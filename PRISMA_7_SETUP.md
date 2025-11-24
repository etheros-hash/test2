# Prisma 7 Setup Guide

This project has been updated to work with Prisma 7.0.0, which includes breaking changes from previous versions.

## Key Changes in Prisma 7

1. **Database URL Configuration**: The `url` field has been removed from `schema.prisma`
2. **Connection Configuration**: Database connections now use adapters
3. **Migrate Configuration**: Migrations use `prisma.config.ts` for connection URLs

## Files Updated for Prisma 7

### 1. `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  // url field removed in Prisma 7
}
```

### 2. `prisma/prisma.config.ts` (NEW)
This file provides the database URL for migrations:
```typescript
import type { MigrateConfig } from 'prisma'

const config: MigrateConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export default config
```

### 3. `src/lib/prisma.ts`
Updated to use the PostgreSQL adapter:
```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@prisma/client@7.0.0`
- `@prisma/adapter-pg` - PostgreSQL adapter
- `pg` - PostgreSQL driver
- `prisma@7.0.0` (dev dependency)

### 2. Set Environment Variables

Create `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/enterprisematch?schema=public"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

## If You Encounter Engine Download Issues

If you see errors like:
```
Failed to fetch the engine file at https://binaries.prisma.sh/...
```

### Option 1: Use a VPN or Different Network
The Prisma engine binaries may be blocked on certain networks.

### Option 2: Pre-download Engines
```bash
# Download engines manually
npx prisma version
```

### Option 3: Use Prisma Accelerate (Cloud)
Instead of direct database connections, use Prisma Accelerate:

1. Sign up at https://www.prisma.io/accelerate
2. Update your connection:
```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL,
})
```

### Option 4: Downgrade to Prisma 5.x (Not Recommended)

If Prisma 7 causes issues, you can downgrade:

```bash
npm install @prisma/client@5.20.0
npm install -D prisma@5.20.0
```

Then revert the schema:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

And remove the adapter from `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

## Database Setup Options

### Local PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb enterprisematch

# Linux
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb enterprisematch

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Docker
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=enterprisematch \
  -p 5432:5432 \
  -d postgres:15
```

### Cloud Providers (Recommended for Production)

1. **Vercel Postgres**
   - Integrated with Vercel deployments
   - https://vercel.com/storage/postgres

2. **Supabase**
   - Free tier available
   - https://supabase.com

3. **Neon**
   - Serverless Postgres
   - https://neon.tech

4. **Railway**
   - Simple deployment
   - https://railway.app

## Verifying Setup

After setup, verify your connection:

```bash
# Test database connection
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Common Issues

### "Failed to fetch engine file"
- Network/firewall blocking Prisma downloads
- Try a different network or use VPN

### "P1012: url is no longer supported"
- You're using old Prisma 5 schema with Prisma 7
- Remove `url` from datasource in schema.prisma
- Ensure `prisma.config.ts` exists

### "Cannot find module '@prisma/adapter-pg'"
```bash
npm install @prisma/adapter-pg pg
npm install --save-dev @types/pg
```

### "DATABASE_URL is not defined"
- Create `.env` file with DATABASE_URL
- Ensure `.env` is not in `.gitignore` for local dev (it should be for production)

## Additional Resources

- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma 7 Client Configuration](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections)
- [Database Adapters](https://www.prisma.io/docs/orm/overview/databases/database-adapters)
