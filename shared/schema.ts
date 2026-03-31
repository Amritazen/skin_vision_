import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  result: text("result").notNull(), // "Melanoma" | "Not Melanoma" | "Healthy"
  hasLesion: boolean("has_lesion").notNull().default(true),
  confidence: integer("confidence").notNull(), // 0-100
  segmentationMask: text("segmentation_mask"), // URL to mask image (optional)
  detections: jsonb("detections"), // Store bounding boxes/masks
  analysis: text("analysis"), // Clinical reasoning text
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  analyzedAt: true
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

// Explicit API types
export type CreateScanRequest = {
  imageUrl: string;
};

export type ScanResponse = Scan;

// UV Index types
export type UVData = {
  uvIndex: number;
  uvMax: number;
  safeExposureMinutes?: number;
};

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
