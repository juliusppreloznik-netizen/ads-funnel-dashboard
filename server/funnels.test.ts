import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from './db';

describe('Funnel Generation Features', () => {
  let testClientId: number;

  beforeAll(async () => {
    // Create a test client
    const result = await createClient({
      name: 'Test Client',
      email: 'test@example.com',
      businessName: 'Test Business LLC',
      password: 'testpass123',
      ghlEmail: 'ghl@example.com',
      ghlPassword: 'ghlpass',
      driveLink: 'https://drive.google.com/test',
    });
    testClientId = result[0].insertId;
  });

  describe('Database Schema', () => {
    it('should have admin-only fields in clients table including new metadata fields', async () => {
      const { getClientById } = await import('./db');
      const client = await getClientById(testClientId);
      
      expect(client).toBeDefined();
      expect(client).toHaveProperty('ghlApiToken');
      expect(client).toHaveProperty('ghlLocationId');
      expect(client).toHaveProperty('funnelAccentColor');
      expect(client).toHaveProperty('funnelSecondaryColor');
      expect(client).toHaveProperty('templateUsed');
      expect(client).toHaveProperty('backgroundTreatment');
    });
  });

  describe('Client Update Procedure', () => {
    it('should update admin fields including new metadata fields', async () => {
      const { updateClient } = await import('./db');
      
      await updateClient(testClientId, {
        ghlApiToken: 'test_token_123',
        ghlLocationId: 'loc_456',
        funnelAccentColor: '#8B5CF6',
        funnelSecondaryColor: '#06B6D4',
        templateUsed: 'A',
        backgroundTreatment: 'radial_glow',
      });

      const { getClientById } = await import('./db');
      const updatedClient = await getClientById(testClientId);
      
      expect(updatedClient?.ghlApiToken).toBe('test_token_123');
      expect(updatedClient?.ghlLocationId).toBe('loc_456');
      expect(updatedClient?.funnelAccentColor).toBe('#8B5CF6');
      expect(updatedClient?.funnelSecondaryColor).toBe('#06B6D4');
      expect(updatedClient?.templateUsed).toBe('A');
      expect(updatedClient?.backgroundTreatment).toBe('radial_glow');
    });
  });

  describe('Asset Generation', () => {
    it('should create funnel assets with correct types', async () => {
      const { createGeneratedAsset, getAssetsByClientId } = await import('./db');
      
      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'landing_page_html',
        content: '<html>Landing Page</html>',
      });

      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'thankyou_page_html',
        content: '<html>Thank You Page</html>',
      });

      const assets = await getAssetsByClientId(testClientId);
      const landingPage = assets.find(a => a.assetType === 'landing_page_html');
      const thankyouPage = assets.find(a => a.assetType === 'thankyou_page_html');

      expect(landingPage).toBeDefined();
      expect(thankyouPage).toBeDefined();
    });

    it('should create survey CSS asset', async () => {
      const { createGeneratedAsset, getAssetsByClientId } = await import('./db');
      
      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'survey_css',
        content: ':root { --accent: #8B5CF6; }',
      });

      const assets = await getAssetsByClientId(testClientId);
      const surveyCss = assets.find(a => a.assetType === 'survey_css');

      expect(surveyCss).toBeDefined();
      expect(surveyCss?.content).toContain('--accent');
    });
  });

  describe('Asset Versioning', () => {
    it('should support multiple versions of the same asset type', async () => {
      const { createGeneratedAsset, getAssetsByClientId } = await import('./db');
      
      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'vsl',
        content: 'VSL Version 1',
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'vsl',
        content: 'VSL Version 2 - Revised',
      });

      const assets = await getAssetsByClientId(testClientId);
      const vslAssets = assets.filter(a => a.assetType === 'vsl');

      expect(vslAssets.length).toBeGreaterThanOrEqual(2);
      
      const sortedVsls = vslAssets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      expect(sortedVsls[0].content).not.toBe(sortedVsls[1].content);
      expect(sortedVsls.some(v => v.content.includes('Version 2'))).toBe(true);
      expect(sortedVsls.some(v => v.content.includes('Version 1'))).toBe(true);
    });
  });

  describe('Funnel Generation Prompt v2.5', () => {
    it('should build comprehensive funnel prompt with client data', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business LLC',
        ownerName: 'Test Client',
        industry: 'Business Funding',
        monthlyRevenue: '$7K-$50K',
        fundingChallenges: 'Getting denied for traditional funding',
        goals: 'Access capital for business growth',
        mechanismName: 'Revenue Based Funding',
      });

      expect(prompt).toContain('Test Business LLC');
      expect(prompt).toContain('Test Client');
      expect(prompt).toContain('Revenue Based Funding');
      // v2.2 Copy DNA is included
      expect(prompt).toContain('COPY DNA');
    });

    it('should include 3 reference templates (A, B, C)', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Construction',
        monthlyRevenue: '$20K',
        fundingChallenges: 'Denied',
        goals: 'Growth',
        mechanismName: 'Test Mechanism',
      });

      expect(prompt).toContain('TEMPLATE A: Purple Glassmorphism');
      expect(prompt).toContain('TEMPLATE B: Matrix/Hacker Terminal');
      expect(prompt).toContain('TEMPLATE C: Dark Fintech Dashboard');
    });

    it('should include 15-color accent palette', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Tech',
        monthlyRevenue: '$30K',
        fundingChallenges: 'Slow banks',
        goals: 'Scale',
        mechanismName: 'Test Mechanism',
      });

      expect(prompt).toContain('15-COLOR ACCENT PALETTE');
      expect(prompt).toContain('#8B5CF6'); // Violet
      expect(prompt).toContain('#3B82F6'); // Electric Blue
      expect(prompt).toContain('#10B981'); // Emerald
      expect(prompt).toContain('#F59E0B'); // Amber
      expect(prompt).toContain('#F43F5E'); // Rose
    });

    it('should include background treatment variations', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Real Estate',
        monthlyRevenue: '$50K',
        fundingChallenges: 'Need capital',
        goals: 'Expand',
        mechanismName: 'Test Mechanism',
      });

      // Check for background treatment content from Design Bible
      expect(prompt).toContain('radial glow');
      expect(prompt).toContain('Grid Overlay');
      expect(prompt).toContain('Noise Texture');
      expect(prompt).toContain('Gradient Mesh');
    });

    it('should request metadata output format', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Tech',
        monthlyRevenue: '$30K',
        fundingChallenges: 'Denied',
        goals: 'Growth',
        mechanismName: 'Test Mechanism',
      });

      expect(prompt).toContain('ACCENT_PRIMARY:');
      expect(prompt).toContain('ACCENT_SECONDARY:');
      expect(prompt).toContain('TEMPLATE_USED:');
      expect(prompt).toContain('BACKGROUND_TREATMENT:');
    });

    it('should include Design Bible content (all 16 chapters)', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Tech',
        monthlyRevenue: '$30K',
        fundingChallenges: 'Denied',
        goals: 'Growth',
        mechanismName: 'Test Mechanism',
      });

      // Design Bible chapters
      expect(prompt).toContain('7 SINS OF AI-GENERATED LANDING PAGES');
      expect(prompt).toContain('COLOR SCIENCE');
      expect(prompt).toContain('TYPOGRAPHY');
      expect(prompt).toContain('GLOW BIBLE');
      expect(prompt).toContain('CARD');
      expect(prompt).toContain('MICRO-INTERACTION');
      expect(prompt).toContain('LAYOUT RHYTHM');
      expect(prompt).toContain('HERO');
      expect(prompt).toContain('STATS');
      expect(prompt).toContain('SOCIAL PROOF');
      expect(prompt).toContain('CTA ENGINEERING');
    });

    it('should include v2.3 mandatory design rules and new components', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Tech',
        monthlyRevenue: '$30K',
        fundingChallenges: 'Denied',
        goals: 'Growth',
        mechanismName: 'Test Mechanism',
      });

      // v2.3 mandatory rules
      expect(prompt).toContain('MANDATORY');
      // v2.3 new components
      expect(prompt).toContain('approval table');
      expect(prompt).toContain('section-divider');
    });

    it('should include v2.2 Copy DNA voice and tone', async () => {
      const { buildFunnelGenerationPrompt } = await import('./funnelGenerationPrompt');
      
      const prompt = buildFunnelGenerationPrompt({
        businessName: 'Test Business',
        ownerName: 'Test',
        industry: 'Tech',
        monthlyRevenue: '$30K',
        fundingChallenges: 'Denied',
        goals: 'Growth',
        mechanismName: 'Test Mechanism',
      });

      // Copy DNA voice characteristics
      expect(prompt).toContain('VOICE');
      expect(prompt).toContain('TONE');
      expect(prompt).toContain('HEADLINE');
      // Copy DNA section-by-section guide
      expect(prompt).toContain('SECTION BY SECTION');
    });
  });

  describe('Funnel Response Parsing v2.5', () => {
    it('should parse new format with metadata lines and [LANDING_START] delimiters', async () => {
      const { parseFunnelResponse } = await import('./funnelGenerationPrompt');
      
      const mockResponse = `ACCENT_PRIMARY:#8B5CF6
ACCENT_SECONDARY:#06B6D4
TEMPLATE_USED:A
BACKGROUND_TREATMENT:radial_glow

[LANDING_START]
<!DOCTYPE html><html><head><title>Test Landing</title></head><body>Landing Page</body></html>
[LANDING_END]

[THANKYOU_START]
<!DOCTYPE html><html><head><title>Thank You</title></head><body>Thank You Page</body></html>
[THANKYOU_END]`;

      const result = parseFunnelResponse(mockResponse);

      expect(result.landingPageHtml).toContain('Test Landing');
      expect(result.thankyouPageHtml).toContain('Thank You Page');
      expect(result.accentColor).toBe('#8B5CF6');
      expect(result.metadata.accentPrimary).toBe('#8B5CF6');
      expect(result.metadata.accentSecondary).toBe('#06B6D4');
      expect(result.metadata.templateUsed).toBe('A');
      expect(result.metadata.backgroundTreatment).toBe('radial_glow');
    });

    it('should still parse old format with ===LANDING_PAGE_START=== delimiters', async () => {
      const { parseFunnelResponse } = await import('./funnelGenerationPrompt');
      
      const mockResponse = `===LANDING_PAGE_START===
<!-- ACCENT_COLOR: #F59E0B -->
<!DOCTYPE html><html><body>Old Format Landing</body></html>
===LANDING_PAGE_END===

===THANKYOU_PAGE_START===
<!DOCTYPE html><html><body>Old Format Thank You</body></html>
===THANKYOU_PAGE_END===`;

      const result = parseFunnelResponse(mockResponse);

      expect(result.landingPageHtml).toContain('Old Format Landing');
      expect(result.thankyouPageHtml).toContain('Old Format Thank You');
      // Old format doesn't have metadata lines
      expect(result.metadata.accentPrimary).toBe('');
      expect(result.metadata.templateUsed).toBe('');
    });

    it('should handle all background treatment values', async () => {
      const { parseFunnelResponse } = await import('./funnelGenerationPrompt');
      
      const treatments = [
        'radial_glow', 'grid_overlay', 'dual_tone_gradient', 
        'noise_grain', 'gradient_mesh', 'diagonal_sweep', 'grid_glow_combo'
      ];

      for (const treatment of treatments) {
        const mockResponse = `ACCENT_PRIMARY:#8B5CF6
ACCENT_SECONDARY:#06B6D4
TEMPLATE_USED:B
BACKGROUND_TREATMENT:${treatment}

[LANDING_START]
<html>Test</html>
[LANDING_END]`;

        const result = parseFunnelResponse(mockResponse);
        expect(result.metadata.backgroundTreatment).toBe(treatment);
      }
    });

    it('should handle all template values (A, B, C)', async () => {
      const { parseFunnelResponse } = await import('./funnelGenerationPrompt');
      
      for (const template of ['A', 'B', 'C']) {
        const mockResponse = `ACCENT_PRIMARY:#8B5CF6
ACCENT_SECONDARY:#06B6D4
TEMPLATE_USED:${template}
BACKGROUND_TREATMENT:radial_glow

[LANDING_START]
<html>Test</html>
[LANDING_END]`;

        const result = parseFunnelResponse(mockResponse);
        expect(result.metadata.templateUsed).toBe(template);
      }
    });
  });

  describe('Survey CSS Prompt', () => {
    it('should build survey CSS prompt with accent color', async () => {
      const { buildSurveyCssPrompt } = await import('./surveyCssPrompt');
      
      const prompt = buildSurveyCssPrompt('#8B5CF6');

      expect(prompt).toContain('#8B5CF6');
      expect(prompt).toContain('GoHighLevel survey form');
      expect(prompt).toContain('CSS');
    });
  });

  describe('Asset Revision Prompt', () => {
    it('should build revision prompt with existing assets', async () => {
      const { buildAssetRevisionPrompt } = await import('./assetRevisionPrompt');
      
      const prompt = buildAssetRevisionPrompt({
        vslScript: 'Original VSL content',
        adScripts: 'Original ads content',
        landingPageHtml: '<html>Original landing page</html>',
        thankyouPageHtml: '<html>Original thank you page</html>',
      });

      expect(prompt).toContain('Original VSL content');
      expect(prompt).toContain('Original ads content');
      expect(prompt).toContain('Original landing page');
      expect(prompt).toContain('Original thank you page');
      expect(prompt).toContain('===VSL_START===');
      expect(prompt).toContain('===LANDING_START===');
    });
  });

  describe('VSL and Ad Prompts are niche-locked', () => {
    it('should detect mortgage niche from mechanism name and lock VSL to mortgage copy', async () => {
      const { getVSLPrompt } = await import('./generationPrompts');
      
      const prompt = getVSLPrompt({ businessName: 'Test Biz' }, 'Mortgage Ready Blueprint');
      
      expect(prompt).toContain('Mortgage Ready Blueprint');
      expect(prompt).toContain('Test Biz');
      expect(prompt).toContain('HOOK');
      expect(prompt).toContain('MECHANISM REVEAL');
      expect(prompt).toContain('3,000-4,000 words');
      // Must be locked to mortgage niche
      expect(prompt).toContain('NICHE LOCK');
      expect(prompt).toContain('mortgage readiness and home buying');
      expect(prompt).toContain('aspiring homeowners');
      // Must contain forbidden topics
      expect(prompt).toContain('FORBIDDEN TOPICS');
      expect(prompt).toContain('Investment returns');
      expect(prompt).toContain('wealth management');
      // Must NOT contain funding-specific content
      expect(prompt).not.toContain('business credit and funding');
    });

    it('should default to funding niche for non-mortgage mechanisms', async () => {
      const { getVSLPrompt } = await import('./generationPrompts');
      
      const prompt = getVSLPrompt({ businessName: 'Test Biz' }, 'Secondary Bureau Attack Method');
      
      expect(prompt).toContain('Secondary Bureau Attack Method');
      expect(prompt).toContain('NICHE LOCK');
      expect(prompt).toContain('business credit and funding');
      expect(prompt).toContain('business owners who need capital');
      expect(prompt).toContain('FORBIDDEN TOPICS');
      // Must NOT contain mortgage content
      expect(prompt).not.toContain('mortgage readiness and home buying');
    });

    it('should detect mortgage niche in Ads prompt', async () => {
      const { getAdsPrompt } = await import('./generationPrompts');
      
      const prompt = getAdsPrompt({ businessName: 'Test Biz' }, 'Mortgage Ready Blueprint');
      
      expect(prompt).toContain('Mortgage Ready Blueprint');
      expect(prompt).toContain('Test Biz');
      expect(prompt).toContain('Ad 1');
      expect(prompt).toContain('Ad 5');
      expect(prompt).toContain('5 distinct video ad scripts');
      expect(prompt).toContain('NICHE LOCK');
      expect(prompt).toContain('mortgage readiness and home buying');
      expect(prompt).toContain('FORBIDDEN TOPICS');
    });

    it('should default to funding niche in Ads prompt for non-mortgage mechanisms', async () => {
      const { getAdsPrompt } = await import('./generationPrompts');
      
      const prompt = getAdsPrompt({ businessName: 'Test Biz' }, 'The Banker Shortcut');
      
      expect(prompt).toContain('The Banker Shortcut');
      expect(prompt).toContain('NICHE LOCK');
      expect(prompt).toContain('business credit and funding');
      expect(prompt).toContain('FORBIDDEN TOPICS');
      expect(prompt).not.toContain('mortgage readiness and home buying');
    });
  });
});
