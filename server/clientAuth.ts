import { Router } from "express";
import * as db from "./db";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const COOKIE_NAME = "client_session";

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const client = await db.verifyClientPassword(email, password);

    if (!client) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, client: { name: client.name, email: client.email, businessName: client.businessName } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current client info
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { clientId: number };
    const client = await db.getClientById(decoded.clientId);

    if (!client) {
      return res.status(401).json({ error: "Client not found" });
    }

    const progress = await db.getClientProgress(decoded.clientId);
    const onboardingProgress = await db.getOnboardingProgress(decoded.clientId);
    const completedOnboarding = onboardingProgress.filter((s: any) => s.completed).length;

    res.json({
      client: {
        id: decoded.clientId,
        name: client.name,
        email: client.email,
        businessName: client.businessName,
      },
      tasks: progress.tasks,
      progress: {
        completedTasks: progress.completedTasks,
        totalTasks: progress.totalTasks,
        percentage: progress.percentage,
      },
      onboarding: {
        completedSteps: completedOnboarding,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid session" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

export default router;
