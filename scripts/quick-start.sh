#!/bin/bash

# EnterpriseMatch - Quick Start Script

set -e

echo "🚀 Starting EnterpriseMatch Platform Setup..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your OPENAI_API_KEY and other settings"
    echo ""
fi

# Start PostgreSQL with Docker
echo "🐘 Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if postgres is healthy
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Database is not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"
echo ""

# Update .env with local database URL
echo "📝 Updating DATABASE_URL in .env..."
if grep -q "^DATABASE_URL=" .env; then
    # Use a different delimiter since the URL contains /
    sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enterprisematch?schema=public"|' .env
    rm -f .env.bak
else
    echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enterprisematch?schema=public"' >> .env
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || {
    echo "⚠️  Prisma Client generation failed. Trying db push instead..."
}

# Run migrations (or use db push as fallback)
echo "🔄 Setting up database schema..."
if PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name init 2>/dev/null; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migration failed, trying db push (no migration history)..."
    if PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push 2>/dev/null; then
        echo "✅ Database schema pushed successfully"
    else
        echo "❌ Database setup failed. You may need to:"
        echo "   1. Check your network connection"
        echo "   2. Try: PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push"
        echo "   3. Or use a cloud database (Supabase, Neon, etc.)"
    fi
fi

# Seed database (optional)
echo ""
read -p "❓ Would you like to create an admin user? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "👤 Creating admin user (admin@enterprisematch.com / admin123)..."
    node scripts/seed-admin.js || echo "⚠️  Admin user might already exist or seed script not found"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the application:"
echo "   npm run dev"
echo ""
echo "📊 Access Prisma Studio (Database GUI):"
echo "   npx prisma studio"
echo ""
echo "🔍 View database directly:"
echo "   docker compose exec postgres psql -U postgres -d enterprisematch"
echo ""
echo "🛑 To stop the database:"
echo "   docker compose down"
echo ""
echo "📖 Visit http://localhost:3000 to see your app!"
