import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface ListItemToggleProps {
  icon: string;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * A toggle list item component for settings.
 * Displays an icon, label, optional description, and a toggle switch.
 */
export function ListItemToggle({ icon, label, description, value, onChange }: ListItemToggleProps) {
  return (
    <div className="relative flex flex-col w-full border-t border-border first:border-t-0">
      <button
        onClick={() => onChange(!value)}
        type="button"
        className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary shrink-0">
            <Icon name={icon} size={18} />
          </div>
          <div className="flex-1">
            <p className="text-text-main text-base font-medium leading-normal">{label}</p>
            {description && (
              <p className="text-text-secondary text-sm leading-normal mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="shrink-0">
          <div
            className={cn(
              'relative w-12 h-7 rounded-full transition-all duration-200',
              value ? 'bg-primary' : 'bg-text-muted/20'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 size-6 bg-white rounded-full shadow-md transition-transform duration-200',
                value ? 'translate-x-5.5' : 'translate-x-0.5'
              )}
            />
          </div>
        </div>
      </button>
    </div>
  );
}
