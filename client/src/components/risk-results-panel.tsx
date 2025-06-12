import { TrendingUp, Info, Download, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Assessment } from "@shared/schema";

interface RiskResultsPanelProps {
  assessment: Assessment | null;
}

export default function RiskResultsPanel({ assessment }: RiskResultsPanelProps) {
  if (!assessment) {
    return (
      <Card className="shadow-sm border border-gray-200 sticky top-6">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Info className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Complete the form to see your risk assessment results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-success-500';
      case 'medium':
        return 'bg-warning-500';
      case 'high':
        return 'bg-error-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-success-600';
      case 'medium':
        return 'text-warning-600';
      case 'high':
        return 'text-error-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskDescription = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'Your company meets emiratisation requirements';
      case 'medium':
        return 'Your company approaches the emiratisation threshold';
      case 'high':
        return 'Your company exceeds the emiratisation threshold';
      default:
        return 'Risk level assessment completed';
    }
  };

  const getRecommendations = (assessment: Assessment) => {
    const gap = assessment.currentEmirates - assessment.requiredEmirates;
    const recommendations = [];

    if (gap < 0) {
      recommendations.push(`Hire ${Math.abs(gap)} additional Emirati employees`);
    }
    
    if (assessment.riskLevel === 'high') {
      recommendations.push('Consider training programs for Emirati nationals');
      recommendations.push('Review emiratisation strategy with HR department');
      recommendations.push('Contact authorities for compliance guidance');
    } else if (assessment.riskLevel === 'medium') {
      recommendations.push('Monitor hiring trends closely');
      recommendations.push('Develop Emirati talent pipeline');
    } else {
      recommendations.push('Maintain current emiratisation levels');
      recommendations.push('Consider best practices sharing');
    }

    return recommendations;
  };

  const exportReport = () => {
    const reportData = {
      assessmentDate: new Date().toLocaleDateString(),
      totalEmployees: assessment.totalEmployees,
      skilledEmployees: assessment.skilledEmployees,
      unskilledEmployees: assessment.unskilledEmployees,
      currentEmirates: assessment.currentEmirates,
      requiredEmirates: assessment.requiredEmirates,
      gap: assessment.currentEmirates - assessment.requiredEmirates,
      riskLevel: assessment.riskLevel,
      riskPercentage: assessment.riskPercentage,
      potentialFine: assessment.potentialFine,
      jurisdiction: assessment.jurisdiction,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emiratisation-assessment-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gap = assessment.currentEmirates - assessment.requiredEmirates;

  return (
    <Card className="shadow-sm border border-gray-200 sticky top-6">
      <CardHeader>
        <CardTitle className="text-center">
          <TrendingUp className="h-8 w-8 text-primary-500 mx-auto mb-3" />
          Risk Assessment Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Risk Level Indicator */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 transition-colors ${getRiskColor(assessment.riskLevel)}`}>
            <span className="text-2xl font-bold text-white">
              {Math.round(assessment.riskPercentage)}%
            </span>
          </div>
          <div className={`text-lg font-semibold mb-2 capitalize ${getRiskTextColor(assessment.riskLevel)}`}>
            {assessment.riskLevel} Risk
          </div>
          <div className="text-sm text-gray-600">
            {getRiskDescription(assessment.riskLevel)}
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Employees:</span>
            <span className="font-semibold">{assessment.totalEmployees}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Required Emiratis:</span>
            <span className="font-semibold">{assessment.requiredEmirates}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Current Emiratis:</span>
            <span className="font-semibold">{assessment.currentEmirates}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Gap:</span>
            <span className={`font-semibold ${gap >= 0 ? 'text-success-600' : 'text-error-500'}`}>
              {gap > 0 ? `+${gap}` : gap}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Potential Fine:</span>
            <span className="font-semibold text-error-500">
              AED {assessment.potentialFine.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Recommendations
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {getRecommendations(assessment).map((recommendation, index) => (
              <li key={index}>• {recommendation}</li>
            ))}
          </ul>
        </div>

        {/* Export Button */}
        <Button
          onClick={exportReport}
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </CardContent>
    </Card>
  );
}
