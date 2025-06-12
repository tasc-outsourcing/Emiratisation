import { useState } from "react";
import CompanyDetailsForm from "@/components/company-details-form";
import RiskResultsPanel from "@/components/risk-results-panel";
import type { Assessment } from "@shared/schema";

export default function RiskAssessment() {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompanyDetailsForm onAssessmentComplete={setCurrentAssessment} />
        </div>
        <div className="lg:col-span-1">
          <RiskResultsPanel assessment={currentAssessment} />
        </div>
      </div>
    </div>
  );
}
