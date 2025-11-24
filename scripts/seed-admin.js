const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)

  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@enterprisematch.com' },
      update: {},
      create: {
        email: 'admin@enterprisematch.com',
        name: 'Admin User',
        passwordHash: adminPassword,
        role: 'ADMIN',
        verified: true,
      },
    })
    console.log('✅ Admin user created:', admin.email)
  } catch (error) {
    console.log('ℹ️  Admin user already exists')
  }

  // Create test enterprise user
  const enterprisePassword = await bcrypt.hash('enterprise123', 10)

  try {
    const enterprise = await prisma.user.upsert({
      where: { email: 'enterprise@test.com' },
      update: {},
      create: {
        email: 'enterprise@test.com',
        name: 'Test Enterprise',
        passwordHash: enterprisePassword,
        role: 'ENTERPRISE',
        companyName: 'Test Corp',
        companySize: '201-1000',
        industry: 'Technology',
        verified: true,
      },
    })
    console.log('✅ Enterprise user created:', enterprise.email)
  } catch (error) {
    console.log('ℹ️  Enterprise user already exists')
  }

  // Create test builder user
  const builderPassword = await bcrypt.hash('builder123', 10)

  try {
    const builder = await prisma.user.upsert({
      where: { email: 'builder@test.com' },
      update: {},
      create: {
        email: 'builder@test.com',
        name: 'Test Builder',
        passwordHash: builderPassword,
        role: 'BUILDER',
        companyName: 'Startup Inc',
        verified: true,
      },
    })
    console.log('✅ Builder user created:', builder.email)
  } catch (error) {
    console.log('ℹ️  Builder user already exists')
  }

  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('Test accounts:')
  console.log('  Admin:      admin@enterprisematch.com / admin123')
  console.log('  Enterprise: enterprise@test.com / enterprise123')
  console.log('  Builder:    builder@test.com / builder123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
