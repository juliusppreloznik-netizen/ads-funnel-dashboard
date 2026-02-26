import { describe, it, expect, vi } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  createChangeRequest: vi.fn(() => Promise.resolve()),
  getAllChangeRequests: vi.fn(() =>
    Promise.resolve([
      {
        id: 1,
        description: "Fix the header alignment",
        page: "/admin",
        priority: "high",
        status: "pending",
        resolvedAt: null,
        createdAt: new Date("2026-02-16"),
        updatedAt: new Date("2026-02-16"),
      },
      {
        id: 2,
        description: "Add export button to client list",
        page: "/admin/clients",
        priority: "medium",
        status: "done",
        resolvedAt: new Date("2026-02-16"),
        createdAt: new Date("2026-02-15"),
        updatedAt: new Date("2026-02-16"),
      },
    ])
  ),
  updateChangeRequestStatus: vi.fn(() => Promise.resolve()),
  deleteChangeRequest: vi.fn(() => Promise.resolve()),
}));

import * as db from "./db";

describe("Change Request Helpers", () => {
  it("should create a change request with all fields", async () => {
    await db.createChangeRequest("Fix the header", "/admin", "high");
    expect(db.createChangeRequest).toHaveBeenCalledWith("Fix the header", "/admin", "high");
  });

  it("should create a change request with default priority", async () => {
    await db.createChangeRequest("Add dark mode");
    expect(db.createChangeRequest).toHaveBeenCalledWith("Add dark mode");
  });

  it("should list all change requests", async () => {
    const requests = await db.getAllChangeRequests();
    expect(requests).toHaveLength(2);
    expect(requests[0].description).toBe("Fix the header alignment");
    expect(requests[0].priority).toBe("high");
    expect(requests[0].status).toBe("pending");
    expect(requests[1].status).toBe("done");
  });

  it("should update change request status", async () => {
    await db.updateChangeRequestStatus(1, "done");
    expect(db.updateChangeRequestStatus).toHaveBeenCalledWith(1, "done");
  });

  it("should update status to in_progress", async () => {
    await db.updateChangeRequestStatus(1, "in_progress");
    expect(db.updateChangeRequestStatus).toHaveBeenCalledWith(1, "in_progress");
  });

  it("should delete a change request", async () => {
    await db.deleteChangeRequest(1);
    expect(db.deleteChangeRequest).toHaveBeenCalledWith(1);
  });

  it("should include page info in requests", async () => {
    const requests = await db.getAllChangeRequests();
    expect(requests[0].page).toBe("/admin");
    expect(requests[1].page).toBe("/admin/clients");
  });

  it("should track resolvedAt timestamp for done requests", async () => {
    const requests = await db.getAllChangeRequests();
    expect(requests[0].resolvedAt).toBeNull(); // pending
    expect(requests[1].resolvedAt).toBeInstanceOf(Date); // done
  });
});
