import { cn } from '@/lib/utils';

/**
 * SegmentedControl - A multi-option toggle component
 * 
 * Generic reusable component for selecting between multiple options with a unified toggle interface.
 * Commonly used for filter controls, view switchers, and option selectors.
 * 
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { value: 'grid', label: 'Grid' },
 *     { value: 'list', label: 'List' }
 *   ]}
 *   value={viewMode}
 *   onChange={setViewMode}
 *   variant="primary"
 *   size="md"
 * />
 * ```
 */

export interface SegmentedControlOption<T = string> {
  value: T;
  label: string;
  icon?: string;
}

export interface SegmentedControlProps<T = string> {
  /** Array of options to display */
  options: SegmentedControlOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Additional CSS classes */
  className?: string;
  /** Visual style variant - 'primary' highlights selection, 'neutral' uses subtle background */
  variant?: 'primary' | 'neutral';
  /** Size of the control */
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  variant = 'primary',
  size = 'md'
}: SegmentedControlProps<T>) {
  const isSmall = size === 'sm';

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-gray-100 dark:bg-surface-input rounded-lg p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        const selectedStyles = variant === 'primary'
          ? "bg-primary shadow-sm text-white"
          : "bg-surface shadow-sm text-text-main";

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "text-xs font-semibold transition-all",
              isSmall ? "px-2 py-1 rounded-md" : "px-3 py-1.5 rounded-md",
              isSelected
                ? selectedStyles
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
