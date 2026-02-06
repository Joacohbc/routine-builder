import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TagSelector } from '@/components/ui/TagSelector';
import { InventorySelector } from '@/components/ui/InventorySelector';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { exerciseValidators } from '@/lib/validations';

interface ExerciseFormProps {
    initialValues: FormFieldValues;
    onSubmit: (values: FormFieldValues) => Promise<void>;
    isEditing: boolean;
}

export function ExerciseForm({ initialValues, onSubmit, isEditing }: ExerciseFormProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Form
            onSubmit={onSubmit}
            defaultValues={initialValues}
            className="h-full"
        >
            <Layout
                header={
                    <div className="flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-md z-50">
                        <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-900 dark:text-white transition-colors">
                            <Icon name="close" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{isEditing ? t('exercise.edit', 'Edit Exercise') : t('exercise.new', 'New Exercise')}</h1>
                        <Button size="sm" type="submit" className="bg-primary text-white rounded-full px-6">{t('common.save', 'Save')}</Button>
                    </div>
                }
            >
                <div className="flex flex-col gap-8 mt-4">
                    {/* Exercise Title */}
                    <Form.Input
                        name="title"
                        label={t('exercise.title', 'Exercise Title')}
                        placeholder={t('exercise.titlePlaceholder', 'e.g. Incline Bench Press')}
                        validator={exerciseValidators.title}
                        className="font-bold text-lg"
                    />

                    {/* Description */}
                    <Form.Textarea
                        name="description"
                        label={t('exercise.description', 'Description')}
                        placeholder={t('exercise.descriptionPlaceholder', 'Add cues, form tips, or setup instructions...')}
                    />

                    {/* Multimedia Gallery */}
                    <Form.Media name="media" />

                    {/* Required Equipment */}
                    <Form.Field name="primaryEquipmentIds">
                        {({ value, setValue }) => (
                            <InventorySelector
                                selectedItemIds={(value as number[]) || []}
                                onChange={setValue}
                            />
                        )}
                    </Form.Field>

                    {/* Tags */}
                    <Form.Field name="tagIds" validator={exerciseValidators.tagIds}>
                        {({ value, setValue, error }) => (
                            <div className="flex flex-col gap-1">
                                <TagSelector
                                    label={t('exercise.tags')}
                                    type="exercise"
                                    selectedTagIds={(value as number[]) || []}
                                    onChange={setValue}
                                />
                                {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
                            </div>
                        )}
                    </Form.Field>
                </div>
            </Layout>
        </Form>
    );
}
