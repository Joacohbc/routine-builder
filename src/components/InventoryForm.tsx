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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-surface-highlight my-8">
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit Item' : 'New Item'}</h2>
        <Form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4"
        >
          <Form.Input 
            name="name" 
            label="Name" 
            defaultValue={item?.name} 
            validator={inventoryValidators.name}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Form.Input 
              name="icon" 
              label="Icon (Symbol)" 
              defaultValue={item?.icon}
              validator={inventoryValidators.icon}
            />
            <Form.Input
              name="quantity"
              label="Quantity"
              type="number"
              defaultValue={item?.quantity}
              validator={inventoryValidators.quantity}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Select
              name="condition"
              label="Condition"
              defaultValue={item?.condition}
              options={[
                { label: 'New', value: 'new' },
                { label: 'Good', value: 'good' },
                { label: 'Worn', value: 'worn' },
                { label: 'Poor', value: 'poor' },
              ]}
            />
            <Form.Select
              name="status"
              label="Status"
              defaultValue={item?.status}
              options={[
                { label: 'Available', value: 'available' },
                { label: 'Checked Out', value: 'checked_out' },
                { label: 'Maintenance', value: 'maintenance' },
              ]}
            />
          </div>

          <Form.Field name="tagIds" defaultValue={item?.tagIds || []}>
            {({ value, setValue }) => (
              <TagSelector
                label="Tags"
                selectedTagIds={value as number[]}
                onChange={setValue}
                type={'inventory'} />
            )}
          </Form.Field>

          <div className="flex gap-3 mt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <FormSubmitButton />
          </div>
        </Form>
      </div>
    </div>
  );
}

function FormSubmitButton() {
  const { errors, isSubmitting } = useFormContext();
  const hasErrors = Object.keys(errors).some(key => !!errors[key]);

  return (
    <Button type="submit" className="flex-1" disabled={hasErrors || isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  );
}
