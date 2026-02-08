import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// Global cache to avoid re-fetching the large icons.json file multiple times
let cachedAllIcons: string[] | null = null;
let isFetchingPromise: Promise<string[]> | null = null;

async function fetchAllIcons(): Promise<string[]> {
  if (cachedAllIcons) return cachedAllIcons;
  if (isFetchingPromise) return isFetchingPromise;

  isFetchingPromise = fetch('./icon_names.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load icons');
      return res.json();
    })
    .then(names => {
      // Remove duplicates just in case and ensure it's an array of strings
      const uniqueNames = Array.from(new Set(names));
      cachedAllIcons = uniqueNames as string[];
      return cachedAllIcons;
    })
    .catch(err => {
      console.error('Error loading icon_names.json:', err);
      return [];
    });

  return isFetchingPromise;
}

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  label?: string;
  onBlur?: () => void;
}

export function IconPicker({
  value,
  onChange,
  error,
  className,
  placeholder,
  label,
  onBlur
}: IconPickerProps) {
  const { t } = useTranslation();
  const displayPlaceholder = placeholder || t('iconPicker.selectPlaceholder', 'Select an icon...');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [fullIconList, setFullIconList] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(120);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const resetScroll = () => {
    setDisplayCount(120);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }
  };

  const filteredIcons = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const query = normalize(search);

    if (!query) {
      return fullIconList;
    }

    return fullIconList.filter(icon => normalize(icon).includes(query));
  }, [search, fullIconList]);



  // Infinite scroll observer
  useEffect(() => {
    if (filteredIcons.length <= displayCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + 120);
        }
      },
      { 
        threshold: 0.1, 
        root: scrollContainerRef.current,
        rootMargin: '200px' 
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [filteredIcons.length, displayCount]);

  useEffect(() => {
    if (isOpen && fullIconList.length === 0) {
      fetchAllIcons().then(icons => {
        setFullIconList(icons);
      });
    }
  }, [isOpen, fullIconList.length]);

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
  };

  const formatIconName = (name: string) => {
    return name
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <>
      <div className={cn("w-full", className)}>
        {label && (
          <label className="block text-xs font-medium text-text-secondary mb-1 ml-1">
            {label}
          </label>
        )}
        <button
          type="button"
          onBlur={onBlur}
          onClick={() => {
            setIsOpen(true);
            setSearch('');
            resetScroll();
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
            error
              ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
              : "border-border bg-surface hover:border-primary/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          {value ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon name={value} size={20} />
              </div>
              <span className="flex-1 font-medium text-text-main truncate">
                {formatIconName(value)}
              </span>
              <Icon name="expand_more" className="text-text-muted" />
            </>
          ) : (
            <>
              <span className="flex-1 text-text-muted">
                {displayPlaceholder}
              </span>
              <Icon name="expand_more" className="text-text-muted" />
            </>
          )}
        </button>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="centered"
        className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border space-y-4 bg-surface z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-main">{t('iconPicker.title', 'Select Icon')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-text-secondary hover:bg-surface-highlight rounded-full"
            >
              <Icon name="close" />
            </button>
          </div>

          <Input
            icon="search"
            placeholder={t('common.search', 'Search...')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetScroll();
            }}
            className="w-full"
            autoFocus
          />
        </div>

        {/* Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-background"
        >
            <>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {filteredIcons.slice(0, displayCount).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleSelect(icon)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all hover:scale-105 active:scale-95",
                      value === icon
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface text-primary border-transparent hover:border-border shadow-sm"
                    )}
                    title={icon}
                  >
                    <Icon name={icon} size={28} />
                  </button>
                ))}
              </div>

              {filteredIcons.length > displayCount && (
                <div ref={observerTarget} className="h-24 flex flex-col items-center justify-center gap-2 mt-4">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-text-muted font-medium">
                    {t('iconPicker.loadingMore', 'Loading more icons...')}
                  </p>
                </div>
              )}

              {filteredIcons.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-text-muted">
                  <Icon name="search_off" size={48} className="mb-2 opacity-20" />
                  <p>{t('iconPicker.notFound', 'No icons found')}</p>
                </div>
              )}
            </>
        </div>

        {/* Footer info */}
        <div className="p-3 text-center text-xs text-text-muted border-t border-border bg-surface">
          {t('iconPicker.footer', 'Showing {{count}} icons', { count: filteredIcons.length })}
        </div>
      </Modal>
    </>
  );
}
