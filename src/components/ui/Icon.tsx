import { cn } from '@/lib/utils';

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
