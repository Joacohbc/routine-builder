import { useExercises } from '@/hooks/useExercises';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

import { FormattedTimeInput } from '@/components/ui/FormattedTimeInput';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { RoutineExercise, SeriesType, WorkoutSet } from '@/types';
import { ExerciseSerieRow } from '@/components/routine/ExerciseSerieRowProps';

// ==================== ExerciseSerie Component ====================
export interface ExerciseSerieProps {
    routineExercise: RoutineExercise;
    seriesId: string;
    seriesType: SeriesType;
    onRemoveExercise: (seriesId: string, exId: string) => void;
    onToggleTrackingType: (seriesId: string, exId: string) => void;
    onUpdateSet: (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => void;
    onAddSet: (seriesId: string, exId: string) => void;
    onRemoveSet: (seriesId: string, exId: string, setId: string) => void;
    onUpdateRestAfter: (seriesId: string, exId: string, restAfterSet: number) => void;
}

export function ExerciseSerie({
	routineExercise, seriesId, seriesType, onRemoveExercise, onToggleTrackingType, onUpdateSet, onAddSet, onRemoveSet, onUpdateRestAfter
}: ExerciseSerieProps) {
	const { t } = useTranslation();
	const { exercises } = useExercises();

	const exerciseComplete = exercises.find(e => e.id === routineExercise.exerciseId);
	if (!exerciseComplete) return null;

	return (
		<div className={cn(
			"bg-surface p-4 shadow-sm border border-gray-100 dark:border-surface-highlight relative overflow-hidden",
			seriesType === 'superset'
				? "rounded-2xl first:rounded-tl-2xl first:rounded-tr-2xl last:rounded-bl-2xl last:rounded-br-2xl mb-1"
				: "rounded-2xl"
		)}>
			{/* Exercise Header */}
			<div className="mb-4">
				{/* Exercise Name */}
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-base font-semibold text-text-main truncate flex-1">
						{exerciseComplete.title}
					</h3>
					<button
						type="button"
						onClick={() => onRemoveExercise(seriesId, routineExercise.id)}
						className="flex items-center justify-center text-gray-400 hover:text-red-500 ml-2"
					>
						<Icon name="close" />
					</button>
				</div>

				{/* Tracking Type Selector */}
				<div className="flex justify-center">
					<SegmentedControl
						options={[
							{ value: 'reps', label: t('routineBuilder.switchToReps') },
							{ value: 'time', label: t('routineBuilder.switchToTime') },
						]}
						value={String(routineExercise.trackingType)}
						onChange={() => onToggleTrackingType(seriesId, routineExercise.id)} />
				</div>
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
					{routineExercise.trackingType === 'time' ? t('routineBuilder.duration') : t('routineBuilder.reps')}
				</div>
				<div className="col-span-2 text-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
					{t('routineBuilder.fail')}
				</div>
			</div>

			{/* Set Rows */}
			<div className="space-y-2">
				{routineExercise.sets.map((set, index) => (
					<ExerciseSerieRow
						key={set.id}
						set={set}
						index={index}
						trackingType={routineExercise.trackingType}
						seriesId={seriesId}
						exerciseId={routineExercise.id}
						onUpdateSet={onUpdateSet}
						onRemoveSet={onRemoveSet} />
				))}
			</div>

			<button
				type="button"
				onClick={() => onAddSet(seriesId, routineExercise.id)}
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
						value={seriesType === 'superset' ? 0 : routineExercise.restAfterSet}
						onChange={(val) => onUpdateRestAfter(seriesId, routineExercise.id, val)}
						disabled={seriesType === 'superset'} />
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
