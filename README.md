# Fund Tracker

Webowa aplikacja do śledzenia wydatków, rachunków, subskrypcji i wynagrodzeń.

## Stack
- `apps/web`: Next.js + TypeScript + React Hook Form + Recharts
- `apps/api`: Fastify + Prisma + PostgreSQL + JWT
- `packages/shared-types`: współdzielone typy
- Turborepo + pnpm workspaces

## Uruchomienie lokalne
1. Wymagania
   - Docker Desktop (dla Postgresa/Redis)
   - Node.js 20+ oraz `pnpm`

2. Skonfiguruj zmienne środowiskowe
   - Skopiuj `.env.example` do `.env` w katalogu głównym:
     `copy .env.example .env`
   - Ponieważ Prisma uruchamiana jest w `apps/api`, skopiuj też `.env` do `apps/api`:
     `copy .env apps\api\.env`

3. Uruchom bazę
   - W katalogu projektu uruchom:
     `docker compose up -d`

4. Instalacja zależności
   - W katalogu projektu:
     `pnpm install`

5. Migracje bazy (Prisma)
   - Preferowana ścieżka:
     `pnpm --filter @fund-tracker/api prisma:migrate`
   - Jeśli zobaczysz błąd związany z blokadą advisory lock (`P1002`) lub `EPERM` przy `prisma generate`, użyj resetu pomijającego generowanie:
     `cd apps\api`
     `$env:PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK="true"`
     `./node_modules/.bin/prisma migrate reset --force --skip-generate`

6. Uruchomienie aplikacji
   - API:
     `pnpm --filter @fund-tracker/api dev`
   - Web:
     `pnpm --filter @fund-tracker/web dev`

Adresy:
- Web: `http://localhost:3000`
- API: `http://localhost:4000/health`

## Zakres MVP
- Rejestracja/logowanie.
- CRUD transakcji.
- Budżety miesięczne.
- Dashboard (saldo, wydatki per kategoria).
- Import CSV endpoint (`POST /import/csv`).
- Testy podstawowe + CI.
