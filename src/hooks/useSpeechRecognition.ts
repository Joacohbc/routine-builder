import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  recognitionLanguages,
  type SpeechRecognition,
  type SpeechRecognitionEvent,
  type SpeechRecognitionErrorEvent
} from '@/lib/webSpeech';

export function useSpeechRecognition(language: string) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    let mounted = true;

    createSpeechRecognition(language)
      .then((recognition) => {
        if (!mounted) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setError(null);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
        }
      });

    return () => {
      mounted = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setError((err as Error).message || 'start-failed');
      }
    }
  }, [isListening]);

  return {
    isSupported: isSpeechRecognitionSupported,
    isListening,
    transcript,
    error,
    toggleListening,
    recognitionLanguages
  };
}
