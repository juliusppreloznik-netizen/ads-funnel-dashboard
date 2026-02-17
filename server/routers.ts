import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { sendClientWelcomeEmail } from "./_core/clientEmail";
import { invokeLLM } from "./_core/llm";
import { getVSLPrompt, getAdsPrompt, getLandingPageCopyPrompt, applyLandingPageReplacements } from "./generationPrompts";
import { buildFunnelPrompt, FG_COLORS, ColorScheme } from "./funnelPrompts";
import { buildFunnelGenerationPrompt, parseFunnelResponse } from "./funnelGenerationPrompt";
import { buildSurveyCssPrompt, parseSurveyCssResponse } from "./surveyCssPrompt";
import { buildAssetRevisionPrompt, parseRevisionResponse } from "./assetRevisionPrompt";

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
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createClient(input);
        const clientId = result[0].insertId;
        
        // Create default tasks for the new client
        await db.createDefaultTasksForClient(clientId);
        
        // Send welcome email to client
        const protocol = ctx.req.headers['x-forwarded-proto'] || 'http';
        const host = ctx.req.headers.host || 'localhost:3000';
        const portalUrl = `${protocol}://${host}/client-login`;
        
        await sendClientWelcomeEmail({
          clientEmail: input.email,
          clientName: input.name,
          password: input.password,
          portalUrl,
        });
        
        // Notify owner about new submission
        await notifyOwner({
          title: "New Client Submission",
          content: `${input.name} from ${input.businessName} has submitted the intake form.`,
        });
        return { success: true, clientId };
      }),
    
    list: protectedProcedure.query(async () => {
      return await db.getAllClients();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),
    
    createManual: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        businessName: z.string(),
        password: z.string(),
        ghlEmail: z.string().optional(),
        ghlPassword: z.string().optional(),
        driveLink: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createClient(input);
        const clientId = result[0].insertId;
        
        // Create default tasks for the new client
        await db.createDefaultTasksForClient(clientId);
        
        // Send welcome email to client
        const protocol = ctx.req.headers['x-forwarded-proto'] || 'http';
        const host = ctx.req.headers.host || 'localhost:3000';
        const portalUrl = `${protocol}://${host}/client-login`;
        
        await sendClientWelcomeEmail({
          clientEmail: input.email,
          clientName: input.name,
          password: input.password,
          portalUrl,
        });
        
        return { success: true, clientId };
      }),
    
    resetPassword: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        newPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateClientPassword(input.clientId, input.newPassword);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteClient(input.clientId);
        return { success: true };
      }),
    
    createTasksForClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        await db.createDefaultTasksForClient(input.clientId);
        return { success: true };
      }),
    
    archive: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        await db.archiveClient(input.clientId);
        return { success: true };
      }),
    
    unarchive: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        await db.unarchiveClient(input.clientId);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        ghlApiToken: z.string().optional(),
        ghlLocationId: z.string().optional(),
        funnelAccentColor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateClient(input.id, {
          ghlApiToken: input.ghlApiToken,
          ghlLocationId: input.ghlLocationId,
          funnelAccentColor: input.funnelAccentColor,
        });
        return { success: true };
      }),

    getAdminNotes: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        const notes = await db.getAdminNotes(input.clientId);
        return { notes: notes || "" };
      }),

    updateAdminNotes: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateAdminNotes(input.clientId, input.notes);
        return { success: true };
      }),
  }),

  // Task management
  tasks: router({
    getByClientId: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByClientId(input.clientId);
      }),
    
    getProgress: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientProgress(input.clientId);
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        status: z.enum(["not_started", "in_progress", "done"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Get task and client info before updating
        const task = await db.getTaskById(input.taskId);
        
        if (task) {
          const client = await db.getClientById(task.clientId);
          const wasNotDone = task.status !== "done";
          const nowDone = input.status === "done";
          
          // Update the task
          await db.updateTaskStatus(input.taskId, input.status, input.notes);
          
          // Send email notification if task was just completed
          if (client && wasNotDone && nowDone) {
            await notifyOwner({
              title: "Task Completed",
              content: `Task "${task.taskName}" has been marked as complete for ${client.name} (${client.businessName}).`,
            });
          }
        } else {
          await db.updateTaskStatus(input.taskId, input.status, input.notes);
        }
        
        return { success: true };
      }),
    
    updateNotes: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTaskNotes(input.taskId, input.notes);
        return { success: true };
      }),
    
    createCustomTask: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        taskName: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createCustomTask(input.clientId, input.taskName);
        return { success: true };
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
      .input(z.object({ clientId: z.number(), uniqueMechanism: z.string() }))
      .mutation(async ({ input }) => {
        const client = await db.getClientById(input.clientId);
        if (!client) throw new Error("Client not found");

        const prompt = getVSLPrompt(client, input.uniqueMechanism);
        const response = await invokeLLM({
          model: "claude-opus-4-6",
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
          title: "VSL Script Generated",
          content: `VSL script generated for ${client.name} (${client.businessName})`,
        });

        return { success: true };
      }),

    generateAds: protectedProcedure
      .input(z.object({ clientId: z.number(), uniqueMechanism: z.string() }))
      .mutation(async ({ input }) => {
        const client = await db.getClientById(input.clientId);
        if (!client) throw new Error("Client not found");

        const prompt = getAdsPrompt(client, input.uniqueMechanism);
        const response = await invokeLLM({
          model: "claude-opus-4-6",
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
          title: "Ad Scripts Generated",
          content: `5 ad scripts generated for ${client.name} (${client.businessName})`,
        });

        return { success: true };
      }),
  }),

  // Funnel Builder
  funnels: router({
    reviseAllAssets: protectedProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get all existing assets for this client
        const assets = await db.getAssetsByClientId(input.clientId);
        
        // Find the latest version of each asset type
        const vslAsset = assets.filter(a => a.assetType === 'vsl').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        const adsAsset = assets.filter(a => a.assetType === 'ads').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        const landingAsset = assets.filter(a => a.assetType === 'landing_page_html').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        const thankyouAsset = assets.filter(a => a.assetType === 'thankyou_page_html').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        const surveyAsset = assets.filter(a => a.assetType === 'survey_css').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        // Build revision input
        const revisionInput = {
          vslScript: vslAsset?.content,
          adScripts: adsAsset?.content,
          landingPageHtml: landingAsset?.content,
          thankyouPageHtml: thankyouAsset?.content,
          surveyCss: surveyAsset?.content,
        };

        // Build the revision prompt
        const prompt = buildAssetRevisionPrompt(revisionInput);

            // Generate with LLM
        const response = await invokeLLM({
          model: "claude-opus-4-6",
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 16000,
        });

        const content = response.choices[0].message.content;
        const fullResponse = typeof content === 'string' ? content : '';

        // Parse the response
        const revisedAssets = parseRevisionResponse(fullResponse);

        // Save revised assets (originals remain in database)
        const savedAssets: string[] = [];
        
        if (revisedAssets.vslScript) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'vsl',
            content: revisedAssets.vslScript,
          });
          savedAssets.push('VSL Script');
        }

        if (revisedAssets.adScripts) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'ads',
            content: revisedAssets.adScripts,
          });
          savedAssets.push('Ad Scripts');
        }

        if (revisedAssets.landingPageHtml) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'landing_page_html',
            content: revisedAssets.landingPageHtml,
          });
          savedAssets.push('Landing Page');
        }

        if (revisedAssets.thankyouPageHtml) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'thankyou_page_html',
            content: revisedAssets.thankyouPageHtml,
          });
          savedAssets.push('Thank You Page');
        }

        if (revisedAssets.surveyCss) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'survey_css',
            content: revisedAssets.surveyCss,
          });
          savedAssets.push('Survey CSS');
        }

        return {
          success: true,
          revisedAssets: savedAssets,
        };
      }),

    generateSurveyCss: protectedProcedure
      .input(z.object({
        clientId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get client data to retrieve accent color
        const client = await db.getClientById(input.clientId);
        if (!client) {
          throw new Error('Client not found');
        }

        // Use the stored accent color, or default to purple if not set
        const accentColor = client.funnelAccentColor || '#8B5CF6';

        // Build the survey CSS prompt
        const prompt = buildSurveyCssPrompt(accentColor);

        // Generate with LLM
        const response = await invokeLLM({
          model: "claude-opus-4-6",
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
        });

        const content = response.choices[0].message.content;
        const fullResponse = typeof content === 'string' ? content : '';

        // Parse the response
        const surveyCss = parseSurveyCssResponse(fullResponse);

        // Save survey CSS to generatedAssets
        await db.createGeneratedAsset({
          clientId: input.clientId,
          assetType: 'survey_css',
          content: surveyCss,
        });

        return {
          surveyCss,
          accentColor,
        };
      }),

    generateForClient: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        mechanismName: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Get client data
        const client = await db.getClientById(input.clientId);
        if (!client) {
          throw new Error('Client not found');
        }

        // Build the comprehensive funnel generation prompt
        const prompt = buildFunnelGenerationPrompt({
          businessName: client.businessName,
          ownerName: client.name,
          industry: 'Business Funding', // Default - can be enhanced later
          monthlyRevenue: '$7K-$50K', // Default - can be enhanced later
          fundingChallenges: 'Getting denied for traditional funding',
          goals: 'Access capital for business growth',
          mechanismName: input.mechanismName,
        });

        // Generate with LLM
        const response = await invokeLLM({
          model: "claude-opus-4-6",
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 16000,
        });

        const content = response.choices[0].message.content;
        const fullResponse = typeof content === 'string' ? content : '';

        // Parse the response
        const { landingPageHtml, thankyouPageHtml, accentColor, metadata } = parseFunnelResponse(fullResponse);

        // Save landing page HTML to generatedAssets
        if (landingPageHtml) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'landing_page_html',
            content: landingPageHtml,
          });
        }

        // Save thank you page HTML to generatedAssets
        if (thankyouPageHtml) {
          await db.createGeneratedAsset({
            clientId: input.clientId,
            assetType: 'thankyou_page_html',
            content: thankyouPageHtml,
          });
        }

        // Update client's metadata fields from generation
        const updateFields: Record<string, string | null> = {};
        if (accentColor) updateFields.funnelAccentColor = accentColor;
        if (metadata.accentSecondary) updateFields.funnelSecondaryColor = metadata.accentSecondary;
        if (metadata.templateUsed) updateFields.templateUsed = metadata.templateUsed;
        if (metadata.backgroundTreatment) updateFields.backgroundTreatment = metadata.backgroundTreatment;
        
        if (Object.keys(updateFields).length > 0) {
          await db.updateClient(input.clientId, updateFields);
        }

        return {
          landingPageHtml,
          thankyouPageHtml,
          accentColor,
          metadata,
        };
      }),

    generate: protectedProcedure
      .input(z.object({
        mechanism: z.string(),
        colorScheme: z.enum(['emerald', 'blue', 'violet', 'amber', 'coral', 'cyan']),
        pageType: z.enum(['landing', 'thankyou', 'both']),
      }))
      .mutation(async ({ input }) => {
        const color = FG_COLORS[input.colorScheme];
        const prompt = buildFunnelPrompt(input.mechanism, color, input.pageType);

        const response = await invokeLLM({
          model: "claude-opus-4-6",
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 16000,
        });

        const content = response.choices[0].message.content;
        const fullResponse = typeof content === 'string' ? content : '';

        // Extract landing page
        let landingHtml = '';
        const landingMatch = fullResponse.match(/\[LANDING_START\]([\s\S]*?)\[LANDING_END\]/);
        if (landingMatch) {
          landingHtml = landingMatch[1].trim();
        } else if (input.pageType === 'landing' || input.pageType === 'both') {
          // If no markers, assume entire response is landing page
          landingHtml = fullResponse.trim();
        }

        // Extract thank you page
        let thankyouHtml = '';
        const thankyouMatch = fullResponse.match(/\[THANKYOU_START\]([\s\S]*?)\[THANKYOU_END\]/);
        if (thankyouMatch) {
          thankyouHtml = thankyouMatch[1].trim();
        } else if (input.pageType === 'thankyou') {
          thankyouHtml = fullResponse.trim();
        }

        return {
          landingHtml,
          thankyouHtml,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        mechanism: z.string(),
        colorScheme: z.string(),
        landingHtml: z.string().optional(),
        thankyouHtml: z.string().optional(),
        clientId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createFunnel(input);
        return { id };
      }),

    list: protectedProcedure.query(async () => {
      return await db.getAllFunnels();
    }),

    editWithAI: protectedProcedure
      .input(z.object({
        currentHtml: z.string(),
        instruction: z.string(),
        context: z.string().optional(), // mechanism, color scheme, etc.
      }))
      .mutation(async ({ input }) => {
        const prompt = `You are an expert funnel editor. You will receive HTML code for a landing page and an instruction to modify it.

Current HTML:
${input.currentHtml}

${input.context ? `Context: ${input.context}\n\n` : ''}User Instruction: ${input.instruction}

Please modify the HTML according to the instruction. Return ONLY the complete modified HTML, no explanations or markdown code blocks. Maintain all existing styling and structure unless specifically asked to change it.`;

        const response = await invokeLLM({
          model: "claude-opus-4-6",
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 16000,
        });

        const content = response.choices[0].message.content;
        const modifiedHtml = typeof content === 'string' ? content : '';

        return { modifiedHtml };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFunnelById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        landingHtml: z.string().optional(),
        thankyouHtml: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateFunnel(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFunnel(input.id);
        return { success: true };
      }),
  }),

  // Onboarding progress tracking
  onboarding: router({
    getProgress: publicProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOnboardingProgress(input.clientId);
      }),

    markComplete: publicProcedure
      .input(z.object({
        clientId: z.number(),
        stepKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.markOnboardingStepComplete(input.clientId, input.stepKey);
        return { success: true };
      }),

    markIncomplete: publicProcedure
      .input(z.object({
        clientId: z.number(),
        stepKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.markOnboardingStepIncomplete(input.clientId, input.stepKey);
        return { success: true };
      }),

    getStepDefinitions: publicProcedure
      .query(() => {
        return db.getOnboardingStepDefinitions();
      }),

    getAllProgress: protectedProcedure
      .query(async () => {
        return await db.getAllClientsOnboardingProgress();
      }),
  }),

  // Change requests - admin logs feature/change requests from any page
  changeRequests: router({
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        page: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createChangeRequest(input.description, input.page, input.priority);
        return { success: true };
      }),

    list: protectedProcedure
      .query(async () => {
        return await db.getAllChangeRequests();
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "done"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateChangeRequestStatus(input.id, input.status);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteChangeRequest(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
