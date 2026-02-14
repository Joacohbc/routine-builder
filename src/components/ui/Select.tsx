import type { SelectHTMLAttributes } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export function Select({ className, label, options, error, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1 ml-1">{label}</label>
      )}
      <div className="relative">
        <select
          className={cn(
            'w-full h-12 rounded-2xl bg-surface border px-4 text-sm appearance-none outline-none transition-all',
            'text-text-main',
            error
              ? 'border-red-400 dark:border-red-500 focus:border-red-500'
              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors',
            error ? 'text-red-400' : 'text-text-secondary'
          )}
        >
          <Icon name="expand_more" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1">{error}</p>}
    </div>
  );
}
