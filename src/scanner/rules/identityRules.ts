import { CloudConfiguration, Finding } from '../types';

export function evaluateIdentityRules(config: CloudConfiguration, timestamp: string): Finding[] {
  const findings: Finding[] = [];

  // CHECK 3: IDENTITY-001 - MULTI-FACTOR AUTHENTICATION
  const mfaDisabled = config.identity?.mfa_enabled === false;
  findings.push({
    id: `FND-IDENTITY-001-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    checkId: 'IDENTITY-001',
    category: 'Identity',
    title: mfaDisabled ? 'Multi-Factor Authentication Disabled' : 'Multi-Factor Authentication Enforced',
    severity: 'HIGH',
    status: mfaDisabled ? 'FAIL' : 'PASS',
    description: mfaDisabled
      ? 'Password-only authentication provides less protection against compromised credentials.'
      : 'Multi-factor authentication (MFA) is strictly enforced for user accounts and console logins.',
    evidence: `identity.mfa_enabled = ${config.identity?.mfa_enabled ?? 'undefined'}`,
    impact: mfaDisabled
      ? 'Single-factor authentication leaves the cloud management console vulnerable to credential stuffing, password spray, and phishing attacks.'
      : 'Account takeover risk is substantially mitigated via cryptographic or time-based one-time password (TOTP) secondary factors.',
    recommendation: mfaDisabled
      ? 'Enable MFA for privileged and sensitive accounts.'
      : 'Maintain mandatory MFA policies and support FIDO2 / hardware security keys.',
    remediationSteps: [
      'Locate all root and IAM user identities operating without an active MFA device.',
      'Enforce organization-wide conditional access requiring MFA upon console sign-in.',
      'Require virtual authenticator apps (TOTP) or hardware security keys (FIDO2/WebAuthn).',
      'Create an IAM policy condition explicitly denying sensitive actions when aws:MultiFactorAuthPresent is false.',
      'Re-run CloudGuard scan to verify compliance.'
    ],
    timestamp,
  });

  // CHECK 4: IDENTITY-002 - WILDCARD PERMISSIONS
  const hasWildcard = config.identity?.wildcard_permissions === true;
  findings.push({
    id: `FND-IDENTITY-002-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    checkId: 'IDENTITY-002',
    category: 'Identity',
    title: hasWildcard ? 'Excessive Wildcard Permissions' : 'Least-Privilege Permissions Enforced',
    severity: 'HIGH',
    status: hasWildcard ? 'FAIL' : 'PASS',
    description: hasWildcard
      ? 'Overly broad permissions can violate least-privilege principles and increase the potential impact of compromised credentials.'
      : 'IAM policies restrict user and role privileges to specific, necessary actions and targets without wildcard over-entitlement.',
    evidence: `identity.wildcard_permissions = ${config.identity?.wildcard_permissions ?? 'undefined'}`,
    impact: hasWildcard
      ? 'If an over-permissioned key or role is intercepted by an attacker, they can perform unauthorized reconnaissance, privilege escalation, and resource deletion.'
      : 'Limits blast radius in the event of an identity compromise to narrowly scoped actions.',
    recommendation: hasWildcard
      ? 'Replace broad permissions with only the actions and resources actually required.'
      : 'Conduct periodic IAM access analyzer reviews and prune unused privileges.',
    remediationSteps: [
      'Perform an IAM policy audit for occurrences of Action: "*" and Resource: "*".',
      'Review historical audit logs (CloudTrail/Cloud Audit) to discover exact API calls required by workloads.',
      'Generate least-privilege customer-managed policies scoped strictly to required services and resource ARNs.',
      'Remove broad administrative managed policies from standard application service roles.',
      'Re-run CloudGuard scan to verify compliance.'
    ],
    timestamp,
  });

  return findings;
}
