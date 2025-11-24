import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateMatch } from '@/lib/matching'
import { MatchStatus, MVPStatus, RFPStatus } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rfpId, mvpId } = body

    if (!rfpId || !mvpId) {
      return NextResponse.json(
        { error: 'Both rfpId and mvpId are required' },
        { status: 400 }
      )
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findUnique({
      where: {
        rfpId_mvpId: {
          rfpId,
          mvpId
        }
      }
    })

    if (existingMatch) {
      return NextResponse.json(
        { error: 'Match already exists' },
        { status: 400 }
      )
    }

    // Fetch RFP and MVP
    const rfp = await prisma.rFP.findUnique({ where: { id: rfpId } })
    const mvp = await prisma.mVP.findUnique({ where: { id: mvpId } })

    if (!rfp || !mvp) {
      return NextResponse.json(
        { error: 'RFP or MVP not found' },
        { status: 404 }
      )
    }

    // Calculate match using AI
    const matchResult = await calculateMatch(rfp, mvp)

    // Create match
    const match = await prisma.match.create({
      data: {
        rfpId,
        mvpId,
        enterpriseId: rfp.enterpriseId,
        builderId: mvp.builderId,
        score: matchResult.score,
        reasoning: matchResult.reasoning,
        status: MatchStatus.PENDING,
      },
      include: {
        rfp: {
          include: {
            enterprise: {
              select: {
                id: true,
                name: true,
                companyName: true,
                email: true,
              }
            }
          }
        },
        mvp: {
          include: {
            builder: {
              select: {
                id: true,
                name: true,
                companyName: true,
                email: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ match, ...matchResult }, { status: 201 })
  } catch (error) {
    console.error('Match creation error:', error)
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

    let matches

    if (userRole === 'ENTERPRISE') {
      matches = await prisma.match.findMany({
        where: { enterpriseId: userId },
        include: {
          rfp: true,
          mvp: {
            include: {
              builder: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  email: true,
                  website: true,
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (userRole === 'BUILDER') {
      matches = await prisma.match.findMany({
        where: { builderId: userId },
        include: {
          mvp: true,
          rfp: {
            include: {
              enterprise: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  email: true,
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Admin sees all matches
      matches = await prisma.match.findMany({
        include: {
          rfp: {
            include: {
              enterprise: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  email: true,
                }
              }
            }
          },
          mvp: {
            include: {
              builder: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  email: true,
                }
              }
            }
          },
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
