import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import type { MediaItem } from '@/types';

interface MediaUploadInputProps {
  value?: MediaItem[];
  onChange: (value: MediaItem[]) => void;
  className?: string;
}

export function MediaUploadInput({ value = [], onChange, className }: MediaUploadInputProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const media = value || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert(t('validations.mediaType'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newMedia: MediaItem = {
        id: crypto.randomUUID(),
        type: isImage ? 'image' : 'video',
        url: base64Url,
      };
      onChange([...media, newMedia]);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addYouTube = () => {
    const url = prompt(t('exercise.enterYoutubeUrl'));
    if (!url) return;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    if (videoId) {
      onChange([
        ...media,
        {
          id: crypto.randomUUID(),
          type: 'youtube',
          url: videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        },
      ]);
    } else {
      alert(t('validations.invalidYoutubeUrl', 'Invalid YouTube URL'));
    }
  };

  const removeMedia = (mediaId: string) => {
    onChange(media.filter((m) => m.id !== mediaId));
  };

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {t('exercise.media', 'Multimedia Gallery')}
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark transition-colors"
        >
          <Icon name="add_circle" size={16} /> {t('common.addItem')}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*"
        onChange={handleFileUpload}
      />

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-none w-24 h-24 rounded-2xl border-2 border-dashed border-gray-600 dark:border-gray-700 flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-white/5 transition-colors snap-start"
        >
          <Icon name="add_a_photo" size={24} />
          <span className="text-[10px] font-medium">{t('common.upload', 'Upload')}</span>
        </button>

        {media.map((m) => (
          <div
            key={m.id}
            className="relative flex-none w-24 h-24 rounded-2xl overflow-hidden bg-surface-highlight snap-start group"
          >
            {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" />}
            {m.type === 'video' && <video src={m.url} className="w-full h-full object-cover" />}
            {m.type === 'youtube' && (
              <>
                <img src={m.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="play_circle" className="text-white drop-shadow-lg" size={24} />
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => removeMedia(m.id)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addYouTube}
          className="flex-none w-24 h-24 rounded-2xl bg-red-900/20 border border-red-900/50 flex flex-col items-center justify-center gap-1 text-red-500 hover:bg-red-900/30 transition-colors snap-start"
        >
          <Icon name="smart_display" size={24} />
          <span className="text-[10px] font-bold">YOUTUBE</span>
        </button>
      </div>
    </section>
  );
}
