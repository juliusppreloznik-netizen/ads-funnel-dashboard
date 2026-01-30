/**
 * FUNNEL GENERATION PROMPTS
 * 
 * This file contains the EXACT prompts from the original funnel-builder-enhanced.html
 * DO NOT MODIFY - These prompts are carefully crafted for high-converting funnels
 */

export const FG_COLORS = {
  emerald: { accent: '#10B981', hover: '#0d9668', rgb: '16, 185, 129', inputBg: '#064e3b', placeholder: '#6ee7b7' },
  blue: { accent: '#3B82F6', hover: '#2563eb', rgb: '59, 130, 246', inputBg: '#1e3a5f', placeholder: '#93c5fd' },
  violet: { accent: '#8B5CF6', hover: '#7c3aed', rgb: '139, 92, 246', inputBg: '#4c1d95', placeholder: '#c4b5fd' },
  amber: { accent: '#F59E0B', hover: '#d97706', rgb: '245, 158, 11', inputBg: '#78350f', placeholder: '#fcd34d' },
  coral: { accent: '#F97316', hover: '#ea580c', rgb: '249, 115, 22', inputBg: '#7c2d12', placeholder: '#fdba74' },
  cyan: { accent: '#06B6D4', hover: '#0891b2', rgb: '6, 182, 212', inputBg: '#164e63', placeholder: '#67e8f9' }
};

export type ColorScheme = keyof typeof FG_COLORS;

export function buildFunnelPrompt(
  mechanism: string,
  color: typeof FG_COLORS[ColorScheme],
  pageType: 'landing' | 'thankyou' | 'both'
): string {
  const basePrompt = `Act as an ELITE direct response copywriter + frontend developer who builds INSANELY detailed, high-converting funding landing pages.

═══════════════════════════════════════════════════════════════════════════════════════
UNIQUE MECHANISM: "${mechanism}"
ACCENT COLOR: ${color.accent} (hover: ${color.hover}, glow: rgba(${color.rgb}, 0.3))
SECONDARY COLOR: #F59E0B (gold/amber for highlights)
═══════════════════════════════════════════════════════════════════════════════════════

DESIGN SYSTEM (USE EXACTLY):
--bg-primary: #0a0a0a
--bg-card: #111111
--bg-card-hover: #161616
--border-color: #222222
--text-primary: #ffffff
--text-secondary: #a1a1aa
--text-muted: #71717a
--accent: ${color.accent}
--accent-hover: ${color.hover}
--accent-glow: rgba(${color.rgb}, 0.4)
--secondary: #F59E0B
--red: #ef4444
--green: #22c55e

CRITICAL CSS PATTERNS:
- Font: 'Inter' from Google Fonts (weights: 400,500,600,700,800,900)
- Container max-width: 1100px with padding: 0 24px
- Card styling: background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 20px;
- Section padding: 100px 0
- Button glow: box-shadow: 0 0 50px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.3)
- Gradient text: background: linear-gradient(135deg, var(--accent), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
- Section labels: font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); with ::before pseudo-element showing 20px horizontal line

COPYWRITING RULES:
- Enemy = Banks, MCAs, credit bureaus, traditional lenders
- "It's not your fault" - blame the system, not the prospect
- Specific numbers: $50K-$250K, 14-30 days, 0% APR, 12-21 months
- Max 3-4 lines per paragraph
- 70% towards (gains) / 30% away (pain)
`;

  let pageInstructions = '';
  
  if (pageType === 'landing' || pageType === 'both') {
    pageInstructions += `
[LANDING_START]
Generate a COMPLETE, PRODUCTION-READY landing page with these EXACT sections:

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 1: HERO (min-height: 100vh, position: relative)
═══════════════════════════════════════════════════════════════════════════════════════
A) MINI BADGES ROW (3 inline badges at top):
   - Badge 1: Green pulsing dot + "130+ Funded"
   - Badge 2: "🔒 Bank-Level Security"
   - Badge 3: "⚡ 14-Day Results"
   Style: display: flex; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 100px; font-size: 11px;

B) EYEBROW BANNER:
   "<strong>ATTENTION:</strong> Business owners earning $7K–$50K/month who keep getting denied"
   Style: background: linear-gradient(135deg, rgba(accent, 0.15), rgba(accent, 0.05)); border: 1px solid rgba(accent, 0.3); border-radius: 8px; padding: 10px 18px;

C) STACKED HEADLINE (centered, each line separate):
   Row 1: "DEPLOY THE" (small, muted, uppercase, letter-spacing: 0.15em)
   Row 2: "${mechanism}" (HUGE gradient text, 58px, font-weight: 900)
   Row 3: "to Unlock" + AMOUNT BOX "$50K–$250K+" (amount in gold border box)
   Row 4: "in 0% Capital" (large white text)

D) TIMEFRAME PILL:
   "⏱ In 30 Days or Less"
   Style: background: var(--bg-card); border: 1px solid var(--border-color); padding: 14px 28px; border-radius: 100px;

E) SUBHEADLINE:
   "Without getting denied again, sacrificing collateral, or destroying your credit with predatory MCAs"

F) VSL CONTAINER (max-width: 800px):
   - Border: 1px solid var(--border-color) that changes to accent on hover
   - Aspect ratio: 16/9
   - Badge in top-left: red pulsing dot + "Watch Now"
   - Center: Large play button (88px circle, accent gradient background, white triangle)
   - Below play button: "See How It Works (3 min)"
   - Hover effect: border-color: var(--accent); box-shadow: 0 0 60px var(--accent-glow); transform: scale(1.01);

G) CTA BUTTON:
   "See If You Qualify →"
   Style: padding: 22px 48px; border-radius: 14px; font-size: 18px; font-weight: 700;
   Add shimmer animation: @keyframes shine that moves left to right
   Subtext below: "Takes 2 minutes • No credit check required"

H) SOCIAL PROOF ROW (border-top, padding-top: 32px):
   Three items: "$6M+" Funded | "93%" Approval Rate | "14" Days Avg
   Numbers in accent color, labels in muted

I) GRID BACKGROUND:
   Subtle red grid lines with radial mask fade

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 2: RESULTS SHOWCASE
═══════════════════════════════════════════════════════════════════════════════════════
Section label: "Real Results"
Title: "What Our Clients Walk Away With"

3 RESULT CARDS in a row (grid-template-columns: repeat(3, 1fr)):
Card 1: "$75,000" - "Total Funding" - Quote about being denied 3 times before
Card 2: "$110,000" - "Business Credit" - Quote about secondary bureaus
Card 3: "$150,000" - "Total Funding" - Quote about SBA runaround

Each card:
- Amount: 40px font, gradient accent-to-secondary
- Label: 12px uppercase, muted
- Quote: 14px italic, secondary color
- Hover: translateY(-6px), accent border glow, top gradient bar appears

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 3: MECHANISM INTRODUCTION
═══════════════════════════════════════════════════════════════════════════════════════
Small intro badge: "🎯 Introducing"
Big title: "THE <span class='accent'>${mechanism.toUpperCase()}</span>"
Description paragraph explaining what the mechanism does (2-3 sentences max)

3 PHASE CARDS (with connecting gradient line between them):
Phase 1: "Credit Profile Optimization" - Audit all bureaus, remove red flags
Phase 2: "Strategic Application Sequencing" - Apply in right order to avoid inquiry damage
Phase 3: "Capital Deployment" - Deploy funding to accounts, use for business

Each phase card:
- Number in accent-colored rounded square (44px)
- Title: 17px bold
- Description: 14px secondary

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 4: "HIDDEN SIGNALS" SECTION (TWO COLUMNS)
═══════════════════════════════════════════════════════════════════════════════════════
LEFT SIDE - Copy:
Section label: "The Hidden Problem"
Title: "The \\"Hidden Signals\\" That Get You Approved"
Paragraph: "Banks don't just look at your credit score. They scan for specific 'approval triggers'—inquiry patterns, utilization ratios, account velocity. Most business owners have red flags they don't even know about."
Add a mockup description of what they're missing.

RIGHT SIDE - "AVAILABLE CREDIT" MOCKUP:
Create a realistic credit dashboard mockup showing:
- Header: "Available Credit" with X close button
- Large amount: "$60,400.00" in gradient text
- Line items table:
  * Credit Limit: $85,000.00
  * Total Balance: $9,720.00
  * Available Credit: $60,400.00
  * Pending Charges: $14,500.00
- Utilization row with progress bar: 8.4%
- Bottom highlight box: "Open Lines: $175,000"

Style the mockup with:
- Dark card background (#111)
- Border: 1px solid var(--border-color)
- Border-radius: 16px
- Main amount in large gradient text (32px+)
- Line items in rows with label left (muted), value right (white)
- Progress bar for utilization (accent colored fill, 8.4% width)
- Final "Open Lines" amount in highlighted box with accent border

Below mockup add caption: "This client went from 3 hard approvals to $175K in available 0% capital after strategic sequencing."

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 5: "STRATEGIC SEQUENCING" APPROVAL TABLE
═══════════════════════════════════════════════════════════════════════════════════════
Section label: "Proof"
Title: "This Is What \\"Strategic Sequencing\\" Produces"
Subtitle: "Below is an actual client stack. Notice how we stacked multiple 0% APR cards across different issuers—and strategically timed to avoid inquiry stacking penalties."

HIGHLIGHT BOX (accent background with border):
"This person received $155,500 in available capital for $0 at 0% APR for 18-21 months. No collateral. No revenue requirements. Stacks in under 3 months."

APPROVAL TABLE - Create a styled data table:
Headers: Lender/Card | Status | Credit Limit | APR | 0% Period
Row 1: Credit Card | Approved (green badge) | $35,000.00 | 0% | 21 months
Row 2: Credit Card | Approved | $30,000.00 | 0% | 21 months
Row 3: Credit Card | Approved | $25,000.00 | 0% | 6 months
Row 4: Credit Card | Approved | $20,000.00 | 0% | 6 months
Row 5: Credit Card | Approved | $18,000.00 | 0% | 6 months
Row 6: Line of Credit | Approved | $15,000.00 | 7.5% | N/A
Row 7: Line of Credit | Pending (muted badge) | — | — | —
Row 8: Credit Card | Pending | — | — | —
Footer: Total Funded | | $155,500.00 (bold, accent)

Style:
- Table background: var(--bg-card)
- Border: 1px solid var(--border-color), border-radius: 12px
- Header row: slightly darker background
- "Approved" status: green background pill, green text
- "Pending" status: muted background pill
- Total row: bold with accent colored amount
- Alternating row backgrounds optional

Below table: "Want to see what your approval table could look like?" + CTA button

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 6: STATS SECTION (full-width dark band)
═══════════════════════════════════════════════════════════════════════════════════════
Background: var(--bg-card) with top/bottom borders

4 STAT CARDS in a row (grid-template-columns: repeat(4, 1fr)):
Stat 1: "$6M+" / "Total Funded" (this one gets highlight border)
Stat 2: "130+" / "Clients Served"
Stat 3: "93%" / "Approval Rate"
Stat 4: "14" / "Days Average"

Each stat card:
- Background: var(--bg-primary)
- Border: 1px solid var(--border-color)
- Border-radius: 20px
- Padding: 36px 24px
- Number: 44px gradient text
- Label: 13px uppercase muted

First card highlight: background: linear-gradient(135deg, rgba(accent, 0.1), rgba(secondary, 0.05)); border-color: var(--accent);

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 7: COMPARISON SECTION
═══════════════════════════════════════════════════════════════════════════════════════
Section label: "The Difference"
Title: "DIY vs. ${mechanism}"

TWO-COLUMN COMPARISON GRID (side by side, max-width: 900px):

LEFT COLUMN - "✕ Doing It Yourself":
Header: muted color with X icon
Background: rgba(239, 68, 68, 0.02)
Items:
✕ Hidden red flags you don't know about
✕ Secondary bureaus tanking approvals
✕ Generic credit repair that doesn't work
✕ Hard inquiries stacking up for nothing
✕ Months of waiting, maybe $20K-$30K

RIGHT COLUMN - "✓ ${mechanism}":
Header: accent color with checkmark
Background: rgba(accent, 0.02)
Items:
✓ Every red flag identified across ALL bureaus
✓ Secondary bureaus legally cleared
✓ Surgical attacks using data privacy laws
✓ Direct lender network = higher approval
✓ $50K-$150K+ in 14 days

Style:
- Grid container with border-radius: 20px, overflow: hidden
- Each column has padding: 32px
- X icons in muted color
- Checkmarks in green (#22c55e)

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 8: "YOU MIGHT BE THINKING" OBJECTION CARDS
═══════════════════════════════════════════════════════════════════════════════════════
Section label: "Common Questions"
Title: "You Might Be Thinking..."

3 FAQ/OBJECTION CARDS in a row:

Card 1:
Icon: 💳 (28px)
Question: "My credit is destroyed"
Answer: "We've funded owners with 520 scores. The Bureau Attack clears red flags you don't even know about."

Card 2:
Icon: 🔄 (28px)
Question: "I've tried credit repair"
Answer: "Credit repair only disputes the Big Three. We attack the source—secondary bureaus—using laws they've never heard of."

Card 3:
Icon: 🎯 (28px)
Question: "Sounds complicated"
Answer: "It's 100% done-for-you. You check email and accept approvals. We handle everything else."

Each card style:
- Background: var(--bg-card)
- Border: 1px solid var(--border-color)
- Border-radius: 20px
- Padding: 28px
- Hover: border-color: var(--accent), translateY(-4px)
- Question: 17px bold white
- Answer: 14px secondary, line-height: 1.7

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 9: GUARANTEE
═══════════════════════════════════════════════════════════════════════════════════════
Centered card (max-width: 600px):

- Shield icon container: 72px circle with accent gradient background, "🛡️" emoji centered
- Title: "100% Money-Back Guarantee" (26px bold)
- Text: "Your $2,000 deposit is fully refundable if we can't get you approved. No approval, no risk. Simple as that." (16px secondary)
- 3 checkpoints in a row: 
  ✓ Refundable deposit
  ✓ No approval = full refund  
  ✓ Zero risk

Card style:
- Background: linear-gradient(135deg, rgba(accent, 0.08), rgba(secondary, 0.04))
- Border: 2px solid var(--accent)
- Border-radius: 24px
- Padding: 44px
- Add subtle rotating conic gradient animation in background (opacity: 0.08)

═══════════════════════════════════════════════════════════════════════════════════════
SECTION 10: FINAL CTA
═══════════════════════════════════════════════════════════════════════════════════════
Position: relative with overflow: hidden
Add large radial gradient glow behind (accent color, 40% opacity, centered at bottom)

Section label: "Get Started"
Title: "Ready to Get Funded?" (48px bold)
Subtitle: "Take 2 minutes to see if you qualify for $50K–$150K+ in funding." (17px secondary)
CTA Button: "Check Your Eligibility →" (same style as hero button)
Urgency badge: "🔥 Limited Spots This Month"
Badge style: background: rgba(245, 158, 11, 0.12); color: var(--secondary); border: 1px solid rgba(245, 158, 11, 0.25); padding: 10px 18px; border-radius: 100px;

═══════════════════════════════════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════════════════════════════════
Simple centered: "© 2025 ${mechanism}. All rights reserved."
Style: padding: 40px 0; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);

═══════════════════════════════════════════════════════════════════════════════════════
MODAL - CRITICAL: Must work with iframe embeds
═══════════════════════════════════════════════════════════════════════════════════════
IMPORTANT: Use visibility/opacity NOT display:none (iframes don't load inside display:none)

HTML Structure:
<div id="modal" class="modal">
  <div class="modal-overlay" onclick="closeModal()"></div>
  <div class="modal-content">
    <button class="modal-close" onclick="closeModal()">×</button>
    <div id="survey-container"><!-- Survey iframe here --></div>
  </div>
</div>

MODAL CSS (MUST USE EXACTLY):
.modal { 
  position: fixed; 
  inset: 0; 
  z-index: 9999; 
  display: flex;
  align-items: center; 
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
}
.modal.active { 
  visibility: visible;
  opacity: 1;
}
.modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); }
.modal-content { position: relative; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 24px; padding: 40px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-close { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 50%; color: white; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
#survey-container iframe { width: 100%; min-height: 500px; border: none; }

MODAL JS:
function openModal() { document.getElementById('modal').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal() { document.getElementById('modal').classList.remove('active'); document.body.style.overflow = ''; }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

═══════════════════════════════════════════════════════════════════════════════════════
RESPONSIVE BREAKPOINTS
═══════════════════════════════════════════════════════════════════════════════════════
@media (max-width: 900px):
- Result cards, FAQ cards, phase cards: single column
- Stats grid: 2 columns
- Two-column sections: stack vertically
- Comparison: single column

@media (max-width: 600px):
- Hero padding reduced
- CTA button: full width
- Stats: 2x2 grid
- Guarantee points: stack vertically
- All text sizes scale down appropriately

Output complete valid HTML starting with <!DOCTYPE html>
[LANDING_END]
`;
  }
  
  if (pageType === 'thankyou' || pageType === 'both') {
    pageInstructions += `
[THANKYOU_START]
Generate a COMPLETE thank you/confirmation page:

EXACT COPY TO USE:
- Headline: "You're Confirmed"
- Subheadline: "Check your email for the calendar invite and call details."
- Section Title: "Before Your Call"
- Step 1: Check your email for the calendar invite
- Step 2: Be ready to discuss your current revenue and funding goals
- Step 3: Check your texts for messages from our team

DESIGN:
- Same dark theme (--bg-primary, --bg-card)
- Centered layout, max-width: 600px
- Large checkmark icon (accent gradient circle, white checkmark)
- Headline: 44px bold
- Subheadline: 17px secondary
- 3 numbered steps in cards
- Footer: "Questions? Reply to your confirmation email."

Output complete valid HTML starting with <!DOCTYPE html>
[THANKYOU_END]
`;
  }

  return basePrompt + pageInstructions + `

═══════════════════════════════════════════════════════════════════════════════════════
FINAL REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════════════
- All CSS must be inline in <style> tags
- All JavaScript must be inline in <script> tags
- No external dependencies except Google Fonts
- Mobile-responsive with proper breakpoints
- Semantic HTML5 structure
- Accessibility: proper heading hierarchy, alt text, ARIA labels
- Performance: optimized CSS, minimal JavaScript
- Cross-browser compatible (Chrome, Safari, Firefox, Edge)

Output ONLY the complete HTML. No explanations, no markdown code blocks, just the raw HTML.
`;
}
