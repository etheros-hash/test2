import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { MVPStatus } from '@prisma/client'

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

    const body = await request.json()
    const validatedData = mvpSchema.parse(body)

    const mvp = await prisma.mVP.create({
      data: {
        ...validatedData,
        status: validatedData.status === 'SUBMITTED' ? MVPStatus.SUBMITTED : MVPStatus.DRAFT,
        builderId: userId,
      },
      include: {
        builder: {
          select: {
            id: true,
            name: true,
            companyName: true,
          }
        }
      }
    })

    return NextResponse.json(mvp, { status: 201 })
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

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    let mvps

    if (userRole === 'BUILDER') {
      // Builders see their own MVPs
      mvps = await prisma.mVP.findMany({
        where: { builderId: userId },
        include: {
          builder: {
            select: {
              id: true,
              name: true,
              companyName: true,
            }
          },
          matches: {
            include: {
              rfp: {
                select: {
                  id: true,
                  title: true,
                  industry: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (userRole === 'ENTERPRISE') {
      // Enterprises see approved MVPs (limited info until matched)
      mvps = await prisma.mVP.findMany({
        where: { status: MVPStatus.APPROVED },
        select: {
          id: true,
          title: true,
          description: true,
          problem: true,
          solution: true,
          techStack: true,
          stage: true,
          targetIndustries: true,
          targetCompanySize: true,
          tags: true,
          createdAt: true,
          builder: {
            select: {
              companyName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Admin sees all
      mvps = await prisma.mVP.findMany({
        include: {
          builder: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            }
          },
          matches: true,
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(mvps)
  } catch (error) {
    console.error('Error fetching MVPs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
