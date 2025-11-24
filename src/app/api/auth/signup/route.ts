import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

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
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        role: validatedData.role as UserRole,
        companyName: validatedData.companyName,
        companySize: validatedData.companySize,
        industry: validatedData.industry,
        website: validatedData.website,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

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
