import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Form, useFormContext } from '@/components/ui/Form';
import { TagSelector } from '@/components/ui/TagSelector';
import { inventoryValidators } from '@/lib/validations';
import type { InventoryItem } from '@/types';

interface InventoryFormProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id'> & { id?: number }) => Promise<void>;
}

export function InventoryForm({ item, onClose, onSave }: InventoryFormProps) {
  const { t } = useTranslation();

  const handleFormSubmit = async (rawValues: unknown) => {
    const values = rawValues as InventoryItem;

    console.log('Form Values:', values);
    await onSave({
      name: values.name,
      icon: values.icon,
      status: values.status,
      condition: values.condition,
      quantity: Number(values.quantity),
      tagIds: values.tagIds,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      variant="centered"
      className="max-w-sm p-6 border border-gray-200 dark:border-surface-highlight overflow-y-auto"
    >
      <h2 className="text-xl font-bold mb-4">{item ? t('inventory.titleEdit') : t('inventory.titleNew')}</h2>
      <Form
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-4"
      >
        <Form.Input
          name="name"
          label={t('inventory.name')}
          defaultValue={item?.name}
          validator={inventoryValidators.name}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Form.IconPicker
            name="icon"
            label={t('inventory.icon')}
            defaultValue={item?.icon}
            validator={inventoryValidators.icon}
          />
          <Form.Input
            name="quantity"
            label={t('inventory.quantity')}
            type="number"
            defaultValue={item?.quantity}
            validator={inventoryValidators.quantity}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Select
            name="condition"
            label={t('inventory.condition')}
            defaultValue={item?.condition}
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
            defaultValue={item?.status}
            options={[
              { label: t('inventory.statuses.available'), value: 'available' },
              { label: t('inventory.statuses.checked_out'), value: 'checked_out' },
              { label: t('inventory.statuses.maintenance'), value: 'maintenance' },
            ]}
          />
        </div>

        <Form.Field name="tagIds" defaultValue={item?.tagIds || []}>
          {({ value, setValue }) => (
            <TagSelector
              label={t('common.tags')}
              selectedTagIds={value as number[]}
              onChange={setValue}
              type={'inventory'} />
          )}
        </Form.Field>

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>{t('common.cancel')}</Button>
          <FormSubmitButton />
        </div>
      </Form>
    </Modal>
  );
}

function FormSubmitButton() {
  const { t } = useTranslation();
  const { errors, isSubmitting } = useFormContext();
  const hasErrors = Object.keys(errors).some(key => !!errors[key]);

  return (
    <Button type="submit" className="flex-1" disabled={hasErrors || isSubmitting}>
      {isSubmitting ? t('common.saving') : t('common.save')}
    </Button>
  );
}
