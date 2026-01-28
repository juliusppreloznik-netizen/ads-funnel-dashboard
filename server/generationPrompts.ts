import { readFileSync } from 'fs';
import { join } from 'path';

export function getVSLPrompt(client: any, uniqueMechanism: string): string {
  return `You are a direct response copywriter creating a VSL (Video Sales Letter) script.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism: "${uniqueMechanism}"

Write a complete VSL script using the unique mechanism "${uniqueMechanism}". The script should:
- Hook the viewer in the first 10 seconds with a bold promise
- Introduce the problem (business funding struggles)
- Present "${uniqueMechanism}" as the solution
- Explain how it works (6 figures, 0% APR, 14 days)
- Include social proof and results
- End with a strong call to action

Output the script as continuous flowing copy with NO timestamps, NO section headers, NO visual suggestions. Just the raw script text that will be read aloud.`;
}

export function getAdsPrompt(client: any, uniqueMechanism: string): string {
  return `You are a direct response copywriter creating 5 video ad scripts.

Client Information:
- Business Name: ${client.businessName}
- Unique Mechanism: "${uniqueMechanism}"

Write 5 distinct ad scripts (30-45 seconds each) using "${uniqueMechanism}" as the core offer. Each ad should use a different hook type:

Ad 1 - Contrast Hook (before/after, us vs them)
Ad 2 - Big Secret Hook (reveal hidden truth)
Ad 3 - Story Hook (personal narrative)
Ad 4 - Self-Identification Hook (speak directly to avatar)
Ad 5 - FOMO Hook (scarcity, urgency)

Format:
Ad 1:
[script text]

Ad 2:
[script text]

Ad 3:
[script text]

Ad 4:
[script text]

Ad 5:
[script text]

Output ONLY the ad copy with NO visual suggestions, NO timestamps, NO formatting notes.`;
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

  // Apply text replacements (minimal - just the key copy elements)
  // Note: The template uses Framer components, so we need to find and replace within the HTML structure
  // For now, just return the template as-is since the structure is complex
  // In a production system, you'd parse the HTML and replace specific text nodes

  return result;
}

export function loadLandingPageTemplate(): string {
  try {
    // Use absolute path from project root since __dirname varies in dev vs prod
    const templatePath = join(process.cwd(), 'server/landingPageTemplate.html');
    return readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error('Failed to load landing page template:', error);
    console.error('Attempted path:', join(process.cwd(), 'server/landingPageTemplate.html'));
    throw new Error('Landing page template not found');
  }
}
