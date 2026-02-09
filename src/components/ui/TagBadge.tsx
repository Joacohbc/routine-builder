import { cn } from '@/lib/utils';

interface TagBadgeProps {
  label: string;
  color: string;
  className?: string;
}

/**
 * A small, colored badge used to display tags for exercises or equipment.
 * Automatically handles translation for system tags if children are not provided.
 */
export function TagBadge({ label, color, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-md font-medium border whitespace-nowrap",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`
      }}
    >
      {label}
    </span>
  );
}
