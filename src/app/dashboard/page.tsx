'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [recentItems, setRecentItems] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      const userRole = (session?.user as any)?.role

      if (userRole === 'ENTERPRISE') {
        const rfpsResponse = await fetch('/api/rfps')
        const matchesResponse = await fetch('/api/matches')

        const rfps = await rfpsResponse.json()
        const matches = await matchesResponse.json()

        setStats({
          total: rfps.length,
          active: rfps.filter((r: any) => r.status === 'ACTIVE').length,
          matches: matches.length,
        })
        setRecentItems(rfps.slice(0, 5))
      } else if (userRole === 'BUILDER') {
        const mvpsResponse = await fetch('/api/mvps')
        const matchesResponse = await fetch('/api/matches')

        const mvps = await mvpsResponse.json()
        const matches = await matchesResponse.json()

        setStats({
          total: mvps.length,
          approved: mvps.filter((m: any) => m.status === 'APPROVED').length,
          matches: matches.length,
        })
        setRecentItems(mvps.slice(0, 5))
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">EnterpriseMatch</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.name} ({userRole})
              </span>
              <Button
                variant="ghost"
                onClick={() => router.push('/api/auth/signout')}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name}
          </h2>
          <p className="text-gray-600">
            {userRole === 'ENTERPRISE'
              ? 'Manage your RFPs and discover innovative solutions'
              : 'Manage your MVPs and find enterprise customers'
            }
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {userRole === 'ENTERPRISE' ? 'Total RFPs' : 'Total MVPs'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {userRole === 'ENTERPRISE' ? 'Active RFPs' : 'Approved MVPs'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">
                  {userRole === 'ENTERPRISE' ? stats.active : stats.approved}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-600">{stats.matches}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userRole === 'ENTERPRISE' ? (
                <>
                  <Link href="/dashboard/rfps/new">
                    <Button className="w-full">Create New RFP</Button>
                  </Link>
                  <Link href="/dashboard/matches">
                    <Button variant="outline" className="w-full">View Matches</Button>
                  </Link>
                  <Link href="/dashboard/rfps">
                    <Button variant="outline" className="w-full">Manage RFPs</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/mvps/new">
                    <Button className="w-full">Submit New MVP</Button>
                  </Link>
                  <Link href="/dashboard/matches">
                    <Button variant="outline" className="w-full">View Matches</Button>
                  </Link>
                  <Link href="/dashboard/mvps">
                    <Button variant="outline" className="w-full">Manage MVPs</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                {userRole === 'ENTERPRISE' ? 'Your recent RFPs' : 'Your recent MVPs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentItems.length > 0 ? (
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={item.status === 'ACTIVE' || item.status === 'APPROVED' ? 'success' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No items yet. Create your first {userRole === 'ENTERPRISE' ? 'RFP' : 'MVP'}!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            {userRole === 'ENTERPRISE' ? (
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Create an RFP describing your business need</li>
                <li>Our AI will analyze and match you with relevant solutions</li>
                <li>Review matches and connect with builders</li>
                <li>Start conversations and pilot programs</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Submit your MVP or demo for review</li>
                <li>Our team will vet your submission</li>
                <li>Get matched with enterprises that need your solution</li>
                <li>Connect with your first enterprise customers</li>
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
