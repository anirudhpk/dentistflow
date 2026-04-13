# Deploying DentistFlow For One Clinic

This is the lowest-cost practical setup: one VPS, Docker, and Postgres as the main production database. SQLite remains available only as a local fallback when `DATABASE_URL` is not set.

## Recommended server

- 1 small VPS
- 1 vCPU / 1-2 GB RAM is enough to start for a single clinic
- Ubuntu 24.04 LTS or similar

## What this setup includes

- Next.js app in production mode
- Postgres database container in Docker Compose
- Runtime Postgres support in the app when `DATABASE_URL` is set
- SQLite fallback for local/dev if `DATABASE_URL` is not set
- Environment-based email / OTP / WhatsApp config
- Simple restart behavior via Docker

## Before deploy

1. Copy `.env.production.example` to `.env.production`
2. Fill the required values
3. Set `APP_BASE_URL` to your real public domain

## First deploy

```bash
docker compose build
docker compose up -d
```

App will run on port `3000`. Postgres will run on port `5432` inside the same Docker Compose stack.

## Persisted data

SQLite fallback data is stored in:

```bash
./data
```

That folder is mounted into the container, so patient data survives restarts.

Postgres data is stored in the Docker volume `postgres_data`.

## Reverse proxy

In production, put Nginx or Caddy in front of this container and point your domain to the server.

Typical mapping:

- public domain -> reverse proxy
- reverse proxy -> `http://127.0.0.1:3000`

Starter Nginx config:

- [`deploy/nginx/dentistflow.conf`](/Users/anirudhpk/dentist-app/deploy/nginx/dentistflow.conf)

## Updating

```bash
git pull
docker compose build
docker compose up -d
```

## Notes

- This is suitable for a single clinic starting out.
- In production, keep `DATABASE_URL` set so the app stays on Postgres.
- The next major upgrade after that should be stronger auth/roles and backups/monitoring.

Related docs:

- [`UBUNTU_DEPLOY_CHECKLIST.md`](/Users/anirudhpk/dentist-app/UBUNTU_DEPLOY_CHECKLIST.md)
- [`deploy/postgres/POSTGRES_MIGRATION.md`](/Users/anirudhpk/dentist-app/deploy/postgres/POSTGRES_MIGRATION.md)
