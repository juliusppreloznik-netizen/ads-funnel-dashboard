import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Detects which of the two allowed niches the mechanism belongs to.
 * Returns "mortgage" or "funding" — nothing else.
 */
function detectNiche(uniqueMechanism: string): "mortgage" | "funding" {
  const lower = uniqueMechanism.toLowerCase();
  const mortgageKeywords = ["mortgage", "home", "house", "property", "real estate", "homeowner", "homebuyer", "home buyer", "housing", "down payment", "fha", "va loan", "conventional loan", "pre-approval", "pre-qualify"];
  if (mortgageKeywords.some(kw => lower.includes(kw))) {
    return "mortgage";
  }
  return "funding";
}

function getNicheContext(niche: "mortgage" | "funding") {
  if (niche === "mortgage") {
    return {
      industry: "mortgage readiness and home buying",
      targetAudience: "aspiring homeowners who want to get mortgage-approved",
      coreOutcome: "getting approved for a mortgage and buying their dream home",
      painPoints: "mortgage denials, low credit scores blocking home purchases, not knowing what lenders look for, high interest rates, being told to wait 6-12 months",
      proofNumbers: "mortgage approvals, credit score improvements (e.g. 580 to 720), interest rate savings, homes purchased, down payment assistance secured",
      specificResults: "approved for a $350,000 mortgage in 45 days, credit score went from 580 to 720, saved $47,000 in interest over the life of the loan, went from denied to approved in 6 weeks",
      oldWay: "credit repair companies that take 6-12 months, generic advice from loan officers, paying for courses about home buying, waiting and hoping your score goes up",
      offer: "done-for-you mortgage readiness service — we optimize your credit profile, prepare your application, and position you for the best possible approval and rate",
      riskReversal: "if we can't get you mortgage-ready within 90 days, you don't pay",
      cta: "click the button below, fill out a short application, and book your free mortgage readiness assessment",
      socialProof: "helped over 500 families get into their dream homes",
      industryInsiders: "underwriters, loan officers, mortgage brokers",
      hiddenProblem: "the hidden data in your credit profile that causes automatic mortgage denials — things you can't see on Credit Karma",
      scarcity: "we only take on 15 new clients per month because each case requires hands-on attention",
    };
  }
  // funding niche (default)
  return {
    industry: "business credit and funding",
    targetAudience: "business owners who need capital to grow their business",
    coreOutcome: "getting approved for 6 figures in business funding at 0% APR",
    painPoints: "funding rejections, low credit scores, not knowing what lenders look for, high interest rates, being told they need more revenue or more time in business",
    proofNumbers: "funding approvals ($50K-$250K+), credit score improvements, 0% APR terms, approval timelines (14-30 days)",
    specificResults: "$150,000 approved in 32 days at 0% APR, credit score went from 570 to 720, $200,000 in funding with a 610 credit score, approved after 6 previous rejections",
    oldWay: "credit stacking, net 60 accounts, traditional bank loans, SBA loans that take months, credit repair companies, business credit courses",
    offer: "done-for-you funding service — we optimize your credit profile, build your business credit, and connect you with our insider lender network to get you approved",
    riskReversal: "you don't pay unless you get approved for funding",
    cta: "click the button below, answer a few questions, and get your custom funding blueprint",
    socialProof: "helped over 1,000 business owners secure more than $50 million in funding",
    industryInsiders: "underwriters, VPs at lending institutions, funding brokers",
    hiddenProblem: "hidden data furnishers on your credit report that cause automatic rejections — things you can't see on Credit Karma that banks use to deny you",
    scarcity: "we only take on 10 new clients per month because each case requires hands-on attention",
  };
}

export function getVSLPrompt(client: any, uniqueMechanism: string): string {
  const niche = detectNiche(uniqueMechanism);
  const ctx = getNicheContext(niche);

  return `You are an elite direct response copywriter specializing in VSL scripts. You've studied the masters like Gary Halbert, Dan Kennedy, and modern direct response legends.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism: "${uniqueMechanism}"
- Industry: ${ctx.industry}
- Target Audience: ${ctx.targetAudience}

═══════════════════════════════════════════════════════════
NICHE LOCK — MANDATORY
═══════════════════════════════════════════════════════════
This VSL is EXCLUSIVELY about ${ctx.industry}.
The target audience is ${ctx.targetAudience}.
The core outcome is ${ctx.coreOutcome}.

FORBIDDEN TOPICS — DO NOT WRITE ABOUT ANY OF THESE:
- Investment returns, portfolio management, wealth management, stocks, bonds, hedge funds
- Day trading, market timing, financial advisors, retirement accounts, 401k, IRA
- Real estate investing (unless the niche is mortgage — and even then, it's about BUYING a home to live in, NOT investing)
- Insurance, annuities, cryptocurrency, forex, options trading
- Any niche or industry other than ${ctx.industry}

If you write about ANY forbidden topic, the entire output is invalid and will be rejected.
═══════════════════════════════════════════════════════════

STYLE & VOICING REQUIREMENTS:
- Conversational, direct first-person narrative ("I'm going to show you...")
- Story-driven with personal experience and client case studies
- Specific numbers and concrete results: ${ctx.specificResults}
- Vivid mental imagery and sensory-rich descriptions
- Emotional contrast between pain of current situation and pleasure of transformation
- Use present tense and "right now" to create immediacy
- Address skepticism head-on with transparency and proof

STRUCTURE (follow this exact flow):

1. HOOK (first 30-60 seconds):
   - Bold promise about ${ctx.coreOutcome} using "${uniqueMechanism}"
   - Specific outcome the audience wants (use numbers from: ${ctx.proofNumbers})
   - Works even if they've been rejected before or tried other solutions

2. BODY - PROBLEM AGITATION:
   - Introduce ${ctx.hiddenProblem}
   - Personal story: "Four years ago, I was working in ${ctx.industry}..."
   - Discovery moment: noticing that people who should be succeeding were getting rejected/failing
   - Investigation: talking to ${ctx.industryInsiders}
   - The revelation: it's not about what everyone thinks — there's hidden data/factors working against them

3. MECHANISM REVEAL:
   - Explain "${uniqueMechanism}" as the solution
   - Technical details that build credibility (insider knowledge about ${ctx.industry})
   - The "loophole" or unfair advantage this mechanism provides
   - Why the old way doesn't work: ${ctx.oldWay}

4. PROOF & CASE STUDIES:
   - At least 2-3 specific client stories with names and numbers
   - Before state: specific struggles (${ctx.painPoints})
   - After state: specific results (${ctx.specificResults})
   - Emotional transformation ("I didn't start this to survive...")

5. OFFER:
   - "Here's my offer to you:"
   - ${ctx.offer}
   - Done-for-you service (not a course)
   - Risk reversal: ${ctx.riskReversal}

6. CLOSE:
   - Scarcity: ${ctx.scarcity}
   - Permission to act ("you're finally ready to [${ctx.coreOutcome}]")
   - Clear CTA: ${ctx.cta}

LENGTH: 3,000-4,000 words minimum. This is a LONG-FORM VSL. Do not cut it short.

CRITICAL FORMATTING RULES:
- Output ONLY continuous flowing copy
- NO timestamps (like [0:00] or 0:15)
- NO section headers (like "Hook:" or "Body:")
- NO visual suggestions (like "show laptop screen")
- NO stage directions or production notes
- Just pure script text that flows naturally when read aloud

The script should feel like a conversation with a trusted expert who's revealing insider secrets about ${ctx.industry}. Use vivid storytelling and emotional arc throughout.

Write the complete VSL script now:`;
}

export function getAdsPrompt(client: any, uniqueMechanism: string): string {
  const niche = detectNiche(uniqueMechanism);
  const ctx = getNicheContext(niche);

  return `You are an elite direct response copywriter specializing in short-form video ad scripts. You've studied the reference ad scripts and understand the exact style, voicing, and structure required.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism: "${uniqueMechanism}"
- Industry: ${ctx.industry}
- Target Audience: ${ctx.targetAudience}

═══════════════════════════════════════════════════════════
NICHE LOCK — MANDATORY
═══════════════════════════════════════════════════════════
These ads are EXCLUSIVELY about ${ctx.industry}.
The target audience is ${ctx.targetAudience}.
The core outcome is ${ctx.coreOutcome}.

FORBIDDEN TOPICS — DO NOT WRITE ABOUT ANY OF THESE:
- Investment returns, portfolio management, wealth management, stocks, bonds, hedge funds
- Day trading, market timing, financial advisors, retirement accounts, 401k, IRA
- Real estate investing (unless the niche is mortgage — and even then, it's about BUYING a home to live in, NOT investing)
- Insurance, annuities, cryptocurrency, forex, options trading
- Any niche or industry other than ${ctx.industry}

If you write about ANY forbidden topic, the entire output is invalid and will be rejected.
═══════════════════════════════════════════════════════════

Your task is to write 5 distinct video ad scripts (45-90 seconds each when read aloud) for "${client.businessName}" using "${uniqueMechanism}" as the core mechanism.

STYLE & VOICING REQUIREMENTS:
- Conversational, casual tone (like talking to a friend)
- Direct, no-fluff approach
- Specific numbers: ${ctx.proofNumbers}
- Address skepticism and common objections about ${ctx.industry}
- Use "you" and "I" to build personal connection
- Create curiosity gaps that compel action
- Strong, clear CTAs with specific next steps

EACH AD MUST FOLLOW THIS STRUCTURE:
1. HOOK (first 5-10 seconds): Grab attention immediately
2. BODY (30-60 seconds): Problem → Mechanism → Proof
3. CTA (10-15 seconds): Clear next step with urgency

THE 5 ADS SHOULD USE DIFFERENT AWARENESS LEVELS:

Ad 1 - Problem Aware | Logical Justifier:
- Hook: "I'm going to be super straight up with you..."
- Address the main pain point: ${ctx.painPoints}
- Introduce "${uniqueMechanism}" as invite-only or exclusive
- Explain why the old way fails (${ctx.oldWay}) but you have the insider solution
- Social proof: ${ctx.socialProof}
- CTA: No upfront cost, ${ctx.riskReversal}

Ad 2 - Perceived Solution-Aware | Mechanistic:
- Hook: "I'm about to show you a secret method..."
- Call out outdated strategies: ${ctx.oldWay}
- Reveal "${uniqueMechanism}" as the new method
- Explain how it works (insider network, proprietary process)
- Contrast: faster results, better terms vs. the old way
- CTA: DM a keyword or click button

Ad 3 - Hero Case Study | Indirect Curiosity Lead:
- Hook: "I need to show you something... This is crazy..."
- Show a specific client result: ${ctx.specificResults}
- Client story with relatable before state
- Explain the process used ("${uniqueMechanism}")
- Emotional payoff ("didn't start this business to survive...")
- CTA: Same process available for you

Ad 4 - Unaware | Curiosity:
- Hook: "You're crazy if you're not taking advantage of this"
- Reveal ${ctx.hiddenProblem}
- Explain why the system works differently than people think
- How to take advantage using "${uniqueMechanism}"
- CTA: Join the people who've already achieved results — ${ctx.socialProof}

Ad 5 - Loophole | Direct:
- Hook: "There's a new method called '${uniqueMechanism}'..."
- Position as underground or newly discovered
- Explain the mechanism simply in 2-3 sentences
- Address objections (complex process, too good to be true)
- Position as done-for-you: ${ctx.offer}
- CTA: ${ctx.cta}

CRITICAL FORMATTING RULES:
- Format as: "Ad 1:" followed by script, then "Ad 2:" etc.
- Output ONLY clean ad copy
- NO visual suggestions (like "show laptop" or "switch camera")
- NO timestamps or time markers
- NO production notes or stage directions
- NO formatting instructions (like "bold this" or "add graphic")
- Just pure script text that can be read directly to camera

Each ad should feel authentic and conversational, like the speaker is genuinely trying to help. ALL copy must be about ${ctx.industry} — nothing else.

Write all 5 ad scripts now:`;
}

export function getLandingPageCopyPrompt(client: any, uniqueMechanism: string): string {
  return `You are a direct response copywriter. Generate landing page copy using the unique mechanism "${uniqueMechanism}".

The landing page follows this structure (similar to Citadel Consulting funding template):
- Main headline about unlocking 6 figures with "${uniqueMechanism}"
- Subheadline explaining 0% APR in 14 days
- Body sections explaining the problem, solution, and how it works
- Social proof section
- FAQ section

Generate ONLY the copy text as a JSON object with these exact keys:

{
  "headline": "Main headline using ${uniqueMechanism}",
  "subheadline": "Supporting subheadline",
  "problemSection": "Paragraph about the funding problem",
  "solutionSection": "Paragraph introducing ${uniqueMechanism}",
  "howItWorksSection": "Paragraph explaining the process",
  "socialProofIntro": "Short intro to success stories",
  "ctaText": "Call to action button text",
  "faq1Question": "First FAQ question",
  "faq1Answer": "First FAQ answer",
  "faq2Question": "Second FAQ question",
  "faq2Answer": "Second FAQ answer",
  "faq3Question": "Third FAQ question",
  "faq3Answer": "Third FAQ answer"
}

Keep the same promise (6 figures, 0% APR, 14 days) but reword everything to feature "${uniqueMechanism}".

OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT:`;
}

export function applyLandingPageReplacements(
  template: string,
  copyData: any,
  hexColor?: string
): string {
  let result = template;

  // Apply color replacements if provided
  if (hexColor) {
    // Replace the primary orange color (#ED6D05 and rgb(237, 109, 5))
    const rgbMatch = hexColor.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 16);
      const g = parseInt(rgbMatch[2], 16);
      const b = parseInt(rgbMatch[3], 16);
      result = result.replace(/rgb\(237,\s*109,\s*5\)/g, `rgb(${r}, ${g}, ${b})`);
      result = result.replace(/rgb\(237, 109, 5\)/g, `rgb(${r}, ${g}, ${b})`);
    }
    result = result.replace(/#ED6D05/gi, hexColor);
  }

  return result;
}

export function loadLandingPageTemplate(): string {
  try {
    const templatePath = join(process.cwd(), 'server/landingPageTemplate.html');
    return readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Failed to load landing page template:', error);
    console.error('Attempted path:', join(process.cwd(), 'server/landingPageTemplate.html'));
    throw new Error('Landing page template not found');
  }
}
