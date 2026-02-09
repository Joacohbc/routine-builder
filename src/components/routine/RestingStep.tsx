import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface RestingStepProps {
  restTimer: number;
  targetRestTime?: number;
  onSkip: () => void;
}

export function RestingStep({ restTimer, targetRestTime, onSkip }: RestingStepProps) {
  const { t } = useTranslation();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
      <span className="text-text-secondary text-sm uppercase tracking-widest font-bold mb-4">
        {t('activeWorkout.resting')}
      </span>
      <div className="text-6xl font-mono font-bold text-primary mb-2">
        {formatTime(restTimer)}
      </div>
      {targetRestTime !== undefined && (
        <div className="text-sm text-text-secondary mb-6">
          {t('activeWorkout.targetRestTime', { time: formatTime(targetRestTime) })}
        </div>
      )}
      <Button onClick={onSkip} variant="secondary">
        {t('activeWorkout.skipRest')}
      </Button>
    </div>
  );
}
