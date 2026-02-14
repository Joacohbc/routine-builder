import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  icon?: string;
  description?: string;
  onChange?: (checked: boolean) => void;
}

export function RadioButton({
  className,
  label,
  icon,
  description,
  checked,
  onChange,
  ...props
}: RadioButtonProps) {
  const radioDotSvg =
    "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e')";

  return (
    <label
      className={cn(
        'group cursor-pointer flex items-center gap-4 rounded-xl border p-4 flex-row-reverse shadow-sm transition-all',
        'bg-surface',
        'border-border',
        'hover:border-primary/50',
        className
      )}
      style={{ '--radio-dot-svg': radioDotSvg } as React.CSSProperties}
    >
      <input
        type="radio"
        className={cn(
          'peer h-5 w-5 appearance-none rounded-full border-2 bg-transparent transition-all',
          'border-text-muted',
          'checked:bg-primary checked:border-primary checked:bg-[image:var(--radio-dot-svg)]',
          'focus:outline-none focus:ring-2 focus:ring-primary/20'
        )}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        {...props}
      />
      <div className="flex grow items-center gap-3">
        {icon && (
          <Icon
            name={icon}
            className={cn('transition-colors', checked ? 'text-primary' : 'text-text-muted')}
          />
        )}
        <div className="flex flex-col">
          <p className="text-text-main text-sm font-medium leading-normal">{label}</p>
          {description && <p className="text-xs text-text-secondary">{description}</p>}
        </div>
      </div>
    </label>
  );
}
