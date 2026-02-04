import type { ReactNode, ComponentProps } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ValidationResult } from '@/lib/validations';
import { IconPicker } from '@/components/ui/IconPicker';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { MediaUploadInput } from '@/components/ui/MediaUploadInput';
import type { TextareaHTMLAttributes } from 'react';
import type { MediaItem } from '@/types';
import { RadioButton } from '@/components/ui/RadioButton';

export type FormFieldValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;
export type FormTouched = Record<string, boolean>;

type FormContextType = {
  values: FormFieldValues;
  errors: FormErrors;
  touched: FormTouched;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error?: string) => void;
  setFieldTouched: (name: string, isTouched: boolean) => void;
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
  const { t } = useTranslation();
  const [values, setValues] = useState<FormFieldValues>(defaultValues || {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
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

  const setFieldTouched = useCallback((name: string, isTouched: boolean) => {
    setTouched(prev => {
        if (prev[name] === isTouched) return prev;
        return { ...prev, [name]: isTouched };
    });
  }, []);

  const registerField = useCallback((name: string, defaultValue?: unknown) => {
    setValues(prev => {
      if (prev[name] !== undefined) return prev;
      return { ...prev, [name]: defaultValue };
    });
  }, []);

  const unregisterField = useCallback((name: string) => {
    // We do not delete the value to preserve state if the field remounts
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setTouched(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
    });
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    // Mark all registered fields as touched
    const allTouched: FormTouched = {};
    Object.keys(values).forEach(key => {
        allTouched[key] = true;
    });
    setTouched(prev => ({ ...prev, ...allTouched }));
    
    // Check if any error exists
    const hasErrors = Object.keys(errors).some(key => !!errors[key]);
    
    if (hasErrors) {
      console.warn("Form submission blocked due to validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (typeof err === 'object' && err !== null) {
        Object.entries(err).forEach(([key, value]) => {
            // Handle { key: string, params?: object } error structure
            if (typeof value === 'object' && value !== null && 'key' in value) {
                const errorObj = value as { key: string; params?: Record<string, string | number> };
                setFieldError(key, t(errorObj.key, errorObj.params));
            } else if (typeof value === 'string') {
                // Fallback for simple string errors
                setFieldError(key, t(value));
            }
        });
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider value={{ values, errors, touched, setFieldValue, setFieldError, setFieldTouched, registerField, unregisterField, isSubmitting }}>
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
    onBlur: () => void;
  }) => ReactNode;
}

function FormField({ name, defaultValue, validator, children }: FormFieldProps) {
  const { values, errors, touched, setFieldValue, setFieldError, setFieldTouched, registerField, unregisterField } = useFormContext();
  const { t } = useTranslation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
    // Debounce touched update
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
        setFieldTouched(name, true);
    }, 500);

    setFieldValue(name, newValue);
  }, [name, setFieldValue, setFieldTouched]);

  const handleBlur = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFieldTouched(name, true);
  }, [name, setFieldTouched]);

  // Only show error if touched
  const visibleError = touched[name] ? errors[name] : undefined;

  // eslint-disable-next-line react-hooks/refs
  return <>{children({ value, setValue, onChange: setValue, error: visibleError, onBlur: handleBlur })}</>;
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
      {({ onChange, setValue, error, value, onBlur }) => (
        <Input
          {...props}
					defaultValue={String(value)}
					error={error}
          onBlur={onBlur}
          onChange={(e) => {
            onChange(e);
            setValue(e.target.value);
          }}
        />
      )}
    </FormField>
  );
}

// --- Form.Textarea ---
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  validator?: (value: string) => ValidationResult;
}

function FormTextarea({ name, validator, label, className, defaultValue, ...props }: FormTextareaProps) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      validator={validator ? (v) => validator(String(v)) : undefined}
    >
      {({ onChange, setValue, error, value, onBlur }) => (
        <div className="w-full">
          {label && (
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
              {label}
            </label>
          )}
          <div className={cn(
            "group relative flex w-full rounded-2xl bg-surface-light dark:bg-surface-dark border transition-all duration-200 shadow-sm overflow-hidden",
            error
              ? "border-red-400 dark:border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
              : "border-gray-200 dark:border-surface-highlight focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
            className
          )}>
            <textarea
              className="flex-1 w-full bg-transparent border-none p-4 text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 min-h-[100px] resize-none"
              {...props}
              value={String(value || '')}
              onBlur={onBlur}
              onChange={(e) => {
                onChange(e);
                setValue(e.target.value);
              }}
            />
            {error && (
              <div className="absolute top-4 right-3 flex items-center justify-center text-red-400 dark:text-red-500 pointer-events-none">
                <Icon name="error" size={20} />
              </div>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1">
              {error}
            </p>
          )}
        </div>
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
      {({ onChange, setValue, error, value, onBlur }) => (
        <Select
          {...props}
					error={error}
					defaultValue={String(value)}
          onBlur={onBlur}
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
      {({ setValue, error, value, onBlur }) => (
        <IconPicker
          {...props}
          value={String(value || '')}
          error={error}
          onBlur={onBlur}
          onChange={(v) => setValue(v)}
        />
      )}
    </FormField>
  );
}

// --- Form.Media ---
interface FormMediaProps {
  name: string;
  defaultValue?: MediaItem[];
  className?: string;
  validator?: (value: MediaItem[]) => ValidationResult;
}

function FormMedia({ name, defaultValue, validator, className }: FormMediaProps) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      validator={validator ? (v) => validator(v as MediaItem[]) : undefined}
    >
      {({ setValue, value }) => (
        <MediaUploadInput
          value={value as MediaItem[]}
          onChange={setValue}
          className={className}
        />
      )}
    </FormField>
  );
}

// --- Form.RadioButton ---
interface FormRadioButtonProps {
  name: string;
  label: string;
  value: string | number | boolean;
  icon?: string;
  description?: string;
  className?: string;
}

function FormRadioButton({ name, value: radioValue, label, icon, description, className }: FormRadioButtonProps) {
  return (
     <FormField name={name}>
       {({ value, setValue, onBlur }) => (
         <RadioButton
            name={name}
            label={label}
            icon={icon}
            description={description}
            className={className}
            checked={value === radioValue}
            onBlur={onBlur}
            onChange={() => setValue(radioValue)}
            // Helper to prevent form submission on enter if needed, but radio usually fine.
         />
       )}
     </FormField>
  );
}

// --- Form.RadioButtonGroup ---
export interface RadioOption {
  label: string;
  value: string | number | boolean;
  icon?: string;
  description?: string;
}

interface FormRadioButtonGroupProps {
  name: string;
  options: RadioOption[];
  validator?: (value: unknown) => ValidationResult;
  className?: string;
  defaultValue?: string | number | boolean;
}

function FormRadioButtonGroup({ name, options, validator, className, defaultValue }: FormRadioButtonGroupProps) {
  return (
    <FormField
      name={name}
      defaultValue={defaultValue}
      validator={validator}
    >
      {({ value, setValue, error, onBlur }) => (
        <div className={cn("flex flex-col gap-3", className)}>
          {options.map((option) => (
            <RadioButton
              key={String(option.value)}
              label={option.label}
              icon={option.icon}
              description={option.description}
              checked={value === option.value}
              onBlur={onBlur}
              onChange={() => setValue(option.value)}
              className={error ? "border-red-400 dark:border-red-500" : undefined}
            />
          ))}
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1">
              {error}
            </p>
          )}
        </div>
      )}
    </FormField>
  );
}

Form.Field = FormField;
Form.Input = FormInput;
Form.Select = FormSelect;
Form.IconPicker = FormIconPicker;
Form.Textarea = FormTextarea;
Form.Media = FormMedia;
Form.RadioButton = FormRadioButton;
Form.RadioButtonGroup = FormRadioButtonGroup;
