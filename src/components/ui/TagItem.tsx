import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

interface TagItemProps {
  tag: Tag;
  showActions?: boolean;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
  onClick?: (tag: Tag) => void;
  selected?: boolean;
  className?: string;
}

export function TagItem({ 
  tag, 
  showActions = false, 
  onEdit, 
  onDelete, 
  onClick, 
  selected = false,
  className 
}: TagItemProps) {
  
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick ? () => onClick(tag) : undefined}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border transition-all w-full text-left",
        selected
          ? "bg-primary/5 border-primary"
          : "bg-surface border-slate-200 dark:border-slate-800 shadow-sm",
        onClick && "hover:border-primary cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full shrink-0" 
          style={{ backgroundColor: tag.color }} 
        />
        <span className={cn(
          "font-medium",
          selected ? "text-primary" : "text-slate-900 dark:text-white"
        )}>
          {tag.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {selected && !showActions && (
            <Icon name="check" size={18} className="text-primary" />
        )}
        
        {showActions && (
          <>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tag);
                }}
                className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                type="button"
              >
                <Icon name="edit" size={20} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(tag);
                }}
                className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                type="button"
              >
                <Icon name="delete" size={20} />
              </button>
            )}
          </>
        )}
      </div>
    </Component>
  );
}
