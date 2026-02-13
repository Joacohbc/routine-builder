import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface ListItemSelectProps {
  icon: string;
  label: string;
  valueLabel?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  title: string;
  description?: string;
}

export function ListItemSelect({ 
  icon, 
  label, 
  valueLabel, 
  value, 
  options, 
  onSelect, 
  title,
  description
}: ListItemSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex flex-col w-full border-t border-border first:border-t-0">
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary shrink-0">
              <Icon name={icon} size={18} />
            </div>
            <p className="text-text-main text-base font-medium leading-normal truncate text-left">
              {label}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-text-secondary">
            {valueLabel && (
              <p className="text-sm font-normal leading-normal whitespace-nowrap">{valueLabel}</p>
            )}
            <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="bottom-sheet"
      >
        <div className="flex flex-col p-4 max-h-[80vh]">
          <h3 className="text-lg font-bold text-text-main mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-text-secondary mb-4">{description}</p>
          )}
          <div className="flex flex-col gap-2 overflow-y-scroll flex-1 min-h-0 -mx-4 px-4">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all",
                  value === option.value
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-surface text-text-main hover:bg-surface-highlight border border-border"
                )}
              >
                <span className="font-medium">{option.label}</span>
                {value === option.value && (
                  <Icon name="check" size={20} />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-4 text-center text-text-secondary font-medium hover:text-text-main transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </Modal>
    </>
  );
}
