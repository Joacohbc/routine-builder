import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, children, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border p-4 shadow-sm relative overflow-hidden',
        hover && 'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
