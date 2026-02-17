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

export function getVSLPrompt(client: any, uniqueMechanism: string): string {
  const niche = detectNiche(uniqueMechanism);

  if (niche === "mortgage") {
    return getMortgageVSLPrompt(client, uniqueMechanism);
  }
  return getFundingVSLPrompt(client, uniqueMechanism);
}

export function getAdsPrompt(client: any, uniqueMechanism: string): string {
  const niche = detectNiche(uniqueMechanism);

  if (niche === "mortgage") {
    return getMortgageAdsPrompt(client, uniqueMechanism);
  }
  return getFundingAdsPrompt(client, uniqueMechanism);
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNDING VSL PROMPT — MANUS COPY DIRECTIVE COMPLIANT
// ═══════════════════════════════════════════════════════════════════════════

function getFundingVSLPrompt(client: any, uniqueMechanism: string): string {
  return `You are an elite direct response copywriter. You write like someone who DISCOVERED an insider secret and is revealing it. Your tone is investigative, urgent, and slightly conspiratorial. You use short, punchy paragraphs — one idea per paragraph. You are writing a VSL script (18-22 minutes when read aloud, 3,500-4,500 words).

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism Name: "${uniqueMechanism}"

═══════════════════════════════════════════════════════════════════════
⛔ ABSOLUTE BLACKLIST — ZERO TOLERANCE — ANY VIOLATION = FULL REGENERATION
═══════════════════════════════════════════════════════════════════════

Category 1 — HIGHEST PRIORITY BAN:
• "Credit repair" — NEVER in any form, any context, even to criticize it
• "Repair your credit" / "Fixing your credit" / "Credit fix" / "Credit restoration"
• "Credit repair company" / "Credit repair service"
• ANY phrase combining "credit" and "repair" in any order
• "Disputing items on your credit report" (this IS credit repair language)
• "Clean up your credit" / "Fix your credit score"

Category 2 — Building Business Credit (BANNED):
• "Building business credit" / "Build your business credit" / "Establish business credit"
• "Net-30 accounts" / "Net-60 accounts" / "Trade accounts" / "Trade lines"
• "Credit stacking"
• "Strategic data furnishing" / "Positive payment history reported to..."
• "Shadow credit profile"
• "Vendor relationships that report to the right agencies"
• "Strengthening your business credit scores"
• "PAYDEX score" / "D&B PAYDEX"
• Any framing where the client needs to open accounts, make payments, or build history

Category 3 — Wrong Process/Offer Language (BANNED):
• "Internal Profile Optimization" as a standalone pillar
• "Strategic Data Furnishing" as a pillar or step
• Any 3-pillar framework (we use a 4-STEP process)
• "We help you establish vendor relationships"
• Any framing where the CLIENT does the work
• Any mention of courses, DIY components, or "we advise you"
• "Hidden data furnishers" without naming them as secondary bureaus (Innovis, LexisNexis, SageStream)
• Vague "hidden factors" language without specifying what they are

Category 4 — Other Forbidden Topics:
• Investment returns, portfolio management, wealth management, stocks, bonds, hedge funds
• Day trading, cryptocurrency, forex, options trading
• Insurance, annuities, retirement accounts

HOW TO REFERENCE FAILED ALTERNATIVES WITHOUT SAYING "CREDIT REPAIR":
Instead of "credit repair doesn't work" → say "This has nothing to do with disputing items on your consumer report and waiting 6 months for nothing to happen."
Instead of "unlike credit repair" → say "While everyone else is playing whack-a-mole on 3 bureaus, we're cutting the data off at the source across all 30."
Instead of "stop wasting money on credit repair" → say "Stop wasting money on services that only touch a fraction of the data lenders actually look at."

═══════════════════════════════════════════════════════════════════════
✅ REQUIRED LANGUAGE — ALL OF THESE MUST APPEAR IN THE VSL
═══════════════════════════════════════════════════════════════════════

Mechanism Language (use these exact phrasings or close variations):
• "27 hidden secondary data furnishers" or "27 secondary bureaus"
• Name at least 2-3 by name: "Innovis, LexisNexis, SageStream"
• "Legal loophole" and/or "Federal data privacy laws"
• Cite at least 2-3 specific regulations: "FCRA, FTC, CFPB, OCC"
• "Cease and desist letters backed by federal statutes"
• "Force them to prove accuracy AND consent"
• "99% of the time they can't"
• "Domino effect" or "Cascades to the Big 3 automatically"
• "30 bureaus" (3 primary + 27 secondary)
• "Ghost data on invisible bureaus" (for problem framing)

The 4-Step Process (ONLY framework allowed):
1. Step 1: 30-Bureau Deep Audit — Audit across ALL primary AND secondary bureaus to find every hidden red flag
2. Step 2: Secondary Bureau Attack — Legal cease & desist process forcing removal of inaccurate/unauthorized data from secondary furnishers, cascading to Big 3
3. Step 3: Funding Profile Optimization — Align remaining business data points for lender algorithms (AFTER removal, not instead of it)
4. Step 4: Insider Lender Submission — Direct submission through insider network to funding decision-makers, bypassing cold applications

Red Flag Items to Reference (use 3-6 throughout the VSL):
• Collections / charge-offs
• Late payments from years ago still showing
• Hard inquiries (including unauthorized/phantom ones)
• Phantom loan applications never submitted
• Incorrect business addresses
• Wrong industry classifications (NAICS/SIC codes)
• Derogatory debt that was already paid
• Student loan misreporting

Offer Elements (ALL must be present):
• Done-for-you (NOT a course, NOT DIY, NOT advisory)
• "We handle 100% of it for you"
• Risk reversal: "If I don't get you approved, you don't pay me a penny"
• Timeline: "As little as 14-30 days"
• Funding range: $50K-$250K+ at 0% APR
• Scarcity: Limited client intake per month

═══════════════════════════════════════════════════════════════════════
📖 MANDATORY NARRATIVE STRUCTURE — FOLLOW THIS EXACT ARC
═══════════════════════════════════════════════════════════════════════

1. HOOK (first 30-60 seconds):
   Pattern interrupt + big promise + "even if" qualifiers.
   Immediately state this has NOTHING to do with building credit, net-30 accounts, or disputing items on consumer reports.
   It's about a hidden data problem on 27 bureaus most people don't know exist.
   Use "${uniqueMechanism}" by name.

2. CREDIBILITY — Broker Origin Story:
   "Four years ago, I was working as a broker in the lending industry..."
   Worked with the biggest lenders. Saw $50K-$80K/month businesses getting denied.
   Couldn't understand why. Started digging into what was really happening behind the scenes.

3. PROBLEM REVEALED — The 27 Hidden Secondary Bureaus:
   Beyond the Big 3 (Experian, TransUnion, Equifax), there are 27 secondary data furnishers.
   Name them: Innovis, LexisNexis, SageStream.
   They collect and sell data without consent or verification.
   Business funding lenders pull from these secondary bureaus IN ADDITION to the Big 3.
   Inaccurate data on these hidden bureaus triggers automatic denials before a human underwriter ever sees the application.
   THIS is the real reason good businesses with solid revenue get rejected.
   Use "ghost data on invisible bureaus" framing.

4. WHY ALTERNATIVES FAIL:
   Services that dispute items on the Big 3 only touch a fraction of what lenders look at.
   Net-30 accounts and credit stacking build on a poisoned foundation.
   SBA loans are slow, bureaucratic, and still denied if secondary data is bad.
   IMPORTANT: NEVER use the words "credit repair" — describe what fails without naming the category.
   Example: "Those services that promise to fix your credit? They only touch 3 bureaus. Your problem is on the other 27."

5. THE MECHANISM — The Legal Loophole:
   Federal data privacy laws: FCRA, FTC, CFPB, OCC regulations.
   We deploy cease and desist letters backed by federal statutes.
   Force each secondary data furnisher to prove data accuracy AND that the consumer gave express consent.
   99% of the time they can't prove it.
   Items are legally required to be removed.
   Removals cascade from secondary bureaus to the Big 3 automatically — the domino effect.
   We then optimize the clean profile and submit through our insider lender network.

6. PROCESS BREAKDOWN — The 4 Steps:
   Walk through each step in detail:
   Step 1: 30-Bureau Deep Audit
   Step 2: Secondary Bureau Attack
   Step 3: Funding Profile Optimization
   Step 4: Insider Lender Submission

7. SOCIAL PROOF — Use ONLY These Approved Case Studies:

   Case Study 1 — The Restaurant Owner:
   "$45K/month revenue, rejected by 6 different lenders. We audited his profile and found: incorrect business address from 3 years ago, wrong industry classification (listed as retail instead of food service), $67,000 in derogatory debt from 4 years ago, 2 collections from 1.5 years ago, 14 phantom loan applications he never submitted, 3 late payments still showing from 2 years ago. All on secondary bureau files. We deployed the Secondary Bureau Attack, removed every item, submitted through our insider network. Approved within 1 week: $75K line of credit at 4.1%, $50K business card at 0% APR for 18 months, $25K equipment financing at 3.2%. Total: $150,000. The same banks that rejected him were now competing for his business."

   Case Study 2 — Clark:
   "Every dollar of profit going back into the business. Bad months forced expenses onto personal credit cards. Score tanked to 520. No access to capital. His words: 'I didn't start this business to survive, I started it to thrive and give my kids a better life.' In 32 days, approved for $75,000 at 0% APR. Used the capital to capitalize on a supplier deal, finally got breathing room."

   Case Study 3 — Tom:
   "$110,000 in funding. Grew his business to $1 million in sales in less than a year."

   Aggregate: "Last year alone, we helped 65 business owners access over $6 million in total funding."

   DO NOT fabricate new case studies. Only use these three plus the aggregate number.

8. COST OF INACTION:
   Every month without capital costs money. Competitors are using this.
   The window is closing. Requirements tighten monthly.
   6 months from now it'll be harder. The time to act is now.

9. OFFER:
   Done-for-you. Full audit + attack + optimization + insider submission.
   "We handle 100% of it for you. All you have to do is check your email and accept the approval when it comes."

10. RISK REVERSAL:
    "If I don't get you approved, you don't pay me a penny. Zero risk on your part."

11. SCARCITY + CLOSE:
    Limited spots per month. CTA to apply / short application.
    "Click the button below, answer a few quick questions, and let's see what you qualify for."

═══════════════════════════════════════════════════════════════════════
🎙️ TONE & VOICE RULES
═══════════════════════════════════════════════════════════════════════

DO:
• Write like someone who DISCOVERED an insider secret and is revealing it
• Use concrete specifics: exact dollar amounts, exact timelines, exact number of items removed, named bureaus, named regulations
• Position the 27 secondary bureaus as the VILLAIN — stealing data, selling it illegally, not verifying accuracy
• Position the client as the VICTIM who now has a legal weapon
• Position us as the INSIDER who cracked the code through direct relationships with bank underwriters and VPs
• Use short, punchy paragraphs — one idea per paragraph, lots of white space
• Frame the legal process as a LOOPHOLE the 1% already know about
• Emphasize SPEED: "as little as 14 days" / "within one week" / "32 days"
• Emphasize DONE-FOR-YOU: "All you do is check your email and accept the approval"

DON'T:
• NEVER mention "credit repair" in any form
• NEVER sound like a generic credit service — we are a legal data removal + funding service
• NEVER use passive voice — we DO things, we don't "help you do" things
• NEVER use vague mechanism language — always name what we attack, how, and what happens
• NEVER position the client as needing to "build" anything — framing is REMOVAL of bad data, not ADDITION of good data
• NEVER use academic, corporate, or overly polished tone — direct, conversational, slightly edgy
• NEVER fabricate case study details — only use the 3 approved case studies above

═══════════════════════════════════════════════════════════════════════
⛔ OUTPUT VALIDATION — SELF-CHECK BEFORE OUTPUTTING
═══════════════════════════════════════════════════════════════════════

Before outputting, verify:
□ Does the copy mention "credit repair" anywhere? → If yes, REGENERATE ENTIRELY
□ Does it mention "building business credit" / net-30 / credit stacking / trade lines? → If yes, REGENERATE
□ Does it use "Strategic Data Furnishing" as a mechanism? → If yes, REGENERATE
□ Does it use a 3-pillar framework? → If yes, REGENERATE (must be 4-step)
□ Does it position the client as doing the work? → If yes, REGENERATE
□ Does it reference "27 secondary bureaus" and name at least 2? → REQUIRED
□ Does it describe the legal mechanism (cease & desist + FCRA/FTC)? → REQUIRED
□ Does it mention the domino/cascade effect? → REQUIRED
□ Does it use the 4-step process? → REQUIRED
□ Does it state done-for-you + no results no fee? → REQUIRED
□ Does it include at least 2 case studies with specific numbers? → REQUIRED

═══════════════════════════════════════════════════════════════════════
FORMATTING RULES
═══════════════════════════════════════════════════════════════════════

- Output ONLY continuous flowing copy — 3,500-4,500 words
- NO timestamps (like [0:00])
- NO section headers (like "Hook:" or "Body:")
- NO visual suggestions (like "show laptop screen")
- NO stage directions or production notes
- Just pure script text that flows naturally when read aloud

Write the complete VSL script now:`;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNDING ADS PROMPT — MANUS COPY DIRECTIVE COMPLIANT
// ═══════════════════════════════════════════════════════════════════════════

function getFundingAdsPrompt(client: any, uniqueMechanism: string): string {
  return `You are an elite direct response copywriter specializing in short-form video ad scripts. Your tone is investigative, urgent, and slightly conspiratorial. Direct, no-fluff, conversational — like talking to a friend who just discovered something big.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism Name: "${uniqueMechanism}"

═══════════════════════════════════════════════════════════════════════
⛔ ABSOLUTE BLACKLIST — ZERO TOLERANCE — ANY VIOLATION = FULL REGENERATION
═══════════════════════════════════════════════════════════════════════

NEVER USE ANY OF THESE — NOT EVEN TO CRITICIZE THEM:
• "Credit repair" / "repair your credit" / "fixing your credit" / "credit fix" / "credit restoration"
• "Building business credit" / "establish business credit" / "net-30" / "net-60" / "trade lines" / "credit stacking"
• "Strategic data furnishing" / "shadow credit profile" / "PAYDEX" / "D&B"
• "Disputing items on your credit report" (this is credit repair language)
• Any framing where the client does the work, opens accounts, or builds history
• Any 3-pillar framework (we use 4 steps)
• Investment, portfolio, wealth management, stocks, crypto, forex

HOW TO ATTACK ALTERNATIVES WITHOUT SAYING "CREDIT REPAIR":
• "Those companies that promise to fix your credit? They only touch 3 bureaus. Your problem is on the other 27."
• "Stop wasting money on services that only touch a fraction of the data lenders actually look at."
• "This has nothing to do with disputing items on your consumer report and waiting 6 months."

═══════════════════════════════════════════════════════════════════════
✅ EVERY AD MUST INCLUDE ALL OF THESE ELEMENTS
═══════════════════════════════════════════════════════════════════════

1. Reference to 27 hidden/secondary bureaus as the hidden cause of denials
2. Name at least 1-2 specific bureaus (Innovis, LexisNexis, SageStream)
3. The legal mechanism: cease & desist + federal law (FCRA/FTC) forcing data removal
4. Domino effect / cascade to the Big 3
5. At least one specific result number from approved case studies
6. Done-for-you (NOT a course, NOT DIY)
7. Risk reversal: "No results, no fee" / "If I don't get you approved, you don't pay"
8. CTA: apply/qualify link + scarcity or urgency
9. "${uniqueMechanism}" mentioned by name

═══════════════════════════════════════════════════════════════════════
📖 THE 5 REQUIRED AD ANGLES — USE THESE EXACT ENTRY POINTS
═══════════════════════════════════════════════════════════════════════

Write 5 distinct video ad scripts (45-90 seconds each when read aloud).

Ad 1 — PROBLEM AWARENESS:
Lead with the frustration of unexplained denials. Reveal 27 hidden bureaus as the cause.
Hook example: "Your business makes $50K/month… so why does every lender keep saying no?"
Explain that beyond the Big 3, there are 27 secondary bureaus (name them) with ghost data triggering automatic denials.
Introduce "${uniqueMechanism}" — the legal process that forces removal.
Result: reference the Restaurant Owner ($150K approved after 6 rejections).
CTA with urgency.

Ad 2 — ENEMY / US VS. THEM:
Position the 27 secondary bureaus as the villain. Frame the system as rigged against small business owners.
Hook example: "The funding system is rigged against small business owners. And I can prove it."
Explain how Innovis, LexisNexis, SageStream collect and sell data without consent.
Position yourself as the insider fighting back with federal law.
"${uniqueMechanism}" is the weapon.
Done-for-you + no results no fee.
CTA.

Ad 3 — CASE STUDY / PROOF-FIRST:
Open with a specific client result. Tell the story of what was found and removed.
Hook example: "A restaurant owner doing $45K/month got rejected by 6 lenders. 30 days later, those same banks approved him for $150,000."
Walk through what we found on his secondary bureau files (incorrect address, wrong industry code, $67K derogatory debt, 14 phantom applications).
Deployed the Secondary Bureau Attack. Domino effect. Approved.
"${uniqueMechanism}" made it possible.
CTA: "Same process available for you."

Ad 4 — CONTRARIAN / BELIEF SHIFT:
Attack conventional approaches as fundamentally incomplete. Reframe the problem.
Hook example: "Stop wasting money on services that only touch 3 of the 30 bureaus lenders actually check."
Explain why disputing items on the Big 3 is a fraction of the problem.
The real red flags are on 27 secondary bureaus those services don't even know exist.
"${uniqueMechanism}" uses FCRA/FTC law to force removal from ALL 30.
Domino effect cascades to Big 3 automatically.
Clark: 520 score → $75K at 0% APR in 32 days.
CTA.

Ad 5 — URGENCY / OPPORTUNITY WINDOW:
Lead with time-sensitive 0% APR offers. Create urgency around tightening requirements.
Hook example: "Right now, lenders are approving $50K-$150K at 0% APR. But this window is closing fast."
Explain the window: 0% introductory rates, favorable terms, but requirements tighten monthly.
To qualify, your secondary bureau data needs to be clean — that's where "${uniqueMechanism}" comes in.
Legal process, 27 bureaus, cease & desist, domino effect.
"We handle 100% of it. If I don't get you approved, you don't pay."
Limited spots per month. CTA.

═══════════════════════════════════════════════════════════════════════
📊 APPROVED CASE STUDIES — USE ONLY THESE NUMBERS
═══════════════════════════════════════════════════════════════════════

Restaurant Owner: $45K/mo revenue → 6 rejections → found incorrect address, wrong industry code, $67K derogatory debt, 2 collections, 14 phantom applications, 3 late payments on secondary bureaus → removed all → $150K approved in 1 week ($75K LOC at 4.1% + $50K card at 0% APR + $25K equipment at 3.2%)

Clark: Score 520 → $75,000 at 0% APR in 32 days. Quote: "I didn't start this business to survive, I started it to thrive and give my kids a better life."

Tom: $110,000 in funding → grew to $1M in sales in less than a year.

Aggregate: 65 business owners, $6 million in total funding last year.

DO NOT fabricate new case studies or numbers.

═══════════════════════════════════════════════════════════════════════
⛔ SELF-CHECK BEFORE OUTPUTTING
═══════════════════════════════════════════════════════════════════════

□ Does ANY ad mention "credit repair"? → REGENERATE ALL
□ Does ANY ad mention net-30 / credit stacking / trade lines / building business credit? → REGENERATE ALL
□ Does EVERY ad reference 27 secondary bureaus? → REQUIRED
□ Does EVERY ad mention the legal mechanism? → REQUIRED
□ Does EVERY ad include a specific result number? → REQUIRED
□ Does EVERY ad state done-for-you + no results no fee? → REQUIRED
□ Does EVERY ad include "${uniqueMechanism}" by name? → REQUIRED

═══════════════════════════════════════════════════════════════════════
FORMATTING RULES
═══════════════════════════════════════════════════════════════════════

- Format as: "Ad 1:" followed by script, then "Ad 2:" etc.
- Output ONLY clean ad copy
- NO visual suggestions (like "show laptop" or "switch camera")
- NO timestamps or time markers
- NO production notes or stage directions
- Just pure script text that can be read directly to camera
- Each ad should be 45-90 seconds when read aloud

Write all 5 ad scripts now:`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MORTGAGE VSL PROMPT
// ═══════════════════════════════════════════════════════════════════════════

function getMortgageVSLPrompt(client: any, uniqueMechanism: string): string {
  return `You are an elite direct response copywriter. You write like someone who DISCOVERED an insider secret and is revealing it. Your tone is investigative, urgent, and slightly conspiratorial. Short, punchy paragraphs. Writing a VSL script (18-22 minutes, 3,500-4,500 words).

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism Name: "${uniqueMechanism}"
- Niche: Mortgage readiness and home buying

═══════════════════════════════════════════════════════════════════════
⛔ ABSOLUTE BLACKLIST
═══════════════════════════════════════════════════════════════════════

• "Credit repair" in any form — NEVER
• "Disputing items on your credit report"
• "Clean up your credit" / "Fix your credit score"
• Investment, portfolio, wealth management, stocks, crypto
• Real estate INVESTING (this is about buying a HOME to live in)
• Any framing where the client does the work

═══════════════════════════════════════════════════════════════════════
✅ REQUIRED ELEMENTS
═══════════════════════════════════════════════════════════════════════

• "${uniqueMechanism}" as the core mechanism
• Hidden data on secondary bureaus causing mortgage denials
• Done-for-you service (not a course)
• Specific results and timelines
• Risk reversal
• Scarcity

NARRATIVE ARC:
1. HOOK: Bold promise about getting mortgage-approved using "${uniqueMechanism}" even if denied before
2. CREDIBILITY: Origin story working in the mortgage/lending industry
3. PROBLEM: Hidden data on secondary bureaus causing automatic mortgage denials
4. WHY ALTERNATIVES FAIL: Services that only touch the Big 3 bureaus miss the real problem
5. MECHANISM: "${uniqueMechanism}" — the legal process to clean secondary bureau data
6. PROOF: Specific client stories with mortgage approval amounts and timelines
7. COST OF INACTION: Every month renting is money lost, rates changing
8. OFFER: Done-for-you mortgage readiness service
9. RISK REVERSAL: No results, no fee
10. CLOSE: Limited spots, CTA to apply

FORMATTING:
- 3,500-4,500 words, continuous flowing copy
- NO timestamps, NO section headers, NO stage directions
- Pure script text that flows naturally when read aloud

Write the complete VSL script now:`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MORTGAGE ADS PROMPT
// ═══════════════════════════════════════════════════════════════════════════

function getMortgageAdsPrompt(client: any, uniqueMechanism: string): string {
  return `You are an elite direct response copywriter. Investigative, urgent, conversational tone. Writing 5 video ad scripts (45-90 seconds each) for a mortgage readiness service.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism Name: "${uniqueMechanism}"
- Niche: Mortgage readiness and home buying

⛔ BLACKLIST: "credit repair" in any form, investment/wealth management, real estate investing, any framing where client does the work.

✅ EVERY AD MUST INCLUDE: "${uniqueMechanism}" by name, hidden data problem on secondary bureaus, done-for-you service, risk reversal, specific result, CTA with urgency.

5 AD ANGLES:
Ad 1 — Problem Awareness: Frustration of mortgage denials despite good income
Ad 2 — Enemy: The system is rigged — secondary bureaus selling bad data
Ad 3 — Case Study: Specific client went from denied to approved
Ad 4 — Contrarian: Services that only touch 3 bureaus miss the real problem
Ad 5 — Urgency: Interest rates changing, act now before it gets harder

FORMATTING:
- "Ad 1:" then script, "Ad 2:" etc.
- NO visual suggestions, timestamps, or production notes
- Pure script text, 45-90 seconds each when read aloud

Write all 5 ad scripts now:`;
}

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE COPY (unchanged)
// ═══════════════════════════════════════════════════════════════════════════

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
