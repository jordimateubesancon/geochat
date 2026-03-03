/// <reference lib="webworker" />

const TILE_CACHE = "map-tiles-v1";
const SHELL_CACHE = "app-shell-v1";
const TILE_PATTERN = /\.tile\.opentopomap\.org/;
const STATIC_PATTERN = /\/_next\/static\//;
const MAX_TILE_ENTRIES = 2000; // ~50 MB budget (opaque responses ~7 MB padded each in Chrome, but real PNG tiles are ~25 KB)

// Grey placeholder tile (256x256 PNG, ~110 bytes)
const GREY_TILE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADPMO" +
  "yrAAAAOElEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7waVOAAB" +
  "JMdBbgAAAABJRU5ErkJggg==";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Tile requests — cache-first
  if (TILE_PATTERN.test(url.hostname)) {
    event.respondWith(handleTile(request));
    return;
  }

  // Static assets — cache-first (immutable, hash-named)
  if (STATIC_PATTERN.test(url.pathname)) {
    event.respondWith(handleStatic(request));
    return;
  }

  // Everything else — network only (passthrough)
});

async function handleTile(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Cache opaque (status 0) and OK responses
    if (response.status === 0 || response.ok) {
      cache.put(request, response.clone());
      evictOldTiles(cache);
    }
    return response;
  } catch {
    // Offline and not cached — return grey placeholder
    return greyTileResponse();
  }
}

async function evictOldTiles(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_TILE_ENTRIES) return;
  // Delete oldest entries (first in list = oldest by insertion order)
  const toDelete = keys.length - MAX_TILE_ENTRIES;
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(keys[i]);
  }
}

async function handleStatic(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

function greyTileResponse() {
  const bytes = Uint8Array.from(atob(GREY_TILE_BASE64), (c) =>
    c.charCodeAt(0)
  );
  return new Response(bytes, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}
