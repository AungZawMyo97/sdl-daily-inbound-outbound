# SDL Daily Inbound-Outbound Tracker

SDL Daily Inbound-Outbound Tracker is a private cash tracking application for recording and reviewing daily financial movement in Myanmar Kyat (MMK) and Thai Baht (THB). It is built for fast daily entry, clear monthly review, and simple reporting without mixing unrelated currency flows into one view.

## What It Does

- Records daily inbound and outbound transactions.
- Supports MMK and THB transaction views.
- Tracks monthly inbound, outbound, and net totals.
- Shows overall net balance by selected currency.
- Provides a yearly dashboard with monthly breakdowns.
- Supports monthly report downloads.
- Tracks baht refill transactions separately from normal customer-baht flow.
- Shows a Baht From Customers monthly summary:
  - THB Inbound from non-refill customer transactions.
  - MMK Equivalent from matching non-refill MMK outbound transactions.

## Domain Rules

Transactions are stored with:

- `amount`
- `type`: `IN` or `OUT`
- `currency`: `MMK` or `THB`
- `date`
- optional `description`
- optional `bahtRefill`

`bahtRefill` is used to separate refill transactions from customer-baht totals. For Baht From Customers, the app excludes only rows where `bahtRefill` is `true`; older rows with `null` and regular rows with `false` are included.

## Tech Stack

- Next.js App Router
- React and TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Local shadcn-style UI components
- Lucide React icons

## Project Structure

- `src/app` contains pages and API routes.
- `src/components` contains reusable UI and feature components.
- `src/components/ui` contains shared UI primitives.
- `src/lib` contains shared utilities, auth/session helpers, timezone helpers, and Prisma setup.
- `prisma` contains the Prisma schema and migrations.

## Getting Started

Install dependencies:

```powershell
npm.cmd install
```

Run the development server:

```powershell
npm.cmd run dev
```

Run validation checks:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
```

Build for production:

```powershell
npm.cmd run build
```

## Notes For Maintainers

- Keep transaction summaries server-side where possible.
- Preserve authentication checks on transaction API routes.
- Use `src/lib/timezone.ts` for current local date, month, and year defaults.
- Use skeleton placeholders for metric loading states.
- Keep changes scoped; this app values predictable financial behavior over broad refactors.
