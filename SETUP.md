# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and update:

**Database URL:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/enterprisematch"
```

**NextAuth Secret:**
Generate a secret:
```bash
openssl rand -base64 32
```
Then update:
```
NEXTAUTH_SECRET="<your-generated-secret>"
```

**OpenAI API Key:**
Get your API key from https://platform.openai.com/api-keys
```
OPENAI_API_KEY="sk-..."
```

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb enterprisematch
```

#### Option B: Use Docker
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=enterprisematch \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Use a Cloud Provider
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 6. (Optional) Seed the Database

Create a seed file `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@enterprisematch.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      verified: true,
    },
  })

  console.log('Admin user created:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run the seed:
```bash
npx tsx prisma/seed.ts
```

### 7. Start the Development Server
```bash
npm run dev
```

### 8. Access the Platform

Open http://localhost:3000

Create accounts:
- **Enterprise**: Sign up → Select "Enterprise" → Create RFP
- **Builder**: Sign up → Select "Builder" → Submit MVP

## Troubleshooting

### Database Connection Issues

**Error: Can't reach database server**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check firewall/network settings

**Error: Schema does not exist**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Prisma Issues

**Error: Prisma Client not generated**
```bash
npx prisma generate
```

**Error: Migration failed**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### NextAuth Issues

**Error: NEXTAUTH_SECRET is not set**
- Generate a secret: `openssl rand -base64 32`
- Add to `.env`: `NEXTAUTH_SECRET="..."`

**Error: NEXTAUTH_URL is not set**
- Add to `.env`: `NEXTAUTH_URL="http://localhost:3000"`

### OpenAI API Issues

**Error: Invalid API key**
- Verify your API key at https://platform.openai.com/api-keys
- Make sure it starts with `sk-`
- Check you have credits available

**Error: Rate limit exceeded**
- The matching algorithm uses GPT-4
- Consider using GPT-3.5-turbo for development (edit `src/lib/matching.ts`)
- Or increase your OpenAI rate limits

## Production Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<production-secret>"
OPENAI_API_KEY="sk-..."
NODE_ENV="production"
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel will automatically:
- Install dependencies
- Build the Next.js app
- Set up serverless functions

### Database Migrations in Production

```bash
# Generate migration
npx prisma migrate deploy
```

## Next Steps

1. ✅ Create your first Enterprise account
2. ✅ Create your first Builder account
3. ✅ Submit a test RFP
4. ✅ Submit a test MVP
5. ✅ Test the AI matching
6. ✅ Review the match results

## Need Help?

- Check the main README.md
- Review the Prisma schema: `prisma/schema.prisma`
- Check API routes: `src/app/api/`
- Review the matching algorithm: `src/lib/matching.ts`
