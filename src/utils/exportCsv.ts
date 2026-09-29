import { ScanResult } from '../scanner/types';

export function exportScanToCsv(scan: ScanResult): void {
  const headers = [
    'Scan ID',
    'Configuration Name',
    'Scan Timestamp',
    'Security Score',
    'Risk Level',
    'Check ID',
    'Category',
    'Title',
    'Status',
    'Severity',
    'Evidence',
    'Impact',
    'Recommendation',
    'Remediation Steps',
  ];

  const escapeCell = (val: string | number | undefined): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = scan.findings.map((f) => [
    escapeCell(scan.scanId),
    escapeCell(scan.configurationName),
    escapeCell(scan.timestamp),
    escapeCell(scan.securityScore),
    escapeCell(scan.riskLevel),
    escapeCell(f.checkId),
    escapeCell(f.category),
    escapeCell(f.title),
    escapeCell(f.status),
    escapeCell(f.severity),
    escapeCell(f.evidence),
    escapeCell(f.impact),
    escapeCell(f.recommendation),
    escapeCell(f.remediationSteps.join('; ')),
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const filename = `cloudguard-audit-${scan.scanId.toLowerCase()}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
