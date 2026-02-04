import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTags, TAG_COLORS } from '@/hooks/useTags';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { validators } from '@/lib/validations';
import type { Tag } from '@/types';

export default function ManageTagsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tags, addTag, updateTag, deleteTag } = useTags();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const handleOpenForm = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
    } else {
      setEditingTag(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTag(null);
  };

  const handleSubmit = async (data: FormFieldValues) => {
    const tagData = {
      name: data.name as string,
      color: (data.color as string) || TAG_COLORS[0],
    };

    if (editingTag) {
      await updateTag({ ...editingTag, ...tagData });
    } else {
      await addTag(tagData);
    }
    handleCloseForm();
  };

  const handleDelete = async () => {
    if (tagToDelete?.id) {
      await deleteTag(tagToDelete.id);
      setTagToDelete(null);
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800/50">
           <button
            onClick={() => navigate(-1)}
            className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
            {t('tags.title', 'Manage Tags')}
          </h2>
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <Button onClick={() => handleOpenForm()} className="w-full">
          <Icon name="add" className="mr-2" />
          {t('tags.addNew', 'Add New Tag')}
        </Button>

        <div className="flex flex-col gap-2">
          {tags.map((tag) => (
            <div 
              key={tag.id} 
              className="flex items-center justify-between p-3 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: tag.color }} 
                />
                <span className="font-medium text-slate-900 dark:text-white">
                  {tag.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenForm(tag)}
                  className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
                >
                  <Icon name="edit" size={20} />
                </button>
                <button
                  onClick={() => setTagToDelete(tag)}
                  className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500 transition-colors"
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>
            </div>
          ))}
          
          {tags.length === 0 && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              {t('tags.noTags', 'No tags found. Create one to get started.')}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        variant="bottom-sheet"
      >
        <div className="p-4 pb-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTag ? t('tags.editTag', 'Edit Tag') : t('tags.createTag', 'Create Tag')}
          </h3>
          
          <Form
            onSubmit={handleSubmit}
            defaultValues={{
              name: editingTag?.name || '',
              color: editingTag?.color || TAG_COLORS[0],
            }}
            submitLabel={editingTag ? t('common.save', 'Save') : t('common.create', 'Create')}
          >
            <Form.Field
              name="name"
              validator={validators.required}
            >
              {({ value, onChange, error }) => (
                 <Input
                    label={t('tags.name', 'Name')}
                    placeholder={t('tags.namePlaceholder', 'e.g., Pull, Heavy')}
                    value={String(value || '')}
                    onChange={(e) => onChange(e.target.value)}
                    error={error}
                  />
              )}
            </Form.Field>
            
            <Form.Field
              name="color"
              validator={validators.required}
            >
              {({ value, onChange, error }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('tags.color', 'Color')}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          value === color 
                            ? 'border-slate-900 dark:border-white scale-110' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div 
                    className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2"
                  >
                     <div className="h-full transition-all duration-300" style={{ width: '100%', backgroundColor: String(value) }} />
                  </div>
                  {error && <p className="text-sm text-red-500">{t(error)}</p>}
                </div>
              )}
            </Form.Field>
          </Form>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDelete}
        title={t('tags.deleteTitle', 'Delete Tag')}
        description={t('tags.deleteDescription', 'Are you sure you want to delete this tag? It will be removed from all exercises and inventory items.')}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="danger"
      />
    </Layout>
  );
}
