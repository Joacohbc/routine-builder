import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, children, hover = false, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-surface-highlight p-4 shadow-sm relative overflow-hidden',
        hover && 'hover:shadow-md dark:hover:border-primary/30 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
