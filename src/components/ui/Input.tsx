import type { InputHTMLAttributes } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
  error?: string;
}

export function Input({ className, icon, label, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "group relative flex items-center w-full h-12 rounded-2xl bg-surface-light dark:bg-surface-dark border transition-all duration-200 shadow-sm",
        error 
          ? "border-red-400 dark:border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
          : "border-gray-200 dark:border-surface-highlight focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        className
      )}>
        {icon && (
          <div className={cn(
            "pl-4 pr-3 flex items-center justify-center transition-colors",
            error 
              ? "text-red-400 dark:text-red-500" 
              : "text-gray-400 dark:text-gray-500 group-focus-within:text-primary"
          )}>
            <Icon name={icon} />
          </div>
        )}
        <input
          className={cn(
            "flex-1 bg-transparent border-none text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0",
            !icon && "px-4"
          )}
          {...props}
        />
        {error && (
          <div className="pr-3 flex items-center justify-center text-red-400 dark:text-red-500">
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
  );
}
