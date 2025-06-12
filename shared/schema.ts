import { pgTable, text, serial, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  emiratisationRate: real("emiratisation_rate").notNull(), // percentage as decimal (e.g., 0.04 for 4%)
  riskMultiplier: real("risk_multiplier").notNull().default(1.0),
  isActive: boolean("is_active").notNull().default(true),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  industryId: integer("industry_id").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // 'mainland' or 'freezone'
  skilledEmployees: integer("skilled_employees").notNull(),
  unskilledEmployees: integer("unskilled_employees").notNull(),
  totalEmployees: integer("total_employees").notNull(),
  requiredEmirates: integer("required_emirates").notNull(),
  currentEmirates: integer("current_emirates").notNull().default(0),
  riskPercentage: real("risk_percentage").notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high'
  potentialFine: real("potential_fine").notNull(),
  createdAt: text("created_at").notNull(),
});

export const configuration = pgTable("configuration", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
});

export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  isActive: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  totalEmployees: true,
  requiredEmirates: true,
  riskPercentage: true,
  riskLevel: true,
  potentialFine: true,
  createdAt: true,
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
});

export type Industry = typeof industries.$inferSelect;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Configuration = typeof configuration.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;
