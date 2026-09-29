import { jsPDF } from 'jspdf';
import { ScanResult } from '../scanner/types';

export function exportScanToPdf(scan: ScanResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 6;
      // Add page header
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 155);
      doc.text('CLOUDGUARD – Educational Cloud Security Configuration Audit Report', margin, margin);
      doc.setDrawColor(40, 50, 65);
      doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
    }
  };

  // Top Dark Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Title & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('CLOUDGUARD', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text('Cloud Misconfiguration Scanner', margin + 44, 15);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('An Educational Cloud Security Configuration Auditing Tool', margin, 22);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date(scan.timestamp).toUTCString()} | Scan ID: ${scan.scanId}`, margin, 30);

  y = 46;

  // Disclaimer Box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('AUDIT DISCLAIMER:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const disclaimer =
    'This report is generated from configuration data. CloudGuard is a defensive cybersecurity Cloud Misconfiguration Scanner.';
  const wrappedDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin - 6);
  doc.text(wrappedDisclaimer, margin + 3, y + 9);

  y += 20;

  // Executive Summary Panel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Audit Summary', margin, y);
  y += 5;

  // Summary Metrics Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'FD');

  // Score Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  const scoreColor =
    scan.securityScore >= 80
      ? [16, 185, 129]
      : scan.securityScore >= 60
      ? [202, 138, 4]
      : [225, 29, 72];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${scan.securityScore}/100`, margin + 6, y + 15);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Risk Level: ${scan.riskLevel}`, margin + 6, y + 23);

  // Column 2: Scan details
  const col2X = margin + 55;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Environment: ${scan.configurationName.substring(0, 34)}`, col2X, y + 8);
  doc.text(`Total Checks Run: ${scan.totalChecks}`, col2X, y + 14);
  doc.text(`Passed Checks: ${scan.passedChecks}`, col2X, y + 20);
  doc.text(`Failed Checks: ${scan.failedChecks}`, col2X, y + 26);

  // Column 3: Severity Breakdown
  const col3X = margin + 125;
  doc.text(`Critical Findings: ${scan.criticalCount}`, col3X, y + 8);
  doc.text(`High Findings: ${scan.highCount}`, col3X, y + 14);
  doc.text(`Medium Findings: ${scan.mediumCount}`, col3X, y + 20);
  doc.text(`Low / Info Findings: ${scan.lowCount + scan.infoCount}`, col3X, y + 26);

  y += 38;

  // Detailed Findings Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Security Findings & Compliance Checks', margin, y);
  y += 6;

  scan.findings.forEach((finding, index) => {
    checkPageBreak(38);

    const isPass = finding.status === 'PASS';
    doc.setFillColor(isPass ? 240 : 255, isPass ? 253 : 241, isPass ? 244 : 242);
    doc.setDrawColor(isPass ? 187 : 254, isPass ? 247 : 205, isPass ? 208 : 211);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'FD');

    // Header of finding card
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(isPass ? 21 : 159, isPass ? 128 : 18, isPass ? 61 : 57);
    doc.text(
      `[${finding.status}] ${finding.checkId} – ${finding.title}`,
      margin + 4,
      y + 6
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Category: ${finding.category} | Severity: ${finding.severity}`, pageWidth - margin - 52, y + 6);

    // Finding description
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(finding.description, pageWidth - 2 * margin - 8);
    doc.text(descLines.slice(0, 2), margin + 4, y + 12);

    // Evidence
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Evidence: ', margin + 4, y + 20);
    doc.setFont('courier', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(finding.evidence, margin + 20, y + 20);

    // Recommendation
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Remediation: ', margin + 4, y + 26);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const recLines = doc.splitTextToSize(finding.recommendation, pageWidth - 2 * margin - 26);
    doc.text(recLines[0] || '', margin + 24, y + 26);

    y += 36;
  });

  // Footer Disclaimer
  checkPageBreak(24);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const footerNote =
    'CloudGuard Project Viva Report | Educational Cloud Security Misconfiguration Auditing System. No cloud credentials were used or requested during the execution of this evaluation.';
  doc.text(footerNote, margin, y);

  doc.save(`cloudguard-report-${scan.scanId.toLowerCase()}.pdf`);
}
