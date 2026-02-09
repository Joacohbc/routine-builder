import type { TrackingType } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { t } from 'i18next';

interface WorkoutSetDisplayProps {
  targetWeight: number;
  targetReps?: number;
  time?: number;
  targetTime?: number;
  trackingType: TrackingType;
}

export function WorkoutSetDisplay({
  targetWeight,
  targetReps,
  time,
  targetTime,
  trackingType
}: WorkoutSetDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xs flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6">

        {/* Weight Display */}
        <div className="flex flex-col gap-2">
          <label className="text-center text-xs font-bold text-text-muted uppercase">KG</label>
          <div className="relative">
            <div className="w-full text-center text-4xl font-bold text-text-main py-2">
              {targetWeight}
            </div>
          </div>
        </div>

        {/* Reps or Time Display */}
        {trackingType === 'time' ? (
          <div className="flex flex-col gap-2">
            <label className="text-center text-xs font-bold text-text-muted uppercase">Time</label>
            <div className="relative">
              <div className="w-full text-center text-4xl font-bold font-mono text-text-main py-2">
                {formatTime(time || 0)}
              </div>
              <div className="text-xs text-center text-text-secondary mt-1">
                Target: {formatTime(targetTime || 0)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-center text-xs font-bold text-text-muted uppercase">
              {targetReps === Infinity ? t('routineBuilder.fail', 'Fail') : 'Reps'}
            </label>
            <div className="relative">
              <div className="w-full text-center text-4xl font-bold text-text-main py-2">
                {targetReps === Infinity ? <Icon name="skull" size={45} /> : targetReps}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
