export type ValidationResult =
  | { ok: true }
  | { ok: false; error: { key: string; params?: Record<string, string | number> } };

// Generic validators
export const validators = {
  required: (value: unknown): ValidationResult => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return { ok: false, error: { key: 'validations.required' } };
    }
    return { ok: true };
  },

  minLength: (min: number) => (value: unknown): ValidationResult => {
    const strVal = String(value || '');
    if (strVal.length < min) {
      return { ok: false, error: { key: 'validations.minLength', params: { min } } };
    }
    return { ok: true };
  },

  maxLength: (max: number) => (value: unknown): ValidationResult => {
    const strVal = String(value || '');
    if (strVal.length > max) {
      return { ok: false, error: { key: 'validations.maxLength', params: { max } } };
    }
    return { ok: true };
  },

  number: (value: unknown): ValidationResult => {
    const num = Number(value);
    if (isNaN(num)) {
      return { ok: false, error: { key: 'validations.number' } };
    }
    return { ok: true };
  },

  integer: (value: unknown): ValidationResult => {
    const num = parseInt(String(value), 10);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { ok: false, error: { key: 'validations.integer' } };
    }
    return { ok: true };
  },

  min: (min: number) => (value: unknown): ValidationResult => {
    const num = Number(value);
    if (isNaN(num)) {
      return { ok: false, error: { key: 'validations.number' } };
    }
    if (num < min) {
      return { ok: false, error: { key: 'validations.min', params: { min } } };
    }
    return { ok: true };
  },

  max: (max: number) => (value: string): ValidationResult => {
    const num = Number(value);
    if (isNaN(num)) {
      return { ok: false, error: { key: 'validations.number' } };
    }
    if (num > max) {
      return { ok: false, error: { key: 'validations.max', params: { max } } };
    }
    return { ok: true };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { ok: false, error: { key: 'validations.email' } };
    }
    return { ok: true };
  },

  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { ok: true };
    } catch {
      return { ok: false, error: { key: 'validations.url' } };
    }
  },
};

// Compose multiple validators
export function composeValidators(...validators: ((value: string) => ValidationResult)[]): (value: string) => ValidationResult {
  return (value: string) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.ok) {
        return result;
      }
    }
    return { ok: true };
  };
}

// InventoryItem specific validators
export const inventoryValidators = {
  name: composeValidators(
    validators.required,
    validators.minLength(1),
    validators.maxLength(100)
  ),

  quantity: (value: string): ValidationResult => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return { ok: false, error: { key: 'validations.number' } };
    }
    if (num < 1) {
      return { ok: false, error: { key: 'validations.min', params: { min: 1 } } };
    }
    if (num > 9999) {
      return { ok: false, error: { key: 'validations.max', params: { max: 9999 } } };
    }
    return { ok: true };
  },

  icon: (value: string): ValidationResult => {
    if (value && value.length > 50) {
      return { ok: false, error: { key: 'validations.iconTooLong' } };
    }
    return { ok: true };
  },
};
