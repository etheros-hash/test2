'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUp() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'BUILDER' as 'ENTERPRISE' | 'BUILDER',
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'enterprise') {
      setFormData(prev => ({ ...prev, role: 'ENTERPRISE' }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setLoading(false)
        return
      }

      // Redirect to signin
      router.push('/auth/signin?registered=true')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Join EnterpriseMatch as {formData.role === 'ENTERPRISE' ? 'an Enterprise' : 'a Builder'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">I am a</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="BUILDER"
                    checked={formData.role === 'BUILDER'}
                    onChange={(e) => setFormData({ ...formData, role: 'BUILDER' })}
                    className="mr-2"
                  />
                  Builder
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ENTERPRISE"
                    checked={formData.role === 'ENTERPRISE'}
                    onChange={(e) => setFormData({ ...formData, role: 'ENTERPRISE' })}
                    className="mr-2"
                  />
                  Enterprise
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            {formData.role === 'ENTERPRISE' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="companySize" className="text-sm font-medium">
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  >
                    <option value="">Select size</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1001-5000">1001-5000 employees</option>
                    <option value="5000+">5000+ employees</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </label>
                  <Input
                    id="industry"
                    type="text"
                    placeholder="Technology, Healthcare, etc."
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website (optional)
              </label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:underline">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
