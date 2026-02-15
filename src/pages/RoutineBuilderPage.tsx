import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/lib/routes';
import { useRoutines } from '@/hooks/useRoutines';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { routineValidators } from '@/lib/validations';
import { SeriesManager } from '@/components/routine/SeriesManager';
import type { Routine, RoutineSeries } from '@/types';

export default function RoutineBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { routines, addRoutine, updateRoutine, loading: routinesLoading } = useRoutines();

  const initialValues = useMemo(() => {
    if (id) {
      if (!routinesLoading && routines.length > 0) {
        return routines.find((r) => r.id === Number(id)) ?? null;
      }
      return null;
    }

    // New routine default
    return {
      name: t('routineBuilder.newRoutine'),
      series: [
        {
          id: crypto.randomUUID(),
          type: 'standard',
          exercises: [],
          restAfterSerie: 120,
        },
      ],
    };
  }, [id, routines, routinesLoading, t]);

  // Handle not found routine
  useEffect(() => {
    if (id && !routinesLoading && routines.length > 0) {
      const r = routines.find((r) => r.id === Number(id));
      if (!r) {
        navigate(ROUTES.ROUTINE);
      }
    }
  }, [id, routines, routinesLoading, navigate]);

  const handleSave = async (values: FormFieldValues) => {
    const routineData: Routine = {
      id: id ? Number(id) : undefined,
      name: values.name as string,
      series: values.series as RoutineSeries[],
      updatedAt: new Date(),
      createdAt: id ? (initialValues as Routine).createdAt : new Date(),
    };

    if (id) {
      await updateRoutine(routineData);
    } else {
      const newRoutine = { ...routineData };
      delete newRoutine.id;
      await addRoutine(newRoutine);
    }
    navigate(ROUTES.ROUTINE);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!initialValues) {
    return <div className="p-4 text-center">{t('common.loading', 'Loading...')}</div>;
  }

  return (
    <Form onSubmit={handleSave} defaultValues={initialValues as FormFieldValues} className="h-full">
      <Layout
        header={
          <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
            <button
              type="button"
              onClick={handleCancel}
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
