import { cn } from '@/lib/utils';
import type { WorkoutSet, TrackingType } from '@/types';

import { FormattedTimeInput } from '@/components/ui/FormattedTimeInput';
import { Icon } from '@/components/ui/Icon';

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

export function ExerciseSerieRow({
	set, index, trackingType, seriesId, exerciseId, onUpdateSet, onRemoveSet
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
					onChange={(e) => onUpdateSet(seriesId, exerciseId, set.id, 'weight', Number(e.target.value))} />
			</div>

			<div className="col-span-4">
				{set.type === 'failure' ? (
					<input
						className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-400 h-9"
						value="-"
						placeholder="-"
						disabled />
				) : trackingType === 'time' ? (
					<FormattedTimeInput
						className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
						value={set.time || 0}
						onChange={(val) => onUpdateSet(seriesId, exerciseId, set.id, 'time', val)} />
				) : (
					<input
						className="w-full bg-gray-50 dark:bg-surface-input border-none rounded-lg text-center text-sm font-semibold text-gray-900 dark:text-white h-9 focus:ring-1 focus:ring-primary placeholder-gray-400"
						placeholder="-"
						type="number"
						value={set.reps || ''}
						onChange={(e) => onUpdateSet(seriesId, exerciseId, set.id, 'reps', Number(e.target.value))} />
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
