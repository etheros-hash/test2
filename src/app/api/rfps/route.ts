import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { RFPStatus } from '@prisma/client'

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

    const body = await request.json()
    const validatedData = rfpSchema.parse(body)

    const rfp = await prisma.rFP.create({
      data: {
        ...validatedData,
        status: validatedData.status === 'SUBMITTED' ? RFPStatus.SUBMITTED : RFPStatus.DRAFT,
        enterpriseId: userId,
        attachments: [],
      },
      include: {
        enterprise: {
          select: {
            id: true,
            name: true,
            companyName: true,
          }
        }
      }
    })

    return NextResponse.json(rfp, { status: 201 })
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

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    let rfps

    if (userRole === 'ENTERPRISE') {
      // Enterprise users see their own RFPs
      rfps = await prisma.rFP.findMany({
        where: { enterpriseId: userId },
        include: {
          enterprise: {
            select: {
              id: true,
              name: true,
              companyName: true,
            }
          },
          matches: {
            include: {
              mvp: {
                select: {
                  id: true,
                  title: true,
                  stage: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (userRole === 'BUILDER') {
      // Builders see active RFPs (excluding confidential details until matched)
      rfps = await prisma.rFP.findMany({
        where: { status: RFPStatus.ACTIVE },
        select: {
          id: true,
          title: true,
          description: true,
          problem: true,
          requirements: true,
          industry: true,
          companySize: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          // Exclude confidential fields
          enterprise: {
            select: {
              companyName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Admin sees all
      rfps = await prisma.rFP.findMany({
        include: {
          enterprise: {
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

    return NextResponse.json(rfps)
  } catch (error) {
    console.error('Error fetching RFPs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
