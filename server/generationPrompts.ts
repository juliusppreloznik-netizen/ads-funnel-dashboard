import { readFileSync } from 'fs';
import { join } from 'path';

export function getVSLPrompt(client: any, uniqueMechanism: string): string {
  return `You are an elite direct response copywriter specializing in VSL scripts. You've studied the masters like Gary Halbert, Dan Kennedy, and modern direct response legends.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism: "${uniqueMechanism}"

CRITICAL INSTRUCTION — MECHANISM-ADAPTIVE COPY:
The unique mechanism name "${uniqueMechanism}" tells you EVERYTHING about what niche, industry, and offer this VSL is for. You MUST infer the correct niche from the mechanism name and write ALL copy to match that niche.

Examples of how to interpret the mechanism name:
- "Mortgage Ready Blueprint" → mortgage/home buying niche. Write about getting mortgage-ready, home ownership, credit optimization for home buyers, etc.
- "Secondary Bureau Attack Method" → business funding/credit niche. Write about business capital, funding approvals, lender relationships, etc.
- "Revenue Acceleration System" → business growth/scaling niche. Write about revenue growth, scaling operations, client acquisition, etc.
- "Debt Freedom Protocol" → debt relief/financial freedom niche. Write about eliminating debt, financial independence, credit recovery, etc.
- "Patient Pipeline Method" → medical/dental practice growth niche. Write about patient acquisition, practice revenue, etc.

DO NOT default to business funding copy. DO NOT mention credit scores, 0% APR, funding approvals, or business capital UNLESS the mechanism name clearly relates to those topics. Read the mechanism name carefully and build the ENTIRE script around what it actually represents.

Your task is to write a complete VSL script for "${client.businessName}" that sells their "${uniqueMechanism}" offer.

STYLE & VOICING REQUIREMENTS:
- Conversational, direct first-person narrative ("I'm going to show you...")
- Story-driven with personal experience and client case studies
- Specific numbers and concrete results (use realistic numbers appropriate to the niche)
- Vivid mental imagery and sensory-rich descriptions
- Emotional contrast between pain of current situation and pleasure of transformation
- Use present tense and "right now" to create immediacy
- Address skepticism head-on with transparency and proof

STRUCTURE (follow this exact flow):
1. HOOK (first 30-60 seconds):
   - Bold promise about achieving the core outcome using "${uniqueMechanism}"
   - Specific, compelling result that the target audience desperately wants
   - Works even if they've tried other solutions and failed

2. BODY - PROBLEM AGITATION:
   - Introduce the "hidden killer" or overlooked problem in their niche
   - Personal story: how the speaker discovered this problem working in the industry
   - Discovery moment: noticing that people who should be succeeding were failing
   - Investigation: talking to insiders, experts, and decision-makers
   - The revelation: it's not about what everyone thinks it's about — there's a hidden factor

3. MECHANISM REVEAL:
   - Explain "${uniqueMechanism}" as the solution — name it, own it, make it proprietary
   - Technical details that build credibility (insider knowledge specific to this niche)
   - The "loophole" or unfair advantage this mechanism provides
   - Why traditional methods in this niche don't work

4. PROOF & CASE STUDIES:
   - At least 2-3 specific client stories with names and numbers relevant to the niche
   - Before state: specific struggles the target audience relates to
   - After state: specific results achieved through "${uniqueMechanism}"
   - Emotional transformation — the human moment that makes it real

5. OFFER:
   - "Here's my offer to you:"
   - What you'll do for them (step-by-step process using "${uniqueMechanism}")
   - Done-for-you service (not a course)
   - Risk reversal (guarantee appropriate to the niche)

6. CLOSE:
   - Scarcity (limited spots, limited capacity)
   - Permission to act ("you're finally ready to [achieve the niche-specific outcome]")
   - Clear CTA (click button, answer questions, get custom plan/blueprint/assessment)

LENGTH: 3,000-4,000 words minimum. This is a LONG-FORM VSL. Do not cut it short.

CRITICAL FORMATTING RULES:
- Output ONLY continuous flowing copy
- NO timestamps (like [0:00] or 0:15)
- NO section headers (like "Hook:" or "Body:")
- NO visual suggestions (like "show laptop screen")
- NO stage directions or production notes
- Just pure script text that flows naturally when read aloud

The script should feel like a conversation with a trusted expert who's revealing insider secrets about the "${uniqueMechanism}" niche. Use vivid storytelling and emotional arc throughout.

Write the complete VSL script now:`;
}

export function getAdsPrompt(client: any, uniqueMechanism: string): string {
  return `You are an elite direct response copywriter specializing in short-form video ad scripts. You've studied the reference ad scripts and understand the exact style, voicing, and structure required.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism: "${uniqueMechanism}"

CRITICAL INSTRUCTION — MECHANISM-ADAPTIVE COPY:
The unique mechanism name "${uniqueMechanism}" tells you EVERYTHING about what niche, industry, and offer these ads are for. You MUST infer the correct niche from the mechanism name and write ALL ad copy to match that niche.

Examples of how to interpret the mechanism name:
- "Mortgage Ready Blueprint" → mortgage/home buying niche. Write about getting mortgage-ready, home ownership, credit optimization for home buyers, etc.
- "Secondary Bureau Attack Method" → business funding/credit niche. Write about business capital, funding approvals, lender relationships, etc.
- "Revenue Acceleration System" → business growth/scaling niche. Write about revenue growth, scaling operations, client acquisition, etc.
- "Debt Freedom Protocol" → debt relief/financial freedom niche. Write about eliminating debt, financial independence, credit recovery, etc.
- "Patient Pipeline Method" → medical/dental practice growth niche. Write about patient acquisition, practice revenue, etc.

DO NOT default to business funding copy. DO NOT mention credit scores, 0% APR, funding approvals, or business capital UNLESS the mechanism name clearly relates to those topics. Read the mechanism name carefully and build ALL 5 ads around what it actually represents.

Your task is to write 5 distinct video ad scripts (45-90 seconds each when read aloud) for "${client.businessName}" using "${uniqueMechanism}" as the core mechanism.

STYLE & VOICING REQUIREMENTS:
- Conversational, casual tone (like talking to a friend)
- Direct, no-fluff approach
- Specific numbers and concrete promises relevant to the niche (use realistic figures)
- Address skepticism and common objections specific to this niche
- Use "you" and "I" to build personal connection
- Create curiosity gaps that compel action
- Strong, clear CTAs with specific next steps

REFERENCE THE COPYWRITING PRINCIPLES:
- Use vivid mental imagery
- Frame actions as gains, not losses
- Leverage social proof and scarcity via data
- Use curiosity and incompleteness
- Use permission-giving language
- Address the real problem behind symptoms

EACH AD MUST FOLLOW THIS STRUCTURE:
1. HOOK (first 5-10 seconds): Grab attention immediately
2. BODY (30-60 seconds): Problem → Mechanism → Proof
3. CTA (10-15 seconds): Clear next step with urgency

THE 5 ADS SHOULD USE DIFFERENT AWARENESS LEVELS:

Ad 1 - Problem Aware | Logical Justifier:
- Hook: Direct, honest opening that calls out the core problem in this niche
- Address the main pain point the target audience faces
- Introduce "${uniqueMechanism}" as exclusive or invite-only
- Explain why the conventional approach in this niche fails, but you have the insider solution
- Social proof: helped X people achieve Y result
- CTA: Low-risk next step (free assessment, no obligation)

Ad 2 - Perceived Solution-Aware | Mechanistic:
- Hook: "I'm about to show you a method that changes everything..."
- Call out outdated or common strategies in this niche that don't work
- Reveal "${uniqueMechanism}" as the new, better method
- Explain how it works at a high level (the key differentiator)
- Contrast: better results, faster timeline vs. the old way
- CTA: Direct action (DM a keyword or click button)

Ad 3 - Hero Case Study | Indirect Curiosity Lead:
- Hook: "I need to show you something... This is crazy..."
- Show a specific client result (numbers, timeline, transformation)
- Client story with relatable before state
- Explain the process used ("${uniqueMechanism}")
- Emotional payoff — the human moment
- CTA: Same process available for you

Ad 4 - Unaware | Curiosity:
- Hook: Pattern interrupt that makes them stop scrolling
- Reveal a hidden opportunity or overlooked advantage in this niche
- Explain a counterintuitive concept that makes them rethink their approach
- Why the system/industry works differently than they think
- How to take advantage of this hidden dynamic
- CTA: Join X people who've already achieved Y

Ad 5 - Loophole | Direct:
- Hook: "There's a new method called '${uniqueMechanism}'..."
- Position as underground, newly discovered, or insider-only
- Explain the mechanism simply in 2-3 sentences
- Address the main objection (too complex, too good to be true, etc.)
- Position the service as done-for-you solution
- CTA: Fill form to speak with specialist

CRITICAL FORMATTING RULES:
- Format as: "Ad 1:" followed by script, then "Ad 2:" etc.
- Output ONLY clean ad copy
- NO visual suggestions (like "show laptop" or "switch camera")
- NO timestamps or time markers
- NO production notes or stage directions
- NO formatting instructions (like "bold this" or "add graphic")
- Just pure script text that can be read directly to camera

Each ad should feel authentic and conversational, like the speaker is genuinely trying to help. The copy must be 100% relevant to the "${uniqueMechanism}" niche — not generic funding copy.

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
