# Environment errors

## Next.js dev resolution of pnpm Prisma Client

- Symptom: routes importing Prisma return 500 because `.next/dev` externalizes `@prisma/client` but cannot resolve pnpm's hidden `.prisma/client/default` directory.
- Fix: generate Prisma Client into `lib/generated/prisma`, import that project-local output, and run generation from `postinstall`.
- Prevention: never run `next build` while `next dev` is active; restart development after regenerating Prisma Client.
