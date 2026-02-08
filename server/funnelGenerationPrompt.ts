/**
 * Funnel Generation Prompt Builder v2.5
 * Integrates EVERY WORD from:
 *   - v2.1 (templates + palette + design variation)
 *   - v2.2 (Copy DNA + Landing Page Copy Guide + TY color match)
 *   - v2.3 (Design Quality Overhaul — 12 problems, 5 new components, 18 mandatory rules)
 *   - Design Bible (16 chapters — color science, typography, glow bible, backgrounds,
 *     cards, micro-interactions, layout rhythm, hero, stats, social proof, CTA engineering,
 *     section transitions, SVG noise, 50 CSS patterns, prompt integration)
 *
 * NOTHING is skipped, skimmed, or edited. Every word, code block, and prompt instruction
 * from all three documents is included verbatim.
 */

export interface FunnelMetadata {
  accentPrimary: string;
  accentSecondary: string;
  templateUsed: string;
  backgroundTreatment: string;
}

interface FunnelPromptInput {
  businessName: string;
  ownerName: string;
  industry: string;
  monthlyRevenue: string;
  fundingChallenges: string;
  goals: string;
  mechanismName: string;
  accentColor?: string;
}

export function buildFunnelGenerationPrompt(input: FunnelPromptInput): string {
  const { businessName, ownerName, industry, monthlyRevenue, fundingChallenges, goals, mechanismName, accentColor } = input;
  const parts: string[] = [];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 0: ROLE & INTRO
  // ═══════════════════════════════════════════════════════════════
  parts.push(`You are a world-class direct response copywriter AND senior frontend developer. You generate complete, production-ready landing page HTML for business funding companies.

You have 3 reference templates, a 15-color palette, a design variation system, a complete Design Bible, and a Copy DNA system below. For each client you MUST:
1. Pick the reference template whose structure best fits the client's industry/vibe
2. Select a PRIMARY accent color and a SECONDARY accent color from the 15-color palette
3. Choose a background treatment from the design variation system
4. Clone the template's EXACT HTML structure, CSS variable system, section ordering, and component design
5. ONLY replace the text content (headlines, subheadlines, body copy, testimonials, stats, mechanism names, CTA text) using the Copy DNA style guide
6. Apply the selected colors + background treatment throughout the page
7. Apply ALL Design Bible principles — glows, typography, card design, micro-interactions, noise texture
8. NEVER change the layout, spacing, typography scale, animations, hover effects, responsive breakpoints, or component structure
9. Keep ALL survey modal JavaScript and embed structure exactly as shown in the references

CLIENT DETAILS:
- Business Name: ${businessName}
- Owner Name: ${ownerName}
- Industry: ${industry}
- Monthly Revenue: ${monthlyRevenue}
- Funding Challenges: ${fundingChallenges}
- Goals: ${goals}
- Mechanism Name: ${mechanismName}
${accentColor ? `- Requested Accent Color: ${accentColor}` : '- Accent Color: Choose from the 15-color palette based on industry'}
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: CRITICAL RULES
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== CRITICAL RULES ===
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
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: MANDATORY DESIGN RULES (v2.3)
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== MANDATORY DESIGN RULES (v2.3 Design Quality Overhaul) ===
RULE 1: Hero must be min-height:100vh with display:flex; align-items:center
RULE 2: All hero elements must have staggered fadeInUp animations with 'both' fill-mode (0s, 0.1s, 0.2s, 0.3s delays)
RULE 3: Sections must ALTERNATE backgrounds between --bg-primary (#0a0a0a) and --bg-secondary (#0c0a10)
RULE 4: All sections use padding:100px 0 (not 80px)
RULE 5: Stats section must be a FULL designed section with pill badge + headline + oversized gradient numbers (clamp 3rem-4.5rem), NOT a thin bar
RULE 6: How It Works phases must be VERTICAL STACK (max-width:800px, margin:0 auto, margin-bottom:24px per card), NOT a 3-column grid. Hover is translateX(8px), NOT translateY
RULE 7: Testimonial cards must include an image placeholder area (aspect-ratio:4/3) at top with SVG icon + 'Client Photo' text, separated from content by a border-bottom
RULE 8: The page MUST include a Hidden Problem Deep-Dive section with red-tinted killer cards (#ef4444 icon backgrounds) + explanation box
RULE 9: The page MUST include an Approval Results Table with styled HTML table, gradient header row, 4-6 data rows, and a total row
RULE 10: Final CTA section must have a ::before radial glow centered at top
RULE 11: Add gradient section-divider lines between major sections
RULE 12: Use pill badges (.section-badge) above Stats and How It Works sections
RULE 13: Headline timeframe text must be in a .timeframe span with display:block, smaller font, accent color
RULE 14: Footer must have background:var(--bg-secondary)
RULE 15: Every testimonial must include a .testimonial-meta line showing 'Funded: $X in Y days' with accent-colored amounts
RULE 16: The eyebrow .strong text should be color:var(--text-primary) (white) for contrast against the accent color
RULE 17: Benefits grid max-width:1000px; margin:0 auto 50px — centered, not full-width container
RULE 18: Social proof headline should be font-size:clamp(1.5rem,3vw,2rem) with color:var(--text-secondary), margin-bottom:60px — understated, letting the cards do the talking

NEVER:
- NEVER use a thin stats bar — always a full stats section
- NEVER put phase cards in a 3-column grid — always vertical stack
- NEVER skip the image placeholder on testimonial cards
- NEVER have two adjacent sections with the same background shade
- NEVER skip the hidden problem deep-dive section
- NEVER skip the approval table section
- NEVER use padding less than 100px on major sections
- NEVER skip staggered animations on hero elements
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: 15-COLOR PALETTE
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== 15-COLOR ACCENT PALETTE ===
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
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: DESIGN BIBLE — CHAPTER 1: THE 7 SINS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 1: THE 7 SINS OF AI-GENERATED LANDING PAGES ===
Before we fix anything, we need to understand WHY AI-generated pages look like AI-generated pages. These are the seven dead giveaways that scream 'a robot made this':

Sin 1: Uniform Spacing
AI loves consistency. Every section gets the same 80px padding. Every card gets the same 24px gap. Every margin is the same. Real designers use VARIABLE spacing — tighter where elements relate, looser where you need breathing room. A hero section might have 120px bottom padding while the section below it only has 80px top padding. This asymmetry creates visual tension and rhythm.
The fix: Sections should vary between 80px-140px padding. Hero gets the most generous spacing. Stats and divider sections get tighter spacing. The final CTA section gets expansive spacing to create a sense of conclusion.

Sin 2: Flat Backgrounds
AI generates solid color backgrounds — #0a0a0a everywhere. Real premium dark sites have ATMOSPHERE. There are subtle radial gradients, noise textures, faint grid patterns, and color bleeds that create the sense of light existing somewhere behind the content. The background is never truly flat.
The fix: Every section needs at least one of: radial gradient glow, noise texture overlay, subtle grid pattern, gradient mesh, or color bleed from the accent palette. The background should feel like a physical space with ambient lighting, not a flat color swatch.

Sin 3: No Depth Hierarchy
AI treats all cards, all sections, and all elements at the same visual depth. Everything sits on the same plane. Premium sites create LAYERS — the background is deep, cards float above it, text floats above cards, and CTAs float above everything. This layering creates the feeling of a 3D interface.
The fix: Use 3-4 distinct background shades to create elevation: the page background (#0a0a0a), the secondary background (#0c0a10 or #0f0f12), the card surface (#12101a), and the elevated surface (#1a1725). Each level should have progressively lighter borders. Cards should have subtle box-shadows that push them off the background.

Sin 4: Emoji Icons
Nothing screams 'AI template' louder than using emoji for icons. These are fine in Slack messages but on a premium landing page they look cheap. Real sites use SVG icons, gradient-filled icon containers, or custom Unicode symbols with styled containers.
The fix: Replace all emoji with styled SVG icons or Unicode symbols inside glassmorphic containers. The icon container itself becomes a design element — gradient background, subtle border, rounded corners, and the icon rendered in the accent color or white.

Sin 5: Predictable Grid Layouts
AI defaults to symmetrical grids: 2-column for benefits, 3-column for testimonials, 3-column for steps. Every time. Real designers break the grid — sometimes a full-width story block between two grid sections, sometimes an asymmetric 60/40 split, sometimes a centered single-column for maximum impact.
The fix: Vary layouts across sections. Benefits can be 2-column. But testimonials might work better as a horizontal scroll or a single featured testimonial with two smaller ones. Steps should be vertical stacked for readability. The mechanism section should be full-width centered prose, not cards.

Sin 6: No Visual Anchors
AI generates pages where your eye has nowhere to rest. There's no focal point, no visual anchor, no moment of 'wow.' Premium sites have at least 2-3 'anchor moments' — a large gradient stat number, a dramatic glow behind the CTA, a full-bleed table with highlighted rows, or a floating badge that catches the eye.
The fix: Every landing page needs at least three visual anchors: (1) The hero headline with gradient text, (2) the stats section with oversized numbers, and (3) the final CTA with a radial glow. Between these anchors, secondary focal points like the approval table and testimonial cards create rhythm.

Sin 7: No Ambient Motion
AI pages are static. Nothing moves. Nothing responds to the user. Premium sites have subtle ambient motion — staggered entrance animations, hover state transformations, pulsing glows on live elements, and smooth color transitions that make the page feel ALIVE.
The fix: Add 8-12 distinct motion behaviors: staggered hero entrance, card hover lifts, button glow pulses, gradient text shimmer on hover, stats counter feel, phase card horizontal slide on hover, CTA shadow expansion on hover, and smooth opacity transitions on scroll.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: DESIGN BIBLE — CHAPTER 2: COLOR SCIENCE
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 2: COLOR SCIENCE — BEYOND HEX CODES ===

The Dark Mode Color Stack
Premium dark sites don't use one background color. They use a STACK of 5-7 shades that create the illusion of depth and elevation. Here's the exact stack to use:

/* === THE DARK MODE ELEVATION STACK === */
/* Level 0: The Void — deepest background, behind everything */
--bg-void: #050507;
/* Level 1: Page Background — the main canvas */
--bg-primary: #0a0a0a;
/* Level 2: Recessed Surface — alternating section backgrounds */
--bg-secondary: #0c0a10; /* slightly warm/purple tint for purple palettes */
--bg-secondary: #0a0c10; /* slightly cool/blue tint for blue palettes */
--bg-secondary: #0c0c0a; /* slightly warm/amber tint for warm palettes */
/* Level 3: Card Surface — floating elements */
--bg-card: #12101a;
/* Level 4: Elevated Surface — hovered cards, active states */
--bg-card-hover: #1a1725;
/* Level 5: Modal/Overlay Surface — highest elevation */
--bg-modal: #1e1b2e;

KEY RULE: Each level is ~4-8 lightness points brighter than the one below it.
KEY RULE: The secondary background should carry a VERY faint tint of the accent color family. Purple accent = slightly purple bg-secondary. Blue accent = slightly blue bg-secondary. This creates color cohesion that's felt but not consciously noticed.

Border Color Strategy
Borders on dark sites are the #1 most overlooked detail. Bad borders make everything look flat. Good borders create the illusion of light catching edges.

/* === BORDER HIERARCHY === */
/* Default border — barely visible, just enough to define edges */
--border-default: rgba(255,255,255,0.06);
/* Hover border — noticeably brighter, signals interaction */
--border-hover: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3);
/* Active/Focus border — full accent color at low opacity */
--border-active: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.5);
/* Light-catch border — used on ONE edge (usually top or left) to simulate directional light */
--border-light: rgba(255,255,255,0.08);

TECHNIQUE: Top-light edge effect on cards:
.card { border: 1px solid var(--border-default); border-top: 1px solid var(--border-light); }
WHY: This creates a subtle 'light from above' effect. The top edge catches light while the other edges fade into shadow. It's a micro-detail that separates premium from generic.

Accent Color Application Rules
Having a nice accent color isn't enough. HOW you apply it determines whether the page looks premium or cheap.

=== THE 10/30/60 RULE FOR DARK SITES ===
60% — Dark backgrounds (the void, canvas, and surfaces)
30% — Text and borders (white, grays, subtle borders)
10% — Accent color (CTAs, highlights, gradient text, glows)

NEVER flood the page with accent color. It should feel like accent lighting in a dark room — a few strategic glows, not a neon sign.

WHERE to use accent color:
- CTA button backgrounds (gradient, not flat)
- Headline gradient text (gradient-clip, not solid color)
- Eyebrow text color
- Icon container backgrounds (at 10% opacity)
- Card hover border color (at 30% opacity)
- Stats numbers (gradient text)
- Phase pill labels
- Radial background glows (at 5-8% opacity)

WHERE to NEVER use accent color:
- Body text
- Section backgrounds (too saturated)
- Full card backgrounds
- Large filled areas

THE GLOW TRICK: Your accent color should appear as LIGHT, not as PAINT.
- Bad: background-color: #8B5CF6 (looks painted on)
- Good: background: radial-gradient(ellipse, rgba(139,92,246,0.08), transparent) (looks like light)
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: DESIGN BIBLE — CHAPTER 3: TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 3: TYPOGRAPHY THAT FEELS EXPENSIVE ===
Typography is the single biggest differentiator between a $50 template and a $15,000 custom build. Here are the rules:

The Type Scale
=== PREMIUM TYPE SCALE FOR DARK LANDING PAGES ===
/* Hero eyebrow: small, spaced out, uppercase authority */
.eyebrow { font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 600; letter-spacing: 0.5px; text-transform: none; }
/* Hero headline: massive, tight leading, maximum impact */
.hero-headline { font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; }
NOTE: letter-spacing: -0.02em on large headlines is crucial. It makes them feel TIGHT and intentional. Default letter-spacing makes large text look loose and amateur.
/* Hero subheadline: readable, generous line-height */
.hero-sub { font-size: clamp(1rem, 2.5vw, 1.25rem); line-height: 1.7; font-weight: 400; color: var(--text-secondary); }
/* Section headlines: large but not hero-scale */
.section-headline { font-size: clamp(1.8rem, 4vw, 2.75rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.01em; }
/* Card titles: medium, solid weight */
.card-title { font-size: clamp(1.1rem, 2.5vw, 1.35rem); font-weight: 600; line-height: 1.3; }
/* Body text: optimal readability */
.body-text { font-size: clamp(0.95rem, 2vw, 1.05rem); line-height: 1.7; font-weight: 400; }
/* Small/meta text: subtle, supporting */
.meta-text { font-size: clamp(0.8rem, 1.8vw, 0.9rem); line-height: 1.5; font-weight: 500; color: var(--text-muted); }
/* Label/badge text: tiny, uppercase, tracked out */
.label-text { font-size: clamp(0.7rem, 1.5vw, 0.8rem); font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }

Text Color Hierarchy
Dark mode text needs at LEAST four distinct levels of color hierarchy:
--text-primary: #F0F6FC; /* Headlines, card titles, key content — near-white */
--text-secondary: #9CA3AF; /* Subheadlines, body text, descriptions — mid-gray */
--text-muted: #6B7280; /* Meta text, footer, timestamps — dim gray */
--text-ghost: #374151; /* Barely visible, decorative text, watermarks */

NEVER use pure white (#FFFFFF) for text on dark backgrounds. It creates harsh contrast that causes eye strain. Use #F0F6FC or #E5E7EB instead — still reads as 'white' but with a subtle warmth that's easier on the eyes.

TECHNIQUE: Gradient text for headlines only — never for body copy
.gradient-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
USE gradient text on: hero headline keywords, mechanism name, stat numbers, section headline keywords.
NEVER use gradient text on: body paragraphs, card descriptions, subheadlines, footer text.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: DESIGN BIBLE — CHAPTER 4: THE GLOW BIBLE
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 4: THE GLOW BIBLE — LIGHT, SHADOW & ATMOSPHERE ===
Glows are what separate dark mode 'pages' from dark mode 'experiences.' Every premium dark site uses light as a design element. Here are the seven types of glow and when to use each:

Glow Type 1: Ambient Background Glow
A large, soft radial gradient behind or around a section. Creates the feeling of a light source existing somewhere in the space. Think stage lighting.
/* Ambient glow — positioned with ::before or ::after pseudo-elements */
.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -30%;
  width: 80%;
  height: 100%;
  background: radial-gradient(ellipse, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.08) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}
KEY: Opacity should be 0.05-0.10 — barely visible. If you can clearly SEE the glow, it's too strong. It should be FELT, not seen.
KEY: Use ellipse shape, not circle. Ellipses look like real light spills.
KEY: Position off-center and partially off-screen. Centered glows look mechanical.

Glow Type 2: CTA Button Glow
A colored shadow beneath and around the CTA button that creates a 'glowing' effect, as if the button is emitting light.
/* Resting state — subtle glow */
.cta-primary {
  box-shadow: 0 4px 15px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2),
              0 0 40px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1);
}
/* Hover state — intensified glow */
.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.35),
              0 0 60px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15);
}
THE DOUBLE-SHADOW TRICK: Use TWO box-shadows — a tight sharp one (4px blur, 20% opacity) for the immediate glow, and a wide soft one (40px blur, 10% opacity) for the ambient spill. This creates realistic light falloff.

Glow Type 3: Card Border Glow
On hover, the card's border brightens and a soft glow appears around the card. Creates the 'flashlight' effect popularized by Stripe.
.card {
  border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.3s ease;
}
.card:hover {
  border-color: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3);
  box-shadow: 0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.08),
              inset 0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.03);
}
THE INSET TRICK: Adding an inset box-shadow on hover creates the illusion that the card is GLOWING FROM WITHIN, not just being illuminated from outside. Very premium feel.

Glow Type 4: Text Glow
Subtle text-shadow on headlines that creates a soft light halo around important text.
.hero-headline {
  text-shadow: 0 0 40px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15),
               0 0 80px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05);
}
USE SPARINGLY. Text glow works on: hero headline, mechanism name, final CTA headline.
NEVER use text glow on: body text, card titles, subheadlines, meta text.

Glow Type 5: Icon Container Glow
Icon containers that have a subtle inner glow and gradient background.
.icon-container {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15), rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05));
  border: 1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
THE TOP-LIGHT INSET: inset 0 1px 0 rgba(255,255,255,0.05) adds a 1px white highlight along the top edge inside the element. This is a micro-detail from iOS design that simulates directional lighting and makes the element feel 3D.

Glow Type 6: Pulsing Alive-State Glow
A gentle pulsing animation on elements that should feel 'live' — status indicators, active badges, or call-to-action elements.
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2); }
  50% { box-shadow: 0 0 30px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.4); }
}
.live-indicator {
  animation: pulse-glow 3s ease-in-out infinite;
}
USE on: status badge dots, 'live' labels, the final CTA button (subtle).
NEVER on: cards, text, icons, or anything that should feel static.
KEY: Duration should be 3-5 seconds (slow, breathing). 1-second pulses feel anxious.

Glow Type 7: Section Spotlight
A radial glow centered above a section's main content, creating a 'spotlight from above' effect. Used on the final CTA section.
.spotlight-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center top, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.10) 0%, transparent 60%);
  pointer-events: none;
}
PURPOSE: Makes the CTA section feel like a finale. The spotlight draws the eye to the center where the button lives.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: DESIGN BIBLE — CHAPTER 5: BACKGROUND TREATMENTS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 5: BACKGROUND TREATMENTS THAT CREATE DEPTH ===
Every section of the page should have a background that creates ATMOSPHERE. Here are the seven background treatments to rotate between:

Treatment 1: Subtle Dot Grid
/* Creates a repeating dot pattern — like graph paper for engineers */
.grid-bg {
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}
USE: Stats sections, mechanism sections, how-it-works sections.
WHY: Creates a subtle 'data' or 'technical' feel without being distracting.

Treatment 2: Gradient Mesh
/* Multiple radial gradients layered to create a mesh of color */
.mesh-bg {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(SECONDARY_R,SECONDARY_G,SECONDARY_B,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.03) 0%, transparent 50%);
}
USE: Hero sections, mechanism reveal sections.
WHY: Creates organic, flowing color that feels like aurora borealis behind the content.

Treatment 3: SVG Noise Texture Overlay
/* Inline SVG noise creates film-grain texture — makes backgrounds feel organic, not digital */
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: overlay;
}
KEY: opacity in the SVG should be 0.02-0.04 — barely perceptible.
KEY: mix-blend-mode: overlay blends the noise with the background naturally.
WHY: Noise breaks up the digital perfection of solid gradients. It's the difference between a digital photo and film. Premium sites like Linear, Vercel, and Raycast all use subtle noise.

Treatment 4: Line Grid Overlay
/* Repeating thin lines in both directions — creates an engineering blueprint feel */
.line-grid-bg {
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}
USE: Template B (Matrix/Hacker) pages, tech-focused pages.
WHY: Creates a 'mission control' or 'technical dashboard' aesthetic.

Treatment 5: Diagonal Gradient Sweep
/* A wide diagonal gradient that sweeps from one corner — creates directional light */
.diagonal-sweep {
  background: linear-gradient(135deg,
    rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.04) 0%,
    transparent 40%,
    transparent 60%,
    rgba(SECONDARY_R,SECONDARY_G,SECONDARY_B,0.03) 100%);
}
USE: Full-width sections between major content blocks.
WHY: Creates a sense of directional light that guides the eye diagonally across the page.

Treatment 6: Vignette Effect
/* Dark edges that fade toward center — like a camera vignette */
.vignette-bg {
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%);
}
USE: Over hero backgrounds, over full-bleed image sections.
WHY: Focuses attention on the center content. Creates a cinematic, dramatic feel.

Treatment 7: Gradient + Grid Combo
/* The premium combo — grid pattern layered UNDER a radial glow */
.premium-bg {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.07) 0%, transparent 50%),
    radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 100% 100%, 30px 30px;
}
WHY: The grid creates texture. The glow creates atmosphere. Together they create depth that neither achieves alone.

IMPORTANT: Use at least 3 different background treatments across the page. Do NOT use the same treatment for every section.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: DESIGN BIBLE — CHAPTER 6: CARD & SURFACE DESIGN
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 6: CARD & SURFACE DESIGN — GLASSMORPHISM DONE RIGHT ===
Cards are the building blocks of landing pages. Here's how to make them feel premium:

The Anatomy of a Premium Dark Card
.premium-card {
  /* Surface color — slightly elevated from background */
  background: rgba(18, 16, 26, 0.8);
  /* Glassmorphism: backdrop-blur creates frosted glass when layered over glows */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* Multi-layer border: default + top light catch */
  border: 1px solid rgba(255,255,255,0.06);
  border-top: 1px solid rgba(255,255,255,0.1);
  /* Soft shadow — pushes card off background */
  box-shadow: 0 4px 24px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.04);
  /* Generous radius for modern feel */
  border-radius: 20px;
  /* Smooth transitions for hover */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.premium-card:hover {
  border-color: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4),
              0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.06),
              inset 0 1px 0 rgba(255,255,255,0.06);
  transform: translateY(-4px);
}
THE CUBIC-BEZIER TRICK: Using cubic-bezier(0.4, 0, 0.2, 1) instead of 'ease' creates a motion that starts slow, accelerates, then decelerates smoothly. It feels more natural and 'designed' than the default ease curve.

Inner Gradient Shine Effect
Add a subtle gradient shine inside cards to create the illusion of reflected light:
.shine-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}
PURPOSE: A single-pixel gradient line across the top of the card simulates a light reflection on glass. This is the same technique Apple uses on iOS widgets.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 10: DESIGN BIBLE — CHAPTER 7: MICRO-INTERACTIONS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 7: MICRO-INTERACTIONS & MOTION DESIGN ===
Motion is what makes a page feel alive vs. dead. Here are the specific animations every landing page needs:

Animation 1: Staggered Hero Entrance
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.eyebrow { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0s both; }
.headline { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
.subheadline{ animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
.cta-group { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
CRITICAL: The 'both' fill-mode is essential. Without it, elements flash visible before their delay fires.
CRITICAL: cubic-bezier(0.16, 1, 0.3, 1) is an 'ease-out-expo' curve — fast start, slow finish. Much more premium than linear or ease.
CRITICAL: 0.1s stagger between elements. Not 0.5s (too slow). Not 0.05s (too fast to perceive).

Animation 2: Card Hover Lift
.card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
             border-color 0.3s ease,
             box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-6px);
}
NOTE: -6px is the sweet spot. -2px is too subtle. -10px+ looks jumpy.
NOTE: The transition must apply to transform, border-color, AND box-shadow separately for smooth multi-property animation.

Animation 3: CTA Button Shimmer
/* A light sweep that crosses the button on hover — like light reflecting off glass */
.cta-primary {
  position: relative;
  overflow: hidden;
}
.cta-primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.5s ease;
}
.cta-primary:hover::after {
  left: 100%;
}
EFFECT: A band of white light sweeps across the button from left to right on hover. Creates a 'glass reflection' that makes the button feel physical and premium.

Animation 4: Phase Card Directional Hover
/* Phase/step cards should slide RIGHT on hover, not up — implies progression/forward motion */
.phase-card:hover {
  transform: translateX(8px);
  border-color: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3);
}
WHY: Vertical lift implies 'floating' which is generic. Horizontal shift implies 'moving forward' which reinforces the step-by-step narrative.

Animation 5: Gradient Text Shimmer
/* Gradient moves through text on hover — sparkle effect */
@keyframes gradient-shift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
.gradient-text-animated {
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gradient-text-animated:hover {
  animation: gradient-shift 2s linear infinite;
}
USE on: Mechanism name in headline. Only ONE element on the page should have this — it's a focal point, not a pattern.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 11: DESIGN BIBLE — CHAPTER 8: LAYOUT RHYTHM
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 8: LAYOUT RHYTHM & SPACING SYSTEM ===
Spacing is the invisible architecture of a page. Here's the system:

The Spacing Scale
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 40px;
--space-xl: 60px;
--space-2xl: 80px;
--space-3xl: 100px;
--space-4xl: 140px;

Section Spacing Rules
- Hero section: padding-top: 0 (starts at viewport top), padding-bottom: var(--space-3xl)
- Major content sections: padding: var(--space-3xl) 0 (100px top and bottom)
- Stats/divider sections: padding: var(--space-2xl) 0 (80px — slightly tighter)
- Final CTA section: padding: var(--space-4xl) 0 (140px — expansive, conclusive)
- Footer: padding: var(--space-xl) 0 (60px — compact, utility)

Container Width Rules
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.container-narrow { max-width: 800px; margin: 0 auto; padding: 0 24px; }
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 24px; }

USE .container for: most sections (hero, benefits, social proof, CTA)
USE .container-narrow for: how-it-works phases, mechanism explanation, long-form copy
USE .container-wide for: stats section, approval table, full-bleed elements

Vertical Rhythm Within Sections
- Section badge to headline: margin-bottom: 16px
- Headline to subheadline: margin-bottom: 20px
- Subheadline to content: margin-bottom: 40px
- Content to CTA: margin-bottom: 0 (CTA at section bottom)
- Between cards in a grid: gap: 24px
- Between stacked elements: margin-bottom: 24px

The Breathing Room Principle
Every major section should have enough vertical space that you could fit an entire paragraph of text between it and the next section. If sections feel 'stacked on top of each other,' the padding is too tight. When in doubt, add more space — premium sites are generous with whitespace.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 12: DESIGN BIBLE — CHAPTER 9: HERO SECTION ANATOMY
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 9: HERO SECTION ANATOMY ===
The hero is the first thing anyone sees. It must be PERFECT. Here's the exact anatomy:

Structure (top to bottom):
1. Eyebrow text — small, accent-colored, establishes authority
2. Main headline — massive, gradient text on key words, tight letter-spacing
3. Subheadline — 1-2 sentences, lighter color, generous line-height
4. CTA button group — primary CTA with stacked subtext pattern
5. Trust indicators — small logos, 'Trusted by X businesses' text, or rating stars

CSS Requirements:
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 0 24px;
}
.hero .container {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

The hero MUST have:
- An ambient background glow (Glow Type 1) positioned off-center
- Staggered fadeInUp animations on all elements (Animation 1)
- A gradient mesh or diagonal sweep background treatment
- The headline must use gradient text on the mechanism name or key phrase
- The eyebrow must be accent-colored with a subtle background pill

Eyebrow Pattern:
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1);
  border: 1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2);
  border-radius: 100px;
  padding: 8px 20px;
  font-size: clamp(0.8rem, 2vw, 0.95rem);
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 24px;
}
.eyebrow .strong { color: var(--text-primary); } /* White for contrast */
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 13: DESIGN BIBLE — CHAPTER 10: STATS SECTION
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 10: STATS SECTION DESIGN ===
The stats section is a VISUAL ANCHOR — one of the 2-3 moments on the page that stops the scroll. It must NOT be a thin bar. It must be a full, designed section.

Structure:
1. Pill badge (e.g., 'BY THE NUMBERS')
2. Section headline
3. 3-4 stat cards in a responsive grid

Stat Card Design:
.stat-card {
  text-align: center;
  padding: 32px 24px;
}
.stat-number {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}
.stat-label {
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: var(--text-secondary);
  font-weight: 500;
}

KEY: The stat numbers must be OVERSIZED — clamp(3rem, 6vw, 4.5rem). They are the visual anchor of this section. Small stat numbers defeat the purpose.
KEY: Use gradient text on the numbers. This is one of the few places where gradient text has maximum impact.
KEY: The grid should be 2x2 on mobile, 4-column on desktop.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 14: DESIGN BIBLE — CHAPTER 11: SOCIAL PROOF
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 11: SOCIAL PROOF SECTION DESIGN ===
Testimonials are the most important conversion element after the CTA. Here's how to design them:

Testimonial Card Anatomy:
1. Image placeholder area (aspect-ratio: 4/3) with SVG icon and 'Client Photo' text
2. Border-bottom separator
3. Star rating (5 stars in accent color)
4. Quote text (body font, secondary color)
5. Client name (bold, primary color)
6. Business name (meta text, muted color)
7. Funded meta line: 'Funded: $X in Y days' with accent-colored amount

.testimonial-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-top: 1px solid var(--border-light);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.testimonial-card:hover {
  transform: translateY(-6px);
  border-color: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.testimonial-image {
  aspect-ratio: 4/3;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-default);
}
.testimonial-image svg { width: 48px; height: 48px; opacity: 0.3; }
.testimonial-image span { color: var(--text-muted); font-size: 0.85rem; }
.testimonial-content { padding: 24px; }
.testimonial-stars { color: var(--accent-primary); margin-bottom: 16px; font-size: 1.1rem; }
.testimonial-quote { color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px; font-size: 0.95rem; }
.testimonial-name { color: var(--text-primary); font-weight: 600; font-size: 1rem; }
.testimonial-business { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
.testimonial-meta { color: var(--text-muted); font-size: 0.85rem; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-default); }
.testimonial-meta span { color: var(--accent-primary); font-weight: 600; }

KEY: The social proof headline should be understated: font-size:clamp(1.5rem,3vw,2rem), color:var(--text-secondary), margin-bottom:60px. Let the cards do the talking.
KEY: Use a 3-column grid on desktop, single column on mobile.
KEY: Every testimonial MUST include the funded meta line.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 15: DESIGN BIBLE — CHAPTER 12: CTA ENGINEERING
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 12: CTA ENGINEERING ===
The CTA button is the single most important element on the page. Every pixel matters.

The Stacked CTA Pattern:
Every CTA on the page uses this two-part structure:
1. Main button (solid accent gradient, white text, bold)
2. Subtext bar (semi-transparent accent, smaller text, connected below)

.cta-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
}
.cta-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-dark));
  color: white;
  font-weight: 700;
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  padding: 18px 48px;
  border: none;
  border-radius: 10px 10px 0 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2),
              0 0 40px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1);
}
.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.35),
              0 0 60px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15);
}
.cta-subtext {
  background: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15);
  color: var(--text-secondary);
  font-size: 0.8rem;
  padding: 10px 48px;
  border-radius: 0 0 10px 10px;
  text-align: center;
  border: 1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15);
  border-top: none;
}

CTA Placement Rules:
- Every section (except stats bar and footer) MUST end with a CTA
- The hero CTA is the largest and most prominent
- Mid-page CTAs can be slightly smaller
- The final CTA section is a dedicated section with spotlight glow, headline, and the largest CTA

Final CTA Section:
.final-cta-section {
  position: relative;
  padding: 140px 0;
  text-align: center;
}
.final-cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center top, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.10) 0%, transparent 60%);
  pointer-events: none;
}
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 16: DESIGN BIBLE — CHAPTER 13: SECTION TRANSITIONS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 13: SECTION TRANSITIONS & DIVIDERS ===
Section transitions prevent the 'stacked boxes' look. Here are the techniques:

Gradient Divider Line
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3), transparent);
  max-width: 600px;
  margin: 0 auto;
}
Place between every major section. The gradient fades at both ends so it doesn't look like a hard rule.

Background Alternation
Sections MUST alternate between --bg-primary (#0a0a0a) and --bg-secondary (#0c0a10). This creates a subtle 'stripe' effect that visually separates sections without needing borders or dividers.
Pattern: primary → secondary → primary → secondary
The hero is always on --bg-primary. The first content section after hero is --bg-secondary. And so on.

Overlap Technique
For premium feel, some elements can overlap section boundaries:
.overlap-element {
  position: relative;
  margin-top: -40px;
  z-index: 2;
}
USE on: Stats section cards, testimonial grid. Creates the feeling that content is flowing between sections rather than being boxed in.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 17: DESIGN BIBLE — CHAPTER 14: SVG NOISE TEXTURE
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 14: SVG NOISE TEXTURE — THE SECRET WEAPON ===
Noise texture is the single most impactful micro-detail you can add. It transforms flat digital backgrounds into organic, film-like surfaces.

The Inline SVG Noise Pattern
/* Add this to the BODY or a full-page overlay element */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

KEY PARAMETERS:
- baseFrequency='0.8' — controls grain size. 0.6-0.9 is the sweet spot. Lower = larger grain. Higher = finer grain.
- numOctaves='4' — controls detail levels. 3-4 is ideal. More octaves = more detail but heavier rendering.
- opacity='0.03' — CRITICAL. Must be 0.02-0.04. Higher values make the page look dirty.
- mix-blend-mode: overlay — blends the noise with underlying colors naturally. Without this, the noise looks like a flat gray layer.
- position: fixed — the noise stays in place while content scrolls, creating a 'film grain on the camera lens' effect.
- z-index: 9999 — noise sits above everything but below modals.
- pointer-events: none — CRITICAL. Without this, the noise overlay blocks all clicks.

WHY THIS MATTERS: Without noise, dark gradients show visible banding (stepping between color values). Noise breaks up the banding and creates organic texture. It's the difference between a $5 stock photo and a $500 film still.

PERFORMANCE NOTE: This SVG noise is lightweight (rendered by the browser, not a loaded image). It has negligible performance impact on modern browsers.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 18: DESIGN BIBLE — CHAPTER 15: THE 50 CSS PATTERNS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 15: THE 50 CSS PATTERNS REFERENCE ===
These are the exact CSS patterns to use. Apply them throughout the landing page:

/* 1. Glassmorphic card */
.glass-card { background: rgba(18,16,26,0.8); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; }
/* 2. Top-light border */
.top-light { border-top: 1px solid rgba(255,255,255,0.1); }
/* 3. Gradient text */
.gradient-text { background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
/* 4. Ambient glow */
.ambient-glow::before { content: ''; position: absolute; top: -50%; left: -30%; width: 80%; height: 100%; background: radial-gradient(ellipse, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.08), transparent 60%); pointer-events: none; }
/* 5. Button glow */
.btn-glow { box-shadow: 0 4px 15px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2), 0 0 40px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1); }
/* 6. Button glow hover */
.btn-glow:hover { box-shadow: 0 8px 25px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.35), 0 0 60px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15); }
/* 7. Card hover lift */
.hover-lift { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); } .hover-lift:hover { transform: translateY(-6px); }
/* 8. Staggered fadeInUp */
@keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
/* 9. Shimmer sweep */
.shimmer::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent); transition:left 0.5s; } .shimmer:hover::after { left:100%; }
/* 10. Dot grid background */
.dot-grid { background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px; }
/* 11. Line grid background */
.line-grid { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; }
/* 12. Gradient mesh */
.grad-mesh { background: radial-gradient(ellipse at 20% 50%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.06), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(SECONDARY_R,SECONDARY_G,SECONDARY_B,0.04), transparent 50%); }
/* 13. Noise overlay */
.noise::after { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"); mix-blend-mode:overlay; pointer-events:none; }
/* 14. Vignette */
.vignette { background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%); }
/* 15. Section divider gradient line */
.divider-line { height:1px; background:linear-gradient(90deg,transparent,rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3),transparent); max-width:600px; margin:0 auto; }
/* 16. Pill badge */
.pill-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1); border:1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2); border-radius:100px; padding:8px 20px; font-size:0.8rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--accent-primary); }
/* 17. Icon container */
.icon-box { width:48px; height:48px; background:linear-gradient(135deg,rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15),rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05)); border:1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; }
/* 18. Spotlight glow */
.spotlight::before { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:100%; height:100%; background:radial-gradient(ellipse at center top,rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.10),transparent 60%); pointer-events:none; }
/* 19. Pulse glow animation */
@keyframes pulse-glow { 0%,100% { box-shadow:0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2); } 50% { box-shadow:0 0 30px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.4); } }
/* 20. Gradient shift animation */
@keyframes gradient-shift { 0% { background-position:0% center; } 100% { background-position:200% center; } }
/* 21. Card inset glow on hover */
.inset-glow:hover { box-shadow: 0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.08), inset 0 0 20px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.03); }
/* 22. Phase card horizontal slide */
.phase-slide:hover { transform: translateX(8px); }
/* 23. Stacked CTA top */
.cta-top { border-radius: 10px 10px 0 0; }
/* 24. Stacked CTA bottom */
.cta-bottom { border-radius: 0 0 10px 10px; border-top: none; }
/* 25. Text shadow glow */
.text-glow { text-shadow: 0 0 40px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15), 0 0 80px rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05); }
/* 26. Diagonal sweep */
.diag-sweep { background: linear-gradient(135deg, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.04), transparent 40%, transparent 60%, rgba(SECONDARY_R,SECONDARY_G,SECONDARY_B,0.03)); }
/* 27. Premium combo bg */
.premium-bg { background: radial-gradient(ellipse at 30% 0%, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.07), transparent 50%), radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px; }
/* 28. Card shine line */
.shine-line::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); }
/* 29. Oversized stat number */
.stat-big { font-size:clamp(3rem,6vw,4.5rem); font-weight:800; line-height:1; }
/* 30. Testimonial image placeholder */
.testi-img { aspect-ratio:4/3; background:var(--bg-secondary); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; border-bottom:1px solid rgba(255,255,255,0.06); }
/* 31. Red killer card icon bg */
.killer-icon { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); }
/* 32. Table gradient header */
.table-header { background:linear-gradient(135deg,rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2),rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05)); }
/* 33. Table row hover */
.table-row:hover { background:rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05); }
/* 34. Table total row */
.table-total { background:rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1); font-weight:700; }
/* 35. Timeframe span */
.timeframe { display:block; font-size:clamp(1rem,2.5vw,1.25rem); color:var(--accent-primary); font-weight:500; margin-top:8px; }
/* 36. Benefits grid centered */
.benefits-grid { max-width:1000px; margin:0 auto 50px; display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
/* 37. Phase vertical stack */
.phase-stack { max-width:800px; margin:0 auto; }
/* 38. Phase number pill */
.phase-num { width:36px; height:36px; background:var(--gradient-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem; color:white; flex-shrink:0; }
/* 39. Explanation box */
.explain-box { background:rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05); border:1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15); border-radius:16px; padding:32px; margin-top:40px; }
/* 40. Process intro card */
.process-intro { background:var(--bg-card); border:1px solid var(--border-default); border-radius:20px; padding:40px; text-align:center; margin-bottom:40px; }
/* 41. Footer dark bg */
.footer-dark { background:var(--bg-secondary); padding:60px 0; }
/* 42. Responsive grid collapse */
@media(max-width:768px) { .grid-2col,.grid-3col,.grid-4col { grid-template-columns:1fr; } }
/* 43. Full-width mobile buttons */
@media(max-width:768px) { .cta-wrapper { width:100%; } .cta-primary,.cta-subtext { width:100%; } }
/* 44. Clamp font scaling */
/* All font sizes use clamp() for smooth scaling — see type scale above */
/* 45. Cubic bezier easing */
/* All transitions use cubic-bezier(0.4, 0, 0.2, 1) or cubic-bezier(0.16, 1, 0.3, 1) */
/* 46. Border default */
.border-def { border: 1px solid rgba(255,255,255,0.06); }
/* 47. Border hover accent */
.border-accent:hover { border-color: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3); }
/* 48. Inset top light */
.inset-top { box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
/* 49. Card shadow stack */
.shadow-stack { box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04); }
/* 50. Modal overlay */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:10000; }
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 19: DESIGN BIBLE — CHAPTER 16: PROMPT INTEGRATION
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== DESIGN BIBLE — CHAPTER 16: PROMPT INTEGRATION CHECKLIST ===
Before outputting ANY landing page, verify against this checklist:

BACKGROUND & ATMOSPHERE:
[ ] Body background is #0a0a0a (pure black base)
[ ] At least 3 different background treatments used across sections
[ ] SVG noise texture overlay on body (opacity 0.02-0.04)
[ ] Sections alternate between --bg-primary and --bg-secondary
[ ] At least 2 ambient radial glows (hero + one other section)

TYPOGRAPHY:
[ ] Font is Inter from Google Fonts
[ ] Hero headline uses clamp(2.5rem, 6vw, 4rem) with letter-spacing: -0.02em
[ ] Text hierarchy uses all 4 levels: primary, secondary, muted, ghost
[ ] No pure white (#FFFFFF) text — use #F0F6FC instead
[ ] Gradient text ONLY on headlines and stat numbers

CARDS & SURFACES:
[ ] Cards use rgba(18,16,26,0.8) background with backdrop-filter
[ ] Cards have top-light border effect
[ ] Cards have hover lift (-6px) with border color change
[ ] Card border-radius is 20px (not 8px, not 12px)

GLOWS & LIGHT:
[ ] CTA buttons have double box-shadow (tight + ambient)
[ ] Hero has ambient background glow (off-center, ellipse)
[ ] Final CTA section has spotlight glow (::before)
[ ] At least one pulsing glow element on the page

MOTION:
[ ] Hero elements have staggered fadeInUp (0s, 0.1s, 0.2s, 0.3s delays)
[ ] All animations use 'both' fill-mode
[ ] Cards have hover transitions (transform + border + shadow)
[ ] CTA buttons have shimmer sweep on hover
[ ] Phase cards slide right (translateX) not up

LAYOUT:
[ ] Hero is min-height: 100vh with flex centering
[ ] Major sections use padding: 100px 0
[ ] Container max-width is 1200px (800px for narrow sections)
[ ] Benefits grid is max-width: 1000px, centered
[ ] How It Works phases are vertical stack, not grid

COMPONENTS:
[ ] Every section ends with a stacked CTA (except stats and footer)
[ ] Stats section is full-designed with oversized gradient numbers
[ ] Testimonials have image placeholder + funded meta line
[ ] Hidden Problem section has red-tinted killer cards
[ ] Approval Results Table with gradient header and total row
[ ] Pill badges above Stats and How It Works sections
[ ] Gradient divider lines between sections
[ ] Footer has --bg-secondary background

MOBILE:
[ ] All grids collapse to single column at 768px
[ ] Buttons go full-width on mobile
[ ] Font sizes use clamp() for smooth scaling
[ ] Touch targets are at least 44px
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 20: v2.3 NEW COMPONENTS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== v2.3 NEW REQUIRED COMPONENTS ===

COMPONENT 1: Hidden Problem Deep-Dive Section
This section reveals the REAL reasons businesses get denied funding. It uses red-tinted 'killer cards' with an explanation box.

Structure:
1. Section headline: 'The Hidden Reasons [Industry] Businesses Get Denied'
2. 3-4 killer cards in a 2-column grid
3. Explanation box below the cards

Killer Card HTML Pattern:
<div class="killer-card">
  <div class="killer-icon-wrap">
    <svg><!-- warning/alert icon --></svg>
  </div>
  <h3 class="killer-title">[Problem Title]</h3>
  <p class="killer-desc">[2-3 sentence explanation of why this kills funding applications]</p>
</div>

Killer Card CSS:
.killer-card {
  background: var(--bg-card);
  border: 1px solid rgba(239,68,68,0.15);
  border-radius: 20px;
  padding: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.killer-card:hover {
  border-color: rgba(239,68,68,0.3);
  transform: translateY(-4px);
}
.killer-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.killer-icon-wrap svg { width: 24px; height: 24px; color: #ef4444; }

Explanation Box:
<div class="explain-box">
  <p class="explain-text">[1-2 paragraphs explaining how your mechanism solves these hidden problems]</p>
</div>
.explain-box {
  background: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05);
  border: 1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.15);
  border-radius: 16px;
  padding: 32px;
  margin-top: 40px;
}

COMPONENT 2: Approval Results Table
A styled HTML table showing real funding results. This is a VISUAL ANCHOR — one of the 2-3 moments that stops the scroll.

Structure:
<div class="table-wrapper">
  <table class="results-table">
    <thead>
      <tr class="table-header-row">
        <th>Business Type</th>
        <th>Funding Amount</th>
        <th>Timeline</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr class="table-row"><!-- 4-6 data rows --></tr>
      <tr class="table-total-row"><!-- total row --></tr>
    </tbody>
  </table>
</div>

Table CSS:
.table-wrapper {
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid var(--border-default);
}
.results-table {
  width: 100%;
  border-collapse: collapse;
}
.results-table th, .results-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--border-default);
}
.table-header-row {
  background: linear-gradient(135deg, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2), rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05));
}
.table-header-row th {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
}
.table-row:hover {
  background: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.05);
}
.table-row td:nth-child(2) {
  color: var(--accent-primary);
  font-weight: 600;
}
.table-total-row {
  background: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1);
}
.table-total-row td {
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: none;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: #10B981;
  font-weight: 600;
}

COMPONENT 3: Section Divider Lines
Gradient lines placed between every major section.
<div class="section-divider"></div>
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.3), transparent);
  max-width: 600px;
  margin: 0 auto;
}

COMPONENT 4: Pill Badges
Small uppercase badges above section headlines.
<div class="section-badge">[BADGE TEXT]</div>
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.1);
  border: 1px solid rgba(PRIMARY_R,PRIMARY_G,PRIMARY_B,0.2);
  border-radius: 100px;
  padding: 8px 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent-primary);
  margin-bottom: 16px;
}

COMPONENT 5: Process Intro Card
A centered card that introduces the How It Works section.
<div class="process-intro">
  <p class="process-intro-text">[Brief intro to the process — 1-2 sentences]</p>
</div>
.process-intro {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 21: v2.3 MANDATORY SECTION ORDER
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== v2.3 MANDATORY SECTION ORDER ===
The landing page MUST follow this exact 11-section order. Do NOT skip any section. Do NOT reorder.

1. HERO — Full viewport, eyebrow + headline + sub + CTA + trust indicators
2. STATS — Pill badge + headline + 3-4 oversized gradient stat numbers
3. PAIN / PROBLEM — Section headline + 2-column benefits/pain grid + CTA
4. HIDDEN PROBLEM DEEP-DIVE — Killer cards (red-tinted) + explanation box + CTA
5. MECHANISM REVEAL — How your mechanism solves the problems + CTA
6. HOW IT WORKS — Pill badge + process intro card + vertical phase stack + CTA
7. APPROVAL RESULTS TABLE — Styled HTML table with gradient header + 4-6 rows + total + CTA
8. SOCIAL PROOF — Understated headline + 3 testimonial cards with image placeholders + funded meta + CTA
9. GUARANTEE / RISK REVERSAL — Bold guarantee statement + CTA
10. FINAL CTA — Spotlight glow section + compelling headline + largest CTA
11. FOOTER — Dark bg-secondary, company info, disclaimer text

Between EVERY section, include a gradient divider line (<div class="section-divider"></div>).
`);

  // ═══════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  // SECTION 22: v2.2 COPY DNA — THE NEW COPY DNA (VERBATIM)
  // ═══════════════════════════════════════════════════════════════
  parts.push(`══════════════════ START OF COPY DNA ══════════════════

=== VOICE & TONE ===
Write like a knowledgeable insider having a direct conversation with a business owner — NOT like a corporate brochure. The tone is confident, specific, slightly irreverent, and loaded with insider knowledge the reader has never heard before.

RULES:
- Write in second person ('you') and first person plural ('we') — NEVER third person corporate voice
- Use short sentences. Then shorter ones. Like this.
- Use ellipsis (...) to create pacing and pull readers forward
- Bold key phrases for emphasis — the way someone would stress words in conversation
- Use pattern interrupts: ask a question, then answer it unexpectedly
- Drop specific numbers and data points — '85% of the lending weight' not 'most of the criteria'
- Use analogies from everyday life (nightclub VIP lines, restaurant reservations, golf buddies) to explain complex financial concepts
- Address the reader's internal monologue — say what they're already thinking, then redirect
- NEVER use phrases like: 'Sound familiar?', 'We understand', 'Many business owners face', 'Our team of experts', 'comprehensive solution', 'streamlined process', 'tailored approach'
- NEVER start sections with generic corporate headers. Use conversational hooks instead.

GOOD example: 'Here's the crazy part... we've found a way to essentially trick the lenders into seeing you as the ideal borrower. By simply removing the red flags they didn't even know they had.'
BAD example: 'Our comprehensive approach addresses the key challenges business owners face in securing adequate funding solutions.'

=== HEADLINE PATTERNS ===
Headlines should create an 'aha moment' by revealing something the reader didn't know. They should feel like insider knowledge, not a sales pitch.

PATTERN 1 — The Hidden Truth Reveal:
'The Real Reason Banks Keep Denying You Has Nothing To Do With Your Revenue'
'What 85% Of Business Owners Don't Know About Their Own Credit Profile'
'The Invisible Data Points That Are Costing You $50K-$250K In Available Capital'

PATTERN 2 — The Insider Mechanism:
'The {Mechanism Name} That Forces Banks To See You As Their Ideal Borrower'
'How A 2-Step Process Unlocks Capital That Was Always Available To You'
'The Documentation Formatting Secret That Turns Denials Into Approvals'

PATTERN 3 — The Contrast/Reframe:
'While Everyone Else Gets Auto-Rejected By Algorithms... You Get A Personal Call Asking How Much You Need'
'Stop Applying For Loans. Start Getting Invited To Funding.'

NEVER use: 'Unlock Your Business Potential', 'Your Solution Is Here', 'Ready To Transform Your Business', or any headline that could apply to literally any company in any industry.

=== OPENING / HERO SECTION ===
The hero section should hit like a pattern interrupt — NOT a corporate value proposition. Open with the thing the reader believes is wrong, then immediately reframe it.

STRUCTURE:
1. Eyebrow: A short, punchy qualifying statement that makes the RIGHT person stop scrolling
   GOOD: 'Getting denied despite strong revenue? Read this.'
   GOOD: 'Making $10K+/month but can't get approved? Here's why.'
   BAD: 'Denied traditional funding? Your solution is here.'

2. Headline: Reveal the hidden truth or mechanism (see patterns above)

3. Subheadline: Address EXACTLY what they won't have to do/fear
   GOOD: 'Without putting up your house, destroying your personal credit, or sitting through another denial.'
   BAD: 'Without getting denied again, sacrificing collateral, or being forced into predatory daily repayment plans.'
   (The bad example is close but too formal — 'predatory daily repayment plans' sounds like a policy document. Say 'another MCA draining your account every morning' instead.)

=== PAIN POINT SECTION ===
Do NOT list pain points as corporate bullet cards with emoji icons. Instead, use a CONVERSATIONAL revealing structure that makes the reader say 'wait, THAT's why I keep getting denied?'

STRUCTURE — The Revealing Cascade:
Start by challenging what they think the problem is, then reveal the real problem layer by layer:

'And contrary to what everyone thinks, these approval signals have very little to do with:
how much money your business makes...
how established your business is...
or how much collateral you have.

In fact, things like cash flow statements, personal income and years in business only make up 15% of the lending "weight".

The other 85%?

A few very specific data points on your personal credit profile...
And something insiders call "documentation formatting".'

This structure works because it:
- Challenges their existing belief (they think revenue/collateral matters most)
- Drops a specific number (15%/85%) that creates an 'aha' moment
- Introduces insider terminology they've never heard ('documentation formatting')
- Creates a knowledge gap they MUST fill by reading further

PAIN POINTS TO WEAVE IN (use conversationally, NOT as bullet lists):
- Secondary bureau data that's incomplete, inaccurate, or invisible to them
- The MCA debt trap — 'relentless daily payments that put a stranglehold on cash flow'
- The feeling of being 'targeted when vulnerable' by predatory lenders after PPP/EIDL
- Hidden industry codes flagging them as 'high risk' incorrectly
- The frustration of strong revenue + repeated denials = 'something is wrong but I don't know what'
- Personal credit getting destroyed from floating business expenses on personal cards
- The tightrope of cash flow timing — profitable on paper, panicking in reality

=== MECHANISM SECTION ===
The mechanism should feel like a SECRET being revealed, not a product feature being listed. Position it as 'what insiders know that regular business owners don't.'

STRUCTURE — The Insider Reveal:
'Here's the crazy part...

Thanks to this 2-step process, you don't need:
- years of spotless financial records
- millions in revenue
- the best personal credit score known to man
- putting up every asset you've ever owned as collateral

To access this kind of capital.'

Then explain the mechanism using an ANALOGY:
'It's like being the bank president's golf buddy when everyone else is filling out loan applications online.

While they're getting auto-rejected by algorithms, you're getting a personal call asking "How much do you need and when do you want it transferred?"'

MECHANISM FRAMING RULES:
- Always use a vivid, relatable analogy (nightclub VIP, restaurant reservation, golf buddy, knowing the bouncer)
- Explain what the mechanism DOES using insider language ('documentation formatting', 'approval signals', 'lending weight', 'red flags')
- Position the client's company as having a 'private network' of executive underwriters, funding managers, and bank VPs
- Mention specific institution names where appropriate (JP Morgan Chase, US Bank, Citizens) — this creates concrete credibility
- Frame it as 'bypassing the gatekeeping responsible for 87% of funding rejections'
- Use the phrase 'off-market capital originators who usually have a 12-month waitlist'
- The mechanism should feel like ACCESS to a private world, not a service being sold

=== HOW IT WORKS SECTION ===
The steps should each open with a STORYTELLING analogy, not a process description. Each step gets a vivid name and an analogy before the explanation.

STRUCTURE — Story-First Steps:
Step 1: 'Skipping The Line'
'Imagine strolling right past the line at the busiest nightclub in the city because you're friends with the owner...'
Then explain: A funding specialist assesses your 'red flags' in business filing documentation and personal credit profile. They create a custom optimization game plan.

Step 2: 'Optimization' (or mechanism-specific name)
'Our in-house consumer data team gets to work removing the red flag items from your personal credit profile. At the same time, underwriting specialists pick apart your filing documents and position your business in a way that makes lenders see you as a "safe bet" to give capital to.'

Step 3: 'Capital Deployment'
'While other business owners are refreshing their email hoping for an approval... you're choosing which offers to accept.'
Then explain: Strategic application sequencing to maximize approval amounts across multiple sources.

RULES:
- Each step MUST open with a vivid analogy or scene-setting line BEFORE the explanation
- Use conversational language: 'gets to work', 'pick apart', 'safe bet' — NOT 'conduct', 'facilitate', 'leverage'
- Step names should be punchy and memorable, not generic ('Skipping The Line' not 'Profile Assessment & Optimization')

=== SOCIAL PROOF / TESTIMONIALS ===
Testimonials should sound like REAL people talking, not polished marketing quotes. Include specific details that make them feel authentic.

GOOD testimonial: 'I was drowning in two MCAs. Daily debits eating $800/week from my account. {Business Name} cleaned up my profile in 3 weeks and got me $150K in 0% capital. I literally cried when the approval came through. — Marcus T., Landscaping, Tampa FL, funded $150K in 22 days'

BAD testimonial: 'After months of rejection, they helped me secure $120,000 in just 3 weeks! It's given my e-commerce store the breathing room to scale. — John S., E-commerce Founder, Austin TX'

The bad example is technically fine but feels WRITTEN. The good example has:
- A specific painful detail (two MCAs, $800/week daily debits)
- An emotional reaction (literally cried)
- Exact numbers ($150K, 22 days)
- The 'before' state built into the testimonial

TESTIMONIAL RULES:
- Include a specific BEFORE state (what they were dealing with before)
- Include specific dollar amounts ($50K-$250K range)
- Include specific timeframes (14-45 days)
- Include specific business types and city/state
- Include an emotional reaction or moment ('I couldn't believe it', 'my wife started crying', 'I finally took a vacation')
- Use casual voice: contractions, fragments, dashes — how people actually talk
- Vary the business types: landscaping, e-commerce, restaurant, auto shop, medical practice, real estate, construction, salon, HVAC, trucking

=== STATS BAR ===
Stats should feel like PROOF, not decoration. Use the client's provided data or defaults:
- Total funded: {total_funded} (default: '$25M+')
- Clients served: {clients_served} (default: '500+')
- Approval rate: {approval_rate} (default: '94%')
Optional additional stats that add credibility:
- Average funding time: '14 Days Average'
- Average funding amount per client: '$87K Average'
- Industries served: '47+ Industries'

=== CTA BUTTON COPY ===
CTAs should feel like the obvious next step, not a sales push.

GOOD CTA text: 'Get Me Funded', 'See What I Qualify For', 'Check My Fundability'
BAD CTA text: 'Stop The Frustration', 'See My Success Story', 'Understand The Mechanism'

GOOD subtext: 'Takes 60 seconds. No credit impact.', 'Free assessment — zero obligation', '347 business owners checked this week'
BAD subtext: 'Discover Your Funding Potential Today', 'What Are You Waiting For?'

RULES:
- CTA text should use first person when possible ('Get ME funded' not 'Get funded')
- Subtext should reduce friction (time, cost, risk) or add social proof (number of people who took action)
- Vary the CTA text across sections — don't use the same text for every button
- Final CTA should be the most urgent: 'Get My Funding Blueprint Now' with subtext 'Only 7 spots left this month'

=== GUARANTEE SECTION ===
The guarantee should feel like a confident bet, not a corporate disclaimer.

GOOD: 'Look — if we can't find you at least one viable path to capital, you don't pay us a dime. Simple as that. We've done this for 500+ business owners and we wouldn't make that promise if we weren't damn confident in the process.'

BAD: 'Our Funding Optimization Guarantee: We're confident in our process. If we can't identify a path to capital for your business, you pay nothing.'

RULES:
- Use casual, confident language
- Include a specific number (how many people this has worked for)
- Make it feel like a personal promise, not a policy

══════════════════ END OF COPY DNA ══════════════════
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 23: v2.2 LANDING PAGE COPY GUIDE (SECTION-BY-SECTION)
  // ═══════════════════════════════════════════════════════════════
  parts.push(`══════════════════ START OF LANDING PAGE COPY GUIDE ══════════════════

=== LANDING PAGE COPY — SECTION BY SECTION ===

SECTION 1: HERO
- Eyebrow: Short, qualifying, pattern-interrupt. Use bold. Never generic.
  WRITE: 'Making $10K+/month but keep getting denied? Read this.'
  DON'T WRITE: 'Denied traditional funding? Your solution is here.'
- Headline: Use Hidden Truth Reveal or Insider Mechanism pattern (see Headline Patterns above)
- Subheadline: Conversational 'without' statement using real language
  WRITE: 'Without putting up your house, tanking your personal credit, or sitting through another BS denial.'
  DON'T WRITE: 'Without sacrificing collateral or being forced into predatory repayment structures.'
- CTA: First-person, action-oriented ('Get Me Funded', 'Check My Fundability')

SECTION 2: PAIN / PROBLEM REVEAL
- DO NOT use a grid of cards with emoji icons and safe descriptions
- Instead, use the Cascading Reveal structure (see Pain Point Section above)
- If the template requires cards/grid layout, make each card's CONTENT conversational:
  WRITE card title: 'The 85% They Never Tell You About'
  WRITE card body: 'Cash flow, revenue, time in business? That's only 15% of the lending decision. The rest comes down to data points you've never even seen — and they're probably working against you right now.'
  DON'T WRITE card title: 'Incomplete Secondary Bureau Data'
  DON'T WRITE card body: 'Your business credit profile might be missing crucial information, leading to automatic denials.'

SECTION 3: STATS BAR
- Use client data or defaults. No copy changes needed — numbers speak for themselves.

SECTION 4: SOCIAL PROOF / TESTIMONIALS
- Use the testimonial format from Social Proof section above
- Each testimonial must include a BEFORE state, specific dollars, specific timeline, and emotional reaction
- Vary business types across the 3 testimonials

SECTION 5: MECHANISM REVEAL
- Use 'Introducing' label + mechanism name in gradient headline
- Body copy should use the Insider Reveal structure (see Mechanism Section above)
- Include at least one vivid analogy
- Include the 'private network' + specific bank names positioning
- End with: 'This isn't a loan application. This is access to a private network of capital that most business owners don't even know exists.'

SECTION 6: HOW IT WORKS (3 Steps/Phases)
- Each step gets a STORY-FIRST name and analogy (see How It Works section above)
- Step names should be memorable: 'Skipping The Line', 'Removing The Red Flags', 'Getting The Call'
- NOT: 'Profile Assessment', 'Strategic Optimization', 'Capital Deployment'
- Each step description opens with the analogy, THEN explains the process

SECTION 7: FINAL CTA + GUARANTEE
- Guarantee uses conversational, confident tone (see Guarantee section above)
- Final CTA is the most urgent: stronger text + scarcity subtext
- Headline for this section should create urgency without being cheesy
  WRITE: 'Your Business Is Leaving Money On The Table. Let's Fix That.'
  DON'T WRITE: 'Ready to Unlock Your Business's Potential?'

══════════════════ END OF LANDING PAGE COPY GUIDE ══════════════════
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 24: v2.2 AD COPY ADDENDUM (VERBATIM)
  // ═══════════════════════════════════════════════════════════════
  parts.push(`══════════════════ START OF AD COPY ADDENDUM ══════════════════

=== AD-SPECIFIC COPY RULES ===
Ads must hook in 3 seconds or less. The opening line is EVERYTHING.

AD HOOK PATTERNS (use these, rotate them, never repeat the same one in a set):

PATTERN 1 — The Belief Breaker:
'You can't get funded because of your revenue? Wrong. Your revenue has almost nothing to do with it.'
'Everyone thinks you need perfect credit to get business funding. Here's what actually matters...'

PATTERN 2 — The Insider Leak:
'I spent 5 years building relationships with bank VPs and underwriters. Here's what they told me they ACTUALLY look at...'
'There's a reason 87% of business funding applications get denied. And it's not the reason you think.'

PATTERN 3 — The Specific Result:
'Marcus had two MCAs draining $800/week from his account. 22 days later, he had $150K in 0% capital. Here's how.'
'She went from denied 4 times to approved for $200K in 14 days. Same business. Same revenue. Different approach.'

PATTERN 4 — The Direct Question:
'Making $10K+ a month but can't get approved for business funding? Watch this.'
'How many times have you been told "your business doesn't qualify"?'

PATTERN 5 — The Pattern Redirect (tie to current events):
'While everyone's panicking about interest rates, smart business owners are accessing 0% capital using a method banks don't want you to know about.'

AD BODY RULES:
- Lead with the hook. No warm-up. No 'Hey guys' or 'In today's video'
- One core idea per ad — Rule of One. Pick ONE angle and hammer it.
- Use specific numbers always: '$150K', '14 days', '87%', '$800/week' — NEVER vague
- Include ONE mini-story or case study (3-4 sentences max)
- End with a clear CTA that tells them exactly what happens next: 'Click the link, answer 5 quick questions, and we'll show you exactly how much you qualify for. Takes 60 seconds.'
- Ad tone should be: confident insider sharing a secret, NOT salesperson making a pitch

AD FORMAT — Generate 3-5 ad variations per set:
- 2 short-form (under 100 words) for Facebook/Instagram feed
- 1 medium-form (150-250 words) for Facebook longer format
- 1 video script hook (15-30 seconds) for Reels/TikTok/YouTube Shorts
- 1 long-form (300-500 words) for YouTube pre-roll or VSL-style ad

══════════════════ END OF AD COPY ADDENDUM ══════════════════
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 25: v2.2 VSL COPY ADDENDUM (VERBATIM)
  // ═══════════════════════════════════════════════════════════════
  parts.push(`══════════════════ START OF VSL COPY ADDENDUM ══════════════════

=== VSL-SPECIFIC COPY RULES ===
The VSL is a long-form sales letter delivered as video narration. It should read like someone TALKING to you — not like someone reading a script. Use the conversational direct response style throughout.

VSL STRUCTURE (follow this exact sequence):

--- SECTION 1: THE HOOK (0:00-0:30) ---
Open with a Pattern Interrupt + Belief Breaker. The first 10 seconds must make the viewer think 'wait, what?'

Example opening:
'If you're a business owner making $10K or more a month... and you've been denied for funding... I need you to hear this: the reason you got denied has almost nothing to do with your revenue, your time in business, or your credit score.'

Then the follow-up: 'In fact, those things only account for about 15% of what lenders actually look at. The other 85%? That's what I'm going to show you right now.'

--- SECTION 2: THE PROBLEM REFRAME (0:30-2:00) ---
Challenge what they THINK the problem is. Use the cascading reveal structure:
- What they think matters (revenue, credit, collateral) vs. what actually matters (secondary bureau data, documentation formatting, application sequencing)
- Drop specific numbers and insider terminology
- Make them feel like they've been in the dark about how the system actually works
- Use phrases like: 'Here's what nobody tells you...', 'The real reason is...', 'And this is where it gets interesting...'

--- SECTION 3: THE CREDIBILITY BRIDGE (2:00-3:00) ---
Establish WHY you know this. Not bragging — just facts:
- 'Over the past [X] years, we've built a private network of executive underwriters, funding managers, and bank VPs at JP Morgan Chase, US Bank, Citizens...'
- 'And about a dozen of the most sought-after off-market capital originators in the US.'
- 'Including sources that usually have a 12-month waitlist to even speak with them.'
- Use the analogy: 'It's like being the bank president's golf buddy when everyone else is filling out applications online.'

--- SECTION 4: THE MECHANISM REVEAL (3:00-5:00) ---
This is the COPY HINGE — the part the entire rest of the script revolves around.
- Introduce the mechanism by name: 'We call it the {Mechanism Name}'
- Explain it using the 2-step or 3-step framework with vivid analogies
- Each step gets: an analogy FIRST, then the explanation
- Step 1: 'Skipping the line' — audit red flags, create optimization game plan
- Step 2: 'Optimization' — remove red flags, reformat documentation, position as 'safe bet'
- Step 3: 'Capital deployment' — strategic application sequencing, multiple offers
- Use the line: 'We've found a way to essentially trick the lenders into seeing you as the ideal borrower. By simply removing the red flags.'

--- SECTION 5: SOCIAL PROOF CASCADE (5:00-6:30) ---
Stack 2-3 mini case studies back to back. Each should be 30-45 seconds:
- Name, business type, city
- Their specific BEFORE state (denied, stuck in MCAs, credit destroyed)
- What happened (timeline, amount funded)
- Their emotional reaction (one specific quote)
- Vary the industries: landscaping, e-commerce, restaurant, construction, medical, trucking

--- SECTION 6: THE 'DON'T NEED' REVERSAL (6:30-7:00) ---
List everything they DON'T need to qualify:
- 'You don't need years of spotless financial records...'
- 'You don't need millions in revenue...'
- 'You don't need the best credit score known to man...'
- 'You don't need to put up every asset you've ever owned as collateral.'
- Then: 'All you need is a business making $7K+ per month and the willingness to let us show you what's possible.'

--- SECTION 7: THE GUARANTEE + CTA (7:00-8:00) ---
- State the guarantee conversationally (see Guarantee section above)
- Explain EXACTLY what happens when they click: 'Click the button below. You'll answer a few quick questions about your business. No credit pull. Takes about 60 seconds. Then one of our funding specialists will reach out within 24 hours with your custom game plan.'
- Add urgency: 'We only take on [X] new clients per month to make sure everyone gets personal attention. Right now we have [X] spots left.'
- Final line: 'Stop applying. Start getting approved. Click below.'

VSL TONE RULES:
- Read it OUT LOUD. If it doesn't sound like someone confidently talking to a friend, rewrite it.
- Use sentence fragments. For pacing. Like this.
- Use '...' to create pauses and pull-forward momentum
- Bold key phrases that would be EMPHASIZED if spoken aloud
- Never use passive voice. Always active: 'We remove the red flags' not 'The red flags are addressed'
- The VSL should feel like a knowledgeable friend pulling you aside at a party and saying 'let me tell you how this actually works'

══════════════════ END OF VSL COPY ADDENDUM ══════════════════
`);


    // ═══════════════════════════════════════════════════════════════
  // SECTION 26: REFERENCE TEMPLATES
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== REFERENCE TEMPLATES ===
You have 3 reference template STYLES to choose from. Pick the one that best fits the client's industry and vibe. Clone its EXACT structure, then replace only the text content using the Copy DNA.

TEMPLATE A: Purple Glassmorphism
- Vibe: Premium, sophisticated, financial authority
- Best for: Professional services, finance, consulting, legal, insurance
- Primary colors: Violet/Indigo/Orchid family
- Key features: Heavy glassmorphism on cards, gradient mesh backgrounds, elegant animations
- Card style: Frosted glass with backdrop-filter, subtle borders
- Background: Gradient mesh with multiple radial gradients
- Motion: Smooth, elegant, understated

TEMPLATE B: Matrix/Hacker Terminal
- Vibe: Technical, data-driven, cutting-edge
- Primary colors: Neon Green/Cyan/Electric Blue family
- Best for: Tech, SaaS, e-commerce, construction, trades
- Key features: Line grid backgrounds, monospace accents, data-terminal aesthetic
- Card style: Sharp borders, minimal radius, terminal-like
- Background: Line grid overlay with dot patterns
- Motion: Precise, mechanical, purposeful

TEMPLATE C: Dark Fintech Dashboard
- Vibe: Clean, modern, trustworthy
- Primary colors: Any from the palette — most versatile template
- Best for: Any industry — the safest choice when unsure
- Key features: Clean card design, generous whitespace, balanced layout
- Card style: Clean borders, 20px radius, subtle shadows
- Background: Subtle dot grid with occasional radial glows
- Motion: Smooth, professional, confidence-inspiring

IMPORTANT: These are STYLE GUIDES, not rigid templates. You must still follow the 11-section order, include all required components, and apply the full Design Bible. The template choice affects the AESTHETIC FLAVOR, not the structure.
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 27: BACKGROUND TREATMENT VARIATIONS
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== BACKGROUND TREATMENT VARIATIONS ===
Choose ONE primary background treatment for the page. This sets the overall atmospheric tone.

1. Gradient Mesh — Multiple overlapping radial gradients. Organic, aurora-like.
2. Dot Grid — Repeating dot pattern. Technical, precise.
3. Line Grid — Repeating line pattern. Matrix, engineering.
4. Diagonal Sweep — Corner-to-corner gradient. Directional, dynamic.
5. Noise Only — Pure noise texture over solid black. Minimal, film-like.
6. Gradient + Grid Combo — Radial glow layered over dot grid. Premium, layered.
7. Vignette + Mesh — Dark edges with central gradient mesh. Cinematic, focused.

The chosen treatment applies to the BODY/page level. Individual sections can layer additional treatments on top (e.g., a section might add its own radial glow over the page-level dot grid).
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 28: SURVEY MODAL
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== SURVEY MODAL STRUCTURE ===
Every CTA button on the page opens a survey modal. Each button gets its own unique modal.

Modal HTML Pattern:
<div id="surveyModal_btn_UNIQUEID" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(4px);z-index:10000;align-items:center;justify-content:center;">
  <div style="background:#1a1a2e;border-radius:20px;padding:24px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;position:relative;border:1px solid rgba(255,255,255,0.1);">
    <button onclick="document.getElementById('surveyModal_btn_UNIQUEID').style.display='none';document.body.style.overflow='auto';" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.1);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">✕</button>
    <iframe src="https://api.leadconnectorhq.com/widget/survey/SURVEY_ID_PLACEHOLDER" style="width:100%;min-height:450px;border:none;"></iframe>
  </div>
</div>

CRITICAL: Generate UNIQUE IDs for each button using pattern: btn_{timestamp}_{random7chars}
CRITICAL: The onclick on the CTA button sets display='flex' and overflow='hidden'
CRITICAL: The close button sets display='none' and overflow='auto'
`);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 29: OUTPUT FORMAT
  // ═══════════════════════════════════════════════════════════════
  parts.push(`=== OUTPUT FORMAT ===
Your response MUST follow this exact format:

ACCENT_PRIMARY: [hex color chosen]
ACCENT_SECONDARY: [hex color chosen]
TEMPLATE_USED: [A, B, or C]
BACKGROUND_TREATMENT: [1-7, name of treatment chosen]

[LANDING_START]
<!DOCTYPE html>
<html lang="en">
... complete landing page HTML ...
</html>
[LANDING_END]

[THANKYOU_START]
<!DOCTYPE html>
<html lang="en">
... complete thank you page HTML ...
</html>
[THANKYOU_END]

THANK YOU PAGE — MANDATORY FORMAT:
The thank you page MUST follow this EXACT simple layout. Do NOT deviate. Do NOT add extra sections, animations, or complexity.

LAYOUT (top to bottom, centered on page):
1. A large green circle with a white checkmark icon (SVG) — centered at top
2. Headline: "You're Confirmed" — large, bold, white text, centered
3. Subtitle: "Check your email for the calendar invite and call details." — smaller gray text, centered
4. A card/box with dark background and subtle border containing:
   - Header: "BEFORE YOUR CALL" — small uppercase text, left-aligned
   - 3 bullet points, each with a small green checkmark icon:
     * "Check your email for the calendar invite"
     * "Be ready to discuss your current revenue and funding goals"
     * "Check your texts for messages from our team"
5. Footer at bottom: "© {current_year} {businessName}™. All rights reserved." — small gray text, centered

STYLING RULES:
- Background: solid black (#000000) or very dark (#0a0a0a) — NO gradients, NO patterns, NO noise
- Font: Inter (same as landing page)
- The green checkmark circle should use the landing page's accent color (or green #22c55e if accent is not green)
- The card should have a subtle border (rgba(255,255,255,0.1)) and slightly lighter dark background
- NO animations, NO glow effects, NO glassmorphism — just clean, simple, minimal
- The page should be vertically centered
- Max-width of content: 500px, centered
- MUST be mobile responsive

THAT'S IT. Nothing else on the page. No navigation, no extra sections, no social proof, no additional CTAs.
The thank you page MUST use the SAME accent colors (primary + secondary) as the landing page.

NOW GENERATE THE COMPLETE LANDING PAGE AND THANK YOU PAGE FOR THIS CLIENT.
`);

  return parts.join('\n');
}


export function parseFunnelResponse(raw: string): {
  landingPageHtml: string;
  thankyouPageHtml: string;
  accentColor: string;
  metadata: FunnelMetadata;
} {
  const metaMatch = (key: string) => {
    const re = new RegExp(key + ':\\s*(.+)', 'i');
    const m = raw.match(re);
    return m ? m[1].trim() : '';
  };

  const metadata: FunnelMetadata = {
    accentPrimary: metaMatch('ACCENT_PRIMARY'),
    accentSecondary: metaMatch('ACCENT_SECONDARY'),
    templateUsed: metaMatch('TEMPLATE_USED'),
    backgroundTreatment: metaMatch('BACKGROUND_TREATMENT'),
  };

  let landingPageHtml = '';
  let thankyouPageHtml = '';

  // Try new delimiters first, fall back to old
  const lpMatch = raw.match(/\[LANDING_START\]([\s\S]*?)\[LANDING_END\]/);
  if (lpMatch) {
    landingPageHtml = lpMatch[1].trim();
  } else {
    const oldLp = raw.match(/===LANDING_PAGE_START===([\s\S]*?)===LANDING_PAGE_END===/);
    if (oldLp) landingPageHtml = oldLp[1].trim();
  }

  const tyMatch = raw.match(/\[THANKYOU_START\]([\s\S]*?)\[THANKYOU_END\]/);
  if (tyMatch) {
    thankyouPageHtml = tyMatch[1].trim();
  } else {
    const oldTy = raw.match(/===THANK_?YOU_PAGE_START===([\s\S]*?)===THANK_?YOU_PAGE_END===/);
    if (oldTy) thankyouPageHtml = oldTy[1].trim();
  }

  return { landingPageHtml, thankyouPageHtml, accentColor: metadata.accentPrimary, metadata };
}
