import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/prisma'
import { z } from 'zod'

const mvpSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  problem: z.string().min(20),
  solution: z.string().min(20),
  techStack: z.array(z.string()),
  demoUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  presentationUrl: z.string().url().optional(),
  stage: z.enum(['Concept', 'MVP', 'Beta', 'Production']),
  targetIndustries: z.array(z.string()),
  targetCompanySize: z.array(z.string()),
  isConfidential: z.boolean().default(true),
  tags: z.array(z.string()),
  metrics: z.string().optional(),
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

    if (userRole !== 'BUILDER') {
      return NextResponse.json(
        { error: 'Only builder users can create MVPs' },
        { status: 403 }
      )
    }

    // TODO: implement SQL query
    return NextResponse.json(
      { error: 'MVP creation not yet implemented' },
      { status: 501 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('MVP creation error:', error)
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
    console.error('Error fetching MVPs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
