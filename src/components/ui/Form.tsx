import type { ReactNode, ComponentProps } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ValidationResult } from '@/lib/validations';
import { IconPicker } from '@/components/ui/IconPicker';

export type FormFieldValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;

type FormContextType = {
  values: FormFieldValues;
  errors: FormErrors;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error?: string) => void;
  registerField: (name: string, defaultValue?: unknown) => void;
  unregisterField: (name: string) => void;
  isSubmitting: boolean;
};

const FormContext = createContext<FormContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form components must be used within a Form');
  }
  return context;
}

interface FormProps {
  children: ReactNode;
  onSubmit: (values: FormFieldValues) => Promise<void> | void;
  className?: string;
  defaultValues?: FormFieldValues;
  submitLabel?: string;
}

export function Form({ children, onSubmit, className, defaultValues, submitLabel }: FormProps) {
  const [values, setValues] = useState<FormFieldValues>(defaultValues || {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: string, error?: string) => {
    setErrors(prev => {
      if (prev[name] === error) return prev;
      return { ...prev, [name]: error };
    });
  }, []);

  const registerField = useCallback((name: string, defaultValue?: unknown) => {
    setValues(prev => {
      if (prev[name] !== undefined) return prev;
      return { ...prev, [name]: defaultValue };
    });
  }, []);

  const unregisterField = useCallback((name: string) => {
    setValues(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    
    // Check if any error exists
    const hasErrors = Object.keys(errors).some(key => !!errors[key]);
    
    if (hasErrors) {
      console.warn("Form submission blocked due to validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider value={{ values, errors, setFieldValue, setFieldError, registerField, unregisterField, isSubmitting }}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
        {submitLabel && (
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    </FormContext.Provider>
  );
}

// --- Form.Field ---
interface FormFieldProps {
  name: string;
  defaultValue?: unknown;
  validator?: (value: unknown) => ValidationResult;
  children: (field: {
    value: unknown;
    setValue: (value: unknown) => void;
    onChange: (value: unknown) => void;
    error?: string;
    onBlur: () => void; // Optional, for future use
  }) => ReactNode;
}

function FormField({ name, defaultValue, validator, children }: FormFieldProps) {
  const { values, errors, setFieldValue, setFieldError, registerField, unregisterField } = useFormContext();
  const { t } = useTranslation();
  
  const value = values[name] !== undefined ? values[name] : (defaultValue ?? '');

  useEffect(() => {
    registerField(name, defaultValue);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField, defaultValue]);

  useEffect(() => {
    if (validator) {
      const res = validator(value);
      if (res.ok) {
        setFieldError(name, undefined);
      } else {
        const errorMsg = res.error ? t(res.error.key, res.error.params) : 'Invalid value';
        setFieldError(name, errorMsg);
      }
    }
  }, [name, value, validator, setFieldError, t]);

  const setValue = useCallback((newValue: unknown) => {
    setFieldValue(name, newValue);
  }, [name, setFieldValue]);

  return <>{children({ value, setValue, onChange: setValue, error: errors[name], onBlur: () => {} })}</>;
}

// --- Form.Input ---
interface FormInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'error'> {
  name: string;
  validator?: (value: string) => ValidationResult;
}

function FormInput({ name, validator, defaultValue, ...props }: FormInputProps) {
  return (
    <FormField 
			name={name} 
			defaultValue={defaultValue} 
			validator={validator ? (v) => validator(String(v)) : undefined}>
      {({ onChange, setValue, error, value }) => (
        <Input
          {...props}
					defaultValue={String(value)}
					error={error}
          onChange={(e) => {
            onChange(e);
            setValue(e.target.value);
          }}
        />
      )}
    </FormField>
  );
}

// --- Form.Select ---
interface FormSelectProps extends Omit<ComponentProps<typeof Select>, 'value' | 'onChange' | 'error'> {
  name: string;
  validator?: (value: string) => ValidationResult;
}

function FormSelect({ name, validator, ...props }: FormSelectProps) {
  return (
    <FormField 
			name={name} 
			defaultValue={props.defaultValue} 
			validator={validator ? (v) => validator(String(v)) : undefined}>
      {({ onChange, setValue, error, value }) => (
        <Select
          {...props}
					error={error}
					defaultValue={String(value)}
          onChange={(e) => {
						onChange(e);	
						setValue(e.target.value);
          }}
        />
      )}
    </FormField>
  );
}

// --- Form.IconPicker ---
interface FormIconPickerProps extends Omit<ComponentProps<typeof IconPicker>, 'value' | 'onChange' | 'error'> {
  name: string;
  defaultValue?: string;
  validator?: (value: string) => ValidationResult;
}

function FormIconPicker({ name, validator, defaultValue, ...props }: FormIconPickerProps) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      validator={validator ? (v) => validator(String(v)) : undefined}
    >
      {({ setValue, error, value }) => (
        <IconPicker
          {...props}
          value={String(value || '')}
          error={error}
          onChange={(v) => setValue(v)}
        />
      )}
    </FormField>
  );
}

Form.Field = FormField;
Form.Input = FormInput;
Form.Select = FormSelect;
Form.IconPicker = FormIconPicker;
