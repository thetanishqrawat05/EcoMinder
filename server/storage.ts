import {
  users,
  timerSessions,
  userSettings,
  dailyStreaks,
  motivationalQuotes,
  type User,
  type UpsertUser,
  type TimerSession,
  type InsertTimerSession,
  type UserSettings,
  type InsertUserSettings,
  type DailyStreak,
  type InsertDailyStreak,
  type MotivationalQuote,
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
}

export const storage = new DatabaseStorage();
