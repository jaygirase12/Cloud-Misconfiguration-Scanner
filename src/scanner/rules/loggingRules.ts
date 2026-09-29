import { CloudConfiguration, Finding } from '../types';

export function evaluateLoggingRules(config: CloudConfiguration, timestamp: string): Finding[] {
  const findings: Finding[] = [];

  // CHECK 6: LOGGING-001 - AUDIT LOGGING
  const loggingDisabled = config.logging?.audit_logging_enabled === false;
  findings.push({
    id: `FND-LOGGING-001-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    checkId: 'LOGGING-001',
    category: 'Logging',
    title: loggingDisabled ? 'Audit Logging Disabled' : 'Audit Logging Active',
    severity: 'MEDIUM',
    status: loggingDisabled ? 'FAIL' : 'PASS',
    description: loggingDisabled
      ? 'Without audit logging, security investigations and detection of suspicious activity become more difficult.'
      : 'Control plane audit logging is fully enabled across regions, maintaining comprehensive chronological event records.',
    evidence: `logging.audit_logging_enabled = ${config.logging?.audit_logging_enabled ?? 'undefined'}`,
    impact: loggingDisabled
      ? 'In the event of an unauthorized access event or intrusion, incident responders cannot establish attribution, timeline, or scope of compromised assets.'
      : 'Enables real-time security alerting, post-incident root cause forensics, and compliance accountability.',
    recommendation: loggingDisabled
      ? 'Enable appropriate audit logging and establish log review/monitoring processes.'
      : 'Regularly test audit trail integrity and forward events to a centralized SIEM or log archive.',
    remediationSteps: [
      'Enable management event audit logging across all active regions (e.g. AWS CloudTrail, Azure Activity Log, GCP Cloud Audit).',
      'Target log streams to a dedicated, encrypted centralized log archive bucket with Object Lock / immutability.',
      'Enable log file validation to detect any post-tampering alterations.',
      'Configure real-time monitoring and alerting rules on critical security events (e.g., IAM role changes, security group alterations).',
      'Re-run CloudGuard scan to verify compliance.'
    ],
    timestamp,
  });

  return findings;
}
