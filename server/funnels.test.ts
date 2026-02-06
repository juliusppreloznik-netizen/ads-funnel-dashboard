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
    it('should have admin-only fields in clients table', async () => {
      const { getClientById } = await import('./db');
      const client = await getClientById(testClientId);
      
      expect(client).toBeDefined();
      expect(client).toHaveProperty('ghlApiToken');
      expect(client).toHaveProperty('ghlLocationId');
      expect(client).toHaveProperty('funnelAccentColor');
    });
  });

  describe('Client Update Procedure', () => {
    it('should update admin fields via tRPC', async () => {
      const { updateClient } = await import('./db');
      
      await updateClient(testClientId, {
        ghlApiToken: 'test_token_123',
        ghlLocationId: 'loc_456',
        funnelAccentColor: '#8B5CF6',
      });

      const { getClientById } = await import('./db');
      const updatedClient = await getClientById(testClientId);
      
      expect(updatedClient?.ghlApiToken).toBe('test_token_123');
      expect(updatedClient?.ghlLocationId).toBe('loc_456');
      expect(updatedClient?.funnelAccentColor).toBe('#8B5CF6');
    });
  });

  describe('Asset Generation', () => {
    it('should create funnel assets with correct types', async () => {
      const { createGeneratedAsset, getAssetsByClientId } = await import('./db');
      
      // Create landing page asset
      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'landing_page_html',
        content: '<!-- ACCENT_COLOR: #8B5CF6 --><html>Landing Page</html>',
      });

      // Create thank you page asset
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
      expect(landingPage?.content).toContain('ACCENT_COLOR');
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
      
      // Create version 1
      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'vsl',
        content: 'VSL Version 1',
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create version 2 (revision)
      await createGeneratedAsset({
        clientId: testClientId,
        assetType: 'vsl',
        content: 'VSL Version 2 - Revised',
      });

      const assets = await getAssetsByClientId(testClientId);
      const vslAssets = assets.filter(a => a.assetType === 'vsl');

      expect(vslAssets.length).toBeGreaterThanOrEqual(2);
      
      // Sort by creation date (newest first)
      const sortedVsls = vslAssets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Just check we have multiple versions and they're different
      expect(sortedVsls[0].content).not.toBe(sortedVsls[1].content);
      expect(sortedVsls.some(v => v.content.includes('Version 2'))).toBe(true);
      expect(sortedVsls.some(v => v.content.includes('Version 1'))).toBe(true);
    });
  });

  describe('Funnel Generation Prompt', () => {
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
      expect(prompt).toContain('COPYWRITING DNA');
      expect(prompt).toContain('REFERENCE HTML/CSS PATTERNS');
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
});
