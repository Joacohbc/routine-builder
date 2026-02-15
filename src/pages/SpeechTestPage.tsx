import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { SpeechRecognition } from '@/components/SpeechRecognition';
import { SpeechSynthesis } from '@/components/SpeechSynthesis';

export default function SpeechTestPage() {
  const { t, i18n } = useTranslation();

  const [recognitionLang, setRecognitionLang] = useState(i18n.language);

  // Use custom hooks
  const {
    isListening,
    transcript,
    error,
    toggleListening,
    isSupported: isRecognitionSupported,
    recognitionLanguages,
  } = useSpeechRecognition(recognitionLang);

  const {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    isSupported: isSpeechSynthesisSupported,
  } = useSpeechSynthesis();

  return (
    <Layout title={t('speechTest.title')} showBackButton>
      <div className="flex flex-col gap-8 p-4">
        <SpeechRecognition
          isSupported={isRecognitionSupported}
          isListening={isListening}
          transcript={transcript}
          error={error}
          recognitionLanguages={recognitionLanguages}
          recognitionLang={recognitionLang}
          onToggleListening={toggleListening}
          onLanguageChange={setRecognitionLang}
        />

        <SpeechSynthesis
          isSupported={isSpeechSynthesisSupported}
          isSpeaking={isSpeaking}
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          onSpeak={speak}
        />
      </div>
    </Layout>
  );
}
