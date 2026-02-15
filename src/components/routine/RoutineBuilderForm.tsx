import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { routineValidators } from '@/lib/validations';
import { SeriesManager } from '@/components/routine/SeriesManager';
import type { RoutineSeries } from '@/types';

// ==================== Main Form Component ====================
export interface RoutineBuilderFormProps {
  initialValues: FormFieldValues;
  onSubmit: (values: FormFieldValues) => Promise<void>;
  onCancel: () => void;
}

export function RoutineBuilderForm({ initialValues, onSubmit, onCancel }: RoutineBuilderFormProps) {
  const { t } = useTranslation();

  return (
    <Form onSubmit={onSubmit} defaultValues={initialValues} className="h-full">
      <Layout
        header={
          <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight"
            >
              <Icon name="arrow_back" />
            </button>
            <Form.Field name="name" validator={routineValidators.name}>
              {({ value, setValue, error }) => (
                <div className="flex-1 px-4 text-center">
                  <input
                    value={String(value || '')}
                    onChange={(e) => setValue(e.target.value)}
                    className="bg-transparent text-center font-bold text-lg focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 w-full max-w-50"
                    placeholder={t('routineBuilder.routineName', 'Routine Name')}
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
              )}
            </Form.Field>
            <Button size="sm" type="submit">
              {t('common.save', 'Save')}
            </Button>
          </div>
        }
      >
        <Form.Field name="series" validator={routineValidators.series}>
          {({ value, setValue, error }) => (
            <SeriesManager
              series={(value as RoutineSeries[]) || []}
              updateSeriesList={setValue}
              error={error}
            />
          )}
        </Form.Field>
      </Layout>
    </Form>
  );
}
