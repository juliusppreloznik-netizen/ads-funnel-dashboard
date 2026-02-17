import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table - stores client intake form submissions
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  businessName: text("businessName").notNull(),
  ghlEmail: varchar("ghlEmail", { length: 320 }),
  ghlPassword: text("ghlPassword"),
  driveLink: text("driveLink"),
  password: varchar("password", { length: 255 }), // Hashed password for client portal login
  archived: int("archived").default(0).notNull(), // 0 = active, 1 = archived
  ghlApiToken: text("ghlApiToken"), // Admin-only: GoHighLevel API token
  ghlLocationId: varchar("ghlLocationId", { length: 255 }), // Admin-only: GHL location ID
  funnelAccentColor: varchar("funnelAccentColor", { length: 50 }), // Admin-only: Auto-stored after funnel generation
  funnelSecondaryColor: varchar("funnelSecondaryColor", { length: 50 }), // Admin-only: Secondary accent color from generation
  templateUsed: varchar("templateUsed", { length: 10 }), // Admin-only: Template A/B/C used in last generation
  backgroundTreatment: varchar("backgroundTreatment", { length: 50 }), // Admin-only: Background treatment used in last generation
  adminNotes: text("adminNotes"), // Internal notepad for admin notes about this client
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Generated Assets table - stores VSL scripts, ads, and landing pages
 */
export const generatedAssets = mysqlTable("generatedAssets", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  assetType: mysqlEnum("assetType", ["vsl", "ads", "landing_page", "landing_page_html", "thankyou_page_html", "survey_css"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedAsset = typeof generatedAssets.$inferSelect;
export type InsertGeneratedAsset = typeof generatedAssets.$inferInsert;

/**
 * Client Tasks table - tracks progress of marketing/systems setup work
 */
export const clientTasks = mysqlTable("clientTasks", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  taskName: varchar("taskName", { length: 255 }).notNull(),
  taskOrder: int("taskOrder").notNull(), // For display ordering
  status: mysqlEnum("status", ["not_started", "in_progress", "done"]).default("not_started").notNull(),
  internalNotes: text("internalNotes"), // Admin-only notes
  completedAt: timestamp("completedAt"), // When task was marked as done
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientTask = typeof clientTasks.$inferSelect;
export type InsertClientTask = typeof clientTasks.$inferInsert;

/**
 * Funnels table - stores funnel builder projects
 */
export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"), // Optional - can be null for unassigned funnels
  name: varchar("name", { length: 255 }).notNull(),
  mechanism: text("mechanism"), // Unique mechanism name used in generation
  color: varchar("color", { length: 50 }), // Color scheme name (red, blue, green, etc.)
  landingHtml: text("landingHtml"), // Generated landing page HTML
  thankyouHtml: text("thankyouHtml"), // Generated thank you page HTML
  editorData: text("editorData"), // GrapesJS editor state (JSON)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = typeof funnels.$inferInsert;

/**
 * Onboarding Progress table - tracks which onboarding steps each client has completed
 */
export const onboardingProgress = mysqlTable("onboardingProgress", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  stepKey: varchar("stepKey", { length: 100 }).notNull(), // e.g. 'ghl_setup', 'agency_admin', 'domain', 'phone', 'facebook'
  completed: int("completed").default(0).notNull(), // 0 = not done, 1 = done
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

/**
 * Change Requests table - admin logs change/feature requests from any page
 */
export const changeRequests = mysqlTable("changeRequests", {
  id: int("id").autoincrement().primaryKey(),
  description: text("description").notNull(),
  page: varchar("page", { length: 255 }), // Which page the request was submitted from
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "done"]).default("pending").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChangeRequest = typeof changeRequests.$inferSelect;
export type InsertChangeRequest = typeof changeRequests.$inferInsert;
