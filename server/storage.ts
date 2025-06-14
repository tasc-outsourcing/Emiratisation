import { industries, assessments, configuration, type Industry, type InsertIndustry, type Assessment, type InsertAssessment, type Configuration, type InsertConfiguration } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Industries
  getIndustries(): Promise<Industry[]>;
  getIndustry(id: number): Promise<Industry | undefined>;
  createIndustry(industry: InsertIndustry): Promise<Industry>;
  updateIndustry(id: number, industry: Partial<InsertIndustry>): Promise<Industry | undefined>;
  deleteIndustry(id: number): Promise<boolean>;

  // Assessments
  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;

  // Configuration
  getConfiguration(): Promise<Configuration[]>;
  getConfigurationByKey(key: string): Promise<Configuration | undefined>;
  setConfiguration(config: InsertConfiguration): Promise<Configuration>;
  updateConfiguration(key: string, value: string): Promise<Configuration | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getIndustries(): Promise<Industry[]> {
    return await db.select().from(industries).where(eq(industries.isActive, true));
  }

  async getIndustry(id: number): Promise<Industry | undefined> {
    const [industry] = await db.select().from(industries).where(eq(industries.id, id));
    return industry || undefined;
  }

  async createIndustry(insertIndustry: InsertIndustry): Promise<Industry> {
    const [industry] = await db
      .insert(industries)
      .values(insertIndustry)
      .returning();
    return industry;
  }

  async updateIndustry(id: number, updates: Partial<InsertIndustry>): Promise<Industry | undefined> {
    const [industry] = await db
      .update(industries)
      .set(updates)
      .where(eq(industries.id, id))
      .returning();
    return industry || undefined;
  }

  async deleteIndustry(id: number): Promise<boolean> {
    const [industry] = await db
      .update(industries)
      .set({ isActive: false })
      .where(eq(industries.id, id))
      .returning();
    return !!industry;
  }

  async getAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments);
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const industry = await this.getIndustry(insertAssessment.industryId);
    if (!industry) {
      throw new Error("Industry not found");
    }

    // Calculate assessment values
    const totalEmployees = insertAssessment.skilledEmployees + insertAssessment.unskilledEmployees;
    const jurisdictionMultiplier = insertAssessment.jurisdiction === 'mainland' ? 1.0 : 0.75;
    const adjustedRate = industry.emiratisationRate * jurisdictionMultiplier;
    const requiredEmirates = Math.ceil(totalEmployees * adjustedRate);
    const currentEmirates = insertAssessment.currentEmirates || 0;
    
    const gap = currentEmirates - requiredEmirates;
    const riskPercentage = Math.min(100, Math.max(0, (-gap / requiredEmirates) * 100));
    
    let riskLevel: string;
    if (riskPercentage <= 25) riskLevel = 'low';
    else if (riskPercentage <= 50) riskLevel = 'medium';
    else riskLevel = 'high';

    const baseFine = await this.getConfigurationByKey('base_fine');
    const baseFineAmount = baseFine ? parseFloat(baseFine.value) : 30000;
    const freezonePenalty = await this.getConfigurationByKey('freezone_reduction');
    const frezoneReduction = freezonePenalty ? parseFloat(freezonePenalty.value) : 0.25;
    
    const jurisdictionFineMultiplier = insertAssessment.jurisdiction === 'mainland' ? 1.0 : (1.0 - frezoneReduction);
    const potentialFine = Math.abs(gap) * baseFineAmount * jurisdictionFineMultiplier * industry.riskMultiplier;

    const [assessment] = await db
      .insert(assessments)
      .values({
        ...insertAssessment,
        currentEmirates,
        totalEmployees,
        requiredEmirates,
        riskPercentage,
        riskLevel,
        potentialFine: Math.max(0, potentialFine),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return assessment;
  }

  async getConfiguration(): Promise<Configuration[]> {
    return await db.select().from(configuration);
  }

  async getConfigurationByKey(key: string): Promise<Configuration | undefined> {
    const [config] = await db.select().from(configuration).where(eq(configuration.key, key));
    return config || undefined;
  }

  async setConfiguration(config: InsertConfiguration): Promise<Configuration> {
    const existing = await this.getConfigurationByKey(config.key);
    if (existing) {
      const [updated] = await db
        .update(configuration)
        .set(config)
        .where(eq(configuration.key, config.key))
        .returning();
      return updated;
    } else {
      const [newConfig] = await db
        .insert(configuration)
        .values(config)
        .returning();
      return newConfig;
    }
  }

  async updateConfiguration(key: string, value: string): Promise<Configuration | undefined> {
    const [updated] = await db
      .update(configuration)
      .set({ value })
      .where(eq(configuration.key, key))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
