import { cn } from './Icon';
import { Icon } from './Icon';

interface TagProps {
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'outline';
  className?: string;
  onClick?: () => void;
}

export function Tag({ label, icon, variant = 'default', className, onClick }: TagProps) {
  const variants = {
    default: 'bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary',
    primary: 'bg-primary/5 dark:bg-primary/10 text-primary border border-primary dark:border-primary',
    outline: 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-surface-highlight',
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
