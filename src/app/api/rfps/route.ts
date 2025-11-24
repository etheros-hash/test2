import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/prisma'
import { z } from 'zod'

const rfpSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  problem: z.string().min(20),
  requirements: z.string().min(20),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  industry: z.string(),
  companySize: z.string(),
  isConfidential: z.boolean().default(true),
  tags: z.array(z.string()),
  status: z.enum(['DRAFT', 'SUBMITTED']).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    if (userRole !== 'ENTERPRISE') {
      return NextResponse.json(
        { error: 'Only enterprise users can create RFPs' },
        { status: 403 }
      )
    }

    // TODO: implement SQL query
    return NextResponse.json(
      { error: 'RFP creation not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('RFP creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return empty array for now - TODO: implement SQL queries
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching RFPs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
