import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessmentInputSchema, insertConfigurationSchema } from "@shared/schema";
import { z } from "zod";

const updateConfigSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const adminAuthSchema = z.object({
  password: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      console.log("Received assessment data:", req.body);
      const result = assessmentInputSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Validation errors:", result.error.issues);
        return res.status(400).json({ 
          message: "Invalid assessment data", 
          errors: result.error.issues 
        });
      }
      
      const assessment = await storage.createAssessment(result.data);
      
      // Send to HubSpot/Zapier webhook (if configured)
      if (process.env.ZAPIER_WEBHOOK_URL) {
        try {
          const webhookData = {
            first_name: assessment.firstName,
            last_name: assessment.lastName,
            email: assessment.email,
            phone: assessment.phone,
            company: assessment.companyName,
            emiratisation_gap: assessment.gap,
            risk_score: assessment.riskScore,
            risk_level: assessment.riskLevel,
            fine_estimate: assessment.fineEstimate,
          };
          
          await fetch(process.env.ZAPIER_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookData),
          });
        } catch (webhookError) {
          console.error("Webhook failed:", webhookError);
          // Don't fail the assessment if webhook fails
        }
      }
      
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Assessment creation failed:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessment" });
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
        return res.status(400).json({ 
          message: "Invalid configuration data", 
          errors: result.error.issues 
        });
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

  // Admin authentication
  app.post("/api/admin/auth", async (req, res) => {
    try {
      const result = adminAuthSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Password required" });
      }
      
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (result.data.password === adminPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Statistics endpoint for admin
  app.get("/api/admin/statistics", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      
      const totalAssessments = assessments.length;
      const highRiskAssessments = assessments.filter(a => a.riskLevel === 'high').length;
      const mediumRiskAssessments = assessments.filter(a => a.riskLevel === 'medium').length;
      const lowRiskAssessments = assessments.filter(a => a.riskLevel === 'low').length;
      
      const totalFines = assessments.reduce((sum, a) => sum + a.fineEstimate, 0);
      const averageRiskScore = assessments.length > 0 
        ? assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length 
        : 0;
      
      const sectorBreakdown = assessments.reduce((acc, a) => {
        acc[a.industrySector] = (acc[a.industrySector] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        totalAssessments,
        highRiskAssessments,
        mediumRiskAssessments,
        lowRiskAssessments,
        totalFines,
        averageRiskScore: Math.round(averageRiskScore),
        sectorBreakdown,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}