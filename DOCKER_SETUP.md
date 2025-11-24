# Docker Setup Guide

This guide will help you run the EnterpriseMatch platform using Docker, which is the easiest way to get started without worrying about Prisma engine downloads or PostgreSQL installation.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Node.js 18+ (for running the Next.js dev server locally)

## Quick Start (Automated)

We've created a script that automates the entire setup:

```bash
npm run setup
```

This will:
1. Start PostgreSQL in Docker
2. Configure your `.env` file
3. Install dependencies
4. Generate Prisma Client
5. Run database migrations
6. Optionally seed test users

After setup completes:
```bash
npm run dev
```

Then visit: http://localhost:3000

## Manual Setup

If you prefer to set things up manually:

### Step 1: Start PostgreSQL

```bash
# Start the database
npm run db:start

# Or manually:
docker compose up -d postgres
```

This starts a PostgreSQL 15 container with:
- **User**: postgres
- **Password**: postgres
- **Database**: enterprisematch
- **Port**: 5432 (mapped to your localhost)

### Step 2: Configure Environment

Update your `.env` file with the local Docker database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enterprisematch?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key"
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Run Migrations

```bash
npm run db:migrate

# Or manually:
npx prisma migrate dev --name init
```

### Step 6: Seed Test Users (Optional)

```bash
npm run db:seed
```

This creates three test accounts:
- **Admin**: admin@enterprisematch.com / admin123
- **Enterprise**: enterprise@test.com / enterprise123
- **Builder**: builder@test.com / builder123

### Step 7: Start the App

```bash
npm run dev
```

Visit http://localhost:3000

## Useful Commands

### Database Management

```bash
# Start database
npm run db:start

# Stop database (keeps data)
npm run db:stop

# Stop and remove database (deletes data)
docker compose down -v

# View database logs
docker compose logs -f postgres

# Access PostgreSQL CLI
docker compose exec postgres psql -U postgres -d enterprisematch
```

### Prisma Commands

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Run migrations
npm run db:migrate

# Reset database (warning: deletes all data)
npm run db:reset

# Generate Prisma Client
npx prisma generate

# View migration status
npx prisma migrate status
```

### App Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Running Everything in Docker

If you want to run both the database AND the Next.js app in Docker:

1. **Uncomment the `app` service** in `docker-compose.yml`

2. **Build and start**:
```bash
docker compose up --build
```

3. **Run migrations** (one-time):
```bash
docker compose exec app npx prisma migrate deploy
```

4. **Visit**: http://localhost:3000

## Troubleshooting

### Port 5432 Already in Use

If you have PostgreSQL already running locally:

**Option 1**: Stop your local PostgreSQL
```bash
# macOS
brew services stop postgresql

# Linux
sudo service postgresql stop
```

**Option 2**: Change the port in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 on host instead
```

Then update your `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/enterprisematch?schema=public"
```

### Database Connection Refused

Make sure the database is running:
```bash
docker compose ps
```

You should see `enterprisematch-db` with status `Up`.

If not, check logs:
```bash
docker compose logs postgres
```

### Prisma Client Not Generated

If you see errors about Prisma Client not being found:
```bash
npx prisma generate
```

### Migration Errors

Reset and re-run migrations:
```bash
npm run db:reset
npm run db:migrate
```

### Need to Start Fresh

Remove all data and start over:
```bash
# Stop and remove containers + volumes
docker compose down -v

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Re-run setup
npm run setup
```

## Docker Compose Services

### PostgreSQL Service

```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5432:5432"
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: enterprisematch
```

**Features**:
- Alpine Linux (lightweight)
- Persistent storage via Docker volume
- Health checks for reliability
- Automatic restart on failure

### Data Persistence

Your database data is stored in a Docker volume named `postgres_data`. This means:
- ✅ Data persists between container restarts
- ✅ Data survives `docker compose down`
- ❌ Data is deleted with `docker compose down -v`

To backup your data:
```bash
# Export database
docker compose exec postgres pg_dump -U postgres enterprisematch > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres enterprisematch < backup.sql
```

## Production Deployment

For production, use a managed database service instead of Docker:

- **Vercel Postgres** - https://vercel.com/storage/postgres
- **Supabase** - https://supabase.com
- **Neon** - https://neon.tech
- **AWS RDS** - https://aws.amazon.com/rds/postgresql/
- **Google Cloud SQL** - https://cloud.google.com/sql

Docker is great for development but not recommended for production databases.

## Advanced: Multi-Container Development

Want to run the full stack in Docker with hot reload?

1. Create `docker-compose.dev.yml`:

```yaml
services:
  postgres:
    extends:
      file: docker-compose.yml
      service: postgres

  app:
    build:
      context: .
      target: deps
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/enterprisematch?schema=public"
    depends_on:
      - postgres
```

2. Run:
```bash
docker compose -f docker-compose.dev.yml up
```

## Need Help?

- Check main README: [README.md](./README.md)
- Prisma 7 guide: [PRISMA_7_SETUP.md](./PRISMA_7_SETUP.md)
- Setup guide: [SETUP.md](./SETUP.md)
- Docker docs: https://docs.docker.com/

## Next Steps

1. ✅ Start PostgreSQL: `npm run db:start`
2. ✅ Run migrations: `npm run db:migrate`
3. ✅ Seed test data: `npm run db:seed`
4. ✅ Start dev server: `npm run dev`
5. ✅ Visit: http://localhost:3000
6. ✅ Test with: enterprise@test.com / enterprise123

Happy building! 🚀
