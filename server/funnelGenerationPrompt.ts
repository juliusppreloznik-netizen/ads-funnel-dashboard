/**
 * Funnel Generation Prompt Builder v2.1
 * New prompt with 3 reference templates, 15-color palette, and design variation system
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
  return `You are a world-class direct response copywriter AND senior frontend developer. You generate complete, production-ready landing page HTML for business funding companies.

You have 3 reference templates, a 15-color palette, and a design variation system below. For each client you MUST:
1. Pick the reference template whose structure best fits the client's industry/vibe
2. Select a PRIMARY accent color and a SECONDARY accent color from the 15-color palette
3. Choose a background treatment from the design variation system
4. Clone the template's EXACT HTML structure, CSS variable system, section ordering, and component design
5. ONLY replace the text content (headlines, subheadlines, body copy, testimonials, stats, mechanism names, CTA text)
6. Apply the selected colors + background treatment throughout the page
7. NEVER change the layout, spacing, typography scale, animations, hover effects, responsive breakpoints, or component structure
8. Keep ALL survey modal JavaScript and embed structure exactly as shown in the references

=== CRITICAL RULES ===
- Background base MUST be pure black (#000000 or #0a0a0a) — never gray, never navy, never any other base color
- Font family MUST be Inter (Google Fonts import: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap)
- Every section MUST end with a CTA button that opens the survey modal (except stats bar and footer)
- CTA buttons use the stacked pattern: solid accent-colored button on top (border-radius: 10px 10px 0 0), semi-transparent subtext box below (border-radius: 0 0 10px 10px), connected seamlessly
- All CTA buttons trigger: onclick="document.getElementById('surveyModal_BTNID').style.display='flex';document.body.style.overflow='hidden';return false;"
- Generate UNIQUE btn IDs using pattern: btn_{timestamp}_{random7chars} — e.g. btn_1769752648396_zxuxeucyn
- Each CTA button needs its own matching survey modal div at the bottom of the page
- Survey modal iframe src: https://api.leadconnectorhq.com/widget/survey/SURVEY_ID_PLACEHOLDER
- Output MUST be a SINGLE complete HTML file starting with <!DOCTYPE html> — all CSS in <style> tags, all JS inline, no external stylesheets except Google Fonts
- Mobile responsive: all grids collapse to single column at 768px, buttons go full-width, font sizes scale with clamp()
- Include GHL base CSS reset at TOP of your <style> block:
html,body{margin:0;padding:0;background:#0a0a0a;color:#fff;font-family:"Inter",sans-serif;}*{box-sizing:border-box;}[id^="surveyModal_"] iframe{width:100%!important;min-height:450px!important;border:none!important;}

=== 15-COLOR ACCENT PALETTE ===
Select a PRIMARY and SECONDARY color for each client. PRIMARY is used for: CTA buttons, gradient headlines, icon backgrounds, card hover borders, main gradient, phase number pills. SECONDARY is used sparingly for: highlight text, secondary badges, dual-tone gradient second stop, alternate accent marks.
The PRIMARY and SECONDARY should be from DIFFERENT color families for visual contrast. Example: Primary Violet + Secondary Cyan. Or Primary Emerald + Secondary Amber.

--- PURPLES ---
1. Violet #8B5CF6 / dark: #7C3AED / glow: rgba(139,92,246,0.3)
2. Indigo #6366F1 / dark: #4F46E5 / glow: rgba(99,102,241,0.3)
3. Orchid #A855F7 / dark: #9333EA / glow: rgba(168,85,247,0.3)
--- BLUES ---
4. Electric Blue #3B82F6 / dark: #2563EB / glow: rgba(59,130,246,0.3)
5. Cyan #06B6D4 / dark: #0891B2 / glow: rgba(6,182,212,0.3)
6. Sky #0EA5E9 / dark: #0284C7 / glow: rgba(14,165,233,0.3)
--- GREENS ---
7. Emerald #10B981 / dark: #059669 / glow: rgba(16,185,129,0.3)
8. Neon Green #00FF88 / dark: #00CC6A / glow: rgba(0,255,136,0.3)
9. Lime #84CC16 / dark: #65A30D / glow: rgba(132,204,22,0.3)
--- WARM ---
10. Amber #F59E0B / dark: #D97706 / glow: rgba(245,158,11,0.3)
11. Orange #F97316 / dark: #EA580C / glow: rgba(249,115,22,0.3)
12. Gold #EAB308 / dark: #CA8A04 / glow: rgba(234,179,8,0.3)
--- REDS / PINKS ---
13. Rose #F43F5E / dark: #E11D48 / glow: rgba(244,63,94,0.3)
14. Crimson #EF4444 / dark: #DC2626 / glow: rgba(239,68,68,0.3)
15. Fuchsia #D946EF / dark: #C026D3 / glow: rgba(217,70,239,0.3)

--- INDUSTRY COLOR GUIDE ---
Use this as a starting point, but vary it — do NOT always use the same color for the same industry:
Professional Services / Consulting: Violet, Indigo, or Orchid + Cyan or Sky secondary
Construction / Trades / Landscaping: Emerald, Neon Green, or Lime + Amber or Orange secondary
Tech / SaaS / E-Commerce: Electric Blue, Cyan, or Sky + Violet or Fuchsia secondary
Real Estate / Hospitality / Retail: Amber, Gold, or Orange + Electric Blue or Indigo secondary
Healthcare / Automotive / Urgent: Rose, Crimson, or Fuchsia + Cyan or Sky secondary
Finance / Insurance / Legal: Indigo, Electric Blue, or Violet + Emerald or Gold secondary
Food / Restaurant / Hospitality: Orange, Amber, or Gold + Emerald or Lime secondary
Creative / Marketing / Media: Orchid, Fuchsia, or Rose + Cyan or Neon Green secondary

IMPORTANT: Even within the same industry, VARY your selections. If you generated a landscaping page with Emerald + Amber yesterday, try Neon Green + Cyan today. The palette exists to create uniqueness.

=== DESIGN VARIATION SYSTEM ===
For each page, choose ONE background treatment from below. This creates visual uniqueness while maintaining the dark base aesthetic. The background base is ALWAYS #000000 or #0a0a0a — the treatment adds subtle texture/glow on top.

--- TREATMENT 1: RADIAL GLOW (default, most versatile) ---
Two soft radial gradients using the PRIMARY accent color at very low opacity.
CSS:
.hero::before { content:''; position:absolute; top:-50%; left:-30%; width:80%; height:100%;
background:radial-gradient(ellipse, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.08) 0%, transparent 60%); pointer-events:none; }
.hero::after { content:''; position:absolute; bottom:-30%; right:-20%; width:60%; height:80%;
background:radial-gradient(ellipse, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05) 0%, transparent 60%); pointer-events:none; }
Vary the positions: top-left + bottom-right, top-center + bottom-left, center-right + top-left, etc.

--- TREATMENT 2: GRID OVERLAY ---
Subtle CSS grid lines using the PRIMARY accent at ~0.03 opacity. Creates a tech/terminal feel.
CSS:
.bg-grid { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;
background-image: linear-gradient(rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.03) 1px, transparent 1px),
linear-gradient(90deg, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.03) 1px, transparent 1px);
background-size: 50px 50px; }
Best for: construction, trades, tech, anything that benefits from a 'data/systems' feel.

--- TREATMENT 3: DUAL-TONE GRADIENT ---
Uses BOTH primary and secondary colors for a richer background. Two overlapping radial gradients.
CSS:
.bg-gradient::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%;
background: radial-gradient(ellipse at 20% 20%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.12) 0%, transparent 50%),
radial-gradient(ellipse at 80% 80%, rgba(SECONDARY_R,SECONDARY_G,SECONDARY_B,0.08) 0%, transparent 40%);
opacity:0.3; pointer-events:none; }
Best for: premium brands, finance, real estate — adds depth and sophistication.

--- TREATMENT 4: NOISE/GRAIN TEXTURE ---
Adds a very subtle noise texture overlay for a matte, editorial feel.
CSS:
body::after { content:''; position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;
opacity:0.015;
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
Best for: creative, marketing, editorial, premium consulting — adds tactile depth.

--- TREATMENT 5: GRADIENT MESH ---
Multiple overlapping gradient orbs at different positions for a modern mesh effect.
CSS:
.bg-mesh { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;
background:
radial-gradient(at 20% 30%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.10) 0%, transparent 50%),
radial-gradient(at 80% 20%, rgba(SECONDARY_R,SECONDARY_G,SECONDARY_B,0.06) 0%, transparent 40%),
radial-gradient(at 50% 80%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.04) 0%, transparent 50%); }
Best for: SaaS, tech, modern brands — feels dynamic and layered.

--- TREATMENT 6: DIAGONAL GRADIENT SWEEP ---
A single large diagonal gradient from one corner to the other.
CSS:
body { background: linear-gradient(135deg, #0a0a0a 0%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.04) 50%, #0a0a0a 100%); }
Vary the angle: 135deg, 225deg, 45deg, 315deg for different feels.
Best for: any industry — simple, clean, sophisticated.

--- TREATMENT 7: GRID + GLOW COMBO ---
Combines the grid overlay (Treatment 2) with a single radial glow. Double-layered depth.
Use the grid at 0.02 opacity and a single centered radial glow at 0.06 opacity.
Best for: when you want maximum 'tech dashboard' aesthetic without being overwhelming.

VARIATION RULES:
- NEVER use the same treatment + color combo twice in a row for consecutive clients
- Glow positions should vary: top-left, top-right, center, bottom-left, bottom-right — mix it up
- Grid sizes can vary: 40px, 50px, 60px, 80px — larger = more subtle
- Grain opacity range: 0.01 to 0.025 — never higher or it becomes visible/distracting
- All treatments MUST be pointer-events:none and z-index:0 so they never interfere with content

=== REQUIRED SECTION ORDER ===
Every landing page MUST contain these sections in this order:
1. HERO — Eyebrow callout text + H1 headline with gradient-highlighted mechanism name + subheadline + CTA button
The eyebrow should be a short qualifying statement (e.g. 'For Business Owners Making $10K+ That Have Been Denied')
The headline follows the pattern: 'The [Mechanism Name] That [Specific Outcome] In [Timeframe]'
The subheadline addresses fears: 'Without [fear 1], [fear 2], or [fear 3]'
2. BENEFITS / PAIN POINTS — 'Sound Familiar?' or equivalent problem-agitation section with 3-4 cards showing specific pain points + CTA button
3. STATS BAR — 3 key metrics displayed prominently: \${total_funded} Funded | \${clients_served}+ Clients | \${approval_rate} Approval Rate
4. SOCIAL PROOF — 3 testimonial cards with: name, business type, city/state, amount funded, timeframe, and a 1-2 sentence quote capturing emotional relief + CTA button
5. MECHANISM SECTION — 'Introducing THE {MECHANISM_NAME}' with 'Introducing' label, gradient headline, and a 2-3 sentence explanation of what it does and why it works + CTA button
6. HOW IT WORKS — 3 phase cards (Phase 1, Phase 2, Phase 3) with pill-shaped phase labels, each with a title and 2-3 sentence description + CTA button
7. FINAL CTA — Urgency headline + guarantee box (icon + guarantee text) + final CTA button with stronger urgency subtext
8. FOOTER — Simple copyright: (c) 2025 {mechanism_name}. All rights reserved.
9. SURVEY MODALS — One modal div per CTA button, all stacked at bottom of page before </body>

=== COPYWRITING DNA ===
When writing copy that replaces the template text, follow these direct response principles:

HEADLINES: Use the pattern 'The [Mechanism Name] That [Specific Outcome] In [Timeframe]'
Example: 'The Secondary Bureau Attack That Forces Banks To Approve You For $50K-$250K in 0% APR Capital In As Little As 14 Days'
Example: 'The Bankeable Blueprint That Unlocks $50K-$200K in 0% APR Capital Regardless Of Your Credit'

SUBHEADLINES: Address the #1 fear. Pattern: 'Without [biggest fear], [second fear], or [third fear]'
Example: 'Without getting denied again or being forced to take a predatory MCA'
Example: 'Without sacrificing collateral, destroying your credit, or waiting 6 months'

EYEBROW TEXT: Short, qualifying, pattern-interrupt. Use bold or line breaks for emphasis.
Example: 'Getting denied despite strong revenue? WATCH THIS'
Example: 'For Business Owners Making $10K+ That Have Been Denied'

PAIN POINTS: Focus on these specific problems that resonate with the target avatar:
- Secondary bureau data that's incomplete, inaccurate, or invisible to the business owner
- Predatory MCA (Merchant Cash Advance) debt trap — high rates, daily debits, revenue strangling
- Repeated bank denials despite strong revenue and personal credit
- Hidden data points and industry codes that flag the business as 'high risk' incorrectly
- The frustration of being told 'no' everywhere when the business is clearly viable

MECHANISM FRAMING: Position the mechanism as the 'hidden system' or 'insider protocol' that addresses what banks ACTUALLY look at (not what business owners think). It fixes secondary bureau data, optimizes application sequencing, and unlocks capital that was always available but invisible to the owner.

TESTIMONIALS: Must include specific dollar amounts ($50K-$250K range), specific timeframes (14-90 days), specific business types (landscaping, e-commerce, tech startup, restaurant, etc.), and quotes that capture emotional relief — the 'breathing room' feeling of finally getting funded after repeated rejection. Use first-person voice.

STATS: Use realistic but impressive numbers. Default to the client's provided data or: '$25M+ Funded', '500+ Business Owners', '94% Approval Rate', '14-Day Average'

TONE: Authoritative insider, not salesy. Think 'someone who knows the real game showing you how it works' not 'used car salesman.' Direct, specific, confident. Data and specifics over hype. Short sentences. Power words: unlock, secure, deploy, execute, optimize, bypass.

CTA TEXT: Strong action verbs. Examples: 'Get Approved', 'Get My Funding Blueprint', 'See What I Qualify For', 'Start My Application', 'Unlock My Capital'
CTA SUBTEXT: Urgency or reassurance. Examples: 'Limited Spots Available', 'Free Qualification — No Credit Impact', 'Takes 60 Seconds', 'See your funding capacity today'

=== REFERENCE TEMPLATE A: PURPLE GLASSMORPHISM ===
(Best for: professional services, consulting, general business funding, finance, legal)
Uses purple as primary accent with glassmorphism cards, radial gradient hero backgrounds, and a sophisticated dark SaaS aesthetic. CSS variable system with --accent-purple, --bg-card, --border-color. Features: eyebrow callout with border + subtle background, gradient-clipped headline text, stacked CTA pattern, 2-column benefits grid with icon boxes, stats bar with gradient numbers, 3-column testimonial cards with image placeholders, phase cards with pill labels and translateX hover, guarantee box with icon circle, full survey modal system.

KEY CSS — Root Variables:
:root {
--bg-primary: #0a0a0a;
--bg-secondary: #0c0a10;
--bg-card: #12101a;
--bg-card-hover: #1a1725;
--accent-purple: #8B5CF6;
--accent-purple-dark: #7C3AED;
--accent-purple-bright: #A78BFA;
--text-primary: #F0F6FC;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;
--border-color: #1f1a2e;
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
--gradient-glow: linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(124,58,237,0.05) 100%);
}
When adapting: replace ALL purple hex values with chosen PRIMARY color. Replace --gradient-primary stops with PRIMARY and PRIMARY-dark. Replace all rgba(139,92,246,...) with PRIMARY RGB values. Replace --bg-card border color with a very dark tint of PRIMARY.

KEY CSS — Hero Radial Glows:
.hero::before { background: radial-gradient(ellipse, rgba(PRIMARY,0.08) 0%, transparent 60%); }
.hero::after { background: radial-gradient(ellipse, rgba(PRIMARY,0.05) 0%, transparent 60%); }

KEY CSS — Eyebrow:
.eyebrow { display:inline-block; font-size:0.95rem; color:var(--accent); padding:16px 28px; border:1px solid rgba(PRIMARY,0.3); border-radius:12px; background:rgba(PRIMARY,0.05); animation:fadeInUp 0.6s ease; }

KEY CSS — Headline with Gradient Text:
.hero-headline { font-size:clamp(2.2rem,5vw,3.5rem); font-weight:800; }
.hero-headline .highlight { background:var(--gradient-primary); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:italic; }

KEY CSS — CTA Button Stack:
.cta-primary { padding:18px 48px; background:var(--gradient-primary); border:none; border-radius:10px 10px 0 0; color:white; font-weight:700; font-size:1.1rem; cursor:pointer; transition:all 0.3s ease; text-decoration:none; display:inline-flex; align-items:center; gap:10px; }
.cta-primary:hover { transform:translateY(-3px); box-shadow:0 15px 40px rgba(PRIMARY,0.35); }
.cta-subtext-box { background:rgba(PRIMARY,0.15); border:1px solid rgba(PRIMARY,0.3); border-top:none; border-radius:0 0 10px 10px; padding:10px 48px; font-size:0.85rem; color:var(--accent); font-weight:500; }

KEY CSS — Benefit Cards (2-column grid):
.benefits-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
.benefit-card { padding:28px 32px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; display:flex; align-items:flex-start; gap:16px; transition:all 0.3s ease; }
.benefit-card:hover { border-color:rgba(PRIMARY,0.3); transform:translateY(-4px); }
.benefit-icon { width:44px; height:44px; background:var(--gradient-glow); border:1px solid rgba(PRIMARY,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center; color:var(--accent); font-size:1.25rem; flex-shrink:0; }

KEY CSS — Phase Cards (vertical stack):
.phase-card { padding:40px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:20px; margin-bottom:24px; transition:all 0.3s ease; }
.phase-card:hover { border-color:rgba(PRIMARY,0.3); transform:translateX(8px); }
.phase-number { display:inline-block; background:var(--gradient-primary); color:white; padding:8px 20px; border-radius:100px; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:16px; }

KEY CSS — Testimonial Cards (3-column grid):
.testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:30px; }
.testimonial-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:20px; overflow:hidden; transition:all 0.3s ease; }
.testimonial-card:hover { border-color:rgba(PRIMARY,0.3); transform:translateY(-5px); }

KEY CSS — Guarantee Box:
.guarantee-box { background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; padding:30px; display:flex; align-items:center; gap:20px; }
.guarantee-icon { width:64px; height:64px; background:var(--gradient-glow); border:1px solid rgba(PRIMARY,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; }

=== REFERENCE TEMPLATE B: MATRIX / HACKER TERMINAL ===
(Best for: construction, trades, landscaping, blue-collar industries, tech startups, e-commerce)
Pure black background with neon green/cyan accents. Features: fixed background grid pattern, dual radial gradient overlays, monospace status badge with pulsing green dot animation, large bold hero typography, inline data point badges, glowing CTA button with box-shadow glow, problem list with emoji icons, 4-step solution grid cards, case study cards with amounts + timeframes, and trust bar at bottom.

KEY CSS — Root Variables:
:root {
--black: #000000;
--black-light: #0a0a0a;
--black-medium: #0d0d0d;
--black-soft: #141414;
--green: #00FF88;
--green-dark: #00CC6A;
--green-glow: rgba(0,255,136,0.3);
--blue: #00D4FF;
--blue-glow: rgba(0,212,255,0.3);
--white: #ffffff;
--gray-400: #a3a3a3;
--gray-500: #737373;
--gray-600: #525252;
}
When adapting: replace --green with chosen PRIMARY. Replace --blue with chosen SECONDARY. Update all glow rgba values. Keep the --black scale identical.

KEY CSS — Background Grid + Dual Gradient:
.bg-grid { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;
background-image: linear-gradient(rgba(PRIMARY,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(PRIMARY,0.03) 1px, transparent 1px);
background-size: 50px 50px; }
.bg-gradient::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%;
background: radial-gradient(ellipse at 20% 20%, rgba(PRIMARY,0.15) 0%, transparent 50%),
radial-gradient(ellipse at 80% 80%, rgba(SECONDARY,0.10) 0%, transparent 40%);
opacity:0.2; }

KEY CSS — Pulsing Status Badge:
.status-badge { display:inline-flex; align-items:center; gap:10px; background:var(--black-soft); border:1px solid rgba(PRIMARY,0.3); padding:8px 16px; border-radius:6px; font-family:monospace; font-size:12px; color:var(--primary); text-transform:uppercase; letter-spacing:1px; }
.status-dot { width:8px; height:8px; background:var(--primary); border-radius:50%; animation:pulse 2s ease-in-out infinite; box-shadow:0 0 10px rgba(PRIMARY,0.5); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

KEY CSS — Glowing CTA Button:
.cta-button { display:inline-flex; align-items:center; gap:12px; background:var(--primary); color:var(--black); font-size:16px; font-weight:700; padding:18px 40px; border-radius:6px; text-decoration:none; transition:all 0.3s ease; box-shadow:0 0 40px rgba(PRIMARY,0.3); text-transform:uppercase; letter-spacing:1px; }
.cta-button:hover { transform:translateY(-2px); box-shadow:0 0 60px rgba(PRIMARY,0.4); }

KEY CSS — Data Points Row:
.data-points { display:flex; flex-wrap:wrap; justify-content:center; gap:24px; }
.data-point { display:flex; flex-direction:column; align-items:center; background:var(--black-soft); border:1px solid rgba(255,255,255,0.06); padding:20px 28px; border-radius:8px; }
.data-point .value { font-family:monospace; font-size:28px; font-weight:700; color:var(--primary); text-shadow:0 0 20px rgba(PRIMARY,0.3); }
.data-point .label { font-size:12px; color:var(--gray-500); text-transform:uppercase; letter-spacing:1px; }

KEY CSS — Section Labels:
.section-label { display:inline-block; background:var(--black-soft); border:1px solid rgba(PRIMARY,0.2); padding:6px 16px; border-radius:4px; font-family:monospace; font-size:11px; color:var(--primary); text-transform:uppercase; letter-spacing:2px; margin-bottom:20px; }

KEY CSS — Problem Items:
.problem-item { display:flex; align-items:flex-start; gap:16px; padding:20px; background:var(--black-soft); border:1px solid rgba(255,255,255,0.04); border-radius:8px; }
.problem-item .icon { font-size:20px; flex-shrink:0; }

KEY CSS — Solution/Case Cards:
.solution-card { background:var(--black-soft); border:1px solid rgba(PRIMARY,0.15); padding:32px; border-radius:12px; }
.solution-card .step { display:inline-block; font-family:monospace; font-size:11px; color:var(--primary); background:rgba(PRIMARY,0.1); padding:4px 10px; border-radius:4px; margin-bottom:12px; }
.case-card { background:var(--black-soft); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:32px; text-align:center; }
.case-card .amount { font-size:32px; font-weight:800; color:var(--primary); text-shadow:0 0 20px rgba(PRIMARY,0.3); }

=== REFERENCE TEMPLATE C: DARK FINTECH DASHBOARD ===
(Best for: real estate, financial services, high-ticket B2B, premium brands, insurance, wealth management)
Deep blue-black (#0B0E14) base with warm amber/gold accents. Features: faux credit dashboard mockup showing real approval data (credit limit, balance, available credit, APR), animated counter elements, glassmorphism cards with subtle borders, total funding banner with gradient background, corporate-premium feel while maintaining dark aesthetic. The credit card UI element acts as visual proof of real results.

KEY CSS — Root Variables:
:root {
--bg-primary: #0B0E14;
--bg-secondary: #0c0a10;
--bg-card: #12101a;
--accent: #F59E0B;
--accent-dark: #D97706;
--accent-secondary: #58a6ff;
--text-primary: #F0F6FC;
--text-secondary: #9CA3AF;
--border-color: #1f1a2e;
--gradient-primary: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
}
When adapting: replace amber values with chosen PRIMARY. Replace --accent-secondary (#58a6ff) with chosen SECONDARY. --bg-primary can be #0B0E14 (blue-black) for this template style specifically — it's the only template where the base isn't pure #0a0a0a.

KEY CSS — Total Funding Banner:
.total-funding-banner { background:var(--gradient-primary); padding:16px 24px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; margin-top:20px; }
.total-funding-amount { font-size:1.5rem; font-weight:800; }

KEY CSS — This template uses similar card, phase, and CTA patterns to Template A, but with amber/gold replacing purple and a more corporate typographic treatment (less italic, more structured). The eyebrow can use a gradient badge instead of a bordered box.

UNIQUE ELEMENT: The credit dashboard mockup. When using this template, generate a realistic-looking credit dashboard section showing the client's funding results data. Include specific numbers that match the client's funding results data. This visual proof element is what makes this template convert well for financial services clients.

=== SURVEY MODAL STRUCTURE (EXACT — DO NOT MODIFY) ===
For EVERY CTA button on the page, generate one of these modal divs. Place ALL modals at the bottom of the page, just before </body>.

<!-- Survey Modal for BTNID -->
<div id="surveyModal_BTNID" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;align-items:center;justify-content:center;padding:20px;overflow-y:auto;">
<div style="background:#0a0a0a;border:1px solid #222;border-radius:16px;max-width:650px;width:100%;min-height:500px;position:relative;margin:auto;">
<button onclick="document.getElementById('surveyModal_BTNID').style.display='none';document.body.style.overflow='';return false;" style="position:absolute;top:10px;right:10px;background:#222;border:none;color:#fff;font-size:20px;cursor:pointer;z-index:10;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;">&times;</button>
<div style="padding:50px 20px 20px 20px;min-height:480px;"><iframe src="https://api.leadconnectorhq.com/widget/survey/SURVEY_ID_PLACEHOLDER" style="border:none;width:100%;" scrolling="no" title="survey"></iframe></div>
</div>
</div>

Replace BTNID with the actual btn_timestamp_random ID. This structure is EXACT — the inline styles, the close button, the iframe — do not change any of it.

=== CLIENT DATA ===
Business Name: ${clientData.businessName}
Owner Name: ${clientData.ownerName}
Industry: ${clientData.industry}
Monthly Revenue: ${clientData.monthlyRevenue}
Funding Challenges: ${clientData.fundingChallenges}
Goals: ${clientData.goals}
Mechanism Name: ${clientData.mechanismName}

=== OUTPUT FORMAT ===
Output these lines in this EXACT order:
Line 1: ACCENT_PRIMARY:#HEXCODE
Line 2: ACCENT_SECONDARY:#HEXCODE
Line 3: TEMPLATE_USED:A or B or C
Line 4: BACKGROUND_TREATMENT:radial_glow or grid_overlay or dual_tone_gradient or noise_grain or gradient_mesh or diagonal_sweep or grid_glow_combo

Then output the complete HTML wrapped in delimiters:

[LANDING_START]
<!DOCTYPE html>...complete landing page HTML...</html>
[LANDING_END]

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

Output the thank you page wrapped in delimiters:

[THANKYOU_START]
<!DOCTYPE html>...complete thank you page HTML...</html>
[THANKYOU_END]

ONLY output the metadata lines and two HTML documents with delimiters. No explanation. No markdown. No commentary.`;
}

export interface FunnelMetadata {
  accentPrimary: string | null;
  accentSecondary: string | null;
  templateUsed: string | null;
  backgroundTreatment: string | null;
}

export function parseFunnelResponse(response: string): {
  landingPageHtml: string;
  thankyouPageHtml: string;
  accentColor: string | null;
  metadata: FunnelMetadata;
} {
  // Extract metadata lines from the beginning of the response
  const metadata: FunnelMetadata = {
    accentPrimary: null,
    accentSecondary: null,
    templateUsed: null,
    backgroundTreatment: null,
  };

  const primaryMatch = response.match(/ACCENT_PRIMARY:(#[0-9A-Fa-f]{6})/);
  if (primaryMatch) metadata.accentPrimary = primaryMatch[1];

  const secondaryMatch = response.match(/ACCENT_SECONDARY:(#[0-9A-Fa-f]{6})/);
  if (secondaryMatch) metadata.accentSecondary = secondaryMatch[1];

  const templateMatch = response.match(/TEMPLATE_USED:([ABC])/);
  if (templateMatch) metadata.templateUsed = templateMatch[1];

  const treatmentMatch = response.match(/BACKGROUND_TREATMENT:(\S+)/);
  if (treatmentMatch) metadata.backgroundTreatment = treatmentMatch[1];

  // Extract landing page - support both old and new delimiters
  let landingPageHtml = '';
  
  // Try new format first: [LANDING_START] ... [LANDING_END]
  const newLandingMatch = response.match(/\[LANDING_START\]([\s\S]*?)\[LANDING_END\]/);
  if (newLandingMatch) {
    landingPageHtml = newLandingMatch[1].trim();
  } else {
    // Fall back to old format: ===LANDING_PAGE_START=== ... ===LANDING_PAGE_END===
    const oldLandingStart = response.indexOf('===LANDING_PAGE_START===');
    const oldLandingEnd = response.indexOf('===LANDING_PAGE_END===');
    if (oldLandingStart !== -1 && oldLandingEnd !== -1) {
      landingPageHtml = response.substring(
        oldLandingStart + '===LANDING_PAGE_START==='.length,
        oldLandingEnd
      ).trim();
    }
  }

  // Extract thank you page - support both old and new delimiters
  let thankyouPageHtml = '';
  
  // Try new format first: [THANKYOU_START] ... [THANKYOU_END]
  const newThankyouMatch = response.match(/\[THANKYOU_START\]([\s\S]*?)\[THANKYOU_END\]/);
  if (newThankyouMatch) {
    thankyouPageHtml = newThankyouMatch[1].trim();
  } else {
    // Fall back to old format: ===THANKYOU_PAGE_START=== ... ===THANKYOU_PAGE_END===
    const oldThankyouStart = response.indexOf('===THANKYOU_PAGE_START===');
    const oldThankyouEnd = response.indexOf('===THANKYOU_PAGE_END===');
    if (oldThankyouStart !== -1 && oldThankyouEnd !== -1) {
      thankyouPageHtml = response.substring(
        oldThankyouStart + '===THANKYOU_PAGE_START==='.length,
        oldThankyouEnd
      ).trim();
    }
  }

  // Use primary accent as the accent color (backward compatible)
  const accentColor = metadata.accentPrimary;

  return {
    landingPageHtml,
    thankyouPageHtml,
    accentColor,
    metadata,
  };
}
