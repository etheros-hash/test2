const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)

  try {
    const result = await pool.query(
      `INSERT INTO "User" (email, name, "passwordHash", role, verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING email`,
      ['admin@enterprisematch.com', 'Admin User', adminPassword, 'ADMIN', true]
    )
    if (result.rows.length > 0) {
      console.log('✅ Admin user created:', result.rows[0].email)
    } else {
      console.log('ℹ️  Admin user already exists')
    }
  } catch (error) {
    console.log('ℹ️  Admin user already exists or error:', error.message)
  }

  // Create test enterprise user
  const enterprisePassword = await bcrypt.hash('enterprise123', 10)

  try {
    const result = await pool.query(
      `INSERT INTO "User" (email, name, "passwordHash", role, "companyName", "companySize", industry, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING email`,
      ['enterprise@test.com', 'Test Enterprise', enterprisePassword, 'ENTERPRISE', 'Test Corp', '201-1000', 'Technology', true]
    )
    if (result.rows.length > 0) {
      console.log('✅ Enterprise user created:', result.rows[0].email)
    } else {
      console.log('ℹ️  Enterprise user already exists')
    }
  } catch (error) {
    console.log('ℹ️  Enterprise user already exists or error:', error.message)
  }

  // Create test builder user
  const builderPassword = await bcrypt.hash('builder123', 10)

  try {
    const result = await pool.query(
      `INSERT INTO "User" (email, name, "passwordHash", role, "companyName", verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING email`,
      ['builder@test.com', 'Test Builder', builderPassword, 'BUILDER', 'Startup Inc', true]
    )
    if (result.rows.length > 0) {
      console.log('✅ Builder user created:', result.rows[0].email)
    } else {
      console.log('ℹ️  Builder user already exists')
    }
  } catch (error) {
    console.log('ℹ️  Builder user already exists or error:', error.message)
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
    await pool.end()
  })
