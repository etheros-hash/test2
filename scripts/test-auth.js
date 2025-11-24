const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function testAuth() {
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@enterprisematch.com' }
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('✅ Found user:', admin.email)
    console.log('   Role:', admin.role)
    console.log('   Verified:', admin.verified)
    console.log('   Has password hash:', !!admin.passwordHash)
    console.log('   Password hash length:', admin.passwordHash?.length)

    // Test password comparison
    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash)
    console.log('\n🔑 Testing password "admin123":', isValid ? '✅ VALID' : '❌ INVALID')

    // Show first 20 chars of hash for debugging
    console.log('   Hash preview:', admin.passwordHash?.substring(0, 20) + '...')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

testAuth()
