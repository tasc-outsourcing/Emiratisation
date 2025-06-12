import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIndustrySchema, insertAssessmentSchema, insertConfigurationSchema } from "@shared/schema";
import { z } from "zod";

const updateIndustrySchema = insertIndustrySchema.partial();
const updateConfigSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Industries routes
  app.get("/api/industries", async (req, res) => {
    try {
      const industries = await storage.getIndustries();
      res.json(industries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industries" });
    }
  });

  app.get("/api/industries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const industry = await storage.getIndustry(id);
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch industry" });
    }
  });

  app.post("/api/industries", async (req, res) => {
    try {
      const result = insertIndustrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid industry data", errors: result.error.issues });
      }
      
      const industry = await storage.createIndustry(result.data);
      res.status(201).json(industry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create industry" });
    }
  });

  app.put("/api/industries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = updateIndustrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid industry data", errors: result.error.issues });
      }
      
      const industry = await storage.updateIndustry(id, result.data);
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.json(industry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update industry" });
    }
  });

  app.delete("/api/industries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteIndustry(id);
      if (!success) {
        return res.status(404).json({ message: "Industry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete industry" });
    }
  });

  // Assessments routes
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const result = insertAssessmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid assessment data", errors: result.error.issues });
      }
      
      const assessment = await storage.createAssessment(result.data);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof Error && error.message === "Industry not found") {
        return res.status(400).json({ message: "Invalid industry selected" });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  // Configuration routes
  app.get("/api/configuration", async (req, res) => {
    try {
      const config = await storage.getConfiguration();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.put("/api/configuration", async (req, res) => {
    try {
      const result = updateConfigSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid configuration data", errors: result.error.issues });
      }
      
      const config = await storage.updateConfiguration(result.data.key, result.data.value);
      if (!config) {
        return res.status(404).json({ message: "Configuration key not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      const industries = await storage.getIndustries();
      
      const totalAssessments = assessments.length;
      const highRiskCompanies = assessments.filter(a => a.riskLevel === 'high').length;
      const configuredIndustries = industries.length;
      
      res.json({
        totalAssessments,
        highRiskCompanies,
        configuredIndustries,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
