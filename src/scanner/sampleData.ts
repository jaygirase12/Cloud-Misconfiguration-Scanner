import { CloudConfiguration } from './types';

export const SECURE_SAMPLE_CONFIG: CloudConfiguration = {
  configuration_name: 'Enterprise Hardened Cloud Environment (Simulated)',
  storage: {
    public_access: false,
    encryption_enabled: true,
  },
  identity: {
    mfa_enabled: true,
    wildcard_permissions: false,
  },
  network: {
    unrestricted_ssh: false,
    unrestricted_rdp: false,
  },
  logging: {
    audit_logging_enabled: true,
  },
};

export const MODERATE_SAMPLE_CONFIG: CloudConfiguration = {
  configuration_name: 'Staging Environment with Logging Gaps (Simulated)',
  storage: {
    public_access: false,
    encryption_enabled: false,
  },
  identity: {
    mfa_enabled: true,
    wildcard_permissions: false,
  },
  network: {
    unrestricted_ssh: false,
    unrestricted_rdp: false,
  },
  logging: {
    audit_logging_enabled: false,
  },
};

export const HIGH_RISK_SAMPLE_CONFIG: CloudConfiguration = {
  configuration_name: 'Insecure Legacy Cloud Deployment (Simulated)',
  storage: {
    public_access: true,
    encryption_enabled: false,
  },
  identity: {
    mfa_enabled: false,
    wildcard_permissions: true,
  },
  network: {
    unrestricted_ssh: true,
    unrestricted_rdp: true,
  },
  logging: {
    audit_logging_enabled: false,
  },
};
