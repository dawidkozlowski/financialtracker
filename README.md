# Fund Tracker

Webowa aplikacja do śledzenia wydatków, rachunków, subskrypcji i wynagrodzeń.

## Stack
- `apps/web`: Next.js + TypeScript + React Hook Form + Recharts
- `apps/api`: Fastify + Prisma + PostgreSQL + JWT
- `packages/shared-types`: współdzielone typy
- Turborepo + pnpm workspaces

## Uruchomienie lokalne
1. Skopiuj `.env.example` do `.env`.
2. Uruchom bazę: `docker compose up -d`.
3. Zainstaluj zależności: `pnpm install`.
4. Wygeneruj klienta Prisma: `pnpm --filter @fund-tracker/api prisma:generate`.
5. Wykonaj migracje: `pnpm --filter @fund-tracker/api prisma:migrate`.
6. Uruchom aplikacje: `pnpm dev`.

## Zakres MVP
- Rejestracja/logowanie.
- CRUD transakcji.
- Budżety miesięczne.
- Dashboard (saldo, wydatki per kategoria).
- Import CSV endpoint (`POST /import/csv`).
- Testy podstawowe + CI.
