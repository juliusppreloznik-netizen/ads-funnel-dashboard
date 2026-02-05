import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, generatedAssets, clientTasks, funnels, InsertClient, InsertGeneratedAsset, InsertClientTask, Funnel, InsertFunnel } from "../drizzle/schema";
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
