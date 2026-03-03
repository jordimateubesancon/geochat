#!/usr/bin/env node

/**
 * i18n translation status tracker.
 *
 * Compares target locale files (es.json, fr.json) against the source (en.json)
 * and reports:
 *   - Missing keys  (in en.json but not in the locale file)
 *   - Stale keys    (en.json value changed since translation was last synced)
 *   - Orphan keys   (in locale file but not in en.json)
 *
 * Commands:
 *   npm run i18n            Show status report
 *   npm run i18n -- --sync  Snapshot current en.json hashes (run after translating)
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = resolve(__dirname, "../src/messages");
const TRACKING_FILE = resolve(MESSAGES_DIR, ".tracking.json");
const SOURCE_LOCALE = "en";
const TARGET_LOCALES = ["es", "fr"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function hash(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 10);
}

function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function readTracking() {
  if (!existsSync(TRACKING_FILE)) return {};
  return JSON.parse(readFileSync(TRACKING_FILE, "utf-8"));
}

function writeTracking(data) {
  writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ── Status ───────────────────────────────────────────────────────────────────

function getStatus(sourceKeys, sourceData, localeData, trackedHashes) {
  const missing = [];
  const stale = [];
  const ok = [];
  const orphan = [];

  for (const key of sourceKeys) {
    if (!(key in localeData)) {
      missing.push(key);
    } else {
      const currentHash = hash(sourceData[key]);
      const trackedHash = trackedHashes[key];

      if (!trackedHash) {
        // Has translation but was never synced — assume stale to be safe
        stale.push(key);
      } else if (currentHash !== trackedHash) {
        stale.push(key);
      } else {
        ok.push(key);
      }
    }
  }

  for (const key of Object.keys(localeData)) {
    if (!(key in sourceData)) {
      orphan.push(key);
    }
  }

  return { missing, stale, ok, orphan };
}

// ── Report ───────────────────────────────────────────────────────────────────

function printReport(locale, status, totalKeys) {
  const { missing, stale, ok, orphan } = status;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${locale.toUpperCase()}  ·  ${ok.length}/${totalKeys} up to date`);
  console.log(`${"─".repeat(60)}`);

  if (missing.length) {
    console.log(`\n  MISSING (${missing.length}) — need translation:`);
    for (const key of missing) console.log(`    - ${key}`);
  }

  if (stale.length) {
    console.log(`\n  STALE (${stale.length}) — English source changed, translation may be outdated:`);
    for (const key of stale) console.log(`    ~ ${key}`);
  }

  if (orphan.length) {
    console.log(`\n  ORPHAN (${orphan.length}) — key removed from en.json, safe to delete:`);
    for (const key of orphan) console.log(`    x ${key}`);
  }

  if (!missing.length && !stale.length && !orphan.length) {
    console.log("\n  All translations up to date!");
  }
}

// ── Sync ─────────────────────────────────────────────────────────────────────

function sync(sourceData, sourceKeys) {
  const tracking = readTracking();

  for (const locale of TARGET_LOCALES) {
    const localeFile = resolve(MESSAGES_DIR, `${locale}.json`);
    if (!existsSync(localeFile)) {
      console.log(`  Skipping ${locale} (file not found)`);
      continue;
    }
    const localeData = readJSON(localeFile);

    if (!tracking[locale]) tracking[locale] = {};

    let synced = 0;
    for (const key of sourceKeys) {
      if (key in localeData) {
        tracking[locale][key] = hash(sourceData[key]);
        synced++;
      }
    }

    // Clean orphan entries from tracking
    for (const key of Object.keys(tracking[locale])) {
      if (!(key in sourceData)) {
        delete tracking[locale][key];
      }
    }

    console.log(`  ${locale}: synced ${synced} keys`);
  }

  writeTracking(tracking);
  console.log(`\nWrote ${TRACKING_FILE}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const isSync = args.includes("--sync");

  const sourceFile = resolve(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
  const sourceData = readJSON(sourceFile);
  const sourceKeys = Object.keys(sourceData);

  if (isSync) {
    console.log(`Syncing tracking data (${sourceKeys.length} source keys)...`);
    sync(sourceData, sourceKeys);
    return;
  }

  // Status report
  const tracking = readTracking();
  let totalIssues = 0;

  console.log(`\ni18n Status Report  ·  ${sourceKeys.length} source keys in en.json`);

  for (const locale of TARGET_LOCALES) {
    const localeFile = resolve(MESSAGES_DIR, `${locale}.json`);
    if (!existsSync(localeFile)) {
      console.log(`\n  ${locale}: FILE NOT FOUND — run translations first`);
      totalIssues += sourceKeys.length;
      continue;
    }

    const localeData = readJSON(localeFile);
    const trackedHashes = tracking[locale] || {};
    const status = getStatus(sourceKeys, sourceData, localeData, trackedHashes);
    printReport(locale, status, sourceKeys.length);
    totalIssues += status.missing.length + status.stale.length + status.orphan.length;
  }

  console.log("");

  if (totalIssues > 0) {
    console.log(`${totalIssues} issue(s) found. After updating translations, run:`);
    console.log("  npm run i18n -- --sync\n");
    process.exit(1);
  }
}

main();
