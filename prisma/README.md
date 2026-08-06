# CMS database setup

The Prisma/PostgreSQL layer is additive. The existing CMS continues to use
`data/cms/database.json` until its storage adapter is deliberately migrated.
Running these commands does not import, update or delete that JSON file.

## Local development

1. Add a PostgreSQL connection to the gitignored `.env` file:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   ```

2. Apply the migration and generate Prisma Client:

   ```bash
   pnpm db:migrate
   pnpm db:generate
   ```

3. Initialize the two default categories:

   ```bash
   pnpm db:seed
   ```

4. Create or reset an administrator. If no password environment variable is
   supplied, the command generates a strong one-time password and prints it once:

   ```bash
   pnpm db:admin -- --username admin --email admin@example.com
   ```

   A custom password can be supplied through a securely configured
   `ADMIN_INITIAL_PASSWORD` environment variable. Do not place it in a committed
   file or pass it as a command-line argument.

5. Verify article create, update and delete against the configured database:

   ```bash
   pnpm db:test:articles
   ```

   The test uses uniquely named temporary records and removes them before exit.

6. Verify product create, update, multi-image relations and delete:

   ```bash
   pnpm db:test:products
   ```

7. Verify category create, update, delete and relation protection:

   ```bash
   pnpm db:test:categories
   ```

## Production deployment

Configure `DATABASE_URL` in the hosting platform, then apply committed migrations:

```bash
pnpm db:deploy
pnpm db:seed
```

Do not run `prisma migrate dev` in production. The database-backed `User` model is
ready for a future login adapter, but the current CMS login remains environment-
variable based so the existing administrator access keeps working unchanged.
