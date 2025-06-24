import { useState } from "react";
import Header from "@/components/header";
import AssessmentForm from "@/components/assessment-form-fixed";
import ResultsDisplay from "@/components/results-display";
import LeadCaptureModal from "@/components/lead-capture-modal";
import Footer from "@/components/footer";
import type { AssessmentInput, Assessment } from "@shared/schema";

export default function AssessmentPage() {
  const [formData, setFormData] = useState<any>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [completedAssessment, setCompletedAssessment] = useState<Assessment | null>(null);

  const handleFormComplete = (data: any) => {
    setFormData(data);
    setShowLeadCapture(true);
  };

  const handleLeadCapture = (leadData: { firstName: string; lastName: string; email: string; phone: string; companyName: string }) => {
    if (!formData) return;
    
    const completeData: AssessmentInput = {
      companyLocation: formData.companyLocation || "mainland",
      industrySector: formData.industrySector || "Other",
      totalEmployees: formData.totalEmployees || 0,
      skilledEmployees: formData.skilledEmployees || 0,
      emiratiEmployees: formData.emiratiEmployees || 0,
      nafisRegistered: formData.nafisRegistered || "not_sure",
      wpsGpssaCompliant: formData.wpsGpssaCompliant || "not_sure",
      emiratiLeftRecently: formData.emiratiLeftRecently || "not_sure",
      departureDaysAgo: formData.departureDaysAgo,
      firstName: leadData.firstName || "",
      lastName: leadData.lastName || "",
      email: leadData.email || "",
      phone: leadData.phone || "",
      companyName: leadData.companyName || "",
    };

    submitAssessment(completeData);
  };

  const submitAssessment = async (data: AssessmentInput) => {
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Assessment submission failed");

      const assessment = await response.json();
      setCompletedAssessment(assessment);
      setShowLeadCapture(false);
    } catch (error) {
      console.error("Assessment submission error:", error);
      // Handle error - could show toast or error message
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {!completedAssessment ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-tasc-primary mb-4">
                Emiratisation Risk Assessment Tool
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Assess your company's compliance risk with UAE MoHRE 2025 Emiratisation requirements and calculate potential fines.
              </p>
            </div>
            
            <AssessmentForm onComplete={handleFormComplete} />
          </div>
        ) : (
          <ResultsDisplay assessment={completedAssessment} />
        )}

        <LeadCaptureModal
          isOpen={showLeadCapture}
          onClose={() => setShowLeadCapture(false)}
          onSubmit={handleLeadCapture}
        />
      </main>
      <Footer />
    </div>
  );
}