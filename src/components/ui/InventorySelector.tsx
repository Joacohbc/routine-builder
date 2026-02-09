import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/hooks/useInventory';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

import type { InventoryItem } from '@/types';

interface InventorySelectorProps {
    selectedItems: InventoryItem[];
    onChange: (items: InventoryItem[]) => void;
    label?: string;
}

export function InventorySelector({ selectedItems = [], onChange, label }: InventorySelectorProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { items: inventoryItems } = useInventory();

    const selectedItemIds = selectedItems.map(i => i.id).filter(Boolean);

    const toggleEquipment = (item: InventoryItem) => {
        if (selectedItemIds.includes(item.id!)) {
            onChange(selectedItems.filter(i => i.id !== item.id));
        } else {
            onChange([...selectedItems, item]);
        }
    };

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {label || t('exercise.equipment', 'Required Equipment')}
                </label>
                <button type="button" onClick={() => navigate('/')} className="text-primary text-xs font-bold hover:text-primary-dark transition-colors">
                    {t('inventory.manage', 'Manage Inventory')}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {inventoryItems.map(item => {
                    const isSelected = selectedItemIds.includes(item.id!);
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleEquipment(item)}
                            className={cn(
                                "flex items-center p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                                isSelected
                                    ? "bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(179,157,219,1)]"
                                    : "bg-gray-50 dark:bg-surface-input border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors shrink-0",
                                isSelected ? "bg-primary text-white" : "bg-black/5 dark:bg-white/5 text-gray-500"
                            )}>
                                <Icon name={item.icon} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-bold truncate", isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300")}>{item.name}</p>
                                <p className="text-[10px] text-gray-500">{t('common.inventory', 'Inventory')}</p>
                            </div>
                            {isSelected && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <Icon name="check_circle" size={16} filled />
                                </div>
                            )}
                        </div>
                    );
                })}

                <button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 transition-colors">
                    <Icon name="add" />
                    <span className="text-sm font-medium">{t('common.addItem', 'Add Item')}</span>
                </button>
            </div>
        </section>
    );
}
