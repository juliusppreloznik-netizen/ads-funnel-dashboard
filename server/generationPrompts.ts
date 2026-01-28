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

export function getLandingPagePrompt(client: Client, htmlTemplate: string, hexColor?: string): string {
  const colorInstruction = hexColor 
    ? `\n\n## COLOR CUSTOMIZATION:\nReplace the primary orange color (rgb(237, 109, 5) and #ED6D05) throughout the template with: ${hexColor}\nFind and replace ALL instances of the orange color in inline styles and CSS.`
    : '';

  return `You are an expert at personalizing landing page copy. You will receive an HTML template and must perform LITERAL find-and-replace operations on the text content ONLY.

## CLIENT DATA:
- Client Name: ${client.name}
- Business Name: ${client.businessName}

## CRITICAL INSTRUCTIONS:
1. DO NOT modify HTML structure, CSS, classes, or layout
2. ONLY replace text content between HTML tags
3. Keep the exact same sections, formatting, and design
4. Preserve all Framer classes, data attributes, and styling exactly as-is
5. The output must be the COMPLETE HTML file with only text content changed
6. Keep "Citadel Consulting" or "Citidel Consulting" → replace with "${client.businessName}"
7. Update headlines, body copy, and testimonials with personalized content
8. Maintain the same emotional arc and messaging structure
9. DO NOT remove or modify the VSL embed section
10. DO NOT remove or modify the testimonial embed slots${colorInstruction}

## TEXT REPLACEMENT AREAS:
- Main headline and subheadline
- Body copy paragraphs
- Testimonial text (keep structure, update names/amounts)
- FAQ questions and answers
- CTA button text
- Social proof metrics

Generate NEW copy that maintains the same promise (Funding Optimization, 6 figures, 0% APR, 14 days) but with fresh wording.

OUTPUT THE COMPLETE HTML FILE with only text (and optionally color) changes:

${htmlTemplate}`;
}

export function loadLandingPageTemplate(): string {
  try {
    const templatePath = join(__dirname, 'landingPageTemplate.html');
    return readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Failed to load landing page template:', error);
    // Fallback to simple template
    return `<!DOCTYPE html>
<html>
<head>
  <title>Funding Optimization</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .vsl-container { width: 100%; max-width: 800px; margin: 20px auto; padding: 20px; border: 2px solid #ccc; }
    .testimonial-slot { width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; border: 2px dashed #999; }
  </style>
</head>
<body>
  <h1>Get Your Business Funded The Right Way</h1>
  <p>Access 6 figures of 0% APR capital in as little as 14 days.</p>
  
  <div class="vsl-container">
    <p>[VSL EMBED GOES HERE]</p>
  </div>
  
  <h2>What Our Clients Say</h2>
  
  <div class="testimonial-slot">
    <p>[TESTIMONIAL 1 EMBED GOES HERE]</p>
  </div>
  
  <div class="testimonial-slot">
    <p>[TESTIMONIAL 2 EMBED GOES HERE]</p>
  </div>
  
  <button>Get Started</button>
</body>
</html>`;
  }
}
