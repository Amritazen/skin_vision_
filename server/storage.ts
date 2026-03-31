import {
  users,
  scans,
  type User,
  type InsertUser,
  type InsertScan,
  type Scan,
  type Reminder,
  type InsertReminder,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: number): Promise<Scan | undefined>;
  getScans(): Promise<Scan[]>;

  createReminder(reminder: InsertReminder): Promise<Reminder>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scans: Map<number, Scan>;
  private reminders: Map<number, Reminder>;
  private currentUserId: number;
  private currentScanId: number;
  private currentReminderId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.reminders = new Map();
    this.currentUserId = 1;
    this.currentScanId = 1;
    this.currentReminderId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = this.currentScanId++;
    const scan: Scan = {
      ...insertScan,
      id,
      analyzedAt: new Date(),
      hasLesion: insertScan.hasLesion ?? true,
      segmentationMask: insertScan.segmentationMask ?? null,
      detections: insertScan.detections ?? null,
      analysis: insertScan.analysis ?? null,
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async getScans(): Promise<Scan[]> {
    return Array.from(this.scans.values()).sort((a, b) =>
      (b.analyzedAt?.getTime() || 0) - (a.analyzedAt?.getTime() || 0)
    );
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = {
      ...insertReminder,
      id,
      createdAt: new Date(),
    };
    this.reminders.set(id, reminder);
    return reminder;
  }
}

export const storage = new MemStorage();
