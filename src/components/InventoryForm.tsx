import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Form, useFormContext } from '@/components/ui/Form';
import { TagSelector } from '@/components/ui/TagSelector';
import { inventoryValidators } from '@/lib/validations';
import type { InventoryItem, Tag } from '@/types';

interface InventoryFormProps {
  item: InventoryItem;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id'> & { id?: number }) => Promise<void>;
}

export function InventoryForm({ item, onClose, onSave }: InventoryFormProps) {
  const { t } = useTranslation();

  const handleFormSubmit = async (rawValues: unknown) => {
    const values = rawValues as InventoryItem;

    await onSave({
      name: values.name,
      icon: values.icon,
      status: values.status,
      condition: values.condition,
      quantity: Number(values.quantity),
      tags: values.tags,
    });
  };

  return (
    <Form
      onSubmit={handleFormSubmit}
      defaultValues={{
        name: item?.name || '',
        icon: item?.icon || '',
        status: item?.status || 'available',
        condition: item?.condition || 'good',
        quantity: item?.quantity || 1,
        tags: item?.tags || [],
      }}
      className="h-full"
    >
      <Layout
        header={
          <div className="flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-md z-50">
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-900 dark:text-white transition-colors"
            >
              <Icon name="close" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {item ? t('inventory.titleEdit') : t('inventory.titleNew')}
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
