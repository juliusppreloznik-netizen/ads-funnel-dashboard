import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { getVSLPrompt, getAdsPrompt, getLandingPageCopyPrompt, loadLandingPageTemplate, applyLandingPageReplacements } from "./generationPrompts";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Client intake and management
  clients: router({
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        businessName: z.string(),
        ghlEmail: z.string().optional(),
        ghlPassword: z.string().optional(),
        driveLink: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createClient(input);
        // Notify owner about new submission
        await notifyOwner({
          title: "New Client Submission",
          content: `${input.name} from ${input.businessName} has submitted the intake form.`,
        });
        return { success: true };
      }),
    
    list: protectedProcedure.query(async () => {
      return await db.getAllClients();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),
  }),

  // Generated assets management
  assets: router({
    getByClientId: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssetsByClientId(input.clientId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssetById(input.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateAssetContent(input.id, input.content);
        return { success: true };
      }),
  }),

  // Claude API generation endpoints
  generation: router({
    generateVSL: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        const client = await db.getClientById(input.clientId);
        if (!client) throw new Error("Client not found");

        const prompt = getVSLPrompt(client);
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an elite direct response copywriter specializing in VSL scripts." },
            { role: "user", content: prompt },
          ],
        });

        const content = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0]?.message?.content || "");
        
        await db.createGeneratedAsset({
          clientId: input.clientId,
          assetType: "vsl",
          content,
        });

        await notifyOwner({
          title: "VSL Generated",
          content: `VSL script generated for ${client.name} (${client.businessName})`,
        });

        return { success: true, content };
      }),

    generateAds: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        const client = await db.getClientById(input.clientId);
        if (!client) throw new Error("Client not found");

        const prompt = getAdsPrompt(client);
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an elite direct response copywriter specializing in short-form video ads." },
            { role: "user", content: prompt },
          ],
        });

        const content = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0]?.message?.content || "");
        
        await db.createGeneratedAsset({
          clientId: input.clientId,
          assetType: "ads",
          content,
        });

        await notifyOwner({
          title: "Ads Generated",
          content: `5 ad scripts generated for ${client.name} (${client.businessName})`,
        });

        return { success: true, content };
      }),

    generateLandingPage: protectedProcedure
      .input(z.object({ clientId: z.number(), hexColor: z.string().optional() }))
      .mutation(async ({ input }) => {
        const client = await db.getClientById(input.clientId);
        if (!client) throw new Error("Client not found");

        // Step 1: Generate copy text using Claude
        const copyPrompt = getLandingPageCopyPrompt(client);
        const copyResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are an elite direct response copywriter. Return ONLY valid JSON, no other text." },
            { role: "user", content: copyPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "landing_page_copy",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  subheadline: { type: "string" },
                  socialProof: { type: "string" },
                  ctaButton: { type: "string" },
                  bodySection1: { type: "string" },
                  bodySection2: { type: "string" },
                  bodySection3: { type: "string" },
                  bodySection4: { type: "string" },
                  testimonial1Name: { type: "string" },
                  testimonial1Result: { type: "string" },
                  testimonial1Quote: { type: "string" },
                  testimonial2Name: { type: "string" },
                  testimonial2Result: { type: "string" },
                  testimonial2Quote: { type: "string" },
                  faq1Question: { type: "string" },
                  faq1Answer: { type: "string" },
                  faq2Question: { type: "string" },
                  faq2Answer: { type: "string" },
                  faq3Question: { type: "string" },
                  faq3Answer: { type: "string" },
                },
                required: ["headline", "subheadline", "ctaButton"],
                additionalProperties: false,
              },
            },
          },
        });

        const copyText = typeof copyResponse.choices[0]?.message?.content === 'string' 
          ? copyResponse.choices[0].message.content 
          : JSON.stringify(copyResponse.choices[0]?.message?.content || "{}");
        
        const copyData = JSON.parse(copyText);

        // Step 2: Load template and apply replacements programmatically
        const htmlTemplate = loadLandingPageTemplate();
        const content = applyLandingPageReplacements(
          htmlTemplate,
          copyData,
          client.businessName,
          input.hexColor
        );
        
        await db.createGeneratedAsset({
          clientId: input.clientId,
          assetType: "landing_page",
          content,
        });

        await notifyOwner({
          title: "Landing Page Generated",
          content: `Landing page generated for ${client.name} (${client.businessName})`,
        });

        return { success: true, content };
      }),
  }),
});

export type AppRouter = typeof appRouter;
