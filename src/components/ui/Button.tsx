import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn, Icon } from './Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: string;
  children?: ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30',
    secondary: 'bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-surface-highlight',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-highlight',
    icon: 'rounded-full hover:bg-gray-200 dark:hover:bg-surface-highlight text-gray-600 dark:text-gray-300',
    floating: 'fixed bottom-24 right-6 z-50 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-lg shadow-primary/30 w-14 h-14',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button 
      className={cn(
        baseStyles, 
        variants[variant], 
        variant !== 'icon' && variant !== 'floating' && sizes[size],
        className
      )}
      {...props}
    >
      {icon && <Icon name={icon} className={cn(children ? 'mr-2' : '')} />}
      {children}
    </button>
  );
}
