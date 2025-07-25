import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timer sessions table
export const timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: varchar("task_id").references(() => tasks.id), // link to task
  type: varchar("type").notNull(), // 'focus', 'break', 'long_break'
  duration: integer("duration").notNull(), // in seconds
  completedDuration: integer("completed_duration").notNull().default(0),
  isCompleted: boolean("is_completed").default(false),
  pauseCount: integer("pause_count").default(0),
  distractionCount: integer("distraction_count").default(0),
  xpEarned: integer("xp_earned").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  ambientSound: varchar("ambient_sound"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User settings table
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  theme: varchar("theme").default('light'), // 'light', 'dark'
  hapticFeedback: boolean("haptic_feedback").default(true),
  dailyReminders: boolean("daily_reminders").default(true),
  reminderTime: varchar("reminder_time").default('09:00'),
  soundVolume: decimal("sound_volume", { precision: 3, scale: 2 }).default('0.5'),
  defaultSessionDuration: integer("default_session_duration").default(1500), // 25 minutes
  defaultBreakDuration: integer("default_break_duration").default(300), // 5 minutes
  sessionsUntilLongBreak: integer("sessions_until_long_break").default(4),
  longBreakDuration: integer("long_break_duration").default(900), // 15 minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily streaks table
export const dailyStreaks = pgTable("daily_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  sessionsCompleted: integer("sessions_completed").default(0),
  focusTimeMinutes: integer("focus_time_minutes").default(0),
  goalMet: boolean("goal_met").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Motivational quotes table
export const motivationalQuotes = pgTable("motivational_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  author: varchar("author").notNull(),
  category: varchar("category").default('general'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User XP and gamification
export const userGameData = pgTable("user_game_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalXp: integer("total_xp").default(0),
  currentLevel: integer("current_level").default(1),
  xpToNextLevel: integer("xp_to_next_level").default(100),
  completedAchievements: text("completed_achievements").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements system
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").default(0),
  icon: varchar("icon").notNull(),
  category: varchar("category").default('general'),
  requirement: integer("requirement").notNull(), // sessions/hours/days needed
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks/To-do list
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  priority: varchar("priority").default('medium'), // low, medium, high
  category: varchar("category").default('general'),
  tags: text("tags").array().default([]),
  isCompleted: boolean("is_completed").default(false),
  totalFocusTime: integer("total_focus_time").default(0), // in seconds
  sessionCount: integer("session_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Community challenges
export const communityChallenge = pgTable("community_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  targetSessions: integer("target_sessions").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  xpReward: integer("xp_reward").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User challenge participation
export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => communityChallenge.id),
  currentSessions: integer("current_sessions").default(0),
  isCompleted: boolean("is_completed").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// AI chat history
export const aiChatHistory = pgTable("ai_chat_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id"), // optional link to timer session
  message: text("message").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  aiResponse: text("ai_response"),
  context: varchar("context"), // 'pause', 'fail', 'general'
  createdAt: timestamp("created_at").defaultNow(),
});

// Screen usage tracking
export const screenUsageLogs = pgTable("screen_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").references(() => timerSessions.id),
  distractionCount: integer("distraction_count").default(0),
  focusTime: integer("focus_time").default(0), // seconds stayed in app
  awayTime: integer("away_time").default(0), // seconds spent away
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  timerSessions: many(timerSessions),
  settings: one(userSettings),
  dailyStreaks: many(dailyStreaks),
  gameData: one(userGameData),
  tasks: many(tasks),
  challengeProgress: many(userChallengeProgress),
  aiChatHistory: many(aiChatHistory),
  screenUsageLogs: many(screenUsageLogs),
}));

export const timerSessionsRelations = relations(timerSessions, ({ one }) => ({
  user: one(users, {
    fields: [timerSessions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [timerSessions.taskId],
    references: [tasks.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const dailyStreaksRelations = relations(dailyStreaks, ({ one }) => ({
  user: one(users, {
    fields: [dailyStreaks.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  sessions: many(timerSessions),
}));

export const userGameDataRelations = relations(userGameData, ({ one }) => ({
  user: one(users, {
    fields: [userGameData.userId],
    references: [users.id],
  }),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(communityChallenge, {
    fields: [userChallengeProgress.challengeId],
    references: [communityChallenge.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyStreakSchema = createInsertSchema(dailyStreaks).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGameDataSchema = createInsertSchema(userGameData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiChatHistorySchema = createInsertSchema(aiChatHistory).omit({
  id: true,
  createdAt: true,
});

export const insertScreenUsageLogSchema = createInsertSchema(screenUsageLogs).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
  id: true,
  joinedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TimerSession = typeof timerSessions.$inferSelect;
export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type DailyStreak = typeof dailyStreaks.$inferSelect;
export type InsertDailyStreak = z.infer<typeof insertDailyStreakSchema>;
export type MotivationalQuote = typeof motivationalQuotes.$inferSelect;
