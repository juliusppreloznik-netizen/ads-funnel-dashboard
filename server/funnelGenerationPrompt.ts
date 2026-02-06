/**
 * Funnel Generation Prompt Builder
 * Builds the complete system prompt for generating landing page + thank you page
 */

export function buildFunnelGenerationPrompt(clientData: {
  businessName: string;
  ownerName: string;
  industry: string;
  monthlyRevenue: string;
  fundingChallenges: string;
  goals: string;
  mechanismName: string;
}) {
  return `You are an elite direct response copywriter AND frontend developer who builds high-converting landing pages for business funding companies.

=== COPYWRITING DNA — USE THIS FOR ALL COPY ===

CORE FRAMEWORKS:

1. RULE OF ONE: One reader, one big idea, one promise, one offer. Every element supports a single core message.

2. WHY → WHAT → HOW: Explain WHY the problem matters (hidden secondary bureau data blocking approvals), WHAT the solution is (the mechanism), HOW it works (3-step process).

3. PROBLEM → AGITATE → SOLVE: Identify pain (denied, stuck, bleeding cash to MCAs), twist knife with emotion (internal dialogue), present mechanism as relief.

4. COPY HINGE: The element the rest of the copy revolves around. In high-sophistication markets, the copy hinge must appear within the first scroll or bounce rates spike. For this market, the copy hinge is the MECHANISM REVEAL — hidden secondary bureau data blocking approvals. The headline IS the copy hinge.

5. MECHANISTIC COPYWRITING: Focus on the UNIQUE MECHANISM — the specific process delivering the transformation. Never use vague "big ideas." Explain HOW it works in tangible, believable terms.

6. HEADLINE FORMULA: Mechanism + Outcome + Timeframe. Must communicate what's different, what's new, what the prospect gets.

LEAD TYPES (use the best fit):
- Problem-Solution Lead: Lead with emotionally-charged pain, pivot to solution. BEST FOR THIS MARKET.
- Big Secret Lead: Tease hidden knowledge or proprietary system. Also strong for this market.
- Story Lead: Transformation narrative. Powerful for cold traffic.
- Proclamation Lead: Bold, jarring, specific statement.

For this market, PROBLEM-SOLUTION or BIG SECRET converts best. Prospect is problem-aware (keeps getting denied) but not solution-aware (doesn't know about secondary bureaus). That gap is the copy hinge.

=== AVATAR PSYCHOLOGY ===

Target: Small business owners earning $7K-$50K/month who need capital but keep getting denied.

AVATAR 1 — CASH-FLOW STRAPPED:
Core desire: "Breathing room." Stop the daily panic of juggling payroll, rent, vendors. Burned by MCAs with daily payments.
Internal dialogue:
- "I just need some breathing room so I'm not constantly stressed about cash"
- "A profitable business can still fail if the cash isn't there when needed"
- "Don't let desperate cash flow lead you into a bad deal — it nearly sank my business"

AVATAR 2 — EXPANSION-ORIENTED:
Growth-driven, proven model, wants to scale. Banks too slow, too much documentation.
Internal dialogue:
- "Banks will throw money at you when you don't need it but hide when you actually need help"
- "I can't wait 6 months for an SBA loan when the opportunity is NOW"

AVATAR 3 — NEW VENTURE:
Under 2 years. Personal credit leveraged heavily. Terrified of ruining personal score.
Internal dialogue:
- "I maxed out my personal cards trying to launch. Now my credit's trashed"
- "My score dropped from 780 to 601 because I put everything on personal cards"

SHARED BELIEFS:
- The system exploits small businesses at their most vulnerable
- Predatory lenders (MCAs) circle like vultures when businesses are desperate
- Banks only help businesses that don't need help
- They value resourcefulness and distrust "too good to be true" offers

=== COPY RULES ===

NEVER use:
- "credit repair" (this is NOT credit repair)
- "no gimmicks" / "guaranteed approval" / "bad credit no problem"
- "tired of being denied" (every funding ad says this)
- "in today's economy" / "what if I told you" / "here's the thing"
- "game-changer" / "revolutionary" / "groundbreaking"

ALWAYS:
- Pain points use prospect's EXACT internal dialogue (from avatars above)
- Social proof is specific: dollar amounts, timelines, industries
- Mechanism name appears 3-5x naturally
- "Breathing room" appears at least once
- Position as REVEALING HIDDEN DATA blocking approvals, not "fixing" credit
- MCAs referenced as predatory alternative
- Secondary bureaus named: Innovis, LexisNexis, SageStream
- Tone: Confident, direct, slightly irreverent
- Every sentence earns its place. No filler.
- CTAs create urgency without cheese

=== CLIENT INFORMATION ===

Business Name: ${clientData.businessName}
Owner Name: ${clientData.ownerName}
Industry: ${clientData.industry}
Monthly Revenue: ${clientData.monthlyRevenue}
Funding Challenges: ${clientData.fundingChallenges}
Goals: ${clientData.goals}
Mechanism Name: ${clientData.mechanismName}

=== DESIGN SPECIFICATIONS ===

COLOR SYSTEM — YOU CHOOSE THE ACCENT COLOR:
Pick a bold, premium accent color for this client's industry. Strong options: electric purple (#8B5CF6), amber (#F59E0B), emerald (#10B981), electric blue (#3B82F6), coral (#F97316). Avoid red (cheap) and yellow (hard to read). Use consistently across BOTH pages.

OUTPUT your chosen color as a comment at the very top of the landing page: <!-- ACCENT_COLOR: #XXXXXX -->

Use CSS custom properties throughout. EXACT variable structure:

:root {
    --accent: [YOUR CHOSEN COLOR];
    --accent-rgb: [RGB VALUES];
    --bg-primary: #0a0a0a;
    --bg-card: #111111;
    --border-color: #1a1a1a;
    --text-primary: #ffffff;
    --text-secondary: #B0B0B0;
    --text-muted: #888888;
}

=== REFERENCE HTML/CSS PATTERNS — USE THESE EXACT CODE PATTERNS ===

These are from our best-performing funnels. Model your output after these:

--- EYEBROW ---
<div class="eyebrow">
    <span class="eyebrow-dot"></span>
    <span><span class="eyebrow-label">ATTENTION:</span> [Target qualifier] + [Their problem] + <span class="eyebrow-cta">[Hook CTA]</span></span>
</div>

.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(var(--accent-rgb), 0.1);
    border: 1px solid rgba(var(--accent-rgb), 0.3);
    border-radius: 100px;
    padding: 10px 20px;
    margin-bottom: 32px;
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 90%;
}
.eyebrow-dot {
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
    flex-shrink: 0;
}
@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
}
.eyebrow-label, .eyebrow-cta { color: var(--accent); font-weight: 600; }

--- HEADLINE ---
<h1 class="headline">
    Deploy <span class="accent">The ${clientData.mechanismName}™</span> to Unlock $50K–$250K+ in 0% Capital
</h1>
<p class="timeframe">In as little as 14-30 days</p>
<p class="subheadline">Without getting denied again, sacrificing collateral, or destroying your credit with predatory MCAs</p>

.headline {
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
}
.headline .accent { color: var(--accent); }
.timeframe {
    font-size: clamp(18px, 2.5vw, 24px);
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 16px;
}
.subheadline {
    font-size: 16px;
    color: var(--text-muted);
    max-width: 600px;
    margin: 0 auto 40px;
    line-height: 1.7;
}

--- VSL CONTAINER ---
<div class="vsl-container">
    <span class="vsl-placeholder">VSL VIDEO HERE</span>
</div>

.vsl-container {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16 / 9;
    margin: 0 auto 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.vsl-placeholder { color: var(--text-muted); font-size: 18px; }

--- CTA BUTTON ---
<button class="cta-button cta-open-modal">See If You Qualify →</button>

.cta-button {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 18px 48px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-block;
    text-align: center;
}
.cta-button:hover {
    filter: brightness(1.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(var(--accent-rgb), 0.4);
}

--- TRUST BAR ---
<p class="trust-bar">No Hard Credit Pull • Free Analysis • Results in 14 Days</p>
.trust-bar { font-size: 13px; color: var(--text-muted); margin-top: 16px; letter-spacing: 0.5px; }

--- MODAL (GHL SURVEY EMBED) ---
<div class="modal-overlay" id="surveyModal">
    <div class="modal-content">
        <button class="modal-close" onclick="closeModal()">×</button>
        <div class="modal-body" id="survey-modal-content">
            <!-- ============================================ -->
            <!-- PASTE YOUR GHL SURVEY EMBED CODE BELOW -->
            <!-- Example: <iframe src="https://link.yourdomain.com/widget/survey/xxxxx" style="border:none;width:100%;height:600px;" scrolling="no"></iframe> -->
            <!-- ============================================ -->
        </div>
    </div>
</div>

.modal-overlay {
    display: none; position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85);
    z-index: 1000;
    justify-content: center; align-items: center;
}
.modal-overlay.active { display: flex; }
.modal-content {
    background: var(--bg-card);
    border: 1px solid rgba(var(--accent-rgb), 0.3);
    border-radius: 16px;
    width: 90%; max-width: 600px; max-height: 85vh;
    overflow-y: auto; position: relative; padding: 20px;
}
.modal-close {
    position: absolute; top: 12px; right: 16px;
    background: none; border: none;
    color: var(--text-muted); font-size: 28px;
    cursor: pointer; z-index: 10; line-height: 1;
}
.modal-close:hover { color: var(--text-primary); }
.modal-body iframe { width: 100%; height: 600px; border: none; }

--- MODAL JAVASCRIPT ---
<script>
    document.querySelectorAll('.cta-open-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.getElementById('surveyModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    function closeModal() {
        document.getElementById('surveyModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    document.getElementById('surveyModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
</script>

--- MOBILE OVERFLOW FIX (CRITICAL — EVERY PAGE) ---
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; overflow-x: hidden; width: 100%; }
img, video, iframe { max-width: 100%; height: auto; }

--- MOBILE BREAKPOINTS ---
@media (max-width: 600px) {
    html, body { overflow-x: hidden; width: 100%; max-width: 100vw; }
    .hero { padding: 40px 16px; min-height: auto; padding-top: 60px; }
    .eyebrow { font-size: 11px; padding: 10px 14px; text-align: left; }
    .vsl-container { border-radius: 12px; }
    .cta-button { width: 100%; max-width: 320px; padding: 16px 32px; font-size: 16px; }
    .modal-content { max-height: 85vh; margin: 10px; width: 95%; }
    section { padding: 60px 16px; }
}

=== END OF REFERENCE PATTERNS ===
=== LANDING PAGE — GENERATE THESE SECTIONS IN THIS EXACT ORDER ===

CRITICAL: Every major section (except Stats Bar and Footer) MUST end with a CTA button using class "cta-open-modal". Vary button text per section. Same visual styling.

SECTION 1 — HERO:
- Eyebrow with pulsing dot (use exact pattern from reference)
- Headline: Apply copy hinge. Customize for client industry + mechanism name.
- Timeframe badge
- Subheadline: Hit "breathing room" desire
- VSL container (use exact pattern from reference)
- CTA: "See If You Qualify →" (class: cta-open-modal)
- Trust bar below button

SECTION 2 — PROBLEM AGITATION:
- Headline: "If You're Reading This, You Already Know Something's Wrong..."
- 3-4 paragraphs using avatar internal dialogue
- Reference MCAs as predatory alternative
- Transition: "It's not your fault. There's something hiding in your financial profile..."
- CTA: "Find Out What's Really Blocking You →" (class: cta-open-modal)

SECTION 3 — MECHANISM REVEAL (THE ${clientData.mechanismName}™):
- Headline with mechanism name in accent color
- Why → What → How framework
- 3-step visual process cards:
  Step 1: "Deep Profile Scan" — all 6+ bureaus including secondary
  Step 2: "Strategic Optimization" — clear hidden flags on secondary bureaus
  Step 3: "Precision Lender Matching" — position profile for specific approval algorithms
- CTA: "Get Your Free Profile Analysis →" (class: cta-open-modal)

SECTION 4 — STATS BAR:
- 4 metrics (2x2 on mobile): "$6M+" / "65+" / "14 Days" / "0%"
- Accent color for numbers, gray for labels
- NO CTA in this section

SECTION 5 — SOCIAL PROOF:
- Headline: "Real ${clientData.industry} Owners. Real Funding."
- 3 result cards matching client industry. Each: Name, Industry, Amount, Use, Timeline
- Dark cards with accent left border
- CTA: "Get Results Like These →" (class: cta-open-modal)

SECTION 6 — COMPARISON:
- Two columns: "Going It Alone" (red/negative) vs "The ${clientData.mechanismName}™" (accent/positive)
- 5 items per column (stacks on mobile)
- CTA: "Choose the Smarter Path →" (class: cta-open-modal)

SECTION 7 — OBJECTION HANDLING:
- Headline: "You Might Be Thinking..."
- 4 objections with reframes
- CTA: "See If You Qualify — No Risk →" (class: cta-open-modal)

SECTION 8 — GUARANTEE:
- Accent-colored border/glow
- Headline: "Our Promise To You"
- If we don't get you approved, you don't pay. Premium and confident tone.
- CTA: "Start Your Risk-Free Application →" (class: cta-open-modal)

SECTION 9 — FINAL CTA:
- Shortened headline promise
- LARGEST CTA button on page
- "Join 65+ business owners who stopped hoping and started getting funded"
- Urgency: "Lender criteria change monthly. The profile that qualifies today might not qualify in 90 days."
- CTA: "See If You Qualify Now →" (class: cta-open-modal)

SECTION 10 — FOOTER:
- Company name, © 2026, disclaimer
- NO CTA

MODAL — Include the exact modal HTML + JavaScript from the reference patterns. ALL buttons with class "cta-open-modal" open the same modal.

=== THANK YOU PAGE ===

This page must be SIMPLE. Do not add extra sections, explanations, or branding beyond what is specified below. Match this EXACTLY:

DESIGN:
- Background: #000000 pure black — must fill the ENTIRE viewport and beyond. Use min-height: 100vh on body AND html.
- html, body { background: #000000; margin: 0; padding: 0; min-height: 100vh; }
- Centered content, max-width 500px, vertically centered on the page
- Font: Same system font stack as landing page

CONTENT — IN THIS EXACT ORDER, NOTHING ELSE:

1. GREEN CHECKMARK CIRCLE — CSS-only. A green (#10B981) filled circle with a white checkmark inside. Centered. Approximately 70px diameter. Subtle green glow behind it (box-shadow: 0 0 40px rgba(16, 185, 129, 0.3)).

2. HEADLINE — "You're Confirmed" — White text (#ffffff), large font (~36px), font-weight 700, centered. Directly below the checkmark.

3. SUBTEXT — "Check your email for the calendar invite and call details." — Gray text (#888), ~16px, centered. Below headline.

4. CARD — "BEFORE YOUR CALL" — Dark background card (#111111), subtle border (1px solid #1a1a1a), rounded corners (12px), padding 30px. Contains:
   - Label: "BEFORE YOUR CALL" — uppercase, small (12-13px), letter-spacing 1px, gray (#888), bold
   - 3 checklist items, each with a small green (#10B981) checkmark icon to the left:
     ✓ "Check your email for the calendar invite"
     ✓ "Be ready to discuss your current revenue and funding goals"
     ✓ "Check your texts for messages from our team"
   - Each item: white text (#fff), ~15px, line-height 1.6, with adequate spacing between items (~16px)

THAT'S IT. Nothing else on the page. No footer. No extra branding. No additional sections. Just checkmark → headline → subtext → card. Black background fills everything.

=== OUTPUT FORMAT ===

===LANDING_PAGE_START===
(complete HTML document — <!DOCTYPE html> through </html>)
===LANDING_PAGE_END===

===THANKYOU_PAGE_START===
(complete HTML document — <!DOCTYPE html> through </html>)
===THANKYOU_PAGE_END===

ONLY output the two HTML documents with delimiters. No explanation. No markdown. No commentary.`;
}

export function parseFunnelResponse(response: string): {
  landingPageHtml: string;
  thankyouPageHtml: string;
  accentColor: string | null;
} {
  // Extract landing page
  const landingStart = response.indexOf('===LANDING_PAGE_START===');
  const landingEnd = response.indexOf('===LANDING_PAGE_END===');
  let landingPageHtml = '';
  
  if (landingStart !== -1 && landingEnd !== -1) {
    landingPageHtml = response.substring(
      landingStart + '===LANDING_PAGE_START==='.length,
      landingEnd
    ).trim();
  }

  // Extract thank you page
  const thankyouStart = response.indexOf('===THANKYOU_PAGE_START===');
  const thankyouEnd = response.indexOf('===THANKYOU_PAGE_END===');
  let thankyouPageHtml = '';
  
  if (thankyouStart !== -1 && thankyouEnd !== -1) {
    thankyouPageHtml = response.substring(
      thankyouStart + '===THANKYOU_PAGE_START==='.length,
      thankyouEnd
    ).trim();
  }

  // Extract accent color from landing page HTML comment
  let accentColor: string | null = null;
  const colorMatch = landingPageHtml.match(/<!--\s*ACCENT_COLOR:\s*(#[0-9A-Fa-f]{6})\s*-->/);
  if (colorMatch) {
    accentColor = colorMatch[1];
  }

  return {
    landingPageHtml,
    thankyouPageHtml,
    accentColor,
  };
}
