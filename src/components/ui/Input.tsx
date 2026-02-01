import type { InputHTMLAttributes, ChangeEvent } from 'react';
import { useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface ValidationResult {
  ok: boolean;
  message?: string;
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  icon?: string;
  label?: string;

  /**
   * Validation function that receives the current value and returns a ValidationResult. 
   * If not provided, no validation is performed.
   * @param value 
   * @returns ValidationResult, indicating if the value is valid and an optional message.
   */
  validator?: (value: string) => ValidationResult;
  /** 
   * Called only when validation passes (or if no validator is provided).
   * Receives the new value directly.
   */
  setValue?: (value: string) => void;
}

export function Input({ className, icon, label, validator, setValue, defaultValue = '', ...props }: InputProps) {
  const [internalValue, setInternalValue] = useState(String(defaultValue));
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const hasError = validation && !validation.ok;

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (!validator) {
      setValidation(null);
      if (setValue) {
        setValue(newValue);
      }
      return;
    }

    const result = validator(newValue);
    setValidation(result);
    if (result.ok && setValue) {
      setValue(newValue);
    }
  }, [validator, setValue]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "group relative flex items-center w-full h-12 rounded-2xl bg-surface-light dark:bg-surface-dark border transition-all duration-200 shadow-sm",
        hasError 
          ? "border-red-400 dark:border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
          : "border-gray-200 dark:border-surface-highlight focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        className
      )}>
        {icon && (
          <div className={cn(
            "pl-4 pr-3 flex items-center justify-center transition-colors",
            hasError 
              ? "text-red-400 dark:text-red-500" 
              : "text-gray-400 dark:text-gray-500 group-focus-within:text-primary"
          )}>
            <Icon name={icon} />
          </div>
        )}
        <input
          value={internalValue}
          onChange={handleChange}
          className={cn(
            "flex-1 bg-transparent border-none text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0",
            !icon && "px-4"
          )}
          {...props}
        />
        {hasError && (
          <div className="pr-3 flex items-center justify-center text-red-400 dark:text-red-500">
            <Icon name="error" size={20} />
          </div>
        )}
      </div>
      {hasError && validation.message && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1">
          {validation.message}
        </p>
      )}
    </div>
  );
}
