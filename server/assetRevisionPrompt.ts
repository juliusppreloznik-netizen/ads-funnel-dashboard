/**
 * Asset Revision Prompt Builder
 * Polishes all existing assets (VSL, Ads, Landing Page, Thank You Page, Survey CSS)
 */

interface RevisionInput {
  vslScript?: string;
  adScripts?: string;
  landingPageHtml?: string;
  thankyouPageHtml?: string;
  surveyCss?: string;
}

export function buildAssetRevisionPrompt(assets: RevisionInput): string {
  const hasVsl = !!assets.vslScript;
  const hasAds = !!assets.adScripts;
  const hasLanding = !!assets.landingPageHtml;
  const hasThankyou = !!assets.thankyouPageHtml;
  const hasSurvey = !!assets.surveyCss;

  return `You are a senior direct response copywriter doing a final polish on ALL marketing assets for a business funding company. Make everything SHARPER — not longer.

=== BANNED PHRASES — REMOVE FROM ALL ASSETS ===
- "credit repair"
- "in today's economy" / "what if I told you" / "here's the thing"
- "no gimmicks" / "guaranteed approval" / "bad credit no problem"
- "tired of being denied"
- "game-changer" / "revolutionary" / "groundbreaking"

=== ENFORCE ACROSS ALL ASSETS ===
- Every sentence earns its place. Cut filler ruthlessly.
- Pain points use prospect's EXACT internal dialogue
- Social proof: specific dollar amounts, timelines, industries
- Mechanism name appears 3-5x naturally
- "Breathing room" appears at least once
- MCAs positioned as predatory alternative
- Secondary bureaus (Innovis, LexisNexis, SageStream) named
- Tone: Confident, direct, slightly irreverent

${hasVsl ? `=== VSL REVISION ===
- First 30 seconds: open loop impossible to click away from
- Copy hinge (mechanism) within first 2-3 minutes
- Replace generic openers with visceral hooks
- Close reframes investment vs. cost of inaction
` : ''}

${hasAds ? `=== AD SCRIPT REVISION ===
- HOOKS (first 3 lines): Must stop scroll. If weak, REWRITE COMPLETELY.
- Each ad has distinctly different hook angle
- Mechanism reveal feels like insider knowledge, not a pitch
- Sentences SHORT. Conversational. Camera-ready.
` : ''}

${hasLanding ? `=== LANDING PAGE HTML REVISION ===
- Verify ALL sections: Hero, Problem, Mechanism, Stats, Social Proof, Comparison, Objections, Guarantee, Final CTA, Footer
- CTA button after every section (except Stats and Footer)
- All CTAs use class "cta-open-modal" and open survey modal
- Modal has placeholder for GHL survey embed
- Mobile: no horizontal scroll at 375px
- Colors: Pure dark backgrounds, accent consistent
- Fix any broken HTML or markdown artifacts
` : ''}

${hasThankyou ? `=== THANK YOU PAGE — DO NOT CHANGE ===
The thank you page content is locked. Only fix CSS issues (ensure full black background fills entire viewport with min-height: 100vh on html and body). Do NOT add or remove any content.
` : ''}

${hasSurvey ? `=== SURVEY CSS — DO NOT CHANGE ===
Survey CSS is already optimized. Do not modify.
` : ''}

=== CURRENT ASSETS ===

${hasVsl ? `VSL SCRIPT:
${assets.vslScript}

` : ''}${hasAds ? `AD SCRIPTS:
${assets.adScripts}

` : ''}${hasLanding ? `LANDING PAGE HTML:
${assets.landingPageHtml}

` : ''}${hasThankyou ? `THANK YOU PAGE HTML:
${assets.thankyouPageHtml}

` : ''}${hasSurvey ? `SURVEY CSS:
${assets.surveyCss}

` : ''}

=== OUTPUT FORMAT ===

Return the revised assets using these delimiters:

${hasVsl ? `===VSL_START===
[revised VSL script here]
===VSL_END===

` : ''}${hasAds ? `===ADS_START===
[revised ad scripts here]
===ADS_END===

` : ''}${hasLanding ? `===LANDING_START===
[revised landing page HTML here]
===LANDING_END===

` : ''}${hasThankyou ? `===THANKYOU_START===
[revised thank you page HTML here]
===THANKYOU_END===

` : ''}${hasSurvey ? `===SURVEY_START===
[survey CSS unchanged]
===SURVEY_END===
` : ''}`;
}

export function parseRevisionResponse(response: string): RevisionInput {
  const result: RevisionInput = {};

  // Extract VSL
  const vslMatch = response.match(/===VSL_START===([\s\S]*?)===VSL_END===/);
  if (vslMatch) {
    result.vslScript = vslMatch[1].trim();
  }

  // Extract Ads
  const adsMatch = response.match(/===ADS_START===([\s\S]*?)===ADS_END===/);
  if (adsMatch) {
    result.adScripts = adsMatch[1].trim();
  }

  // Extract Landing Page
  const landingMatch = response.match(/===LANDING_START===([\s\S]*?)===LANDING_END===/);
  if (landingMatch) {
    result.landingPageHtml = landingMatch[1].trim();
  }

  // Extract Thank You Page
  const thankyouMatch = response.match(/===THANKYOU_START===([\s\S]*?)===THANKYOU_END===/);
  if (thankyouMatch) {
    result.thankyouPageHtml = thankyouMatch[1].trim();
  }

  // Extract Survey CSS
  const surveyMatch = response.match(/===SURVEY_START===([\s\S]*?)===SURVEY_END===/);
  if (surveyMatch) {
    result.surveyCss = surveyMatch[1].trim();
  }

  return result;
}
