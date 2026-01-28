import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@example.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Client Intake Flow", () => {
  it("should allow public submission of client intake form", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.create({
      name: "Test Client",
      email: "test@example.com",
      businessName: "Test Business LLC",
      ghlEmail: "ghl@example.com",
      ghlPassword: "password123",
      driveLink: "https://drive.google.com/test",
    });

    expect(result).toEqual({ success: true });
  });

  it("should require authentication to list clients", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    await expect(publicCaller.clients.list()).rejects.toThrow();
  });

  it("should allow authenticated users to list clients", async () => {
    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    const clients = await authCaller.clients.list();
    expect(Array.isArray(clients)).toBe(true);
  });
});

describe("Asset Generation", () => {
  let testClientId: number;

  beforeAll(async () => {
    // Create a test client
    const result = await db.createClient({
      name: "Generation Test Client",
      email: "gentest@example.com",
      businessName: "Gen Test Business",
    });
    testClientId = result[0]?.insertId || 1;
  });

  it("should require authentication for VSL generation", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    await expect(
      publicCaller.generation.generateVSL({ clientId: testClientId })
    ).rejects.toThrow();
  });

  it("should require authentication for ads generation", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    await expect(
      publicCaller.generation.generateAds({ clientId: testClientId })
    ).rejects.toThrow();
  });

  it("should require authentication for landing page generation", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    await expect(
      publicCaller.generation.generateLandingPage({ clientId: testClientId })
    ).rejects.toThrow();
  });
});

describe("Asset Management", () => {
  it("should require authentication to view assets", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    await expect(
      publicCaller.assets.getByClientId({ clientId: 1 })
    ).rejects.toThrow();
  });

  it("should require authentication to update assets", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    await expect(
      publicCaller.assets.update({ id: 1, content: "updated content" })
    ).rejects.toThrow();
  });

  it("should allow authenticated users to view assets", async () => {
    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    const assets = await authCaller.assets.getByClientId({ clientId: 1 });
    expect(Array.isArray(assets)).toBe(true);
  });
});
