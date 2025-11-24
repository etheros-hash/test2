import { NextResponse } from 'next/server'
import { query } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['ENTERPRISE', 'BUILDER']),
  companyName: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingResult = await query(
      'SELECT id FROM "User" WHERE email = $1',
      [validatedData.email]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Create user
    const result = await query(
      `INSERT INTO "User" (email, name, "passwordHash", role, "companyName", "companySize", industry, website, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, name, role`,
      [
        validatedData.email,
        validatedData.name,
        passwordHash,
        validatedData.role,
        validatedData.companyName || null,
        validatedData.companySize || null,
        validatedData.industry || null,
        validatedData.website || null,
        false
      ]
    )

    const user = result.rows[0]
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
