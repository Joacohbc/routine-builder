import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';

type LayoutPropsBase = {
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showBackButton?: boolean;
  onBack?: () => void;
};

type LayoutPropsWithHeader = LayoutPropsBase & {
  header: ReactNode;
  title?: string;
};

type LayoutPropsWithTitle = LayoutPropsBase & {
  header?: never;
  title: string;
};

type LayoutProps = LayoutPropsWithHeader | LayoutPropsWithTitle;

export function Layout({
  children,
  title,
  searchValue,
  onSearchChange,
  showBackButton = false,
  onBack,
  header,
}: LayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const hasSearch = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-background animate-soft-appear">
      {header ? (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-safe-top">
          {header}
        </header>
      ) : (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-safe-top">
          <div className="flex flex-col px-6 pb-4 pt-12 gap-4">
            <div className="flex items-center justify-between">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors mr-2"
                >
                  <Icon name="arrow_back" size={24} />
                </button>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-text-main flex-1">
                {title}
              </h1>
            </div>
            {hasSearch && (
              <Input
                icon="search"
                placeholder={t('common.search')}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            )}
          </div>
        </header>
      )}
      <main className="flex-1 overflow-y-auto px-6 pb-24">{children}</main>
    </div>
  );
}
