import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/hooks/useInventory';
import { useDebounce } from '@/hooks/useDebounce';
import { useTags } from '@/hooks/useTags';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { TagBadge } from '@/components/ui/TagBadge';
import { TagSelector } from '@/components/ui/TagSelector';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Form, useFormContext } from '@/components/ui/Form';
import { inventoryValidators } from '@/lib/validations';
import { cn } from '@/lib/utils';
import { getInventoryConditionColors } from '@/lib/typeColors';
import { fuzzySearch } from '@/lib/search';
import type { InventoryItem, InventoryStatus, Tag } from '@/types';

type FilterStatus = InventoryStatus | 'all';

const emptyItem: InventoryItem = {
  name: '',
  status: 'available',
  condition: 'good',
  icon: '',
  quantity: 0,
  tags: [],
};

export default function InventoryPage() {
  const { t } = useTranslation();
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();
  const { tags, formatTagName } = useTags();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem>(emptyItem);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const tagsRef = useHorizontalScroll();

  // Derived state for tags present in current inventory
  const inventoryTags = useMemo(() => {
    const ids = new Set<number>();
    items.forEach((item) => item.tags?.forEach((tag) => tag.id && ids.add(tag.id)));
    return tags.filter((t) => ids.has(t.id!));
  }, [items, tags]);

  const filteredItems = useMemo(() => {
    // 1. Fuzzy Search first (returns subset)
    const searchMatches = fuzzySearch(items, debouncedSearch, (item) => [item.name]);

    // 2. Apply other filters
    return searchMatches.filter((item) => {
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'available'
            ? item.status === 'available'
            : item.status !== 'available';

      const matchesTag = activeTagId ? item.tags?.some((tag) => tag.id === activeTagId) : true;

      return matchesStatus && matchesTag;
    });
  }, [items, debouncedSearch, filterStatus, activeTagId]);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  if (isFormOpen) {
    const handleFormSubmit = async (rawValues: unknown) => {
      const values = rawValues as InventoryItem;
      const itemToSave = {
        name: values.name,
        icon: values.icon,
        status: values.status,
        condition: values.condition,
        quantity: Number(values.quantity),
        tags: values.tags,
      };

      if (editingItem && editingItem.id) {
        await updateItem({ ...itemToSave, id: editingItem.id });
      } else {
        await addItem(itemToSave);
      }
      setIsFormOpen(false);
      setEditingItem(emptyItem);
    };

    const handleClose = () => {
      setIsFormOpen(false);
      setEditingItem(emptyItem);
    };

    return (
      <Form
        onSubmit={handleFormSubmit}
        defaultValues={{
          name: editingItem?.name || '',
          icon: editingItem?.icon || '',
          status: editingItem?.status || 'available',
          condition: editingItem?.condition || 'good',
          quantity: editingItem?.quantity || 1,
          tags: editingItem?.tags || [],
        }}
        className="h-full"
      >
        <Layout
          header={
            <div className="flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-md z-50">
              <button
                type="button"
                onClick={handleClose}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-900 dark:text-white transition-colors"
              >
                <Icon name="close" />
              </button>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem?.id ? t('inventory.titleEdit') : t('inventory.titleNew')}
              </h1>
              <FormSubmitButton />
            </div>
          }
        >
          <div className="flex flex-col gap-8 mt-4">
            <Form.Input
              name="name"
              label={t('inventory.name')}
              validator={inventoryValidators.name}
              required
              className="font-bold text-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <Form.IconPicker
                name="icon"
                label={t('inventory.icon')}
                validator={inventoryValidators.icon}
              />
              <Form.Input
                name="quantity"
                label={t('inventory.quantity')}
                type="number"
                validator={inventoryValidators.quantity}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Select
                name="condition"
                label={t('inventory.condition')}
                options={[
                  { label: t('inventory.conditions.new'), value: 'new' },
                  { label: t('inventory.conditions.good'), value: 'good' },
                  { label: t('inventory.conditions.worn'), value: 'worn' },
                  { label: t('inventory.conditions.poor'), value: 'poor' },
                ]}
              />
              <Form.Select
                name="status"
                label={t('inventory.status')}
                options={[
                  { label: t('inventory.statuses.available'), value: 'available' },
                  { label: t('inventory.statuses.checked_out'), value: 'checked_out' },
                  { label: t('inventory.statuses.maintenance'), value: 'maintenance' },
                ]}
              />
            </div>

            <Form.Field name="tags">
              {({ value, setValue }) => (
                <TagSelector
                  label={t('common.tags')}
                  activeTags={value as Tag[]}
                  onChange={setValue}
                  type={'inventory'}
                />
              )}
            </Form.Field>
          </div>
        </Layout>
      </Form>
    );
  }

  return (
    <Layout
      title={t('inventoryPage.title')}
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="flex gap-3 mb-2 overflow-x-auto no-scrollbar pb-2">
        <Button
          variant={filterStatus === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          {t('inventoryPage.filters.all')}
        </Button>
        <Button
          variant={filterStatus === 'available' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilterStatus('available')}
        >
          {t('inventoryPage.filters.available')}
        </Button>
        <Button
          variant={filterStatus === 'checked_out' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilterStatus('checked_out')}
        >
          {t('inventoryPage.filters.checkedOut')}
        </Button>
      </div>

      {inventoryTags.length > 0 && (
        <div
          ref={tagsRef}
          className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 pt-1 border-t border-gray-200 dark:border-surface-highlight/50"
        >
          <div className="flex items-center pr-2 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider shrink-0">
            {t('inventoryPage.tagsLabel')}
          </div>
          {inventoryTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id!)}
              className={cn(
                'flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                activeTagId === tag.id
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-gray-200 dark:border-surface-highlight text-gray-500 dark:text-gray-400'
              )}
              style={
                activeTagId === tag.id
                  ? { color: tag.color, borderColor: tag.color, backgroundColor: `${tag.color}15` }
                  : {}
              }
            >
              <Icon name="sell" size={14} />
              {formatTagName(tag)}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">{t('common.loading')}</p>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>{t('inventoryPage.empty')}</p>
            <p className="text-xs mt-2">{t('inventoryPage.emptyHint')}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} hover className="group" onClick={() => handleEdit(item)}>
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-surface-highlight text-gray-600 dark:text-primary shrink-0">
                    <Icon name={item.icon || 'fitness_center'} size={24} />
                  </div>
                  <div className="flex flex-col truncate pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <div
                        className={cn(
                          'flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border',
                          getInventoryConditionColors(item.condition)
                        )}
                      >
                        <span>{item.condition?.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          item.status === 'available' ? 'text-primary' : 'text-gray-500'
                        )}
                      >
                        {item.status === 'available'
                          ? t('inventory.statuses.available')
                          : item.status === 'checked_out'
                            ? t('inventory.statuses.checked_out')
                            : t('inventory.statuses.maintenance')}
                      </p>
                      <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {t('inventoryPage.total', { count: item.quantity })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pl-2 pt-1 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id!);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pl-16">
                {(item.tags || []).map((tag) => (
                  <TagBadge key={tag.id} label={formatTagName(tag)} color={tag.color} />
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      <Button
        variant="floating"
        onClick={() => {
          setEditingItem(emptyItem);
          setIsFormOpen(true);
        }}
      >
        <Icon name="add" size={32} />
      </Button>

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={async () => {
          if (itemToDelete) {
            await deleteItem(itemToDelete);
            setItemToDelete(null);
          }
        }}
        title={t('inventoryPage.deleteDialog.title')}
        description={t('inventoryPage.deleteDialog.description')}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </Layout>
  );
}

function FormSubmitButton() {
  const { t } = useTranslation();
  const { errors, isSubmitting } = useFormContext();
  const hasErrors = Object.keys(errors).some((key) => !!errors[key]);

  return (
    <Button
      type="submit"
      size="sm"
      className="bg-primary text-white rounded-full px-6"
      disabled={hasErrors || isSubmitting}
    >
      {isSubmitting ? t('common.saving') : t('common.save')}
    </Button>
  );
}
