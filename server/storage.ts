import {
  users,
  timerSessions,
  userSettings,
  dailyStreaks,
  motivationalQuotes,
  tasks,
  userGameData,
  achievements,
  communityChallenge,
  userChallengeProgress,
  aiChatHistory,
  screenUsageLogs,
  type User,
  type UpsertUser,
  type TimerSession,
  type InsertTimerSession,
  type UserSettings,
  type InsertUserSettings,
  type DailyStreak,
  type InsertDailyStreak,
  type MotivationalQuote,
  insertTaskSchema,
  insertUserGameDataSchema,
  insertAiChatHistorySchema,
  insertScreenUsageLogSchema,
  insertUserChallengeProgressSchema,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;
  
  // Timer session operations
  createTimerSession(session: InsertTimerSession): Promise<TimerSession>;
  updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession>;
  getUserTimerSessions(userId: string, limit?: number): Promise<TimerSession[]>;
  getSessionsByDateRange(userId: string, startDate: string, endDate: string): Promise<TimerSession[]>;
  
  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  
  // Daily streak operations
  getDailyStreaks(userId: string, limit?: number): Promise<DailyStreak[]>;
  upsertDailyStreak(streak: InsertDailyStreak): Promise<DailyStreak>;
  getCurrentStreak(userId: string): Promise<number>;
  
  // Motivational quotes
  getRandomQuote(): Promise<MotivationalQuote | undefined>;
  
  // Premium feature access check
  canAccessPremiumFeatures(userId: string): Promise<boolean>;
  
  // Tasks operations
  createTask(task: any): Promise<any>;
  getUserTasks(userId: string): Promise<any[]>;
  updateTask(id: string, updates: any): Promise<any>;
  deleteTask(id: string): Promise<void>;
  
  // Gamification operations
  getUserGameData(userId: string): Promise<any>;
  upsertUserGameData(data: any): Promise<any>;
  getAchievements(): Promise<any[]>;
  updateUserXP(userId: string, xpToAdd: number): Promise<any>;
  
  // AI Chat operations
  saveChatMessage(message: any): Promise<any>;
  getChatHistory(userId: string, limit?: number): Promise<any[]>;
  
  // Screen usage tracking
  saveScreenUsageLog(log: any): Promise<any>;
  getScreenUsageStats(userId: string, sessionId?: string): Promise<any>;
  
  // Community challenges
  getActiveChallenges(): Promise<any[]>;
  getUserChallengeProgress(userId: string): Promise<any[]>;
  updateChallengeProgress(userId: string, challengeId: string, sessions: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        isPremium: !!subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createTimerSession(session: InsertTimerSession): Promise<TimerSession> {
    const [newSession] = await db
      .insert(timerSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession> {
    const [updatedSession] = await db
      .update(timerSessions)
      .set(updates)
      .where(eq(timerSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getUserTimerSessions(userId: string, limit = 10): Promise<TimerSession[]> {
    return await db
      .select()
      .from(timerSessions)
      .where(eq(timerSessions.userId, userId))
      .orderBy(desc(timerSessions.startedAt))
      .limit(limit);
  }

  async getSessionsByDateRange(userId: string, startDate: string, endDate: string): Promise<TimerSession[]> {
    return await db
      .select()
      .from(timerSessions)
      .where(
        and(
          eq(timerSessions.userId, userId),
          gte(timerSessions.startedAt, new Date(startDate)),
          lte(timerSessions.startedAt, new Date(endDate))
        )
      )
      .orderBy(desc(timerSessions.startedAt));
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [upsertedSettings] = await db
      .insert(userSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upsertedSettings;
  }

  async getDailyStreaks(userId: string, limit = 30): Promise<DailyStreak[]> {
    return await db
      .select()
      .from(dailyStreaks)
      .where(eq(dailyStreaks.userId, userId))
      .orderBy(desc(dailyStreaks.date))
      .limit(limit);
  }

  async upsertDailyStreak(streak: InsertDailyStreak): Promise<DailyStreak> {
    const [upsertedStreak] = await db
      .insert(dailyStreaks)
      .values(streak)
      .onConflictDoUpdate({
        target: [dailyStreaks.userId, dailyStreaks.date],
        set: {
          sessionsCompleted: streak.sessionsCompleted,
          focusTimeMinutes: streak.focusTimeMinutes,
          goalMet: streak.goalMet,
        },
      })
      .returning();
    return upsertedStreak;
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const streaks = await db
      .select()
      .from(dailyStreaks)
      .where(and(
        eq(dailyStreaks.userId, userId),
        eq(dailyStreaks.goalMet, true)
      ))
      .orderBy(desc(dailyStreaks.date));

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < streaks.length; i++) {
      const streakDate = new Date(streaks[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (streaks[i].date === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }

  async getRandomQuote(): Promise<MotivationalQuote | undefined> {
    const [quote] = await db
      .select()
      .from(motivationalQuotes)
      .where(eq(motivationalQuotes.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return quote;
  }

  // Premium feature access check - free for one week from account creation
  async canAccessPremiumFeatures(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Check if user has premium subscription
    if (user.isPremium) return true;
    
    // Check if user is within free trial period (7 days from account creation)
    const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
    const accountAge = Date.now() - createdAt.getTime();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    return accountAge <= oneWeekInMs;
  }

  // Tasks operations
  async createTask(task: any): Promise<any> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getUserTasks(userId: string): Promise<any[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: string, updates: any): Promise<any> {
    const [updatedTask] = await db.update(tasks).set({ ...updates, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Gamification operations
  async getUserGameData(userId: string): Promise<any> {
    const [gameData] = await db.select().from(userGameData).where(eq(userGameData.userId, userId));
    if (!gameData) {
      // Create initial game data for new user
      const [newGameData] = await db.insert(userGameData).values({ userId }).returning();
      return newGameData;
    }
    return gameData;
  }

  async upsertUserGameData(data: any): Promise<any> {
    const [gameData] = await db.insert(userGameData).values(data).onConflictDoUpdate({
      target: userGameData.userId,
      set: { ...data, updatedAt: new Date() }
    }).returning();
    return gameData;
  }

  async getAchievements(): Promise<any[]> {
    return await db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(achievements.category);
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<any> {
    const gameData = await this.getUserGameData(userId);
    const newTotalXp = gameData.totalXp + xpToAdd;
    
    // Calculate level progression (every 100 XP = level up)
    const newLevel = Math.floor(newTotalXp / 100) + 1;
    const xpToNextLevel = ((newLevel) * 100) - newTotalXp;
    
    return await this.upsertUserGameData({
      userId,
      totalXp: newTotalXp,
      currentLevel: newLevel,
      xpToNextLevel,
      completedAchievements: gameData.completedAchievements
    });
  }

  // AI Chat operations
  async saveChatMessage(message: any): Promise<any> {
    const [chatMessage] = await db.insert(aiChatHistory).values(message).returning();
    return chatMessage;
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<any[]> {
    return await db.select().from(aiChatHistory)
      .where(eq(aiChatHistory.userId, userId))
      .orderBy(desc(aiChatHistory.createdAt))
      .limit(limit);
  }

  // Screen usage tracking
  async saveScreenUsageLog(log: any): Promise<any> {
    const [usageLog] = await db.insert(screenUsageLogs).values(log).returning();
    return usageLog;
  }

  async getScreenUsageStats(userId: string, sessionId?: string): Promise<any> {
    let conditions = [eq(screenUsageLogs.userId, userId)];
    
    if (sessionId) {
      conditions.push(eq(screenUsageLogs.sessionId, sessionId));
    }
    
    const logs = await db.select()
      .from(screenUsageLogs)
      .where(and(...conditions))
      .orderBy(desc(screenUsageLogs.createdAt))
      .limit(10);
    
    const totalDistractions = logs.reduce((sum, log) => sum + (log.distractionCount || 0), 0);
    const totalFocusTime = logs.reduce((sum, log) => sum + (log.focusTime || 0), 0);
    const totalAwayTime = logs.reduce((sum, log) => sum + (log.awayTime || 0), 0);
    
    return {
      logs,
      totalDistractions,
      totalFocusTime,
      totalAwayTime,
      focusRatio: totalFocusTime / (totalFocusTime + totalAwayTime) || 0
    };
  }

  // Community challenges
  async getActiveChallenges(): Promise<any[]> {
    const now = new Date();
    return await db.select().from(communityChallenge)
      .where(and(
        eq(communityChallenge.isActive, true),
        lte(communityChallenge.startDate, now),
        gte(communityChallenge.endDate, now)
      ))
      .orderBy(communityChallenge.endDate);
  }

  async getUserChallengeProgress(userId: string): Promise<any[]> {
    return await db.select({
      challenge: communityChallenge,
      progress: userChallengeProgress
    }).from(userChallengeProgress)
      .innerJoin(communityChallenge, eq(userChallengeProgress.challengeId, communityChallenge.id))
      .where(eq(userChallengeProgress.userId, userId))
      .orderBy(desc(userChallengeProgress.joinedAt));
  }

  async updateChallengeProgress(userId: string, challengeId: string, sessions: number): Promise<any> {
    const [progress] = await db.insert(userChallengeProgress).values({
      userId,
      challengeId,
      currentSessions: sessions
    }).onConflictDoUpdate({
      target: [userChallengeProgress.userId, userChallengeProgress.challengeId],
      set: { 
        currentSessions: sessions,
        isCompleted: sql`${userChallengeProgress.currentSessions} >= (SELECT target_sessions FROM community_challenges WHERE id = ${challengeId})`
      }
    }).returning();
    
    return progress;
  }
}

export const storage = new DatabaseStorage();
