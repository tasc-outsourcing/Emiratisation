import { useState } from "react";
import Header from "@/components/header";
import AssessmentForm from "@/components/assessment-form";
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

  const handleLeadCapture = (leadData: { name: string; email: string; phone: string; company: string }) => {
    if (!formData) return;
    
    const completeData: AssessmentInput = {
      companyLocation: formData.companyLocation || "mainland",
      industrySector: formData.industrySector || "Other",
      totalEmployees: formData.totalEmployees || 0,
      skilledEmployees: formData.skilledEmployees || 0,
      partOfGroup: formData.partOfGroup || false,
      groupOperatesMainland: formData.groupOperatesMainland,
      emiratiEmployees: formData.emiratiEmployees || 0,
      emiratisInSkilledRoles: formData.emiratisInSkilledRoles || false,
      wpsGpssaCompliant: formData.wpsGpssaCompliant || false,
      emiratiLeftRecently: formData.emiratiLeftRecently || false,
      departureDaysAgo: formData.departureDaysAgo,
      firstName: leadData.name.split(' ')[0] || leadData.name,
      lastName: leadData.name.split(' ').slice(1).join(' ') || '',
      email: leadData.email,
      phone: leadData.phone,
      companyName: leadData.company,
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
          onSubmit={(data) => handleLeadCapture({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          company: data.companyName
        })}
        />
      </main>
      <Footer />
    </div>
  );
}