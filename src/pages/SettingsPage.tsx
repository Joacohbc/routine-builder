import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { label: 'English', value: 'English' },
    { label: 'Español', value: 'Español' },
  ];

  return (
    <Layout
      header={
        <div className="flex items-center p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800/50">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Settings</h2>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-4">
        {/* Section: General */}
        <section>
          {/* SectionHeader */}
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3 pt-2">General</h3>
          {/* Grouped List Items Background */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
            {/* ListItem: Language */}
            <div className="relative flex flex-col w-full">
              <button
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-4 px-4 min-h-[60px] justify-between w-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="language" size={18} />
                  </div>
                  <p className="text-slate-900 dark:text-white text-base font-medium leading-normal flex-1 truncate text-left">Language</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <p className="text-sm font-normal leading-normal">{language}</p>
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Section: Appearance */}
        <section>
          {/* SectionHeader */}
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3">Appearance</h3>
          {/* RadioList Container */}
          <div className="flex flex-col gap-3" style={{'--radio-dot-svg': "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e')" } as React.CSSProperties}>
            {/* Radio Option 1: Light Mode */}
            <label className="group cursor-pointer flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark p-4 flex-row-reverse shadow-sm hover:border-primary/50 transition-all">
              <input
                className="peer h-5 w-5 appearance-none rounded-full border-2 border-slate-400 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                name="theme_selector"
                type="radio"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
              />
              <div className="flex grow items-center gap-3">
                <Icon name="light_mode" className="text-slate-500 dark:text-slate-400 peer-checked:text-primary transition-colors" />
                <div className="flex flex-col">
                  <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Light Mode</p>
                </div>
              </div>
            </label>
            {/* Radio Option 2: Dark Mode */}
            <label className="group cursor-pointer flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark p-4 flex-row-reverse shadow-sm hover:border-primary/50 transition-all">
              <input
                className="peer h-5 w-5 appearance-none rounded-full border-2 border-slate-400 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                name="theme_selector"
                type="radio"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <div className="flex grow items-center gap-3">
                <Icon name="dark_mode" className="text-slate-500 dark:text-slate-400 peer-checked:text-primary transition-colors" />
                <div className="flex flex-col">
                  <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Dark Mode</p>
                </div>
              </div>
            </label>
            {/* Radio Option 3: System Default */}
            <label className="group cursor-pointer flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark p-4 flex-row-reverse shadow-sm hover:border-primary/50 transition-all">
              <input
                className="peer h-5 w-5 appearance-none rounded-full border-2 border-slate-400 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                name="theme_selector"
                type="radio"
                checked={theme === 'system'}
                onChange={() => setTheme('system')}
              />
              <div className="flex grow items-center gap-3">
                <Icon name="settings_brightness" className="text-slate-500 dark:text-slate-400 peer-checked:text-primary transition-colors" />
                <div className="flex flex-col">
                  <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">System Default</p>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Footer Info */}
        <div className="mt-auto pt-8 pb-6 flex flex-col items-center justify-center opacity-40">
          <div className="size-10 rounded-xl bg-primary mb-3 flex items-center justify-center shadow-lg shadow-primary/40">
            <Icon name="inventory_2" className="text-white" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lavender Focus v1.0.4</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Local Data Storage Active</p>
        </div>
      </div>

      <Modal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        variant="bottom-sheet"
      >
        <div className="flex flex-col p-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Language</h3>
          <div className="flex flex-col gap-2">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value);
                  setShowLanguageModal(false);
                }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all",
                  language === lang.value
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-surface-light dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800"
                )}
              >
                <span className="font-medium">{lang.label}</span>
                {language === lang.value && (
                  <Icon name="check" size={20} />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowLanguageModal(false)}
            className="mt-4 w-full py-4 text-center text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
