import { CloudConfiguration, Finding } from '../types';

export function evaluateNetworkRules(config: CloudConfiguration, timestamp: string): Finding[] {
  const findings: Finding[] = [];

  // CHECK 5: NETWORK-001 - UNRESTRICTED SSH ACCESS
  const hasUnrestrictedSsh = config.network?.unrestricted_ssh === true;
  findings.push({
    id: `FND-NETWORK-001-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    checkId: 'NETWORK-001',
    category: 'Network',
    title: hasUnrestrictedSsh ? 'Unrestricted SSH Access' : 'Restricted SSH Ingress Enforced',
    severity: 'HIGH',
    status: hasUnrestrictedSsh ? 'FAIL' : 'PASS',
    description: hasUnrestrictedSsh
      ? 'Unrestricted administrative network access can unnecessarily expose management services.'
      : 'Security groups and firewall rules restrict SSH access (TCP port 22) to designated internal CIDRs or private subnets.',
    evidence: `network.unrestricted_ssh = ${config.network?.unrestricted_ssh ?? 'undefined'}`,
    impact: hasUnrestrictedSsh
      ? 'Exposing port 22 directly to 0.0.0.0/0 opens cloud instances to continuous automated internet brute-force attacks, port scanners, and zero-day SSH vulnerabilities.'
      : 'Prevents untrusted internet endpoints from interacting with system-level terminal listeners.',
    recommendation: hasUnrestrictedSsh
      ? 'Restrict administrative access to trusted networks, VPNs, or approved source addresses.'
      : 'Maintain zero-trust network boundaries and deprecate direct internet ingress.',
    remediationSteps: [
      'Query virtual firewall / security group ingress rules for TCP port 22 mapped to 0.0.0.0/0 (IPv4) or ::/0 (IPv6).',
      'Delete the open ingress entry.',
      'Replace direct SSH access with an identity-aware proxy, AWS Systems Manager Session Manager, or VPN gateway CIDR.',
      'Enforce key-based authentication with passphrase and disable password login at the host level.',
      'Re-run CloudGuard scan to verify compliance.'
    ],
    timestamp,
  });

  return findings;
}
