import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTimerSessionSchema, insertUserSettingsSchema, insertDailyStreakSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe only if the secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Timer session routes
  app.post('/api/timer/session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertTimerSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const session = await storage.createTimerSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating timer session:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.patch('/api/timer/session/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const session = await storage.updateTimerSession(id, updates);
      res.json(session);
    } catch (error) {
      console.error("Error updating timer session:", error);
      res.status(400).json({ message: "Failed to update session" });
    }
  });

  app.get('/api/timer/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const sessions = await storage.getUserTimerSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching timer sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/timer/sessions/range', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const sessions = await storage.getSessionsByDateRange(userId, startDate as string, endDate as string);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions by date range:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // User settings routes
  app.get('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = insertUserSettingsSchema.parse({
        ...req.body,
        userId,
      });
      
      const settings = await storage.upsertUserSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Daily streak routes
  app.get('/api/user/streaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      
      const streaks = await storage.getDailyStreaks(userId, limit);
      res.json(streaks);
    } catch (error) {
      console.error("Error fetching daily streaks:", error);
      res.status(500).json({ message: "Failed to fetch streaks" });
    }
  });

  app.get('/api/user/streak/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentStreak = await storage.getCurrentStreak(userId);
      res.json({ currentStreak });
    } catch (error) {
      console.error("Error fetching current streak:", error);
      res.status(500).json({ message: "Failed to fetch current streak" });
    }
  });

  app.post('/api/user/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streakData = insertDailyStreakSchema.parse({
        ...req.body,
        userId,
      });
      
      const streak = await storage.upsertDailyStreak(streakData);
      res.json(streak);
    } catch (error) {
      console.error("Error updating daily streak:", error);
      res.status(400).json({ message: "Invalid streak data" });
    }
  });

  // Motivational quotes
  app.get('/api/quotes/random', async (req, res) => {
    try {
      const quote = await storage.getRandomQuote();
      res.json(quote);
    } catch (error) {
      console.error("Error fetching random quote:", error);
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { period = '7d' } = req.query;
      
      let startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }
      
      const sessions = await storage.getSessionsByDateRange(
        userId,
        startDate.toISOString(),
        new Date().toISOString()
      );
      
      const summary = sessions.reduce((acc, session) => {
        if (session.isCompleted) {
          if (session.type === 'focus') {
            acc.totalFocusTime += session.completedDuration;
            acc.completedSessions++;
          } else {
            acc.totalBreakTime += session.completedDuration;
            acc.completedBreaks++;
          }
        }
        return acc;
      }, {
        totalFocusTime: 0,
        totalBreakTime: 0,
        completedSessions: 0,
        completedBreaks: 0,
      });
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Subscription service not configured. Please contact support." });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
          const invoice = subscription.latest_invoice as Stripe.Invoice;
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (invoice.payment_intent as Stripe.PaymentIntent)?.client_secret,
          });
        }
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        });
        customerId = customer.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234', // This needs to be set by user
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customerId, subscription.id);
  
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: (invoice?.payment_intent as Stripe.PaymentIntent)?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Premium feature access middleware
  const requirePremiumAccess = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const hasAccess = await storage.canAccessPremiumFeatures(userId);
      if (!hasAccess) {
        return res.status(403).json({ 
          message: "Premium feature access required. Free trial has expired.",
          code: "PREMIUM_REQUIRED"
        });
      }
      
      next();
    } catch (error) {
      console.error("Premium access check error:", error);
      res.status(500).json({ message: "Failed to verify premium access" });
    }
  };

  // Premium features status check
  app.get('/api/premium/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const hasAccess = await storage.canAccessPremiumFeatures(userId);
      
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      const trialDaysRemaining = Math.max(0, Math.ceil((oneWeekInMs - accountAge) / (24 * 60 * 60 * 1000)));
      
      res.json({
        isPremium: user.isPremium,
        hasAccess,
        trialDaysRemaining,
        accountAge: Math.floor(accountAge / (24 * 60 * 60 * 1000))
      });
    } catch (error) {
      console.error("Error checking premium status:", error);
      res.status(500).json({ message: "Failed to check premium status" });
    }
  });

  // Task management routes
  app.post('/api/tasks', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.createTask({ ...req.body, userId });
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const { id } = req.params;
      const task = await storage.updateTask(id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(400).json({ message: "Failed to delete task" });
    }
  });

  // Gamification routes
  app.get('/api/game/profile', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameData = await storage.getUserGameData(userId);
      const achievements = await storage.getAchievements();
      res.json({ gameData, achievements });
    } catch (error) {
      console.error("Error fetching game profile:", error);
      res.status(500).json({ message: "Failed to fetch game profile" });
    }
  });

  app.post('/api/game/xp', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { xp } = req.body;
      const gameData = await storage.updateUserXP(userId, xp);
      res.json(gameData);
    } catch (error) {
      console.error("Error updating XP:", error);
      res.status(400).json({ message: "Failed to update XP" });
    }
  });

  // AI Chat routes
  app.post('/api/ai/chat', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, context, sessionId } = req.body;
      
      // Save user message
      await storage.saveChatMessage({
        userId,
        sessionId,
        message,
        isUserMessage: true,
        context,
      });

      // Generate AI response (placeholder for now - will implement OpenAI when API key is provided)
      let aiResponse = "I understand you're having trouble staying focused. Here are some suggestions: Try the 25-minute Pomodoro technique, eliminate distractions by turning off notifications, and break large tasks into smaller ones.";
      
      if (context === 'pause') {
        aiResponse = "Taking breaks is normal! Remember why you started this session. Try taking 3 deep breaths and getting back to your task. You've got this! 💪";
      } else if (context === 'fail') {
        aiResponse = "Don't worry about incomplete sessions - they're part of the learning process. Consider trying shorter 15-minute sessions next time, or identifying what distracted you.";
      }

      // Save AI response
      const chatMessage = await storage.saveChatMessage({
        userId,
        sessionId,
        message,
        isUserMessage: false,
        aiResponse,
        context,
      });

      res.json({ response: aiResponse, chatMessage });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/ai/history', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getChatHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Screen usage tracking routes
  app.post('/api/screen-usage', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const log = await storage.saveScreenUsageLog({ ...req.body, userId });
      res.json(log);
    } catch (error) {
      console.error("Error saving screen usage:", error);
      res.status(400).json({ message: "Failed to save screen usage data" });
    }
  });

  app.get('/api/screen-usage/stats', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId } = req.query;
      const stats = await storage.getScreenUsageStats(userId, sessionId as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching screen usage stats:", error);
      res.status(500).json({ message: "Failed to fetch screen usage stats" });
    }
  });

  // Community challenges routes
  app.get('/api/challenges', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get('/api/challenges/progress', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserChallengeProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching challenge progress:", error);
      res.status(500).json({ message: "Failed to fetch challenge progress" });
    }
  });

  app.post('/api/challenges/:id/join', isAuthenticated, requirePremiumAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: challengeId } = req.params;
      const progress = await storage.updateChallengeProgress(userId, challengeId, 0);
      res.json(progress);
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(400).json({ message: "Failed to join challenge" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
