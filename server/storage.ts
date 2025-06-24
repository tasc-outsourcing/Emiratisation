import { assessments, configuration, type Assessment, type InsertAssessment, type Configuration, type InsertConfiguration, type AssessmentInput, MOHRE_SECTORS } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Assessments
  createAssessment(input: AssessmentInput): Promise<Assessment>;
  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  
  // Configuration
  getConfiguration(): Promise<Configuration[]>;
  getConfigurationByKey(key: string): Promise<Configuration | undefined>;
  setConfiguration(config: InsertConfiguration): Promise<Configuration>;
  updateConfiguration(key: string, value: string): Promise<Configuration | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createAssessment(input: AssessmentInput): Promise<Assessment> {
    // Calculate Emiratisation requirements and risk
    const calculatedData = this.calculateEmiratsationRisk(input);
    
    const [assessment] = await db
      .insert(assessments)
      .values({
        ...input,
        ...calculatedData,
      })
      .returning();

    return assessment;
  }

  async getAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments);
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
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
        .set({ ...config, updatedAt: new Date() })
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
      .set({ value, updatedAt: new Date() })
      .where(eq(configuration.key, key))
      .returning();
    return updated || undefined;
  }

  private calculateEmiratsationRisk(input: AssessmentInput) {
    const {
      companyLocation,
      industrySector,
      totalEmployees,
      skilledEmployees,
      emiratiEmployees,
      nafisRegistered,
      wpsGpssaCompliant,
      emiratiLeftRecently,
      departureDaysAgo,
    } = input;

    // Step 1: Calculate required Emiratis
    let requiredEmirates = 0;

    if (companyLocation === "freezone") {
      requiredEmirates = 0;
    } else if (totalEmployees >= 20 && totalEmployees <= 49 && this.isMoHREDesignatedSector(industrySector)) {
      requiredEmirates = 2;
    } else if (skilledEmployees >= 50) {
      const targetPercent = 8; // Default 8%, could be configurable
      requiredEmirates = Math.ceil((skilledEmployees * targetPercent) / 100);
    }

    // Step 2: Calculate valid Emiratis (assumes all Emiratis are in skilled roles)
    let validEmirates = 0;
    if (wpsGpssaCompliant === "yes") {
      validEmirates = emiratiEmployees;
    }

    // Grace period for recent departures (treat "not_sure" same as "yes" for conservative approach)
    if ((emiratiLeftRecently === "yes" || emiratiLeftRecently === "not_sure") && departureDaysAgo !== undefined && departureDaysAgo <= 90) {
      validEmirates += 1;
    }

    // Step 3: Calculate gap and fine
    const gap = Math.max(0, requiredEmirates - validEmirates);
    const finePerEmirati = 96000; // Default, could be configurable
    const fineEstimate = gap * finePerEmirati;

    // Step 4: Calculate risk score
    let riskScore = 100 - (gap * 20);
    if (gap >= 2) riskScore -= 10;
    if (wpsGpssaCompliant) riskScore += 5;
    
    // Ensure score is within bounds
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Step 5: Determine risk level
    let riskLevel: string;
    if (riskScore >= 71) riskLevel = "low";
    else if (riskScore >= 41) riskLevel = "medium";
    else riskLevel = "high";

    return {
      requiredEmirates,
      validEmirates,
      gap,
      fineEstimate,
      riskScore,
      riskLevel,
    };
  }

  private isMoHREDesignatedSector(sector: string): boolean {
    // All 14 MoHRE sectors are designated (excluding Banking, Insurance, Government, Other)
    const designated = MOHRE_SECTORS.slice(0, 14); // First 14 sectors
    return designated.includes(sector as any);
  }
}

export const storage = new DatabaseStorage();