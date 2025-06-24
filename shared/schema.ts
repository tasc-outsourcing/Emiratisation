import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Assessment submissions table
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  // Company profile
  companyLocation: text("company_location").notNull(), // 'mainland' | 'freezone'
  industrySector: text("industry_sector").notNull(),
  totalEmployees: integer("total_employees").notNull(),
  skilledEmployees: integer("skilled_employees").notNull(),
  
  // Emirati workforce
  emiratiEmployees: integer("emirati_employees").notNull(),
  nafisRegistered: text("nafis_registered").notNull(), // 'yes' | 'no' | 'not_sure'
  wpsGpssaCompliant: text("wps_gpssa_compliant").notNull(), // 'yes' | 'no' | 'not_sure'
  emiratiLeftRecently: text("emirati_left_recently").notNull(), // 'yes' | 'no' | 'not_sure'
  departureDaysAgo: integer("departure_days_ago"),
  
  // Lead capture
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  companyName: text("company_name").notNull(),
  
  // Calculated results
  requiredEmirates: integer("required_emirates").notNull(),
  validEmirates: integer("valid_emirates").notNull(),
  gap: integer("gap").notNull(),
  fineEstimate: real("fine_estimate").notNull(),
  riskScore: integer("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(), // 'low' | 'medium' | 'high'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Configuration table for admin settings
export const configuration = pgTable("configuration", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for form validation
export const assessmentInputSchema = z.object({
  // Company profile
  companyLocation: z.enum(["mainland", "freezone"]),
  industrySector: z.string().min(1, "Please select an industry sector"),
  totalEmployees: z.number().min(1, "Must have at least 1 employee"),
  skilledEmployees: z.number().min(1, "Must have at least 1 skilled employee"),
  partOfGroup: z.boolean(),
  groupOperatesMainland: z.boolean().optional(),
  
  // Emirati workforce
  emiratiEmployees: z.number().min(0, "Cannot be negative"),
  emiratisInSkilledRoles: z.boolean(),
  wpsGpssaCompliant: z.boolean(),
  emiratiLeftRecently: z.boolean(),
  departureDaysAgo: z.number().min(0).max(365).optional(),
  
  // Lead capture
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  companyName: z.string().min(1, "Company name is required"),
}).refine((data) => {
  return data.skilledEmployees <= data.totalEmployees;
}, {
  message: "Skilled employees cannot exceed total employees",
  path: ["skilledEmployees"],
}).refine((data) => {
  return !data.partOfGroup || data.groupOperatesMainland !== undefined;
}, {
  message: "Please specify if group operates in mainland",
  path: ["groupOperatesMainland"],
}).refine((data) => {
  return !data.emiratiLeftRecently || data.departureDaysAgo !== undefined;
}, {
  message: "Please specify when the Emirati left",
  path: ["departureDaysAgo"],
});

export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
  updatedAt: true,
});

// Types
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type AssessmentInput = z.infer<typeof assessmentInputSchema>;
export type Configuration = typeof configuration.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

// Industry sectors constant
export const MOHRE_SECTORS = [
  "Information and Communications",
  "Financial and Insurance Activities", 
  "Real Estate Activities",
  "Professional, Scientific and Technical Activities",
  "Administrative and Support Services",
  "Education",
  "Healthcare and Social Work Activities",
  "Arts and Entertainment",
  "Mining and Quarrying",
  "Manufacturing",
  "Construction",
  "Wholesale and Retail Trade",
  "Transportation and Warehousing",
  "Hospitality (Accommodation and Food Services)",
  "Banking",
  "Insurance",
  "Government",
  "Other"
] as const;

export const REGULATED_SECTORS = ["Banking", "Insurance", "Government"] as const;