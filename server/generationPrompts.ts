import { Client } from "../drizzle/schema";
import { readFileSync } from "fs";
import { join } from "path";

export function getVSLPrompt(client: Client): string {
  return `You are an elite direct response copywriter. Generate a complete VSL script for a business funding company.

## CLIENT DATA:
- Client Name: ${client.name}
- Business Name: ${client.businessName}
- Funding Results Link: ${client.driveLink || "Not provided"}

## CORE MESSAGING:
- Unique Mechanism: "Funding Optimization" (2-step process: private lender network + profile optimization)
- Promise: 6 figures of 0% APR capital in as little as 14 days
- Target: Business owners earning $7K-$50K/month who've been rejected for funding

## CRITICAL OUTPUT REQUIREMENT:
Write the ENTIRE VSL script as ONE CONTINUOUS PIECE OF COPY with NO timestamps, NO section headers, NO visual suggestions, NO formatting breaks.

Write it as if you're speaking directly to the camera in one breath. Use natural paragraph breaks for pacing, but DO NOT include any labels like "HOOK:" or "SECTION 1:" or timestamps like "0:00-0:30".

The script should flow naturally from hook → problem → mechanism reveal → proof → how it works → CTA, approximately 10-12 minutes of speaking content.

Start with the hook and keep writing until you reach the final CTA. Make it conversational, not salesy.

BEGIN SCRIPT NOW:`;
}

export function getAdsPrompt(client: Client): string {
  return `You are an elite direct response copywriter. Generate 5 unique video ad scripts for business funding.

## CLIENT DATA:
- Client Name: ${client.name}
- Business Name: ${client.businessName}

## CORE OFFER:
- 6 figures of 0% APR business capital in 14 days
- Works with bad credit or previous rejections
- Unique Mechanism: "Funding Optimization"

## CRITICAL OUTPUT REQUIREMENT:
Output ONLY the ad copy for each ad. NO visual suggestions, NO platform notes, NO formatting instructions, NO timestamps, NO [VISUAL SUGGESTION] notes.

Format EXACTLY like this:

**Ad 1**

[The complete ad copy here as one flowing piece]

**Ad 2**

[The complete ad copy here as one flowing piece]

**Ad 3**

[The complete ad copy here as one flowing piece]

**Ad 4**

[The complete ad copy here as one flowing piece]

**Ad 5**

[The complete ad copy here as one flowing piece]

---

Each ad should be 30-60 seconds of spoken content. Use different hook types:
- Ad 1: Contrast + Problem hook
- Ad 2: Big Secret hook  
- Ad 3: Story-based hook
- Ad 4: Self-identification hook
- Ad 5: Urgency/FOMO hook

Write clean, conversational copy that flows naturally. End each ad with a clear CTA.

BEGIN ADS NOW:`;
}

export function getLandingPageCopyPrompt(client: Client): string {
  return `You are an elite direct response copywriter. Generate NEW personalized copy for a business funding landing page.

## CLIENT DATA:
- Business Name: ${client.businessName}

## REQUIRED OUTPUT FORMAT:
Return a JSON object with the following fields. Each field should contain the NEW copy text that will replace the original template text.

{
  "headline": "Main headline (replace: 'We'll use Funding Optimization to get you access to 6 figures of 0% APR capital in as little as 14 days')",
  "subheadline": "Subheadline (replace: 'Even if your credit isn't the best and even if you've been rejected for funding before.')",
  "socialProof": "Social proof line (replace: '50+ entrepreneurs approved every month')",
  "ctaButton": "CTA button text (replace: 'Get me funded')",
  "bodySection1": "First body paragraph - introduce the problem",
  "bodySection2": "Second body paragraph - agitate the problem",
  "bodySection3": "Third body paragraph - introduce Funding Optimization mechanism",
  "bodySection4": "Fourth body paragraph - explain how it works",
  "testimonial1Name": "First testimonial name",
  "testimonial1Result": "First testimonial result (e.g., '$120,000 in 4 weeks')",
  "testimonial1Quote": "First testimonial quote",
  "testimonial2Name": "Second testimonial name",
  "testimonial2Result": "Second testimonial result (e.g., '$175,000 in 3 weeks')",
  "testimonial2Quote": "Second testimonial quote",
  "faq1Question": "FAQ 1 question",
  "faq1Answer": "FAQ 1 answer",
  "faq2Question": "FAQ 2 question",
  "faq2Answer": "FAQ 2 answer",
  "faq3Question": "FAQ 3 question",
  "faq3Answer": "FAQ 3 answer"
}

Generate fresh, compelling copy that maintains the same promise (Funding Optimization, 6 figures, 0% APR, 14 days) but with new wording personalized for ${client.businessName}.

OUTPUT ONLY THE JSON OBJECT, NO OTHER TEXT:`;
}

export function applyLandingPageReplacements(
  template: string,
  copyData: any,
  businessName: string,
  hexColor?: string
): string {
  let result = template;

  // Replace business name
  result = result.replace(/Citadel Consulting/g, businessName);
  result = result.replace(/Citidel Consulting/g, businessName);

  // Replace copy elements if provided
  if (copyData.headline) {
    // Find and replace the main headline - look for the specific text pattern
    result = result.replace(
      /We'll use Funding Optimization to get you access to 6 figures of 0% APR capital in as little as 14 days[^<]*/g,
      copyData.headline
    );
  }

  if (copyData.subheadline) {
    result = result.replace(
      /Even if your credit isn't the best and even if you've been rejected for funding before\./g,
      copyData.subheadline
    );
  }

  if (copyData.ctaButton) {
    result = result.replace(/Get me funded/g, copyData.ctaButton);
  }

  // Replace color if provided
  if (hexColor) {
    // Replace rgb(237, 109, 5) with hex color
    const rgbMatch = hexColor.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 16);
      const g = parseInt(rgbMatch[2], 16);
      const b = parseInt(rgbMatch[3], 16);
      result = result.replace(/rgb\(237,\s*109,\s*5\)/g, `rgb(${r}, ${g}, ${b})`);
      result = result.replace(/rgb\(237, 109, 5\)/g, `rgb(${r}, ${g}, ${b})`);
    }
    result = result.replace(/#ED6D05/g, hexColor);
  }

  return result;
}

export function loadLandingPageTemplate(): string {
  try {
    const templatePath = join(__dirname, 'landingPageTemplate.html');
    return readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Failed to load landing page template:', error);
    throw new Error('Landing page template not found');
  }
}
