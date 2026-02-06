import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';

// Define minimal types for Speech Recognition
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function SpeechTestPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = i18n.language; // Use current app language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      setError(null);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);

      let errorMessage = t('speechTest.errors.default');

      if (event.error === 'network') {
          errorMessage = t('speechTest.errors.network');
      } else if (event.error === 'not-allowed') {
          errorMessage = t('speechTest.errors.notAllowed');
      } else if (event.error === 'no-speech') {
          errorMessage = t('speechTest.errors.noSpeech');
      }

      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, [i18n.language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSpeak = () => {
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = i18n.language;
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
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
                <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
                    {t('speechTest.title')}
                </h2>
            </div>
        }
      >
        <div className="p-8 text-center text-text-secondary">
          <Icon name="error" size={48} className="mx-auto mb-4 text-red-400" />
          <p>{t('speechTest.notSupported')}</p>
        </div>
      </Layout>
    );
  }

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
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
            {t('speechTest.title')}
          </h2>
        </div>
      }
    >
      <div className="flex flex-col gap-8 p-4">

        {/* Speech Recognition Section */}
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-primary text-sm font-bold uppercase tracking-wider">
                    Speech to Text
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${isListening ? 'bg-green-500/10 text-green-500' : 'bg-surface text-text-muted'}`}>
                    {isListening ? (i18n.language.startsWith('es') ? 'Escuchando...' : 'Listening...') : (i18n.language.startsWith('es') ? 'Inactivo' : 'Idle')}
                </span>
            </div>

            <div className="bg-surface rounded-xl p-4 min-h-[120px] border border-border shadow-sm relative">
                {transcript ? (
                    <p className="text-text-main leading-relaxed">{transcript}</p>
                ) : (
                    <p className="text-text-muted italic text-sm">{t('speechTest.transcript')}...</p>
                )}
            </div>

            {error && (
                 <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
                    <Icon name="error" size={20} />
                    <p>{error}</p>
                </div>
            )}

            <Button
                variant={isListening ? 'secondary' : 'primary'}
                onClick={toggleListening}
                className="w-full"
                icon={isListening ? 'mic_off' : 'mic'}
            >
                {isListening ? t('speechTest.stopListening') : t('speechTest.startListening')}
            </Button>
        </section>

        {/* Text to Speech Section */}
        <section className="flex flex-col gap-4">
             <h3 className="text-primary text-sm font-bold uppercase tracking-wider">
                Text to Speech
            </h3>

            <div className="flex flex-col gap-3">
                <Input
                    value={textToSpeak}
                    onChange={(e) => setTextToSpeak(e.target.value)}
                    placeholder={t('speechTest.placeholder')}
                />
                <Button
                    variant="secondary"
                    onClick={handleSpeak}
                    disabled={!textToSpeak}
                    icon="volume_up"
                >
                    {t('speechTest.speak')}
                </Button>
            </div>
        </section>

      </div>
    </Layout>
  );
}
