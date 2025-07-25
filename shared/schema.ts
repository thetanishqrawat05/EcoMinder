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
  type: varchar("type").notNull(), // 'focus', 'break', 'long_break'
  duration: integer("duration").notNull(), // in seconds
  completedDuration: integer("completed_duration").notNull().default(0),
  isCompleted: boolean("is_completed").default(false),
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

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  timerSessions: many(timerSessions),
  settings: one(userSettings),
  dailyStreaks: many(dailyStreaks),
}));

export const timerSessionsRelations = relations(timerSessions, ({ one }) => ({
  user: one(users, {
    fields: [timerSessions.userId],
    references: [users.id],
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
