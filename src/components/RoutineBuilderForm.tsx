import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { routineValidators } from '@/lib/validations';
import { cn } from '@/lib/utils';
import { FormattedTimeInput } from '@/components/ui/FormattedTimeInput';
import type { RoutineSeries, RoutineExercise, WorkoutSet, Exercise, SeriesType, TrackingType } from '@/types';

// ==================== ExerciseSerieRow Component ====================
interface ExerciseSerieRowProps {
	set: WorkoutSet;
	index: number;
	trackingType: TrackingType;
	seriesId: string;
	exerciseId: string;
	onUpdateSet: (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => void;
	onRemoveSet: (seriesId: string, exId: string, setId: string) => void;
}

function ExerciseSerieRow({
	set,
	index,
	trackingType,
	seriesId,
	exerciseId,
	onUpdateSet,
	onRemoveSet
}: ExerciseSerieRowProps) {
	return (
		<div className="grid grid-cols-12 gap-2 items-center">
			<div className="col-span-2 flex justify-center">
				<button
					type="button"
					onClick={() => onRemoveSet(seriesId, exerciseId, set.id)}
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
					onChange={(e) => onUpdateSet(seriesId, exerciseId, set.id, 'weight', Number(e.target.value))}
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
				) : trackingType === 'time' ? (
					<FormattedTimeInput
						className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
						value={set.time || 0}
						onChange={(val) => onUpdateSet(seriesId, exerciseId, set.id, 'time', val)}
					/>
				) : (
					<input
						className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
						placeholder="-"
						type="number"
						value={set.reps || ''}
						onChange={(e) => onUpdateSet(seriesId, exerciseId, set.id, 'reps', Number(e.target.value))}
					/>
				)}
			</div>

			<div className="col-span-2 flex justify-center">
				<button
					type="button"
					onClick={() => onUpdateSet(seriesId, exerciseId, set.id, 'type', set.type === 'failure' ? 'working' : 'failure')}
					className={cn(
						"transition-colors",
						set.type === 'failure' ? "text-primary animate-pulse" : "text-gray-300 dark:text-gray-600 hover:text-primary"
					)}
				>
					<Icon name="skull" filled={set.type === 'failure'} />
				</button>
			</div>
		</div>
	);
}

// ==================== ExerciseSerie Component ====================
interface ExerciseSerieProps {
	exercise: RoutineExercise;
	seriesId: string;
	seriesType: SeriesType;
	onRemoveExercise: (seriesId: string, exId: string) => void;
	onToggleTrackingType: (seriesId: string, exId: string) => void;
	onUpdateSet: (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => void;
	onAddSet: (seriesId: string, exId: string) => void;
	onRemoveSet: (seriesId: string, exId: string, setId: string) => void;
	onUpdateRestAfter: (seriesId: string, exId: string, restAfter: number) => void;
}

function ExerciseSerie({
	exercise,
	seriesId,
	seriesType,
	onRemoveExercise,
	onToggleTrackingType,
	onUpdateSet,
	onAddSet,
	onRemoveSet,
	onUpdateRestAfter
}: ExerciseSerieProps) {
	const { t } = useTranslation();
	const { exercises } = useExercises();

	const exerciseDef = exercises.find(e => e.id === exercise.exerciseId);
	if (!exerciseDef) return null;

	return (
		<div className={cn(
			"bg-surface p-4 shadow-sm border border-gray-100 dark:border-surface-highlight relative overflow-hidden",
			seriesType === 'superset'
				? "rounded-2xl first:rounded-tl-2xl first:rounded-tr-2xl last:rounded-bl-2xl last:rounded-br-2xl mb-1"
				: "rounded-2xl"
		)}>
			{/* Exercise Header */}
			<div className="flex items-center justify-center gap-2 mb-4">
				<SegmentedControl
					options={[
						{ value: 'reps', label: t('routineBuilder.switchToReps') },
						{ value: 'time', label: t('routineBuilder.switchToTime') },
					]}
					value={String(exercise.trackingType)}
					onChange={() => onToggleTrackingType(seriesId, exercise.id)}
				/>
				<button
					type="button"
					onClick={() => onRemoveExercise(seriesId, exercise.id)}
					className="flex items-center justify-center text-gray-400 hover:text-red-500"
				>
					<Icon name="close" />
				</button>
			</div>

			{/* Sets Header */}
			<div className="grid grid-cols-12 gap-2 mb-2 px-1">
				<div className="col-span-2 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
					{t('routineBuilder.set')}
				</div>
				<div className="col-span-4 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
					{t('routineBuilder.kg')}
				</div>
				<div className="col-span-4 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
					{exercise.trackingType === 'time' ? t('routineBuilder.duration') : t('routineBuilder.reps')}
				</div>
				<div className="col-span-2 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
					{t('routineBuilder.fail')}
				</div>
			</div>

			{/* Set Rows */}
			<div className="space-y-2">
				{exercise.sets.map((set, index) => (
					<ExerciseSerieRow
						key={set.id}
						set={set}
						index={index}
						trackingType={exercise.trackingType}
						seriesId={seriesId}
						exerciseId={exercise.id}
						onUpdateSet={onUpdateSet}
						onRemoveSet={onRemoveSet}
					/>
				))}
			</div>

			<button
				type="button"
				onClick={() => onAddSet(seriesId, exercise.id)}
				className="w-full mt-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary transition-colors border border-dashed border-gray-300 dark:border-gray-700"
			>
				{t('routineBuilder.addSet')}
			</button>

			{/* Rest Time Control */}
			<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
						<Icon name="timer" size={18} />
						<span className="text-sm font-medium">{t('routineBuilder.restTime')}</span>
					</div>
					<FormattedTimeInput
						className={cn(
							"w-24 bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold h-9 focus:ring-1 focus:ring-primary",
							seriesType === 'superset' ? "text-gray-400 cursor-not-allowed" : "text-gray-900 dark:text-white"
						)}
						value={seriesType === 'superset' ? 0 : (exercise.restAfter || 0)}
						onChange={(val) => onUpdateRestAfter(seriesId, exercise.id, val)}
						disabled={seriesType === 'superset'}
					/>
				</div>
				{seriesType === 'superset' && (
					<p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
						{t('routineBuilder.supersetNoRest')}
					</p>
				)}
			</div>
		</div>
	);
}

// ==================== Serie Component ====================
interface SerieProps {
	serie: RoutineSeries;
	serieIndex: number;
	canRemove: boolean;
	onRemoveSeries: (seriesId: string) => void;
	onUpdateSerieType: (seriesId: string, newType: RoutineSeries['type']) => void;
	onOpenSelector: (seriesId: string) => void;
	onRemoveExercise: (seriesId: string, exId: string) => void;
	onToggleTrackingType: (seriesId: string, exId: string) => void;
	onUpdateSet: (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => void;
	onAddSet: (seriesId: string, exId: string) => void;
	onRemoveSet: (seriesId: string, exId: string, setId: string) => void;
	onUpdateRestAfter: (seriesId: string, exId: string, restAfter: number) => void;
}

function Serie({
	serie,
	serieIndex,
	canRemove,
	onRemoveSeries,
	onUpdateSerieType,
	onOpenSelector,
	onRemoveExercise,
	onToggleTrackingType,
	onUpdateSet,
	onAddSet,
	onRemoveSet,
	onUpdateRestAfter
}: SerieProps) {
	const { t } = useTranslation();

	return (
		<div className="relative">

			{/* Superset Connector Line */}
			{serie.type === 'superset' && (
				<div className="absolute left-0 top-4 bottom-4 w-1 bg-linear-to-b from-primary via-primary to-primary/50 rounded-full">
					<div className="absolute -left-10.5 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
						<span className="text-[9px] uppercase font-bold text-primary tracking-widest bg-background px-1">
							{t('routineBuilder.superset')}
						</span>
					</div>
				</div>
			)}

			<div className={cn("flex flex-col gap-2", serie.type === 'superset' ? "pl-4" : "")}>

				{/* Series Header / Controls */}
				<div className="flex justify-between items-center px-1 mb-1">
					<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
						{t('routineBuilder.series', { count: serieIndex + 1 })}
					</span>

					<div className="flex gap-2">

						{/* Series Type Selector */}
						<SegmentedControl
							options={[
								{ value: 'standard', label: t('routineBuilder.standard') },
								{ value: 'superset', label: t('routineBuilder.superset') },
							]}
							value={serie.type}
							onChange={(newType) => onUpdateSerieType(serie.id, newType)}
						/>

						{/* Remove Series Button */}
						{canRemove && (
							<button
								type="button"
								onClick={() => onRemoveSeries(serie.id)}
								className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
								title={t('routineBuilder.removeSeries')}
							>
								<Icon name="delete" size={18} />
							</button>
						)}
					</div>
				</div>

				{/* Exercise Rows */}
				{serie.exercises.map((ex) => (
					<ExerciseSerie
						key={ex.id}
						exercise={ex}
						seriesId={serie.id}
						seriesType={serie.type}
						onRemoveExercise={onRemoveExercise}
						onToggleTrackingType={onToggleTrackingType}
						onUpdateSet={onUpdateSet}
						onAddSet={onAddSet}
						onRemoveSet={onRemoveSet}
						onUpdateRestAfter={onUpdateRestAfter}
					/>
				))}

				{/* Add Exercise Button */}
				<button
					type="button"
					onClick={() => onOpenSelector(serie.id)}
					className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-colors gap-2"
				>
					<Icon name="add_circle" />
					<span className="font-medium text-sm">{t('routineBuilder.addExercise')}</span>
				</button>
			</div>
		</div>
	);
}

// ==================== Main Form Component ====================
export interface RoutineBuilderFormProps {
	initialValues: FormFieldValues;
	onSubmit: (values: FormFieldValues) => Promise<void>;
	onCancel: () => void;
}

export function RoutineBuilderForm({ initialValues, onSubmit, onCancel }: RoutineBuilderFormProps) {
	const { t } = useTranslation();
	const [showSelector, setShowSelector] = useState<{ seriesId: string } | null>(null);

	// Helper to add exercise to form state (used by ExerciseSelector)
	const handleAddExercise = (seriesId: string, exercise: Exercise, currentSeries: RoutineSeries[], setSeries: (s: RoutineSeries[]) => void) => {
		const updatedSeries = currentSeries.map(s => {
			if (s.id !== seriesId) return s;

			const trackingType = exercise.defaultType === 'time' ? 'time' : 'reps';
			// Set restAfter to 0 for superset, 90 seconds for standard
			const restAfter = s.type === 'superset' ? 0 : 90;
			const newEx: RoutineExercise = {
				id: crypto.randomUUID(),
				exerciseId: exercise.id!,
				trackingType,
				sets: [
					{ id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false },
					{ id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false },
					{ id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false }
				],
				restAfter
			};
			return { ...s, exercises: [...s.exercises, newEx] };
		});
		setSeries(updatedSeries);
		setShowSelector(null);
	};

	return (
		<Form
			onSubmit={onSubmit}
			defaultValues={initialValues}
			className="h-full"
		>
			<Layout
				header={
					<div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
						<button type="button" onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight">
							<Icon name="arrow_back" />
						</button>
						<Form.Field name="name" validator={routineValidators.name}>
							{({ value, setValue, error }) => (
								<div className="flex-1 px-4 text-center">
									<input
										value={String(value || '')}
										onChange={e => setValue(e.target.value)}
										className="bg-transparent text-center font-bold text-lg focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 w-full max-w-50"
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

						const removeSeries = (seriesId: string) => {
							updateSeriesList(series.filter(s => s.id !== seriesId));
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

						const updateRestAfter = (seriesId: string, exId: string, restAfter: number) => {
							updateSeriesList(series.map(s => {
								if (s.id !== seriesId) return s;
								return {
									...s,
									exercises: s.exercises.map(ex => {
										if (ex.id !== exId) return ex;
										return { ...ex, restAfter };
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
									<Serie
										key={s.id}
										serie={s}
										serieIndex={sIndex}
										canRemove={series.length > 1}
										onRemoveSeries={removeSeries}
										onUpdateSerieType={(seriesId, newType) => {
										updateSeriesList(series.map(serie => {
											if (serie.id !== seriesId) return serie;
											// When changing to superset, set all restAfter to 0
											// When changing to standard, set default restAfter to 90 seconds
											const updatedExercises = serie.exercises.map(ex => ({
												...ex,
												restAfter: newType === 'superset' ? 0 : (ex.restAfter || 90)
											}));
											return { ...serie, type: newType, exercises: updatedExercises };
										}));
										}}
										onOpenSelector={(seriesId) => setShowSelector({ seriesId })}
										onRemoveExercise={removeExercise}
										onToggleTrackingType={toggleTrackingType}
										onUpdateSet={updateSet}
										onAddSet={addSet}
										onRemoveSet={removeSet}									onUpdateRestAfter={updateRestAfter}									/>
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
