# Postgres Migration Path

The app now supports PostgreSQL at runtime. When `DATABASE_URL` is set, DentistFlow uses Postgres as the active database. SQLite remains available only as a local fallback for development or legacy data export.

## What is included

- [`schema.sql`](/Users/anirudhpk/dentist-app/deploy/postgres/schema.sql): base Postgres table schema
- [`export_sqlite_to_json.mjs`](/Users/anirudhpk/dentist-app/deploy/postgres/export_sqlite_to_json.mjs): exports current SQLite patient data to JSON
- [`import_json_to_postgres.mjs`](/Users/anirudhpk/dentist-app/deploy/postgres/import_json_to_postgres.mjs): imports exported patient JSON into Postgres

## Current status

This repo is **already migrated** for a Postgres-first runtime.

That means:
- if `DATABASE_URL` is set, the app uses Postgres immediately
- if `DATABASE_URL` is not set, the app falls back to SQLite
- current patient pages and API routes work against either store

## Suggested cutover plan

1. Provision Postgres
2. Apply [`schema.sql`](/Users/anirudhpk/dentist-app/deploy/postgres/schema.sql)
3. Export existing SQLite data:

```bash
node deploy/postgres/export_sqlite_to_json.mjs
```

4. Import that JSON into Postgres:

```bash
node deploy/postgres/import_json_to_postgres.mjs
```

5. Test OTP, patient CRUD, invoice PDF, and prescription send flows
6. Keep `DATABASE_URL` set in production so the app stays on Postgres

## When to migrate

Migrate from SQLite when any of these become true:
- more than one clinic
- multiple staff editing at the same time regularly
- need stronger backup/recovery guarantees
- need managed database monitoring
- need analytics or reporting beyond simple app usage
