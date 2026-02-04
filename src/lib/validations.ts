export type ValidationResult =
  | { ok: true }
  | { ok: false; error: { key: string; params?: Record<string, string | number> } };

// Generic validators
export const validators = {
  required: (value: unknown): ValidationResult => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return { ok: false, error: { key: 'validations.required' } };
    }
    if (Array.isArray(value) && value.length === 0) {
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

  minArrayLength: (min: number) => (value: unknown): ValidationResult => {
      if (!Array.isArray(value)) {
          return { ok: false, error: { key: 'validations.array' } };
      }
      if (value.length < min) {
          return { ok: false, error: { key: 'validations.minArray', params: { min } } };
      }
      return { ok: true };
  }
};

// Compose multiple validators
export function composeValidators(...validators: ((value: any) => ValidationResult)[]): (value: any) => ValidationResult {
  return (value: any) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.ok) {
        return result;
      }
    }
    return { ok: true };
  };
}

// Helpers
export function validateSchema<T>(data: T, schema: Partial<Record<keyof T, (value: any) => ValidationResult>>): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const key in schema) {
        const validator = schema[key];
        if (validator) {
            const result = validator(data[key]);
            if (!result.ok) {
                // Return the error key directly; hydration happens in UI with t()
                // But wait, the UI code expects existing validators to return t() key?
                // The ValidationResult returns { key, params }.
                // To keep it simple for hooks (backend-ish), we might return the result object.
                // But for `validateSchema` usage in Hooks, we might want to throw an error containing all failures.

                // Let's make validateSchema return a map of field -> errorKey for now.
                // Note: The caller will need to translate this.
                errors[key as string] = result.error.key;
            }
        }
    }

    // For now, we return errors map. If empty, valid.
    return errors;
}

// Entity Validators

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

export const tagValidators = {
    name: composeValidators(
        validators.required,
        validators.minLength(1),
        validators.maxLength(30)
    ),
    color: validators.required
};

export const exerciseValidators = {
    title: composeValidators(
        validators.required,
        validators.minLength(1),
        validators.maxLength(100)
    ),
    tagIds: composeValidators(
        validators.required,
        validators.minArrayLength(1)
    )
};

export const routineValidators = {
    name: composeValidators(
        validators.required,
        validators.minLength(1),
        validators.maxLength(100)
    ),
    series: (value: unknown): ValidationResult => {
        if (!Array.isArray(value)) return { ok: false, error: { key: 'validations.array' } };
        if (value.length === 0) return { ok: false, error: { key: 'validations.minArray', params: { min: 1 } } };

        // Deep check: every series must have exercises
        for (const s of value) {
            if (!s.exercises || s.exercises.length === 0) {
                 return { ok: false, error: { key: 'validations.emptySeries' } };
            }
        }

        return { ok: true };
    }
};
