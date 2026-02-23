import { eq, desc, and, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, generatedAssets, clientTasks, funnels, onboardingProgress, changeRequests, helpVideos, InsertClient, InsertGeneratedAsset, InsertClientTask, Funnel, InsertFunnel, InsertHelpVideo, HelpVideo } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as bcrypt from 'bcryptjs';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Client management functions
export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hash password if provided
  if (client.password) {
    client.password = await bcrypt.hash(client.password, 10);
  }
  
  const result = await db.insert(clients).values(client);
  return result;
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
  
  // Add progress data for each client
  const clientsWithProgress = await Promise.all(
    allClients.map(async (client) => {
      const tasks = await db.select().from(clientTasks).where(eq(clientTasks.clientId, client.id));
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const totalTasks = tasks.length;
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...client,
        progress: {
          completedTasks,
          totalTasks,
          percentage,
        },
      };
    })
  );
  
  return clientsWithProgress;
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClientByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(clients).where(eq(clients.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateClientPassword(clientId: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.update(clients)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(clients.id, clientId));
}

export async function verifyClientPassword(email: string, password: string): Promise<any | null> {
  const client = await getClientByEmail(email);
  if (!client || !client.password) return null;
  
  const isValid = await bcrypt.compare(password, client.password);
  return isValid ? client : null;
}

export async function deleteClient(clientId: number) {
  const db = await getDb();  
  if (!db) throw new Error("Database not available");
  
  // Delete associated tasks first (foreign key constraint)
  await db.delete(clientTasks).where(eq(clientTasks.clientId, clientId));
  
  // Delete associated assets
  await db.delete(generatedAssets).where(eq(generatedAssets.clientId, clientId));
  
  // Delete the client
  await db.delete(clients).where(eq(clients.id, clientId));
}

export async function archiveClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients)
    .set({ archived: 1, updatedAt: new Date() })
    .where(eq(clients.id, clientId));
}

export async function unarchiveClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients)
    .set({ archived: 0, updatedAt: new Date() })
    .where(eq(clients.id, clientId));
}

export async function updateClient(clientId: number, updates: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(clients.id, clientId));
}

// Generated assets management functions
export async function createGeneratedAsset(asset: InsertGeneratedAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generatedAssets).values(asset);
  return result;
}

export async function getAssetsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(generatedAssets)
    .where(eq(generatedAssets.clientId, clientId))
    .orderBy(desc(generatedAssets.createdAt));
}

export async function getAssetById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(generatedAssets).where(eq(generatedAssets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAssetContent(id: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(generatedAssets)
    .set({ content, updatedAt: new Date() })
    .where(eq(generatedAssets.id, id));
}

export async function clearAllGeneratedAssets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.delete(generatedAssets);
  return result[0]?.affectedRows || 0;
}

// Client Tasks management functions
const DEFAULT_TASKS = [
  { name: "Assets imported into GHL", order: 1 },
  { name: "Funnel built", order: 2 },
  { name: "Automations built", order: 3 },
  { name: "VSL and ads scripted", order: 4 },
  { name: "Survey routing set up", order: 5 },
  { name: "Facebook CAPI and pixel set up", order: 6 },
  { name: "Pre Launch Check", order: 7 },
  { name: "Ads Launched", order: 8 },
  { name: "A2P", order: 9 },
  { name: "Domain Set Up", order: 10 },
];

export async function createDefaultTasksForClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const tasks = DEFAULT_TASKS.map(task => ({
    clientId,
    taskName: task.name,
    taskOrder: task.order,
    status: "not_started" as const,
  }));
  
  await db.insert(clientTasks).values(tasks);
}

export async function getTasksByClientId(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(clientTasks)
    .where(eq(clientTasks.clientId, clientId))
    .orderBy(clientTasks.taskOrder);
}

export async function getTaskById(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(clientTasks).where(eq(clientTasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTaskStatus(taskId: number, status: "not_started" | "in_progress" | "done", notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };
  
  if (status === "done") {
    updateData.completedAt = new Date();
  } else {
    updateData.completedAt = null;
  }
  
  if (notes !== undefined) {
    updateData.internalNotes = notes;
  }
  
  await db.update(clientTasks)
    .set(updateData)
    .where(eq(clientTasks.id, taskId));
}

export async function updateTaskNotes(taskId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clientTasks)
    .set({ internalNotes: notes, updatedAt: new Date() })
    .where(eq(clientTasks.id, taskId));
}

export async function createCustomTask(clientId: number, taskName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the max task order for this client
  const tasks = await getTasksByClientId(clientId);
  const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.taskOrder)) : 0;
  
  await db.insert(clientTasks).values({
    clientId,
    taskName,
    taskOrder: maxOrder + 1,
    status: "not_started" as const,
  });
}

export async function getClientProgress(clientId: number) {
  const tasks = await getTasksByClientId(clientId);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    totalTasks,
    completedTasks,
    percentage,
    tasks,
  };
}

// ============================================================================
// FUNNEL HELPERS
// ============================================================================

export async function createFunnel(funnel: InsertFunnel): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(funnels).values(funnel);
  return result[0].insertId;
}

export async function getFunnelById(id: number): Promise<Funnel | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(funnels).where(eq(funnels.id, id));
  return result[0];
}

export async function getAllFunnels(): Promise<Funnel[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(funnels).orderBy(desc(funnels.updatedAt));
}

export async function getFunnelsByClientId(clientId: number): Promise<Funnel[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(funnels).where(eq(funnels.clientId, clientId)).orderBy(desc(funnels.updatedAt));
}

export async function updateFunnel(id: number, updates: Partial<InsertFunnel>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(funnels).set(updates).where(eq(funnels.id, id));
}

export async function deleteFunnel(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(funnels).where(eq(funnels.id, id));
}

// Admin notepad functions
export async function updateAdminNotes(clientId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients)
    .set({ adminNotes: notes, updatedAt: new Date() })
    .where(eq(clients.id, clientId));
}

export async function getAdminNotes(clientId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({ adminNotes: clients.adminNotes })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);
  
  return result.length > 0 ? result[0].adminNotes : null;
}

// ============================================================================
// ONBOARDING PROGRESS HELPERS
// ============================================================================

const ONBOARDING_STEPS = [
  { key: 'ghl_setup', label: 'GoHighLevel Account Setup', order: 1 },
  { key: 'agency_admin', label: 'Add Agency Admin Access', order: 2 },
  { key: 'domain_setup', label: 'Domain Setup in GHL', order: 3 },
  { key: 'phone_number', label: 'Phone Number Purchase', order: 4 },
  { key: 'facebook_admin', label: 'Facebook Business Admin Access', order: 5 },
];

export function getOnboardingStepDefinitions() {
  return ONBOARDING_STEPS;
}

export async function getAllClientsOnboardingProgress() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allProgress = await db.select().from(onboardingProgress);
  const totalSteps = ONBOARDING_STEPS.length;
  
  // Group by clientId
  const progressMap: Record<number, { completed: number; total: number }> = {};
  
  // Build a set of completed steps per client
  const clientSteps: Record<number, Set<string>> = {};
  for (const row of allProgress) {
    if (!clientSteps[row.clientId]) {
      clientSteps[row.clientId] = new Set();
    }
    if (row.completed === 1) {
      clientSteps[row.clientId].add(row.stepKey);
    }
  }
  
  for (const [clientIdStr, steps] of Object.entries(clientSteps)) {
    const clientId = parseInt(clientIdStr);
    progressMap[clientId] = {
      completed: steps.size,
      total: totalSteps,
    };
  }
  
  return progressMap;
}

export async function getOnboardingProgress(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const progress = await db.select().from(onboardingProgress)
    .where(eq(onboardingProgress.clientId, clientId));
  
  // Map step definitions with completion status
  return ONBOARDING_STEPS.map(step => {
    const record = progress.find(p => p.stepKey === step.key);
    return {
      stepKey: step.key,
      label: step.label,
      order: step.order,
      completed: record ? record.completed === 1 : false,
      completedAt: record?.completedAt || null,
    };
  });
}

export async function markOnboardingStepComplete(clientId: number, stepKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if record exists
  const existing = await db.select().from(onboardingProgress)
    .where(and(
      eq(onboardingProgress.clientId, clientId),
      eq(onboardingProgress.stepKey, stepKey)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(onboardingProgress)
      .set({ completed: 1, completedAt: new Date(), updatedAt: new Date() })
      .where(eq(onboardingProgress.id, existing[0].id));
  } else {
    await db.insert(onboardingProgress).values({
      clientId,
      stepKey,
      completed: 1,
      completedAt: new Date(),
    });
  }
}

// ============================================================================
// CHANGE REQUEST HELPERS
// ============================================================================

export async function createChangeRequest(description: string, page?: string, priority?: "low" | "medium" | "high") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(changeRequests).values({
    description,
    page: page || null,
    priority: priority || "medium",
  });
}

export async function getAllChangeRequests() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(changeRequests).orderBy(desc(changeRequests.createdAt));
}

export async function updateChangeRequestStatus(id: number, status: "pending" | "in_progress" | "done") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status, updatedAt: new Date() };
  if (status === "done") {
    updateData.resolvedAt = new Date();
  }
  
  await db.update(changeRequests)
    .set(updateData)
    .where(eq(changeRequests.id, id));
}

export async function deleteChangeRequest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(changeRequests).where(eq(changeRequests.id, id));
}

export async function markOnboardingStepIncomplete(clientId: number, stepKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(onboardingProgress)
    .where(and(
      eq(onboardingProgress.clientId, clientId),
      eq(onboardingProgress.stepKey, stepKey)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(onboardingProgress)
      .set({ completed: 0, completedAt: null, updatedAt: new Date() })
      .where(eq(onboardingProgress.id, existing[0].id));
  }
}

// ============================================================================
// HELP VIDEOS HELPERS
// ============================================================================

export async function getAllHelpVideos(): Promise<HelpVideo[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(helpVideos).orderBy(asc(helpVideos.sortOrder), asc(helpVideos.id));
}

export async function getHelpVideoById(id: number): Promise<HelpVideo | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(helpVideos).where(eq(helpVideos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHelpVideo(video: { title: string; description?: string; youtubeUrl: string; videoId: string; category: string; tags?: string; }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the max sort order
  const existing = await db.select().from(helpVideos).orderBy(desc(helpVideos.sortOrder));
  const maxOrder = existing.length > 0 ? existing[0].sortOrder : 0;
  
  const result = await db.insert(helpVideos).values({
    title: video.title,
    description: video.description || null,
    youtubeUrl: video.youtubeUrl,
    videoId: video.videoId,
    category: video.category,
    tags: video.tags || null,
    sortOrder: maxOrder + 1,
  });
  
  return result[0].insertId;
}

export async function updateHelpVideo(id: number, updates: { title?: string; description?: string; youtubeUrl?: string; videoId?: string; category?: string; tags?: string; }): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.youtubeUrl !== undefined) updateData.youtubeUrl = updates.youtubeUrl;
  if (updates.videoId !== undefined) updateData.videoId = updates.videoId;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  
  await db.update(helpVideos).set(updateData).where(eq(helpVideos.id, id));
}

export async function deleteHelpVideo(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(helpVideos).where(eq(helpVideos.id, id));
}

export async function getHelpVideoCategories(): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const videos = await db.select({ category: helpVideos.category }).from(helpVideos);
  const categories = Array.from(new Set(videos.map(v => v.category)));
  return categories.sort();
}
