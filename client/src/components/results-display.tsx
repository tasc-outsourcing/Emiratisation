import { Phone, Download, Calendar, Award, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Assessment } from "@shared/schema";

interface ResultsDisplayProps {
  assessment: Assessment;
}

export default function ResultsDisplay({ assessment }: ResultsDisplayProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'risk-indicator-low';
      case 'medium': return 'risk-indicator-medium';
      case 'high': return 'risk-indicator-high';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const downloadGuide = () => {
    // Create a simple text report for download
    const reportData = `
TASC Outsourcing - Emiratisation Risk Assessment Report
====================================================

Company: ${assessment.companyName}
Date: ${new Date(assessment.createdAt).toLocaleDateString()}

ASSESSMENT SUMMARY
-----------------
Risk Level: ${assessment.riskLevel.toUpperCase()}
Risk Score: ${assessment.riskScore}/100
Potential Fine: AED ${assessment.fineEstimate.toLocaleString()}

WORKFORCE DETAILS
-----------------
Total Employees: ${assessment.totalEmployees}
Skilled Employees: ${assessment.skilledEmployees}
Current Emiratis: ${assessment.emiratiEmployees}
Required Emiratis: ${assessment.requiredEmirates}
Gap: ${assessment.gap}

COMPANY PROFILE
--------------
Industry: ${assessment.industrySector}
Location: ${assessment.companyLocation}
Part of Group: ${assessment.partOfGroup ? 'Yes' : 'No'}

COMPLIANCE STATUS
----------------
Emiratis in Skilled Roles: ${assessment.emiratisInSkilledRoles ? 'Yes' : 'No'}
WPS + GPSSA Compliant: ${assessment.wpsGpssaCompliant ? 'Yes' : 'No'}
Recent Departure: ${assessment.emiratiLeftRecently ? 'Yes' : 'No'}

For expert guidance on compliance strategies, contact TASC Outsourcing.
`.trim();

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasc-emiratisation-assessment-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const RiskIcon = getRiskIcon(assessment.riskLevel);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-tasc-primary mb-2">
          Assessment Complete
        </h1>
        <p className="text-gray-600">
          Here's your Emiratisation compliance risk analysis
        </p>
      </div>

      {/* Risk Score Card */}
      <Card className="card-tasc">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${getRiskColor(assessment.riskLevel)}`}>
              <div className="text-center">
                <RiskIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{assessment.riskScore}</div>
                <div className="text-sm">/ 100</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-tasc-primary mb-2">
              {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)} Risk
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {assessment.riskLevel === 'low' && "Your company meets Emiratisation requirements with good compliance."}
              {assessment.riskLevel === 'medium' && "Your company approaches the Emiratisation threshold and should take action."}
              {assessment.riskLevel === 'high' && "Your company exceeds the Emiratisation threshold and requires immediate attention."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-tasc">
          <CardHeader>
            <CardTitle className="text-center text-tasc-primary">Emiratis Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-tasc-teal">{assessment.requiredEmirates}</div>
            <p className="text-sm text-gray-600 mt-2">Based on {assessment.skilledEmployees} skilled employees</p>
          </CardContent>
        </Card>

        <Card className="card-tasc">
          <CardHeader>
            <CardTitle className="text-center text-tasc-primary">Current Gap</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold ${assessment.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {assessment.gap > 0 ? `-${assessment.gap}` : '✓'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {assessment.gap > 0 ? `Need ${assessment.gap} more Emirati${assessment.gap > 1 ? 's' : ''}` : 'Requirements met'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-tasc">
          <CardHeader>
            <CardTitle className="text-center text-tasc-primary">Potential Fine</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-red-600">
              AED {assessment.fineEstimate.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {assessment.fineEstimate > 0 ? 'If non-compliant' : 'No fines expected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Details */}
      <Card className="card-tasc">
        <CardHeader className="header-company-blue">
          <CardTitle className="text-white">Assessment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-700">Company</div>
              <div>{assessment.companyName}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Industry</div>
              <div>{assessment.industrySector}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Location</div>
              <Badge variant="outline" className="capitalize">
                {assessment.companyLocation}
              </Badge>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Assessment Date</div>
              <div>{new Date(assessment.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-tasc border-tasc-yellow">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-tasc-primary" />
            <h3 className="text-lg font-semibold text-tasc-primary mb-2">Book a Call</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get expert guidance on your compliance strategy
            </p>
            <Button 
              className="bg-[#FFC500] hover:bg-[#FFD700] text-black font-semibold w-full"
              onClick={() => window.open('https://calendly.com/nirbhay-tascoutsourcing/30-mins-emiratisation-strategy-session-clone', '_blank')}
            >
              Schedule Consultation
            </Button>
          </CardContent>
        </Card>

        <Card className="card-tasc border-tasc-primary">
          <CardContent className="pt-6 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-tasc-primary" />
            <h3 className="text-lg font-semibold text-tasc-primary mb-2">Call Now</h3>
            <p className="text-sm text-gray-600 mb-4">
              Speak with our Emiratisation specialists
            </p>
            <Button 
              className="bg-[#004267] hover:bg-[#007FAD] text-white font-semibold w-full"
              onClick={() => window.open('tel:+97143588500', '_self')}
            >
              +971 4 358 8500
            </Button>
          </CardContent>
        </Card>

        <Card className="card-tasc border-tasc-teal">
          <CardContent className="pt-6 text-center">
            <Download className="h-12 w-12 mx-auto mb-4 text-tasc-primary" />
            <h3 className="text-lg font-semibold text-tasc-primary mb-2">Download Guide</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get your detailed assessment report
            </p>
            <Button 
              onClick={downloadGuide}
              variant="outline" 
              className="w-full border-tasc-teal text-tasc-teal hover:bg-tasc-teal hover:text-white"
            >
              Download Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <div className="text-tasc-primary font-semibold text-lg mb-2">
          TASC Outsourcing
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your trusted partner for UAE Emiratisation compliance. We help businesses navigate 
          MoHRE regulations and implement sustainable workforce strategies.
        </p>
      </div>
    </div>
  );
}