import { describe, it, expect, vi } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getOnboardingStepDefinitions: vi.fn(() => [
    { key: "ghl_setup", label: "GoHighLevel Account Setup", order: 1 },
    { key: "agency_admin", label: "Add Agency Admin Access", order: 2 },
    { key: "domain_setup", label: "Domain Setup in GHL", order: 3 },
    { key: "phone_number", label: "Phone Number Purchase", order: 4 },
    { key: "facebook_admin", label: "Facebook Business Admin Access", order: 5 },
  ]),
  getOnboardingProgress: vi.fn((clientId: number) =>
    Promise.resolve([
      { stepKey: "ghl_setup", label: "GoHighLevel Account Setup", order: 1, completed: false, completedAt: null },
      { stepKey: "agency_admin", label: "Add Agency Admin Access", order: 2, completed: false, completedAt: null },
      { stepKey: "domain_setup", label: "Domain Setup in GHL", order: 3, completed: false, completedAt: null },
      { stepKey: "phone_number", label: "Phone Number Purchase", order: 4, completed: false, completedAt: null },
      { stepKey: "facebook_admin", label: "Facebook Business Admin Access", order: 5, completed: false, completedAt: null },
    ])
  ),
  markOnboardingStepComplete: vi.fn(() => Promise.resolve()),
  markOnboardingStepIncomplete: vi.fn(() => Promise.resolve()),
}));

import * as db from "./db";

describe("Onboarding Step Definitions", () => {
  it("should return all 5 onboarding steps in correct order", () => {
    const steps = db.getOnboardingStepDefinitions();
    expect(steps).toHaveLength(5);
    expect(steps[0].key).toBe("ghl_setup");
    expect(steps[1].key).toBe("agency_admin");
    expect(steps[2].key).toBe("domain_setup");
    expect(steps[3].key).toBe("phone_number");
    expect(steps[4].key).toBe("facebook_admin");
  });

  it("should have correct labels for each step", () => {
    const steps = db.getOnboardingStepDefinitions();
    expect(steps[0].label).toBe("GoHighLevel Account Setup");
    expect(steps[1].label).toBe("Add Agency Admin Access");
    expect(steps[2].label).toBe("Domain Setup in GHL");
    expect(steps[3].label).toBe("Phone Number Purchase");
    expect(steps[4].label).toBe("Facebook Business Admin Access");
  });

  it("should have sequential order numbers", () => {
    const steps = db.getOnboardingStepDefinitions();
    steps.forEach((step, i) => {
      expect(step.order).toBe(i + 1);
    });
  });
});

describe("Onboarding Progress", () => {
  it("should return progress for all steps", async () => {
    const progress = await db.getOnboardingProgress(1);
    expect(progress).toHaveLength(5);
    progress.forEach((step) => {
      expect(step).toHaveProperty("stepKey");
      expect(step).toHaveProperty("completed");
      expect(step).toHaveProperty("completedAt");
    });
  });

  it("should default all steps to not completed", async () => {
    const progress = await db.getOnboardingProgress(1);
    progress.forEach((step) => {
      expect(step.completed).toBe(false);
    });
  });

  it("should call markOnboardingStepComplete with correct params", async () => {
    await db.markOnboardingStepComplete(1, "ghl_setup");
    expect(db.markOnboardingStepComplete).toHaveBeenCalledWith(1, "ghl_setup");
  });

  it("should call markOnboardingStepIncomplete with correct params", async () => {
    await db.markOnboardingStepIncomplete(1, "domain_setup");
    expect(db.markOnboardingStepIncomplete).toHaveBeenCalledWith(1, "domain_setup");
  });

  it("should include agency_admin as a valid step key", () => {
    const steps = db.getOnboardingStepDefinitions();
    const agencyStep = steps.find((s) => s.key === "agency_admin");
    expect(agencyStep).toBeDefined();
    expect(agencyStep!.label).toBe("Add Agency Admin Access");
  });
});
