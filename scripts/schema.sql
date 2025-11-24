-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ENTERPRISE', 'BUILDER', 'ADMIN');
CREATE TYPE "RFPStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTIVE', 'MATCHED', 'CLOSED');
CREATE TYPE "MVPStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'MATCHED');
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_DISCUSSION', 'NDA_SIGNED', 'PILOT', 'CLOSED', 'DECLINED');

-- Users table
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    role "UserRole" NOT NULL,
    "companyName" TEXT,
    "companySize" TEXT,
    industry TEXT,
    website TEXT,
    bio TEXT,
    "avatarUrl" TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RFPs table
CREATE TABLE "RFP" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem TEXT NOT NULL,
    requirements TEXT NOT NULL,
    budget TEXT,
    timeline TEXT,
    industry TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    status "RFPStatus" NOT NULL DEFAULT 'DRAFT',
    tags TEXT[] NOT NULL DEFAULT '{}',
    attachments TEXT[] NOT NULL DEFAULT '{}',
    "enterpriseId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MVPs table
CREATE TABLE "MVP" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    "techStack" TEXT[] NOT NULL DEFAULT '{}',
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "presentationUrl" TEXT,
    stage TEXT NOT NULL,
    "targetIndustries" TEXT[] NOT NULL DEFAULT '{}',
    "targetCompanySize" TEXT[] NOT NULL DEFAULT '{}',
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    status "MVPStatus" NOT NULL DEFAULT 'DRAFT',
    tags TEXT[] NOT NULL DEFAULT '{}',
    metrics TEXT,
    "builderId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE "Match" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    score FLOAT NOT NULL,
    reasoning TEXT NOT NULL,
    status "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "rfpId" TEXT NOT NULL REFERENCES "RFP"(id),
    "mvpId" TEXT NOT NULL REFERENCES "MVP"(id),
    "enterpriseId" TEXT NOT NULL REFERENCES "User"(id),
    "builderId" TEXT NOT NULL REFERENCES "User"(id),
    "ndaSigned" BOOLEAN NOT NULL DEFAULT false,
    "ndaSignedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("rfpId", "mvpId")
);

-- Messages table
CREATE TABLE "Message" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    content TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "senderId" TEXT NOT NULL REFERENCES "User"(id),
    "recipientId" TEXT NOT NULL REFERENCES "User"(id),
    "matchId" TEXT REFERENCES "Match"(id),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "User_role_idx" ON "User"(role);
CREATE INDEX "RFP_enterpriseId_idx" ON "RFP"("enterpriseId");
CREATE INDEX "RFP_status_idx" ON "RFP"(status);
CREATE INDEX "RFP_industry_idx" ON "RFP"(industry);
CREATE INDEX "MVP_builderId_idx" ON "MVP"("builderId");
CREATE INDEX "MVP_status_idx" ON "MVP"(status);
CREATE INDEX "MVP_stage_idx" ON "MVP"(stage);
CREATE INDEX "Match_enterpriseId_idx" ON "Match"("enterpriseId");
CREATE INDEX "Match_builderId_idx" ON "Match"("builderId");
CREATE INDEX "Match_status_idx" ON "Match"(status);
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");
CREATE INDEX "Message_matchId_idx" ON "Message"("matchId");
