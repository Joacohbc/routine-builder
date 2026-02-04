import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRoutines } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Form } from '@/components/ui/Form';
import { routineValidators } from '@/lib/validations';
import { cn } from '@/lib/utils';
import { formatTime, parseTime } from '@/lib/timeUtils';
import type { RoutineSeries, RoutineExercise, WorkoutSet, Exercise, Routine } from '@/types';

function TimeInput({ value, onChange, disabled, className }: { value: number | undefined, onChange: (val: number) => void, disabled?: boolean, className?: string }) {
  const [localValue, setLocalValue] = useState(formatTime(value));

  useEffect(() => {
    setLocalValue(formatTime(value));
  }, [value]);

  const handleBlur = () => {
    const seconds = parseTime(localValue);
    onChange(seconds);
    setLocalValue(formatTime(seconds));
  };

  return (
    <input
      className={className}
      placeholder="-"
      type="text"
      disabled={disabled}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
      }}
    />
  );
}

export default function RoutineBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { routines, addRoutine, updateRoutine, loading: routinesLoading } = useRoutines();
  const { exercises } = useExercises(); // To lookup names

  const [initialValues, setInitialValues] = useState<Partial<Routine> | null>(null);
  const [showSelector, setShowSelector] = useState<{ seriesId: string } | null>(null);

  // Initialize form values
  useEffect(() => {
    if (id) {
        if (!routinesLoading && routines.length > 0) {
            const r = routines.find(r => r.id === Number(id));
            if (r) {
                setInitialValues(r);
            } else {
                navigate('/builder'); // Not found
            }
        }
    } else {
        // New routine default
        setInitialValues({
            name: t('routineBuilder.newRoutine'),
            series: [{
                 id: crypto.randomUUID(),
                 type: 'standard',
                 exercises: []
            }]
        });
    }
  }, [id, routines, routinesLoading, navigate, t]);

  const handleSave = async (values: Record<string, unknown>) => {
    const routineData: Routine = {
      id: id ? Number(id) : undefined,
      name: values.name as string,
      series: values.series as RoutineSeries[],
      updatedAt: new Date(),
      createdAt: id ? (initialValues as Routine).createdAt : new Date()
    };

    if (id) {
      await updateRoutine(routineData);
    } else {
        const newRoutine = { ...routineData };
        delete newRoutine.id;
      await addRoutine(newRoutine);
    }
    navigate('/builder');
  };

  // Helper to add exercise to form state (used by ExerciseSelector)
  const handleAddExercise = (seriesId: string, exercise: Exercise, currentSeries: RoutineSeries[], setSeries: (s: RoutineSeries[]) => void) => {
      const updatedSeries = currentSeries.map(s => {
          if (s.id !== seriesId) return s;

          const trackingType = exercise.defaultType === 'time' ? 'time' : 'reps';
          const newEx: RoutineExercise = {
              id: crypto.randomUUID(),
              exerciseId: exercise.id!,
              trackingType,
              sets: [
                  { id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false },
                  { id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false },
                  { id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false }
              ]
          };
          return { ...s, exercises: [...s.exercises, newEx] };
      });
      setSeries(updatedSeries);
      setShowSelector(null);
  };

  if (!initialValues) {
      return <div className="p-4 text-center">{t('common.loading', 'Loading...')}</div>;
  }

  return (
    <Form
        onSubmit={handleSave}
        defaultValues={initialValues as Record<string, unknown>}
        className="h-full"
    >
        <Layout
            header={
                <div className="flex items-center justify-between px-4 py-3 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                    <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight">
                        <Icon name="arrow_back" />
                    </button>
                    <Form.Field name="name" validator={routineValidators.name}>
                        {({ value, setValue, error }) => (
                            <div className="flex-1 px-4 text-center">
                                <input
                                    value={String(value || '')}
                                    onChange={e => setValue(e.target.value)}
                                    className="bg-transparent text-center font-bold text-lg focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 w-full max-w-[200px]"
                                    placeholder={t('routineBuilder.routineName', 'Routine Name')}
                                />
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                            </div>
                        )}
                    </Form.Field>
                    <Button size="sm" type="submit">{t('common.save', 'Save')}</Button>
                </div>
            }
        >
            <Form.Field name="series" validator={routineValidators.series}>
                {({ value, setValue, error }) => {
                    const series = (value as RoutineSeries[]) || [];

                    const updateSeriesList = (newSeries: RoutineSeries[]) => setValue(newSeries);

                    const addSeries = () => {
                        const newSeries: RoutineSeries = {
                            id: crypto.randomUUID(),
                            type: 'standard',
                            exercises: []
                        };
                        updateSeriesList([...series, newSeries]);
                    };

                    const updateSet = (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => {
                        updateSeriesList(series.map(s => {
                            if (s.id !== seriesId) return s;
                            return {
                                ...s,
                                exercises: s.exercises.map(ex => {
                                    if (ex.id !== exId) return ex;
                                    return {
                                        ...ex,
                                        sets: ex.sets.map(set => {
                                            if (set.id !== setId) return set;
                                            return { ...set, [field]: val };
                                        })
                                    };
                                })
                            };
                        }));
                    };

                    const addSet = (seriesId: string, exId: string) => {
                        updateSeriesList(series.map(s => {
                            if (s.id !== seriesId) return s;
                            return {
                                ...s,
                                exercises: s.exercises.map(ex => {
                                    if (ex.id !== exId) return ex;
                                    const lastSet = ex.sets[ex.sets.length - 1];
                                    const newSet: WorkoutSet = {
                                        id: crypto.randomUUID(),
                                        type: 'working',
                                        weight: lastSet ? lastSet.weight : 0,
                                        reps: lastSet ? lastSet.reps : 0,
                                        time: lastSet ? lastSet.time : 0,
                                        completed: false
                                    };
                                    return { ...ex, sets: [...ex.sets, newSet] };
                                })
                            };
                        }));
                    };

                    const removeSet = (seriesId: string, exId: string, setId: string) => {
                        updateSeriesList(series.map(s => {
                            if (s.id !== seriesId) return s;
                            return {
                                ...s,
                                exercises: s.exercises.map(ex => {
                                    if (ex.id !== exId) return ex;
                                    return { ...ex, sets: ex.sets.filter(set => set.id !== setId) };
                                })
                            };
                        }));
                    };

                    const removeExercise = (seriesId: string, exId: string) => {
                        updateSeriesList(series.map(s => {
                            if (s.id !== seriesId) return s;
                            return { ...s, exercises: s.exercises.filter(ex => ex.id !== exId) };
                        }));
                    };

                    const toggleSeriesType = (seriesId: string) => {
                        updateSeriesList(series.map(s => {
                            if (s.id !== seriesId) return s;
                            return { ...s, type: s.type === 'standard' ? 'superset' : 'standard' };
                        }));
                    };

                    const toggleTrackingType = (seriesId: string, exId: string) => {
                        updateSeriesList(series.map(s => {
                            if (s.id !== seriesId) return s;
                            return {
                                ...s,
                                exercises: s.exercises.map(ex => {
                                    if (ex.id !== exId) return ex;
                                    return { ...ex, trackingType: ex.trackingType === 'time' ? 'reps' : 'time' };
                                })
                            };
                        }));
                    };

                    return (
                        <div className="flex flex-col gap-6 py-6">
                            {error && (
                                <div className="mx-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                                    <Icon name="error" size={20} />
                                    {t(error)}
                                </div>
                            )}

                            {series.map((s, sIndex) => (
                                <div key={s.id} className="relative">
                                    {/* Superset Connector Line */}
                                    {s.type === 'superset' && (
                                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full">
                                            <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                                                <span className="text-[9px] uppercase font-bold text-primary tracking-widest bg-background-light dark:bg-background-dark px-1">{t('routineBuilder.superset')}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={cn("flex flex-col gap-2", s.type === 'superset' ? "pl-4" : "")}>
                                        {/* Series Header / Controls */}
                                        <div className="flex justify-between items-center px-1 mb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('routineBuilder.series', { count: sIndex + 1 })}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSeriesType(s.id)}
                                                    className={cn("text-xs px-2 py-1 rounded border transition-colors", s.type === 'superset' ? "bg-primary text-white border-primary" : "bg-transparent border-gray-300 text-gray-500")}
                                                >
                                                    {s.type === 'superset' ? t('routineBuilder.union') : t('routineBuilder.standard')}
                                                </button>
                                            </div>
                                        </div>

                                        {s.exercises.map((ex) => {
                                            const exerciseDef = exercises.find(e => e.id === ex.exerciseId);
                                            if (!exerciseDef) return null;

                                            return (
                                                <div key={ex.id} className={cn(
                                                    "bg-surface-light dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-surface-highlight relative overflow-hidden",
                                                    s.type === 'superset'
                                                        ? "rounded-2xl first:rounded-tl-2xl first:rounded-tr-2xl last:rounded-bl-2xl last:rounded-br-2xl mb-1" // Stacked look for superset
                                                        : "rounded-2xl"
                                                )}>
                                                    {/* Exercise Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-input flex items-center justify-center text-primary">
                                                                <Icon name="fitness_center" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{exerciseDef.title}</h3>
                                                                <p className="text-xs text-gray-500 font-medium">{exerciseDef.muscleGroup}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleTrackingType(s.id, ex.id)}
                                                                className={cn(
                                                                    "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight transition-colors",
                                                                    ex.trackingType === 'time' ? "text-primary" : "text-gray-400"
                                                                )}
                                                                title={ex.trackingType === 'time' ? t('routineBuilder.switchToReps') : t('routineBuilder.switchToTime')}
                                                            >
                                                                <Icon name={ex.trackingType === 'time' ? "schedule" : "tag"} />
                                                            </button>
                                                            <button type="button" onClick={() => removeExercise(s.id, ex.id)} className="text-gray-400 hover:text-red-500">
                                                                <Icon name="close" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Sets Header */}
                                                    <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                                                        <div className="col-span-2 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('routineBuilder.set')}</div>
                                                        <div className="col-span-4 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('routineBuilder.kg')}</div>
                                                        <div className="col-span-4 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                                            {ex.trackingType === 'time' ? t('routineBuilder.duration') : t('routineBuilder.reps')}
                                                        </div>
                                                        <div className="col-span-2 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t('routineBuilder.fail')}</div>
                                                    </div>

                                                    {/* Set Rows */}
                                                    <div className="space-y-2">
                                                        {ex.sets.map((set, index) => (
                                                            <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-2 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSet(s.id, ex.id, set.id)}
                                                                        className={cn(
                                                                            "size-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors hover:bg-red-100 hover:text-red-500",
                                                                            set.type === 'failure' ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                                                        )}
                                                                    >
                                                                        {index + 1}
                                                                    </button>
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <input
                                                                        className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
                                                                        placeholder="-"
                                                                        type="number"
                                                                        value={set.weight || ''}
                                                                        onChange={(e) => updateSet(s.id, ex.id, set.id, 'weight', Number(e.target.value))}
                                                                    />
                                                                </div>
                                                                <div className="col-span-4">
                                                                    {set.type === 'failure' ? (
                                                                        <input
                                                                            className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-400 h-9"
                                                                            value="-"
                                                                            placeholder="-"
                                                                            disabled
                                                                        />
                                                                    ) : ex.trackingType === 'time' ? (
                                                                        <TimeInput
                                                                            className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
                                                                            value={set.time}
                                                                            onChange={(val) => updateSet(s.id, ex.id, set.id, 'time', val)}
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
                                                                            placeholder="-"
                                                                            type="number"
                                                                            value={set.reps || ''}
                                                                            onChange={(e) => updateSet(s.id, ex.id, set.id, 'reps', Number(e.target.value))}
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="col-span-2 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateSet(s.id, ex.id, set.id, 'type', set.type === 'failure' ? 'working' : 'failure')}
                                                                        className={cn("transition-colors", set.type === 'failure' ? "text-primary animate-pulse" : "text-gray-300 dark:text-gray-600 hover:text-primary")}
                                                                    >
                                                                        <Icon name="skull" filled={set.type === 'failure'} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => addSet(s.id, ex.id)}
                                                        className="w-full mt-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary transition-colors border border-dashed border-gray-300 dark:border-gray-700"
                                                    >
                                                        {t('routineBuilder.addSet')}
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Add Exercise Button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowSelector({ seriesId: s.id })}
                                            className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-colors gap-2"
                                        >
                                            <Icon name="add_circle" />
                                            <span className="font-medium text-sm">{t('routineBuilder.addExercise')}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <Button type="button" onClick={addSeries} variant="secondary" className="mt-4">
                                {t('routineBuilder.addSeries')}
                            </Button>

                            {/* Spacer for FAB */}
                            <div className="h-20" />

                            {showSelector && (
                                <ExerciseSelector
                                    onClose={() => setShowSelector(null)}
                                    onSelect={(ex) => handleAddExercise(showSelector.seriesId, ex, series, updateSeriesList)}
                                />
                            )}
                        </div>
                    );
                }}
            </Form.Field>
        </Layout>
    </Form>
  );
}
