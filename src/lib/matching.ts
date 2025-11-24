import OpenAI from 'openai'
import { RFP, MVP } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MatchResult {
  score: number // 0-100
  reasoning: string
  strengths: string[]
  concerns: string[]
  recommendations: string[]
}

export async function calculateMatch(rfp: RFP, mvp: MVP): Promise<MatchResult> {
  const prompt = `You are an expert B2B matchmaking AI. Analyze the following enterprise need and startup solution to determine compatibility.

ENTERPRISE REQUEST:
Title: ${rfp.title}
Problem: ${rfp.problem}
Requirements: ${rfp.requirements}
Industry: ${rfp.industry}
Company Size: ${rfp.companySize}
Budget: ${rfp.budget || 'Not specified'}
Timeline: ${rfp.timeline || 'Not specified'}
Tags: ${rfp.tags.join(', ')}

STARTUP SOLUTION:
Title: ${mvp.title}
Problem Addressed: ${mvp.problem}
Solution: ${mvp.solution}
Tech Stack: ${mvp.techStack.join(', ')}
Stage: ${mvp.stage}
Target Industries: ${mvp.targetIndustries.join(', ')}
Target Company Sizes: ${mvp.targetCompanySize.join(', ')}
Tags: ${mvp.tags.join(', ')}

Provide a match analysis in the following JSON format:
{
  "score": <number 0-100>,
  "reasoning": "<detailed explanation of the match quality>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}

Consider:
1. Problem-solution fit
2. Industry alignment
3. Company size compatibility
4. Technical feasibility
5. Timeline and stage appropriateness
6. Budget alignment (if specified)
7. Tag overlap and relevance

Only return the JSON object, no other text.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B matchmaking analyst. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      score: result.score || 0,
      reasoning: result.reasoning || '',
      strengths: result.strengths || [],
      concerns: result.concerns || [],
      recommendations: result.recommendations || []
    }
  } catch (error) {
    console.error('Error calculating match:', error)
    // Fallback to basic matching
    return fallbackMatch(rfp, mvp)
  }
}

function fallbackMatch(rfp: RFP, mvp: MVP): MatchResult {
  let score = 0
  const strengths: string[] = []
  const concerns: string[] = []

  // Industry match
  if (mvp.targetIndustries.includes(rfp.industry)) {
    score += 30
    strengths.push('Industry alignment')
  } else {
    concerns.push('Industry mismatch')
  }

  // Company size match
  if (mvp.targetCompanySize.includes(rfp.companySize)) {
    score += 20
    strengths.push('Company size compatibility')
  }

  // Tag overlap
  const commonTags = rfp.tags.filter(tag => mvp.tags.includes(tag))
  if (commonTags.length > 0) {
    score += commonTags.length * 10
    strengths.push(`${commonTags.length} matching tags`)
  }

  // Stage consideration
  if (mvp.stage === 'Production' || mvp.stage === 'Beta') {
    score += 15
    strengths.push('Mature product stage')
  } else {
    concerns.push('Early stage product')
  }

  return {
    score: Math.min(score, 100),
    reasoning: 'Basic algorithmic match based on tags, industry, and company size',
    strengths,
    concerns,
    recommendations: ['Schedule an introductory call', 'Review technical documentation']
  }
}

export async function findMatchesForRFP(rfp: RFP, mvps: MVP[], threshold: number = 60): Promise<Array<{ mvp: MVP; match: MatchResult }>> {
  const matches = await Promise.all(
    mvps.map(async (mvp) => {
      const match = await calculateMatch(rfp, mvp)
      return { mvp, match }
    })
  )

  return matches
    .filter(m => m.match.score >= threshold)
    .sort((a, b) => b.match.score - a.match.score)
}

export async function findMatchesForMVP(mvp: MVP, rfps: RFP[], threshold: number = 60): Promise<Array<{ rfp: RFP; match: MatchResult }>> {
  const matches = await Promise.all(
    rfps.map(async (rfp) => {
      const match = await calculateMatch(rfp, mvp)
      return { rfp, match }
    })
  )

  return matches
    .filter(m => m.match.score >= threshold)
    .sort((a, b) => b.match.score - a.match.score)
}
