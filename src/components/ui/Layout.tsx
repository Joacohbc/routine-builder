import type { ReactNode } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function Layout({ children, header }: LayoutProps) {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-background">
      {header && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-safe-top">
          {header}
        </header>
      )}
      <main className="flex-1 overflow-y-auto px-6 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
