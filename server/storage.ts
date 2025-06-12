import { industries, assessments, configuration, type Industry, type InsertIndustry, type Assessment, type InsertAssessment, type Configuration, type InsertConfiguration } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private industries: Map<number, Industry>;
  private assessments: Map<number, Assessment>;
  private configuration: Map<string, Configuration>;
  private currentIndustryId: number;
  private currentAssessmentId: number;
  private currentConfigId: number;

  constructor() {
    this.industries = new Map();
    this.assessments = new Map();
    this.configuration = new Map();
    this.currentIndustryId = 1;
    this.currentAssessmentId = 1;
    this.currentConfigId = 1;

    // Initialize with default industries
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default industries based on UAE emiratisation requirements
    const defaultIndustries = [
      { name: "Banking & Finance", emiratisationRate: 0.04, riskMultiplier: 2.5 },
      { name: "Insurance", emiratisationRate: 0.05, riskMultiplier: 2.0 },
      { name: "Telecommunications", emiratisationRate: 0.02, riskMultiplier: 1.5 },
      { name: "Oil & Gas", emiratisationRate: 0.04, riskMultiplier: 3.0 },
      { name: "Construction", emiratisationRate: 0.02, riskMultiplier: 1.8 },
      { name: "Retail", emiratisationRate: 0.01, riskMultiplier: 1.2 },
      { name: "Healthcare", emiratisationRate: 0.03, riskMultiplier: 2.2 },
      { name: "Education", emiratisationRate: 0.02, riskMultiplier: 1.6 },
    ];

    defaultIndustries.forEach(industry => {
      const id = this.currentIndustryId++;
      this.industries.set(id, { ...industry, id, isActive: true });
    });

    // Default configuration
    const defaultConfig = [
      { key: "low_risk_threshold", value: "25", description: "Low risk threshold percentage" },
      { key: "medium_risk_threshold", value: "50", description: "Medium risk threshold percentage" },
      { key: "high_risk_threshold", value: "75", description: "High risk threshold percentage" },
      { key: "base_fine", value: "30000", description: "Base fine amount in AED" },
      { key: "freezone_reduction", value: "0.25", description: "Freezone fine reduction percentage" },
    ];

    defaultConfig.forEach(config => {
      const id = this.currentConfigId++;
      this.configuration.set(config.key, { ...config, id });
    });
  }

  async getIndustries(): Promise<Industry[]> {
    return Array.from(this.industries.values()).filter(industry => industry.isActive);
  }

  async getIndustry(id: number): Promise<Industry | undefined> {
    return this.industries.get(id);
  }

  async createIndustry(insertIndustry: InsertIndustry): Promise<Industry> {
    const id = this.currentIndustryId++;
    const industry: Industry = { ...insertIndustry, id, isActive: true };
    this.industries.set(id, industry);
    return industry;
  }

  async updateIndustry(id: number, updates: Partial<InsertIndustry>): Promise<Industry | undefined> {
    const existing = this.industries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.industries.set(id, updated);
    return updated;
  }

  async deleteIndustry(id: number): Promise<boolean> {
    const existing = this.industries.get(id);
    if (!existing) return false;
    
    // Soft delete by setting isActive to false
    this.industries.set(id, { ...existing, isActive: false });
    return true;
  }

  async getAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values());
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    return this.assessments.get(id);
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
    
    const gap = insertAssessment.currentEmirates - requiredEmirates;
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

    const id = this.currentAssessmentId++;
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      totalEmployees,
      requiredEmirates,
      riskPercentage,
      riskLevel,
      potentialFine: Math.max(0, potentialFine),
      createdAt: new Date().toISOString(),
    };

    this.assessments.set(id, assessment);
    return assessment;
  }

  async getConfiguration(): Promise<Configuration[]> {
    return Array.from(this.configuration.values());
  }

  async getConfigurationByKey(key: string): Promise<Configuration | undefined> {
    return this.configuration.get(key);
  }

  async setConfiguration(config: InsertConfiguration): Promise<Configuration> {
    const existing = this.configuration.get(config.key);
    if (existing) {
      const updated = { ...existing, ...config };
      this.configuration.set(config.key, updated);
      return updated;
    } else {
      const id = this.currentConfigId++;
      const newConfig: Configuration = { ...config, id };
      this.configuration.set(config.key, newConfig);
      return newConfig;
    }
  }

  async updateConfiguration(key: string, value: string): Promise<Configuration | undefined> {
    const existing = this.configuration.get(key);
    if (!existing) return undefined;
    
    const updated = { ...existing, value };
    this.configuration.set(key, updated);
    return updated;
  }
}

export const storage = new MemStorage();
