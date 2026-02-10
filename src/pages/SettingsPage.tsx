import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { Icon } from '@/components/ui/Icon';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { TIMER_SOUNDS, useAudio } from '@/hooks/useAudio';
import { Form } from '@/components/ui/Form';
import { ListItemSelect } from '@/components/ui/ListItemSelect';
import { AudioUploadInput } from '@/components/ui/AudioUploadInput';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { playTimerSound } = useAudio();
  const { t, i18n } = useTranslation();

  // Get current language code (first two letters)
  const currentLangCode = i18n.language.split('-')[0];
  const currentLanguage = currentLangCode === 'es' ? 'Español' : 'English';

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  return (
    <Layout
      header={
        <div className="flex items-center p-4 pb-2 justify-between border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">{t('common.settings', 'Settings')}</h2>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-4">
        {/* Section: General */}
        <section>
          {/* SectionHeader */}
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3 pt-2">{t('settings.general', 'General')}</h3>
          {/* Grouped List Items Background */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
            {/* ListItem: Language */}
            <ListItemSelect
              icon="language"
              label={t('settings.language', 'Language')}
              valueLabel={currentLanguage}
              value={currentLangCode}
              options={languages}
              onSelect={handleLanguageChange}
              title={t('settings.selectLanguage', 'Select Language')}
            />
          
            {/* ListItem: Manage Tags */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => navigate('/settings/tags')}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="label" size={18} />
                  </div>
                  <p className="text-text-main text-base font-medium leading-normal flex-1 truncate text-left">
                    {t('tags.title', 'Manage Tags')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* ListItem: Speech Test */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => navigate('/speech-test')}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="mic" size={18} />
                  </div>
                  <p className="text-text-main text-base font-medium leading-normal flex-1 truncate text-left">
                    {t('speechTest.title', 'Web Speech API Test')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Section: Workout */}
        <section>
          {/* SectionHeader */}

          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3 pt-2">{t('settings.workout', 'Workout')}</h3>
          
          {/* Grouped List Items Background */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
          
            {/* ListItem: Auto-Next */}
            <ListItemSelect
              icon="skip_next"
              label={t('settings.autoNext', 'Auto-Next')}
              valueLabel={settings.autoNext ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
              value={settings.autoNext ? 'enabled' : 'disabled'}
              options={[
                { label: t('common.enabled', 'Enabled'), value: 'enabled' },
                { label: t('common.disabled', 'Disabled'), value: 'disabled' },
              ]}
              onSelect={(value) => updateSettings({ autoNext: value === 'enabled' })}
              title={t('settings.selectAutoNext', 'Select Auto-Next')}
              description={t('settings.autoNextDesc', 'Automatically advance when target time is reached')}
            />

            {/* ListItem: Timer Sound Enabled */}
            <ListItemSelect
              icon="notifications_active"
              label={t('settings.timerSound', 'Timer Sound')}
              valueLabel={settings.timerSoundEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
              value={settings.timerSoundEnabled ? 'enabled' : 'disabled'}
              options={[
                { label: t('common.enabled', 'Enabled'), value: 'enabled' },
                { label: t('common.disabled', 'Disabled'), value: 'disabled' },
              ]}
              onSelect={(value) => updateSettings({ timerSoundEnabled: value === 'enabled' })}
              title={t('settings.selectTimerSound', 'Select Timer Sound')}
              description={t('settings.timerSoundDesc', 'Play sound when target time is reached')}
            />

            {/* ListItem: Sound Selection (only if timer sound is enabled) */}
            {settings.timerSoundEnabled && (
              <>
                <ListItemSelect
                  icon="volume_up"
                  label={t('settings.soundType', 'Sound Type')}
                  valueLabel={
                    settings.timerSoundId === 'custom'
                      ? t('settings.customSound', 'Custom')
                      : settings.timerSoundId.charAt(0).toUpperCase() + settings.timerSoundId.slice(1)
                  }
                  value={settings.timerSoundId}
                  options={[
                    ...Object.keys(TIMER_SOUNDS).map(key => ({
                      label: key.charAt(0).toUpperCase() + key.slice(1),
                      value: key,
                    })),
                    { label: t('settings.customSound', 'Custom'), value: 'custom' },
                  ]}
                  onSelect={(value) => updateSettings({ timerSoundId: value })}
                  title={t('settings.selectSound', 'Select Sound')}
                />

                {/* Sound Preview (for predefined sounds) */}
                {settings.timerSoundId !== 'custom' && (
                  <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-3 p-3 bg-surface-highlight rounded-xl border border-border">
                      <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                        <Icon name="audiotrack" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-text-main text-sm font-medium">
                          {settings.timerSoundId.charAt(0).toUpperCase() + settings.timerSoundId.slice(1)}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {t('settings.tapToPreview', 'Tap play to preview')}
                        </p>
                      </div>
                      <button
                        onClick={() => playTimerSound(settings.timerSoundId, settings.customTimerSound)}
                        className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Icon name="play_arrow" size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Audio Upload (only if custom is selected) */}
                {settings.timerSoundId === 'custom' && (
                  <div className="px-4 py-3 border-t border-border">
                    <AudioUploadInput
                      value={settings.customTimerSound}
                      onChange={(value) => updateSettings({ customTimerSound: value })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Section: Appearance */}
        <section>
          {/* SectionHeader */}
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3">{t('settings.appearance', 'Appearance')}</h3>
          {/* RadioList Container */}
          <Form
            onSubmit={() => { }}
            defaultValues={{ theme_selector: theme }}
          >
            <Form.RadioButtonGroup
              name="theme_selector"
              options={[
                { label: t('settings.lightMode', 'Light Mode'), value: 'light', icon: 'light_mode' },
                { label: t('settings.darkMode', 'Dark Mode'), value: 'dark', icon: 'dark_mode' },
                { label: t('settings.systemDefault', 'System Default'), value: 'system', icon: 'settings_brightness' }
              ]}
              validator={(value) => {
                if (value !== theme) {
                  setTheme(value as Theme);
                }
                return { ok: true };
              }}
            />
          </Form>
        </section>

        {/* Footer Info */}
        <div className="mt-auto pt-8 pb-6 flex flex-col items-center justify-center opacity-40">
          <div className="size-10 rounded-xl bg-primary mb-3 flex items-center justify-center shadow-lg shadow-primary/40">
            <Icon name="inventory_2" className="text-white" />
          </div>
          <p className="text-xs font-medium text-text-secondary">{t('settings.version', 'Lavender Focus v1.0.4')}</p>
          <p className="text-[10px] text-text-muted mt-1">{t('settings.localData', 'Local Data Storage Active')}</p>
          <p className="text-[9px] text-text-muted mt-2">
            {t('settings.soundsFrom', 'Sounds from')}{' '}
            <a 
              href="https://pixabay.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-text-secondary transition-colors"
            >
              Pixabay
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
