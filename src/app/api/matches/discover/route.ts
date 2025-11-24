import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { findMatchesForRFP, findMatchesForMVP } from '@/lib/matching'
import { MVPStatus, RFPStatus } from '@prisma/client'

// Discover potential matches for a specific RFP or MVP
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rfpId, mvpId, threshold = 60 } = body

    if (!rfpId && !mvpId) {
      return NextResponse.json(
        { error: 'Either rfpId or mvpId is required' },
        { status: 400 }
      )
    }

    let results

    if (rfpId) {
      // Find matches for RFP
      const rfp = await prisma.rFP.findUnique({ where: { id: rfpId } })

      if (!rfp) {
        return NextResponse.json({ error: 'RFP not found' }, { status: 404 })
      }

      // Get approved MVPs
      const mvps = await prisma.mVP.findMany({
        where: { status: MVPStatus.APPROVED }
      })

      results = await findMatchesForRFP(rfp, mvps, threshold)

      // Filter out existing matches
      const existingMatches = await prisma.match.findMany({
        where: { rfpId },
        select: { mvpId: true }
      })

      const existingMvpIds = new Set(existingMatches.map(m => m.mvpId))
      results = results.filter(r => !existingMvpIds.has(r.mvp.id))

      // Add builder info
      const resultsWithBuilder = await Promise.all(
        results.map(async (result) => {
          const builder = await prisma.user.findUnique({
            where: { id: result.mvp.builderId },
            select: {
              id: true,
              name: true,
              companyName: true,
            }
          })

          return {
            ...result,
            mvp: {
              ...result.mvp,
              builder
            }
          }
        })
      )

      return NextResponse.json(resultsWithBuilder)

    } else if (mvpId) {
      // Find matches for MVP
      const mvp = await prisma.mVP.findUnique({ where: { id: mvpId } })

      if (!mvp) {
        return NextResponse.json({ error: 'MVP not found' }, { status: 404 })
      }

      // Get active RFPs
      const rfps = await prisma.rFP.findMany({
        where: { status: RFPStatus.ACTIVE }
      })

      results = await findMatchesForMVP(mvp, rfps, threshold)

      // Filter out existing matches
      const existingMatches = await prisma.match.findMany({
        where: { mvpId },
        select: { rfpId: true }
      })

      const existingRfpIds = new Set(existingMatches.map(m => m.rfpId))
      results = results.filter(r => !existingRfpIds.has(r.rfp.id))

      // Add enterprise info
      const resultsWithEnterprise = await Promise.all(
        results.map(async (result) => {
          const enterprise = await prisma.user.findUnique({
            where: { id: result.rfp.enterpriseId },
            select: {
              id: true,
              name: true,
              companyName: true,
            }
          })

          return {
            ...result,
            rfp: {
              ...result.rfp,
              enterprise
            }
          }
        })
      )

      return NextResponse.json(resultsWithEnterprise)
    }

  } catch (error) {
    console.error('Match discovery error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
