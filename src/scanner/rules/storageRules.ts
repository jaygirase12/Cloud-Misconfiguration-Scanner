import { CloudConfiguration, Finding } from '../types';

export function evaluateStorageRules(config: CloudConfiguration, timestamp: string): Finding[] {
  const findings: Finding[] = [];

  // CHECK 1: STORAGE-001 - PUBLIC STORAGE ACCESS
  const isPublic = config.storage?.public_access === true;
  findings.push({
    id: `FND-STORAGE-001-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    checkId: 'STORAGE-001',
    category: 'Storage',
    title: isPublic ? 'Public Storage Access Enabled' : 'Public Storage Access Disabled',
    severity: 'HIGH',
    status: isPublic ? 'FAIL' : 'PASS',
    description: isPublic
      ? 'Publicly accessible storage can expose sensitive information to unauthorized users.'
      : 'Storage resources reject unrestricted anonymous access, protecting sensitive objects from unauthorized exposure.',
    evidence: `storage.public_access = ${config.storage?.public_access ?? 'undefined'}`,
    impact: isPublic
      ? 'Unrestricted internet read access permits data exfiltration, accidental leaks of credentials or customer PII, and regulatory non-compliance.'
      : 'Confidentiality of stored objects is preserved by enforcing identity boundaries.',
    recommendation: isPublic
      ? 'Review whether public access is required. Disable unnecessary public access and apply appropriate access controls.'
      : 'Maintain block-public-access controls and conduct periodic access reviews.',
    remediationSteps: [
      'Audit all bucket-level and object-level permissions.',
      'Enable global Block Public Access settings on storage accounts.',
      'Revoke public read/write access control lists (ACLs) and wildcards in bucket policies.',
      'Transition public assets to authenticated pre-signed URLs or dedicated CDN delivery.',
      'Re-run CloudGuard scan to verify compliance.'
    ],
    timestamp,
  });

  // CHECK 2: STORAGE-002 - STORAGE ENCRYPTION
  const isEncrypted = config.storage?.encryption_enabled === true;
  findings.push({
    id: `FND-STORAGE-002-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    checkId: 'STORAGE-002',
    category: 'Storage',
    title: isEncrypted ? 'Storage Encryption Enabled' : 'Storage Encryption Disabled',
    severity: 'MEDIUM',
    status: isEncrypted ? 'PASS' : 'FAIL',
    description: isEncrypted
      ? 'At-rest encryption is active across storage systems, ensuring data remains ciphered.'
      : 'Data stored without encryption may have reduced protection if unauthorized access occurs.',
    evidence: `storage.encryption_enabled = ${config.storage?.encryption_enabled ?? 'undefined'}`,
    impact: isEncrypted
      ? 'Data at rest is cryptographically protected against physical media extraction and unauthorized disk reads.'
      : 'Cleartext data at rest is vulnerable to exfiltration during snapshot breaches or physical disk compromises.',
    recommendation: isEncrypted
      ? 'Continue enforcing automated key rotation and monitoring encryption algorithms.'
      : 'Enable encryption for stored data where appropriate.',
    remediationSteps: [
      'Enable default server-side encryption (SSE-AES256 or customer-managed KMS keys) on all storage targets.',
      'Configure automated key rotation policies.',
      'Apply bucket policy conditions denying non-encrypted PutObject requests.',
      'Encrypt existing resting objects using batch migration.',
      'Re-run CloudGuard scan to verify compliance.'
    ],
    timestamp,
  });

  return findings;
}
