import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">EnterpriseMatch</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Enterprises with
            <span className="text-blue-600"> Innovative Builders</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The first platform designed to help startups validate their enterprise ideas
            and go from 0 to 1 by matching them with companies that have immediate needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup?role=enterprise">
              <Button size="lg">I'm an Enterprise</Button>
            </Link>
            <Link href="/auth/signup?role=builder">
              <Button size="lg" variant="outline">I'm a Builder</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Submit Your Need</CardTitle>
                <CardDescription>Enterprises</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Post your RFP or business need with complete confidentiality.
                  Our AI will find the best matching solutions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Showcase Your MVP</CardTitle>
                <CardDescription>Builders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Submit your demo or MVP. Our vetting process ensures only
                  high-quality solutions reach enterprise buyers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. AI-Powered Matching</CardTitle>
                <CardDescription>Both Sides</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get intelligent matches based on needs, industry, tech stack,
                  and more. Start conversations with your first customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Enterprises</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Access innovative solutions before they hit the market</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Work with motivated builders eager to prove their value</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>AI-powered matching saves time and resources</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Complete confidentiality for proprietary information</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">For Builders</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Validate your enterprise idea with real customers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Go from 0 to 1 with your first pilot customers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Get matched with enterprises that have immediate needs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Protected intellectual property and NDAs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join the platform connecting innovative builders with forward-thinking enterprises.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 EnterpriseMatch. Connecting builders with their first enterprise customers.
          </p>
        </div>
      </footer>
    </div>
  )
}
