import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface TagProps {
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'outline';
  className?: string;
  onClick?: () => void;
}

export function Tag({ label, icon, variant = 'default', className, onClick }: TagProps) {
  const variants = {
    default:
      'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary',
    primary:
      'bg-primary/5 dark:bg-primary/10 text-primary border border-primary dark:border-primary',
    outline: 'border border-border text-text-secondary bg-surface-highlight',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-none flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
    >
      {icon && <Icon name={icon} size={14} className={variant === 'primary' ? 'fill-1' : ''} />}
      {label}
    </button>
  );
}
