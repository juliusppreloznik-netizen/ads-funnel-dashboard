import { Client } from "../drizzle/schema";

export function getVSLPrompt(client: Client): string {
  return `=== VSL SCRIPT GENERATION ===

You are an elite direct response copywriter. Generate a complete VSL script for a business funding company using the Funding Optimization mechanism.

## CLIENT DATA:
- Client Name: ${client.name}
- Business Name: ${client.businessName}
- Funding Results Link: ${client.driveLink || "Not provided"}

## CORE MESSAGING FRAMEWORK:

### THE UNIQUE MECHANISM: "Funding Optimization"
This is a 2-step process that makes business owners "irresistible" to lenders:
1. **Step 1 - Private Lender Network**: We've built relationships with executive underwriters, business funding managers, and VPs at major banks (Chase, US Bank, Citizens) plus off-market capital originators. Clients get plugged into this network to bypass the gatekeeping that causes 87% of rejections.
2. **Step 2 - Profile Optimization**: We remove "red flags" from personal credit profiles and format funding applications to trigger "guaranteed approval processing." Banks have hidden "approval signals" - and 85% of approval weight comes from specific credit profile data points and "documentation formatting" - NOT revenue, business age, or collateral.

### TARGET AVATAR PSYCHOLOGY:
- Business owners earning $7K-$50K/month
- Industries: Construction, Real Estate, E-commerce, Professional Services
- Core desire: "Breathing room" - not just growth, but relief from constant cash stress
- Core frustration: Being rejected despite decent revenue; feeling like "the system is rigged"
- Core fear: Predatory MCA loans, losing personal credit, missing opportunities due to slow funding
- Core belief: "If I could just get the capital, I know I could make this work"

### VSL STRUCTURE (Follow EXACTLY):

#### SECTION 1: HOOK (0:00-0:30)
Open with curiosity + specificity:
"We'll use Funding Optimization to get you access to 6 figures of 0% APR capital in as little as 14 days... 'no questions asked'... even if your credit isn't the best and even if you've been rejected for funding before."

Alternative hooks to test:
- Big Secret: "There's a loophole that 'in the know' business owners are using right now to flip the traditional funding process on its head..."
- Problem-Agitate: "If you're a business owner who keeps getting rejected for funding despite having solid revenue, it's not your fault..."

#### SECTION 2: THE PROBLEM (0:30-3:00)
Paint the painful picture:
- What if you could get approved for as much capital as you want...
- Scale your existing business by 10X...
- Invest in assets that accumulate while you sleep...
- Stop the constant, unrelenting stress of surviving month to month?

WITHOUT resorting to:
- Maxing out personal credit cards
- Disrupting existing cash flow
- Getting taken advantage of by predatory MCA sharks (mention the "110% APR" horror)
- Being chained to high interest term loans
- Waiting months for a "too little too late" SBA loan
- Giving away equity to greedy investors

Even if:
- You've gotten rejected dozens of times
- Your credit score starts with a 6... or even a 5

#### SECTION 3: THE UNIQUE MECHANISM REVEAL (3:00-6:00)
"The Unfair Advantage"

Introduce Funding Optimization:
"See, there's a loophole that 'in the know' business owners are using right now..."

Explain the 2 steps:

**Step 1: Skipping the Line**
Use the nightclub/restaurant analogy:
- "Imagine strolling past the line at the busiest nightclub because you're friends with the owner..."
- "It's like being the bank president's golf buddy while everyone else fills out loan applications online"

Explain the private network:
- 5 years building relationships with executive underwriters, VPs at Chase, US Bank, Citizens
- Off-market capital originators with 12-month waitlists
- Bypass the gatekeeping responsible for 87% of funding rejections

**Step 2: Profile Optimization**
Reveal the hidden truth:
- Banks have hidden "approval signals" they use when deciding
- Cash flow statements, personal income, years in business = only 15% of lending weight
- The other 85%? Specific data points on personal credit profile + "documentation formatting"

"We've found a way to essentially trick the lenders into seeing you as the ideal borrower..."
- Remove "red flags" from credit profile
- Format applications to bypass standard review and trigger 'guaranteed approval' processing
- 100% legal - lenders actually WANT us to do it

#### SECTION 4: SOCIAL PROOF / CASE STUDY (6:00-8:00)
Insert testimonial story:
"Marcus went from 5 months of rejections to getting approved for $120,000 in capital in just 4 weeks..."

Include specifics:
- Previous situation (rejections, MCA trap, credit score)
- What changed (Funding Optimization process)
- Result (specific dollar amount, timeframe, 0% APR)

#### SECTION 5: HOW IT WORKS (8:00-10:00)
Break down the 3-step process:

1. **Fundability Audit**
   - Funding specialist assesses "red flags" in business documentation and personal credit
   - Creates custom optimization game plan

2. **Funding Optimization**
   - In-house consumer data team removes red flag items from personal credit profile
   - Underwriting specialists format filing documents to position business as "safe bet"

3. **Network Activation**
   - After full optimization, notify private network of lenders
   - Approval in as low as 24 hours
   - Direct access to funds to deploy as you please

4. **24/7 Updates**
   - Dedicated account manager keeps you updated every step
   - One text, email, or phone call away

#### SECTION 6: CTA (10:00-11:00)
"You could have 6 figures of capital sitting in your bank account by next month..."

Step 1: Answer a few quick questions
Step 2: Schedule a call with a funding specialist to claim your custom funding blueprint

Urgency: "Due to high demand there are limited call slots available this month"
- "485 people have claimed their blueprint in the last 31 days"

Reassurance:
- No credit check required
- No tax returns required
- We will never share your information with third parties

Final CTA: "Get me funded"

---

OUTPUT FORMAT:
Generate the complete VSL script with:
- Timestamp markers for each section
- Speaker directions in [brackets]
- Emphasis on key phrases in **bold**
- Natural, conversational tone - not salesy or hype-y
- Approximately 10-12 minutes total length`;
}

export function getAdsPrompt(client: Client): string {
  return `=== GENERATE 5 VIDEO AD SCRIPTS ===

You are an elite direct response copywriter specializing in short-form video ads for business funding. Generate 5 unique ad scripts optimized for Facebook/Instagram/YouTube.

## CLIENT DATA:
- Client Name: ${client.name}
- Business Name: ${client.businessName}

## CORE OFFER:
- 6 figures of 0% APR business capital in as little as 14 days
- Works even with bad credit or previous rejections
- Unique Mechanism: "Funding Optimization" (private lender network + profile optimization)

## TARGET AVATAR:
- Business owners earning $7K-$50K/month
- Industries: Construction, Real Estate, E-commerce, Professional Services
- Frustrated by rejections, scared of MCA loans, need capital to grow or survive

## AD FRAMEWORK PRINCIPLES:

### Hook Types to Use (one per ad):
1. **Contrast + Problem Hook**: "Most business owners struggle with [common problem], but the real issue is [hidden problem]..."
2. **Big Secret Hook**: "There's a loophole that 'in the know' entrepreneurs are using to get 6 figures in funding..."
3. **Story Hook**: "I was $50K in debt with a 580 credit score when I discovered..."
4. **Self-Identification Hook**: "This is for business owners who keep getting rejected for funding despite having solid revenue..."
5. **Fear of Missing Out Hook**: "While you're waiting on bank approvals, your competitors are using this underground method..."

### Body Structure:
- Agitate the problem (2-3 sentences max)
- Introduce the mechanism (Funding Optimization)
- One key benefit or proof point
- Clear CTA

### CTA Options:
- "Click below to see how much you qualify for"
- "Book your free funding blueprint call"
- "Take the 60-second qualification quiz"

---

## OUTPUT: Generate 5 complete ad scripts

### AD 1: Problem-Agitate-Solution (30-45 seconds)
**Hook Type:** Contrast + Problem
**Platform:** Facebook/Instagram Feed
**Tone:** Empathetic, educational

[Generate full script with hook, body, CTA]

---

### AD 2: Big Secret/Curiosity (30-45 seconds)
**Hook Type:** Big Secret
**Platform:** YouTube Pre-Roll
**Tone:** Mysterious, insider knowledge

[Generate full script with hook, body, CTA]

---

### AD 3: Story-Based Testimonial Style (45-60 seconds)
**Hook Type:** Story Hook
**Platform:** Facebook/Instagram
**Tone:** Relatable, authentic

[Generate full script with hook, body, CTA]

---

### AD 4: Direct Challenge (15-30 seconds)
**Hook Type:** Self-Identification
**Platform:** TikTok/Reels
**Tone:** Direct, punchy

[Generate full script with hook, body, CTA]

---

### AD 5: Urgency/FOMO (30-45 seconds)
**Hook Type:** Fear of Missing Out
**Platform:** Facebook/Instagram
**Tone:** Urgent but not hype-y

[Generate full script with hook, body, CTA]

---

## FORMAT REQUIREMENTS:
- Each ad clearly labeled (Ad 1, Ad 2, etc.)
- Hook in first line (must stop the scroll in 3 seconds)
- Include [VISUAL SUGGESTION] notes where helpful
- Keep language conversational, not corporate
- Include specific numbers where possible ($120K, 14 days, 0% APR)
- End each with clear, single CTA`;
}

export function getLandingPagePrompt(client: Client, htmlTemplate: string): string {
  return `=== LANDING PAGE COPY GENERATION ===

You are an elite direct response copywriter. Generate NEW copy for a landing page by performing LITERAL find-and-replace on the template below.

## CRITICAL INSTRUCTIONS:
1. DO NOT modify the HTML structure, CSS, classes, or layout in ANY way
2. ONLY replace the text content between HTML tags
3. Keep the exact same sections, formatting, and design
4. Preserve all Framer classes, data attributes, and styling exactly as-is
5. The output must be the COMPLETE HTML file with only text content changed

## CLIENT DATA:
- Client Name: ${client.name}
- Business Name: ${client.businessName}

## COPY REPLACEMENT MAPPING:

Replace these text elements with new personalized copy:

### BRAND NAME
- Replace "Citadel Consulting" → "${client.businessName}"
- Replace "Citidel Consulting" → "${client.businessName}"

### HEADLINE (Above the Fold)
Original: "We'll use Funding Optimization to get you access to 6 figures of 0% APR capital in as little as 14 days 'No questions asked'."
→ Generate NEW headline with same promise, different wording. Keep "Funding Optimization" mechanism.

### SUBHEADLINE
Original: "Even if your credit isn't the best and even if you've been rejected for funding before."
→ Generate NEW subheadline addressing same objections.

### SOCIAL PROOF LINE
Original: "50+ entrepreneurs approved every month"
→ Keep or slightly vary

### CTA BUTTON TEXT
Original: "Get me funded"
→ Keep as-is OR test: "Show me how" / "Claim my blueprint"

### BODY COPY SECTIONS
Replace all body copy paragraphs with new copy that:
- Maintains the same emotional arc (problem → agitation → mechanism → proof → CTA)
- Uses the Funding Optimization unique mechanism
- Addresses the same avatar pain points
- Keeps similar length to original paragraphs

### TESTIMONIALS
- Keep testimonial structure
- Update names if desired
- Keep result claims similar ($120K, $175K, $200K ranges)

### FAQ QUESTIONS
Keep the same questions:
1. "How long does it take to get funded?"
2. "Will this work for start ups? Do I need to have an established business?"
3. "Is this a training course or will you actually do the work?"
4. "My personal credit score is pretty bad. Can I still get approved?"
5. "Will the business account report to my personal credit?"
6. "How much funding will I get approved for?"
7. "What if I do not receive any funding?"

Generate NEW answers for each.

### METRICS SECTION
Keep structure, can adjust numbers slightly:
- "$X.X million" in funding allocated
- "XX%" approval rate
- "XX+" clients funded

## COLOR SCHEME OPTIONS:
If client requests different colors, provide CSS variable replacements for:
- Primary accent (currently orange: rgb(237, 109, 5))
- Secondary accent
- Background tones

DEFAULT: Keep existing color scheme unless specified.

## OUTPUT FORMAT:
Return the COMPLETE HTML file with:
1. All original HTML structure preserved exactly
2. Only text content replaced with new copy
3. All Framer classes, scripts, and styling untouched
4. Ready to deploy as-is

---

[THE HTML TEMPLATE]:
${htmlTemplate}`;
}
