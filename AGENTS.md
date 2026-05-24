# AGENTS.md

## Project Overview

SDL Daily Inbound-Outbound Tracker is a private Next.js application for tracking daily cash movement in MMK and THB. It records transactions, summarizes inbound and outbound values, and provides monthly/yearly reporting views.

## Tech Stack

- Next.js App Router with React client components
- TypeScript
- Prisma with PostgreSQL
- Tailwind CSS and local UI components in `src/components/ui`
- Lucide React icons

## Development Commands

- `npm.cmd run dev` starts the local development server.
- `npm.cmd run lint` runs ESLint.
- `npx.cmd tsc --noEmit` runs TypeScript validation.
- `npm.cmd run build` runs the production build.

## Important Implementation Notes

- Keep transaction aggregation logic in API routes or focused helpers, not inside UI components.
- Preserve the existing session checks in every API route that reads or mutates transaction data.
- Transaction dates are treated as local app dates; use helpers from `src/lib/timezone.ts` where current date/month/year defaults are needed.
- Amounts come from Prisma Decimal values and should be converted deliberately before returning JSON.
- The `bahtRefill` field is nullable for compatibility with older rows. For customer-baht monthly totals, exclude only `bahtRefill: true`; include `false` and `null`.

## UI Guidance

- Follow the existing card, button, table, tabs, and skeleton components before adding new primitives.
- Keep operational screens compact and scan-friendly.
- Use lucide icons where useful, but avoid decorative UI that does not improve workflow clarity.
- Use `Skeleton` for loading states instead of visible loading text in metric cards.

## Verification

Before handing off changes, run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
```

