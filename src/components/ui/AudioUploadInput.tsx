import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AudioUploadInputProps {
  value?: string; // Base64 Data URI
  onChange: (value?: string) => void;
  className?: string;
}

/**
 * Component for uploading custom audio files.
 * Accepts audio files and converts them to Base64 Data URI.
 */
export function AudioUploadInput({ value, onChange, className }: AudioUploadInputProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert(t('validations.audioType', 'Please select a valid audio file'));
      return;
    }

    // Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      alert(t('validations.audioSize', 'Audio file must be smaller than 1MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      onChange(base64Url);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="audio/*"
        onChange={handleFileUpload}
      />

      {value ? (
        <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <Icon name="audiotrack" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-text-main text-sm font-medium">
              {t('settings.customAudioUploaded', 'Custom Audio Uploaded')}
            </p>
            <p className="text-text-secondary text-xs">
              {t('settings.tapToPreview', 'Tap play to preview')}
            </p>
          </div>
          <button
            onClick={() => {
              const audio = new Audio(value);
              audio.play().catch((err) => console.error('Preview failed:', err));
            }}
            className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Icon name="play_arrow" size={18} />
          </button>
          <button
            onClick={handleRemove}
            className="flex items-center justify-center size-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          className="justify-start gap-3"
        >
          <Icon name="upload" size={20} />
          {t('settings.uploadCustomAudio', 'Upload Custom Audio')}
        </Button>
      )}

      <p className="text-xs text-text-muted px-1">
        {t('settings.audioHint', 'Supported formats: MP3, WAV, OGG. Max size: 1MB')}
      </p>
    </div>
  );
}
