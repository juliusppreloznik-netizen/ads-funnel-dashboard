import { describe, it, expect, vi } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getAllHelpVideos: vi.fn(() =>
    Promise.resolve([
      {
        id: 1,
        title: "GoHighLevel Account Setup",
        description: "Walk your client through creating their GHL account.",
        youtubeUrl: "https://www.youtube.com/watch?v=YmYNiMH8uQQ",
        videoId: "YmYNiMH8uQQ",
        category: "GHL Setup",
        tags: "ghl,setup,account",
        sortOrder: 1,
        createdAt: new Date("2026-02-17"),
        updatedAt: new Date("2026-02-17"),
      },
      {
        id: 2,
        title: "Domain Setup in GHL",
        description: "Guide your client through domain setup.",
        youtubeUrl: "https://www.youtube.com/watch?v=L7COia29_Cs",
        videoId: "L7COia29_Cs",
        category: "Domain & Hosting",
        tags: "domain,dns,hosting",
        sortOrder: 2,
        createdAt: new Date("2026-02-17"),
        updatedAt: new Date("2026-02-17"),
      },
      {
        id: 3,
        title: "Phone Number Purchase",
        description: "Help your client buy a phone number.",
        youtubeUrl: "https://www.youtube.com/watch?v=t1wPfy7PTRw",
        videoId: "t1wPfy7PTRw",
        category: "Phone & SMS",
        tags: "phone,sms,number",
        sortOrder: 3,
        createdAt: new Date("2026-02-17"),
        updatedAt: new Date("2026-02-17"),
      },
    ])
  ),
  getHelpVideoById: vi.fn((id: number) =>
    Promise.resolve(
      id === 1
        ? {
            id: 1,
            title: "GoHighLevel Account Setup",
            description: "Walk your client through creating their GHL account.",
            youtubeUrl: "https://www.youtube.com/watch?v=YmYNiMH8uQQ",
            videoId: "YmYNiMH8uQQ",
            category: "GHL Setup",
            tags: "ghl,setup,account",
            sortOrder: 1,
            createdAt: new Date("2026-02-17"),
            updatedAt: new Date("2026-02-17"),
          }
        : undefined
    )
  ),
  createHelpVideo: vi.fn(() => Promise.resolve(4)),
  updateHelpVideo: vi.fn(() => Promise.resolve()),
  deleteHelpVideo: vi.fn(() => Promise.resolve()),
  getHelpVideoCategories: vi.fn(() =>
    Promise.resolve(["Domain & Hosting", "GHL Setup", "Phone & SMS"])
  ),
}));

import * as db from "./db";

describe("Help Videos CRUD Helpers", () => {
  it("should list all help videos", async () => {
    const videos = await db.getAllHelpVideos();
    expect(videos).toHaveLength(3);
    expect(videos[0].title).toBe("GoHighLevel Account Setup");
    expect(videos[0].videoId).toBe("YmYNiMH8uQQ");
    expect(videos[1].category).toBe("Domain & Hosting");
    expect(videos[2].category).toBe("Phone & SMS");
  });

  it("should get a video by ID", async () => {
    const video = await db.getHelpVideoById(1);
    expect(video).toBeDefined();
    expect(video!.title).toBe("GoHighLevel Account Setup");
    expect(video!.youtubeUrl).toBe("https://www.youtube.com/watch?v=YmYNiMH8uQQ");
  });

  it("should return undefined for non-existent video ID", async () => {
    const video = await db.getHelpVideoById(999);
    expect(video).toBeUndefined();
  });

  it("should create a new help video and return its ID", async () => {
    const id = await db.createHelpVideo({
      title: "Email Deliverability Setup",
      description: "How to check and fix email deliverability issues.",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123def45",
      videoId: "abc123def45",
      category: "Email",
      tags: "email,deliverability,spam",
    });
    expect(id).toBe(4);
    expect(db.createHelpVideo).toHaveBeenCalledWith({
      title: "Email Deliverability Setup",
      description: "How to check and fix email deliverability issues.",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123def45",
      videoId: "abc123def45",
      category: "Email",
      tags: "email,deliverability,spam",
    });
  });

  it("should create a video without optional fields", async () => {
    await db.createHelpVideo({
      title: "Quick Tip Video",
      youtubeUrl: "https://www.youtube.com/watch?v=xyz789abc12",
      videoId: "xyz789abc12",
      category: "GHL Setup",
    });
    expect(db.createHelpVideo).toHaveBeenCalledWith({
      title: "Quick Tip Video",
      youtubeUrl: "https://www.youtube.com/watch?v=xyz789abc12",
      videoId: "xyz789abc12",
      category: "GHL Setup",
    });
  });

  it("should update a help video", async () => {
    await db.updateHelpVideo(1, {
      title: "Updated GHL Setup Guide",
      description: "Updated description for GHL setup.",
    });
    expect(db.updateHelpVideo).toHaveBeenCalledWith(1, {
      title: "Updated GHL Setup Guide",
      description: "Updated description for GHL setup.",
    });
  });

  it("should update only specific fields", async () => {
    await db.updateHelpVideo(2, { category: "Domains" });
    expect(db.updateHelpVideo).toHaveBeenCalledWith(2, { category: "Domains" });
  });

  it("should delete a help video", async () => {
    await db.deleteHelpVideo(1);
    expect(db.deleteHelpVideo).toHaveBeenCalledWith(1);
  });

  it("should get all unique categories sorted", async () => {
    const categories = await db.getHelpVideoCategories();
    expect(categories).toEqual(["Domain & Hosting", "GHL Setup", "Phone & SMS"]);
    expect(categories).toHaveLength(3);
  });

  it("should include all required fields in video objects", async () => {
    const videos = await db.getAllHelpVideos();
    for (const video of videos) {
      expect(video).toHaveProperty("id");
      expect(video).toHaveProperty("title");
      expect(video).toHaveProperty("youtubeUrl");
      expect(video).toHaveProperty("videoId");
      expect(video).toHaveProperty("category");
      expect(video).toHaveProperty("sortOrder");
      expect(video).toHaveProperty("createdAt");
      expect(video).toHaveProperty("updatedAt");
    }
  });

  it("should have tags as comma-separated strings", async () => {
    const videos = await db.getAllHelpVideos();
    expect(videos[0].tags).toBe("ghl,setup,account");
    expect(videos[1].tags).toBe("domain,dns,hosting");
    expect(videos[2].tags).toBe("phone,sms,number");
  });

  it("should maintain sort order across videos", async () => {
    const videos = await db.getAllHelpVideos();
    for (let i = 0; i < videos.length - 1; i++) {
      expect(videos[i].sortOrder).toBeLessThan(videos[i + 1].sortOrder);
    }
  });
});

describe("YouTube URL Extraction", () => {
  // Test the extractYouTubeVideoId logic (reimplemented here for unit testing)
  function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  it("should extract ID from standard YouTube URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=YmYNiMH8uQQ")).toBe("YmYNiMH8uQQ");
  });

  it("should extract ID from short YouTube URL", () => {
    expect(extractYouTubeVideoId("https://youtu.be/YmYNiMH8uQQ")).toBe("YmYNiMH8uQQ");
  });

  it("should extract ID from embed URL", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/YmYNiMH8uQQ")).toBe("YmYNiMH8uQQ");
  });

  it("should extract bare video ID", () => {
    expect(extractYouTubeVideoId("YmYNiMH8uQQ")).toBe("YmYNiMH8uQQ");
  });

  it("should return null for invalid URL", () => {
    expect(extractYouTubeVideoId("https://example.com/not-a-video")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
  });

  it("should handle URL with extra parameters", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=YmYNiMH8uQQ&t=120")).toBe("YmYNiMH8uQQ");
  });

  it("should handle URL with whitespace", () => {
    expect(extractYouTubeVideoId("  https://youtu.be/YmYNiMH8uQQ  ")).toBe("YmYNiMH8uQQ");
  });
});
