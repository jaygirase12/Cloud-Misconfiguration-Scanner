import { CloudConfiguration } from './types';

export interface ValidationSuccess {
  valid: true;
  config: CloudConfiguration;
  errors: [];
}

export interface ValidationFailure {
  valid: false;
  config: null;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function validateFileBasics(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided for security inspection.' };
  }

  if (!file.name.toLowerCase().endsWith('.json')) {
    return {
      valid: false,
      error: 'Invalid file format. CloudGuard accepts configuration files in .json format only.',
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The uploaded file is empty (0 bytes).' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 2 MB safety threshold (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { valid: true };
}

export function validateConfigurationJson(rawText: string): ValidationResult {
  const errors: string[] = [];

  if (!rawText || rawText.trim().length === 0) {
    return {
      valid: false,
      config: null,
      errors: ['Input configuration is empty.'],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    return {
      valid: false,
      config: null,
      errors: [
        `JSON syntax error: ${err instanceof Error ? err.message : 'Malformed JSON syntax.'}`,
      ],
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      config: null,
      errors: ['Configuration root must be a valid JSON object.'],
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Check top-level sections
  if (!obj.storage || typeof obj.storage !== 'object' || Array.isArray(obj.storage)) {
    errors.push("Missing or invalid 'storage' section. Expected object with storage properties.");
  } else {
    const storage = obj.storage as Record<string, unknown>;
    if (typeof storage.public_access !== 'boolean') {
      errors.push("Invalid 'storage.public_access'. Expected boolean (true or false).");
    }
    if (typeof storage.encryption_enabled !== 'boolean') {
      errors.push("Invalid 'storage.encryption_enabled'. Expected boolean (true or false).");
    }
  }

  if (!obj.identity || typeof obj.identity !== 'object' || Array.isArray(obj.identity)) {
    errors.push("Missing or invalid 'identity' section. Expected object with IAM properties.");
  } else {
    const identity = obj.identity as Record<string, unknown>;
    if (typeof identity.mfa_enabled !== 'boolean') {
      errors.push("Invalid 'identity.mfa_enabled'. Expected boolean (true or false).");
    }
    if (typeof identity.wildcard_permissions !== 'boolean') {
      errors.push("Invalid 'identity.wildcard_permissions'. Expected boolean (true or false).");
    }
  }

  if (!obj.network || typeof obj.network !== 'object' || Array.isArray(obj.network)) {
    errors.push("Missing or invalid 'network' section. Expected object with network properties.");
  } else {
    const network = obj.network as Record<string, unknown>;
    if (typeof network.unrestricted_ssh !== 'boolean') {
      errors.push("Invalid 'network.unrestricted_ssh'. Expected boolean (true or false).");
    }
  }

  if (!obj.logging || typeof obj.logging !== 'object' || Array.isArray(obj.logging)) {
    errors.push("Missing or invalid 'logging' section. Expected object with audit logging properties.");
  } else {
    const logging = obj.logging as Record<string, unknown>;
    if (typeof logging.audit_logging_enabled !== 'boolean') {
      errors.push("Invalid 'logging.audit_logging_enabled'. Expected boolean (true or false).");
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      config: null,
      errors,
    };
  }

  const validatedConfig: CloudConfiguration = {
    configuration_name:
      typeof obj.configuration_name === 'string'
        ? obj.configuration_name.trim()
        : 'Uploaded Cloud Configuration',
    storage: {
      public_access: Boolean((obj.storage as Record<string, unknown>).public_access),
      encryption_enabled: Boolean((obj.storage as Record<string, unknown>).encryption_enabled),
    },
    identity: {
      mfa_enabled: Boolean((obj.identity as Record<string, unknown>).mfa_enabled),
      wildcard_permissions: Boolean((obj.identity as Record<string, unknown>).wildcard_permissions),
    },
    network: {
      unrestricted_ssh: Boolean((obj.network as Record<string, unknown>).unrestricted_ssh),
      unrestricted_rdp:
        typeof (obj.network as Record<string, unknown>).unrestricted_rdp === 'boolean'
          ? Boolean((obj.network as Record<string, unknown>).unrestricted_rdp)
          : false,
    },
    logging: {
      audit_logging_enabled: Boolean(
        (obj.logging as Record<string, unknown>).audit_logging_enabled
      ),
    },
  };

  return {
    valid: true,
    config: validatedConfig,
    errors: [],
  };
}
