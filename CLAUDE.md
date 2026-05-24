# CLAUDE.md

## Working Agreement

This project is a focused financial tracker. Favor small, explicit changes that preserve existing transaction behavior. Do not refactor unrelated areas while implementing a feature or fix.

## Architecture Notes

- App pages live under `src/app`.
- Shared UI and feature components live under `src/components`.
- Database access uses the shared Prisma client from `src/lib/prisma.ts`.
- Authentication/session checks use `src/lib/session.ts`.
- Generated Prisma client code lives under `src/generated/prisma`.

## Domain Rules

- Transactions have a type of `IN` or `OUT`.
- Transactions have a currency of `MMK` or `THB`.
- `bahtRefill` marks refill-related rows and may be `true`, `false`, or `null`.
- Baht From Customers monthly values must exclude `bahtRefill: true` and include `false`/`null`.
- Baht From Customers shows:
  - THB Inbound from `currency = THB` and `type = IN`
  - MMK Equivalent from `currency = MMK` and `type = OUT`

## Code Style

- Prefer the existing component and API route patterns.
- Keep API response shapes simple and explicit.
- Avoid duplicating formatting logic when a nearby component already has a focused helper.
- Use TypeScript interfaces for component props and route response shapes where helpful.
- Keep UI text concise and domain-specific.

## Checks

Use these checks for normal changes:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
```

