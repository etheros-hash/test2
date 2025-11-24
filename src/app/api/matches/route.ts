import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/prisma'
import { calculateMatch } from '@/lib/matching'

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

    // TODO: implement SQL query
    return NextResponse.json(
      { error: 'Match creation not yet implemented' },
      { status: 501 }
    )
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

    // Return empty array for now - TODO: implement SQL queries
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
