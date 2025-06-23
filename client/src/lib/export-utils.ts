import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Assessment } from "@shared/schema";

export const exportToPDF = (assessment: Assessment) => {
  const doc = new jsPDF();
  
  // TASC branding colors
  const primaryBlue: [number, number, number] = [0, 66, 103]; // #004267
  const yellow: [number, number, number] = [255, 197, 0]; // #FFC500
  
  // Header section
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("UAE Emiratisation Compliance Report", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("TASC Outsourcing - Expert Compliance Solutions", 20, 32);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Company Information
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Company Assessment Details", 20, 55);
  
  const companyData = [
    ["Company Name", assessment.companyName],
    ["Contact Person", `${assessment.firstName} ${assessment.lastName}`],
    ["Email", assessment.email],
    ["Phone", assessment.phone],
    ["Industry Sector", assessment.industrySector],
    ["Location", assessment.companyLocation.charAt(0).toUpperCase() + assessment.companyLocation.slice(1)],
    ["Assessment Date", new Date(assessment.createdAt).toLocaleDateString()]
  ];

  autoTable(doc, {
    startY: 65,
    head: [["Field", "Details"]],
    body: companyData,
    theme: "grid",
    headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });

  // Workforce Statistics
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Workforce Statistics", 20, (doc as any).lastAutoTable.finalY + 20);

  const workforceData = [
    ["Total Employees", assessment.totalEmployees.toString()],
    ["Skilled Employees", assessment.skilledEmployees.toString()],
    ["Emirati Employees", assessment.emiratiEmployees.toString()],
    ["Emiratisation Percentage", `${((assessment.emiratiEmployees / assessment.totalEmployees) * 100).toFixed(1)}%`],
    ["WPS & GPSSA Compliant", assessment.wpsGpssaCompliant ? "Yes" : "No"],
    ["Emiratis in Skilled Roles", assessment.emiratisInSkilledRoles ? "Yes" : "No"]
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 30,
    head: [["Metric", "Value"]],
    body: workforceData,
    theme: "grid",
    headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  });

  // Risk Assessment Results
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Risk Assessment Results", 20, (doc as any).lastAutoTable.finalY + 20);

  // Risk level color coding
  let riskColor: [number, number, number];
  switch (assessment.riskLevel) {
    case "high":
      riskColor = [220, 53, 69]; // Red
      break;
    case "medium":
      riskColor = [255, 193, 7]; // Yellow
      break;
    case "low":
      riskColor = [40, 167, 69]; // Green
      break;
    default:
      riskColor = [108, 117, 125]; // Gray
  }

  const riskData = [
    ["Risk Level", assessment.riskLevel.toUpperCase()],
    ["Risk Score", `${assessment.riskScore}/100`],
    ["Potential Fine", `AED ${assessment.fineEstimate.toLocaleString()}`],
    ["MoHRE Compliance Status", assessment.riskLevel === "low" ? "Compliant" : "Non-Compliant"]
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 30,
    head: [["Assessment", "Result"]],
    body: riskData,
    theme: "grid",
    headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
    didParseCell: function(data) {
      if (data.row.index === 0 && data.column.index === 1) {
        data.cell.styles.fillColor = [riskColor[0], riskColor[1], riskColor[2]];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  // Recommendations section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance Recommendations", 20, (doc as any).lastAutoTable.finalY + 20);

  const recommendations = getRecommendations(assessment);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 30,
    head: [["Priority", "Recommendation"]],
    body: recommendations.map((rec, index) => [`${index + 1}`, rec]),
    theme: "grid",
    headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 150 }
    }
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(yellow[0], yellow[1], yellow[2]);
  doc.rect(0, pageHeight - 25, 210, 25, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TASC Outsourcing | +971 4 358 8500 | www.tascoutsourcing.com", 20, pageHeight - 15);
  doc.text("Expert UAE Emiratisation Compliance Solutions", 20, pageHeight - 8);

  // Save the PDF
  const fileName = `emiratisation-compliance-report-${assessment.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportToExcel = (assessment: Assessment) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Company Information Sheet
  const companyInfo = [
    ["UAE Emiratisation Compliance Report"],
    ["Generated by TASC Outsourcing"],
    [""],
    ["Company Details"],
    ["Company Name", assessment.companyName],
    ["Contact Person", `${assessment.firstName} ${assessment.lastName}`],
    ["Email", assessment.email],
    ["Phone", assessment.phone],
    ["Industry Sector", assessment.industrySector],
    ["Location", assessment.companyLocation],
    ["Assessment Date", new Date(assessment.createdAt).toLocaleDateString()],
    [""],
    ["Workforce Statistics"],
    ["Total Employees", assessment.totalEmployees],
    ["Skilled Employees", assessment.skilledEmployees],
    ["Emirati Employees", assessment.emiratiEmployees],
    ["Emiratisation Percentage", `${((assessment.emiratiEmployees / assessment.totalEmployees) * 100).toFixed(1)}%`],
    ["WPS & GPSSA Compliant", assessment.wpsGpssaCompliant ? "Yes" : "No"],
    ["Emiratis in Skilled Roles", assessment.emiratisInSkilledRoles ? "Yes" : "No"],
    [""],
    ["Risk Assessment"],
    ["Risk Level", assessment.riskLevel.toUpperCase()],
    ["Risk Score", `${assessment.riskScore}/100`],
    ["Potential Fine (AED)", assessment.fineEstimate],
    ["MoHRE Compliance Status", assessment.riskLevel === "low" ? "Compliant" : "Non-Compliant"]
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(companyInfo);
  
  // Set column widths
  ws1['!cols'] = [
    { width: 25 },
    { width: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws1, "Assessment Summary");

  // Recommendations Sheet
  const recommendations = getRecommendations(assessment);
  const recData = [
    ["Compliance Recommendations"],
    ["Priority", "Recommendation"],
    ...recommendations.map((rec, index) => [index + 1, rec])
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(recData);
  ws2['!cols'] = [
    { width: 10 },
    { width: 80 }
  ];

  XLSX.utils.book_append_sheet(wb, ws2, "Recommendations");

  // Detailed Analysis Sheet
  const detailedAnalysis = [
    ["Detailed Emiratisation Analysis"],
    [""],
    ["Current Status"],
    ["Metric", "Current", "Required", "Gap"],
    ["Emiratisation %", `${((assessment.emiratiEmployees / assessment.totalEmployees) * 100).toFixed(1)}%`, "8%", 
     `${(8 - ((assessment.emiratiEmployees / assessment.totalEmployees) * 100)).toFixed(1)}%`],
    ["Emirati Count", assessment.emiratiEmployees, Math.ceil(assessment.totalEmployees * 0.08), 
     Math.max(0, Math.ceil(assessment.totalEmployees * 0.08) - assessment.emiratiEmployees)],
    [""],
    ["Compliance Factors"],
    ["Factor", "Status", "Impact"],
    ["WPS Compliance", assessment.wpsGpssaCompliant ? "Compliant" : "Non-Compliant", assessment.wpsGpssaCompliant ? "Positive" : "High Risk"],
    ["GPSSA Compliance", assessment.wpsGpssaCompliant ? "Compliant" : "Non-Compliant", assessment.wpsGpssaCompliant ? "Positive" : "High Risk"],
    ["Skilled Role Placement", assessment.emiratisInSkilledRoles ? "Yes" : "No", assessment.emiratisInSkilledRoles ? "Positive" : "Medium Risk"],
    ["Location", assessment.companyLocation === "freezone" ? "Free Zone" : "Mainland", 
     assessment.companyLocation === "freezone" ? "Exempt" : "Subject to Rules"]
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(detailedAnalysis);
  ws3['!cols'] = [
    { width: 20 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws3, "Detailed Analysis");

  // Save the Excel file
  const fileName = `emiratisation-compliance-report-${assessment.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

const getRecommendations = (assessment: Assessment): string[] => {
  const recommendations: string[] = [];
  
  if (assessment.riskLevel === "high") {
    recommendations.push("Immediate action required: Hire Emiratis to meet minimum 8% requirement");
    recommendations.push("Implement emergency recruitment plan for Emirati candidates");
    recommendations.push("Contact MoHRE to discuss compliance timeline and avoid penalties");
  }
  
  if (assessment.riskLevel === "medium") {
    recommendations.push("Develop 6-month plan to increase Emirati workforce to meet 8% target");
    recommendations.push("Partner with Emirates National Development Programme (ENDP)");
  }

  if (!assessment.wpsGpssaCompliant) {
    recommendations.push("Ensure full WPS (Wage Protection System) compliance");
    recommendations.push("Complete GPSSA (General Pension and Social Security Authority) registration");
  }

  if (!assessment.emiratisInSkilledRoles && assessment.emiratiEmployees > 0) {
    recommendations.push("Provide training to place Emiratis in skilled/supervisory positions");
    recommendations.push("Develop career progression paths for Emirati employees");
  }

  if (assessment.totalEmployees >= 50) {
    recommendations.push("Consider establishing Emiratisation committee for workforce planning");
    recommendations.push("Implement regular monitoring and reporting systems");
  }

  recommendations.push("Regular compliance audits to maintain good standing with MoHRE");
  recommendations.push("Consider partnering with TASC Outsourcing for ongoing compliance support");

  return recommendations;
};