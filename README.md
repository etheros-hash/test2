# EnterpriseMatch - B2B SaaS Platform

A platform connecting enterprise buyers with innovative startup builders. Help startups validate their enterprise ideas and go from 0 to 1 by matching them with companies that have immediate needs.

## Vision

The current problem is that it's hard for startups to validate their enterprise ideas and get their first customers. EnterpriseMatch solves this by:

- **Enterprises** submit RFPs or business needs with complete confidentiality
- **Builders** submit demos and MVPs with vetted quality control
- **AI-powered matching** intelligently connects the right solutions with the right needs
- **Proprietary information protection** ensures both sides feel safe sharing details

## Key Features

### For Enterprises
- Submit confidential RFPs and business needs
- AI-powered matching with relevant solutions
- Access innovative solutions before they hit the market
- Connect with motivated builders eager to prove value

### For Builders
- Showcase your MVP or demo to enterprise buyers
- Quality vetting ensures only high-bar submissions
- Get matched with enterprises that have immediate needs
- Validate your idea with your first pilot customers

### Platform Features
- 🤖 **AI-Powered Matching** - OpenAI-based intelligent matching algorithm
- 🔒 **Confidentiality Controls** - Proprietary information protection
- ✅ **Quality Vetting** - Admin approval system for MVPs
- 💬 **Secure Messaging** - Built-in communication between matches
- 📊 **Analytics Dashboard** - Track your RFPs, MVPs, and matches

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 for matching algorithm
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/b2b_saas?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Set up the database**

   Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

   Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── rfps/          # RFP CRUD operations
│   │   │   ├── mvps/          # MVP CRUD operations
│   │   │   └── matches/       # Matching endpoints
│   │   ├── auth/              # Auth pages (signin/signup)
│   │   ├── dashboard/         # Protected dashboard pages
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   └── providers/         # Context providers
│   └── lib/                   # Utility functions
│       ├── prisma.ts          # Prisma client
│       ├── auth.ts            # NextAuth configuration
│       ├── matching.ts        # AI matching algorithm
│       └── utils.ts           # Helper functions
├── prisma/
│   └── schema.prisma          # Database schema
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Database Schema

The platform uses the following main entities:

- **User** - Accounts for Enterprises, Builders, and Admins
- **RFP** - Enterprise requests for proposals
- **MVP** - Builder product submissions
- **Match** - AI-generated matches between RFPs and MVPs
- **Message** - Communication between matched parties

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in (NextAuth)

### RFPs (Enterprise only)
- `GET /api/rfps` - List RFPs
- `POST /api/rfps` - Create new RFP

### MVPs (Builder only)
- `GET /api/mvps` - List MVPs
- `POST /api/mvps` - Create new MVP

### Matches
- `GET /api/matches` - List your matches
- `POST /api/matches` - Create a match
- `POST /api/matches/discover` - Discover potential matches with AI

## Deployment

See [SETUP.md](./SETUP.md) for detailed setup instructions and deployment guide.

## Future Enhancements

- [ ] Video demo uploads
- [ ] In-app messaging system
- [ ] Advanced search and filters
- [ ] Email notifications
- [ ] NDA template generation
- [ ] Analytics and reporting
- [ ] Mobile app

---

Built with ❤️ to help builders find their first enterprise customers.
