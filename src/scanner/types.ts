export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type CheckCategory = 'Storage' | 'Identity' | 'Network' | 'Logging';

export type CheckStatus = 'PASS' | 'FAIL';

export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';

export interface StorageConfig {
  public_access: boolean;
  encryption_enabled: boolean;
}

export interface IdentityConfig {
  mfa_enabled: boolean;
  wildcard_permissions: boolean;
}

export interface NetworkConfig {
  unrestricted_ssh: boolean;
  unrestricted_rdp?: boolean;
}

export interface LoggingConfig {
  audit_logging_enabled: boolean;
}

export interface CloudConfiguration {
  configuration_name?: string;
  storage: StorageConfig;
  identity: IdentityConfig;
  network: NetworkConfig;
  logging: LoggingConfig;
}

export interface Finding {
  id: string;
  checkId: string;
  category: CheckCategory;
  title: string;
  severity: Severity;
  status: CheckStatus;
  description: string;
  evidence: string;
  impact: string;
  recommendation: string;
  remediationSteps: string[];
  timestamp: string;
}

export interface ScanResult {
  scanId: string;
  configurationName: string;
  timestamp: string;
  securityScore: number;
  riskLevel: RiskLevel;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  findings: Finding[];
  rawConfig: CloudConfiguration;
}

export interface ScanRecordSummary {
  userId: string;
  scanId: string;
  timestamp: string;
  configurationName: string;
  securityScore: number;
  riskLevel: RiskLevel;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  findings?: Finding[];
}
