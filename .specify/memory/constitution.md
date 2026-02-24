<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 2.0.0
  Bump rationale: MAJOR — removed entire Development Guidelines,
    Deployment & Scope sections (backward-incompatible restructuring).
    Constitution now focuses exclusively on governing principles and
    high-level guidelines, as intended by its purpose.
  Modified principles: None (all 7 retained as-is)
  Added sections:
    - Development Guidelines (slim, principle-level only: simplicity,
      minimal dependencies, type safety, security by default, errors
      as first-class)
    - Scope Boundaries (what V1 is not — kept as a governing constraint)
  Removed sections:
    - Code Standards (tech stack detail → belongs in plan/spec)
    - Project Structure (folder layout → belongs in plan)
    - Database Conventions (schema detail → belongs in plan/spec)
    - Real-Time Rules (implementation detail → belongs in plan/spec)
    - State Management (implementation detail → belongs in plan/spec)
    - Error Handling (implementation detail → belongs in plan/spec)
    - Dependencies (approved list → belongs in plan/spec)
    - Deployment (infra detail → belongs in plan/spec)
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ No update needed
    - .specify/templates/spec-template.md — ✅ No update needed
    - .specify/templates/tasks-template.md — ✅ No update needed
    - .specify/templates/commands/*.md — ✅ No command files exist
  Follow-up TODOs: None
-->

# GeoChat Constitution

## Core Principles

### I. Zero-Budget, Zero-Friction

This project has no budget. Every technology choice MUST work within
free tiers of open-source-friendly platforms. If a feature requires
paid infrastructure, it does not belong in V1. Development setup MUST
be achievable with only free-tier services and a single command.

### II. Open Source First

Prefer open-source technologies in every layer of the stack. If a
proprietary tool is used for convenience, there MUST always be a
self-hostable migration path. No vendor lock-in that cannot be undone
in a weekend.

### III. Ship the Simplest Thing That Works

This is an MVP. No microservices, no complex state management, no
premature optimization. Every feature MUST be justified by a clear
user need, not by architectural elegance. If in doubt, leave it out
and add it later.

### IV. Real-Time Is a Core Requirement

The product's value depends on conversations feeling alive. Messages
MUST appear in real-time without manual refresh. New conversation
markers MUST appear on other users' maps automatically. Any
architecture decision that compromises real-time behavior requires
strong justification.

### V. Location Is a First-Class Citizen

Every conversation has a geographic coordinate. The database, the API,
and the UI MUST treat geospatial data as a core primitive, not an
afterthought. Proper geospatial types, spatial indexes, and radius
queries MUST be used from day one — retrofitting these later is
painful.

### VI. Anonymous by Default, Identity When Needed

V1 uses randomly generated display names with no sign-up required.
The barrier to participation MUST be zero. Authentication and
persistent identity are a future concern; the data model MUST
accommodate both anonymous and authenticated users without migration.

### VII. The Map Is the Interface

The map is not a feature of the app — it is the app. The primary
interaction model is spatial: users explore by panning and zooming,
discover by seeing markers, and engage by clicking locations.
Traditional UI elements (lists, search bars, navigation) are secondary
and MUST NOT compete with the map for attention.

## Development Guidelines

- **Simplicity over cleverness**: Prefer flat structures, minimal
  abstractions, and straightforward code. Complexity MUST be justified.
- **Minimal dependencies**: Every new dependency MUST justify its
  existence. Prefer built-in or simpler alternatives when available.
- **Type safety**: All code MUST be type-safe. Escape hatches are a
  last resort and MUST be flagged for follow-up.
- **Security by default**: Secrets MUST never be committed. Database
  access policies MUST be explicit, never implicit.
- **Errors are first-class**: Never swallow errors silently. User-facing
  failures MUST be communicated clearly. Network failures MUST trigger
  recovery, not broken state.
- **Optimistic interaction**: User-initiated actions MUST feel instant
  via optimistic updates, with graceful rollback on failure.

## Scope Boundaries

V1 is explicitly **not**:

- A social network (no profiles, followers, or feeds)
- A messaging app (no direct messages or private conversations)
- A moderation platform (no flagging, reporting, or admin panel)
- A mobile app (web only, though the UI MUST be responsive)
- A production system (no monitoring, alerting, or SLA guarantees)

These are valid future directions, but they are out of scope until the
core experience is validated.

## Governance

This constitution is the authoritative reference for all architectural
and development decisions in GeoChat. It supersedes informal
conventions and ad-hoc decisions.

- **Compliance**: All contributions MUST verify alignment with the
  principles above. If a change conflicts with a principle, the
  principle MUST either be followed or formally amended before the
  change is merged.
- **Amendments**: Any change to this constitution MUST be documented
  with a rationale, reviewed, and versioned. Amendments follow semantic
  versioning (MAJOR for principle removals/redefinitions, MINOR for
  additions/expansions, PATCH for clarifications).
- **Complexity justification**: Any deviation from Principle III (Ship
  the Simplest Thing) MUST be justified in writing with a clear
  explanation of why the simpler alternative is insufficient.

**Version**: 2.0.0 | **Ratified**: 2026-02-23 | **Last Amended**: 2026-02-23
