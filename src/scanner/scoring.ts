import { Finding, RiskLevel, Severity } from './types';

export const SEVERITY_DEDUCTIONS: Record<Severity, number> = {
  CRITICAL: 20,
  HIGH: 10,
  MEDIUM: 5,
  LOW: 2,
  INFO: 0,
};

export function calculateSecurityScore(findings: Finding[]): {
  score: number;
  riskLevel: RiskLevel;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  passedCount: number;
  failedCount: number;
} {
  let deduction = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;
  let passedCount = 0;
  let failedCount = 0;

  for (const finding of findings) {
    if (finding.status === 'PASS') {
      passedCount++;
      continue;
    }

    failedCount++;
    const pts = SEVERITY_DEDUCTIONS[finding.severity] ?? 0;
    deduction += pts;

    switch (finding.severity) {
      case 'CRITICAL':
        criticalCount++;
        break;
      case 'HIGH':
        highCount++;
        break;
      case 'MEDIUM':
        mediumCount++;
        break;
      case 'LOW':
        lowCount++;
        break;
      case 'INFO':
        infoCount++;
        break;
    }
  }

  const score = Math.max(0, 100 - deduction);

  let riskLevel: RiskLevel;
  if (score >= 80) {
    riskLevel = 'Low Risk';
  } else if (score >= 60) {
    riskLevel = 'Moderate Risk';
  } else if (score >= 40) {
    riskLevel = 'High Risk';
  } else {
    riskLevel = 'Critical Risk';
  }

  return {
    score,
    riskLevel,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    passedCount,
    failedCount,
  };
}

export function getRiskColor(riskLevel: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  accent: string;
} {
  switch (riskLevel) {
    case 'Low Risk':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        accent: '#10b981',
      };
    case 'Moderate Risk':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        accent: '#eab308',
      };
    case 'High Risk':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        accent: '#f97316',
      };
    case 'Critical Risk':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        accent: '#f43f5e',
      };
  }
}
