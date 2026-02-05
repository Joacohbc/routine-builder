import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { COMMON_ICONS, UNIQUE_ALL_ICONS } from '@/lib/iconList';

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
      cachedAllIcons = names as string[];
      return cachedAllIcons;
    })
    .catch(err => {
      console.error('Error loading icon_names.json:', err);
      return UNIQUE_ALL_ICONS; // Fallback to static list
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
  const [activeTab, setActiveTab] = useState<'common' | 'all'>('common');
  const [fullIconList, setFullIconList] = useState<string[]>(UNIQUE_ALL_ICONS);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(120);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredIcons = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const query = normalize(search);

    const baseList = activeTab === 'common' ? COMMON_ICONS : fullIconList;

    if (!query) {
      return baseList;
    }

    // When searching, search across fullIconList regardless of tab if it's loaded
    const searchSource = fullIconList.length > UNIQUE_ALL_ICONS.length ? fullIconList : UNIQUE_ALL_ICONS;
    return searchSource.filter(icon => normalize(icon).includes(query));
  }, [search, activeTab, fullIconList]);

  // Reset display count when filtering changes
  useEffect(() => {
    setDisplayCount(120);
    // Reset scroll position to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [search, activeTab]);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || filteredIcons.length <= displayCount) return;

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
  }, [filteredIcons.length, displayCount, isLoading]);

  useEffect(() => {
    const shouldLoad = isOpen && (activeTab === 'all' || search.length > 0);
    if (shouldLoad && fullIconList.length <= UNIQUE_ALL_ICONS.length) {
      setIsLoading(true);
      fetchAllIcons().then(icons => {
        setFullIconList(icons);
        setIsLoading(false);
      });
    }
  }, [isOpen, activeTab, search, fullIconList.length]);

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
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
            {label}
          </label>
        )}
        <button
          type="button"
          onBlur={onBlur}
          onClick={() => {
            setIsOpen(true);
            setSearch('');
            setActiveTab('common');
          }}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
            error
              ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
              : "border-gray-200 dark:border-surface-highlight bg-surface-light dark:bg-surface-dark hover:border-primary/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          {value ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon name={value} size={20} />
              </div>
              <span className="flex-1 font-medium text-slate-900 dark:text-white truncate">
                {formatIconName(value)}
              </span>
              <Icon name="expand_more" className="text-gray-400" />
            </>
          ) : (
            <>
              <span className="flex-1 text-gray-500 dark:text-gray-400">
                {displayPlaceholder}
              </span>
              <Icon name="expand_more" className="text-gray-400" />
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
        <div className="p-4 border-b border-gray-100 dark:border-surface-highlight space-y-4 bg-surface-light dark:bg-surface-dark z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{t('iconPicker.title', 'Select Icon')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-highlight rounded-full"
            >
              <Icon name="close" />
            </button>
          </div>

          <Input
            icon="search"
            placeholder={t('common.search', 'Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            autoFocus
          />

          {!search && (
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-surface-highlight rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('common')}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'common'
                    ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                {t('iconPicker.common', 'Common')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'all'
                    ? "bg-white dark:bg-surface-dark shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                {t('iconPicker.all', 'All Icons')}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-background-dark/50"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-gray-500 font-medium">
                {t('iconPicker.loading', 'Loading icons...')}
              </p>
            </div>
          ) : (
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
                        : "bg-surface-light text-primary dark:bg-surface-dark border-transparent hover:border-gray-200 dark:hover:border-surface-highlight shadow-sm"
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
                  <p className="text-xs text-gray-400 font-medium">
                    {t('iconPicker.loadingMore', 'Loading more icons...')}
                  </p>
                </div>
              )}

              {filteredIcons.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <Icon name="search_off" size={48} className="mb-2 opacity-20" />
                  <p>{t('iconPicker.notFound', 'No icons found')}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-surface-highlight bg-surface-light dark:bg-surface-dark">
          {t('iconPicker.footer', 'Showing {{count}} icons', { count: filteredIcons.length })}
        </div>
      </Modal>
    </>
  );
}
