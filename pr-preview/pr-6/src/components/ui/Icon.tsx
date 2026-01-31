import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number; // Optional custom font-size
}

export function Icon({ name, className, filled = false, size }: IconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined select-none',
        filled && 'filled',
        className
      )}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      {name}
    </span>
  );
}
