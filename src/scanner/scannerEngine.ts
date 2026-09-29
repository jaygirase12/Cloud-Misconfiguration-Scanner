import { evaluateIdentityRules } from './rules/identityRules';
import { evaluateLoggingRules } from './rules/loggingRules';
import { evaluateNetworkRules } from './rules/networkRules';
import { evaluateStorageRules } from './rules/storageRules';
import { calculateSecurityScore } from './scoring';
import { CloudConfiguration, Finding, ScanResult } from './types';

export function runSecurityScan(
  config: CloudConfiguration,
  overrideName?: string
): ScanResult {
  const timestamp = new Date().toISOString();
  const scanId = `SCAN-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  const findings: Finding[] = [
    ...evaluateStorageRules(config, timestamp),
    ...evaluateIdentityRules(config, timestamp),
    ...evaluateNetworkRules(config, timestamp),
    ...evaluateLoggingRules(config, timestamp),
  ];

  const scoreData = calculateSecurityScore(findings);

  const configurationName =
    overrideName || config.configuration_name || 'Simulated Cloud Environment';

  return {
    scanId,
    configurationName,
    timestamp,
    securityScore: scoreData.score,
    riskLevel: scoreData.riskLevel,
    totalChecks: findings.length,
    passedChecks: scoreData.passedCount,
    failedChecks: scoreData.failedCount,
    criticalCount: scoreData.criticalCount,
    highCount: scoreData.highCount,
    mediumCount: scoreData.mediumCount,
    lowCount: scoreData.lowCount,
    infoCount: scoreData.infoCount,
    findings,
    rawConfig: config,
  };
}
