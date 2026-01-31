import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn, Icon } from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
            {label}
          </label>
        )}
        <div className={cn(
          "group relative flex items-center w-full h-12 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200 shadow-sm",
          className
        )}>
          {icon && (
            <div className="pl-4 pr-3 flex items-center justify-center text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors">
              <Icon name={icon} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex-1 bg-transparent border-none text-base font-normal text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0",
              !icon && "px-4"
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
