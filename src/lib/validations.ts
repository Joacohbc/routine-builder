export type ValidationResult = { ok: true } | { ok: false; message: string };

// Generic validators
export const validators = {
  required: (value: string): ValidationResult => {
    if (!value || value.trim() === '') {
      return { ok: false, message: 'This field is required' };
    }
    return { ok: true };
  },

  minLength: (min: number) => (value: string): ValidationResult => {
    if (value.length < min) {
      return { ok: false, message: `Must be at least ${min} characters` };
    }
    return { ok: true };
  },

  maxLength: (max: number) => (value: string): ValidationResult => {
    if (value.length > max) {
      return { ok: false, message: `Must be at most ${max} characters` };
    }
    return { ok: true };
  },

  number: (value: string): ValidationResult => {
    const num = Number(value);
    if (isNaN(num)) {
      return { ok: false, message: 'Must be a valid number' };
    }
    return { ok: true };
  },

  integer: (value: string): ValidationResult => {
    const num = parseInt(value, 10);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { ok: false, message: 'Must be a valid integer' };
    }
    return { ok: true };
  },

  min: (min: number) => (value: string): ValidationResult => {
    const num = Number(value);
    if (isNaN(num)) {
      return { ok: false, message: 'Must be a valid number' };
    }
    if (num < min) {
      return { ok: false, message: `Must be at least ${min}` };
    }
    return { ok: true };
  },

  max: (max: number) => (value: string): ValidationResult => {
    const num = Number(value);
    if (isNaN(num)) {
      return { ok: false, message: 'Must be a valid number' };
    }
    if (num > max) {
      return { ok: false, message: `Must be at most ${max}` };
    }
    return { ok: true };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { ok: false, message: 'Must be a valid email address' };
    }
    return { ok: true };
  },

  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Must be a valid URL' };
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
      return { ok: false, message: 'Must be a valid number' };
    }
    if (num < 1) {
      return { ok: false, message: 'Must be at least 1' };
    }
    if (num > 9999) {
      return { ok: false, message: 'Must be at most 9999' };
    }
    return { ok: true };
  },

  icon: (value: string): ValidationResult => {
    if (value && value.length > 50) {
      return { ok: false, message: 'Icon name is too long' };
    }
    return { ok: true };
  },
};
