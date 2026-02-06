import { useState, useEffect, useRef, useCallback } from 'react';

// --- Speech Recognition Types ---
export interface SpeechRecognitionEvent {
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

export interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface SpeechRecognition extends EventTarget {
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

// --- Hooks ---

export function useSpeechRecognition(language: string) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

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

    return () => {
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
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    toggleListening
  };
}

export function useSpeechSynthesis(language: string) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isSupported] = useState(() => 'speechSynthesis' in window);

    useEffect(() => {
        if (!isSupported) return;

        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Try to set a default voice matching the language
            if (!selectedVoice && availableVoices.length > 0) {
                const defaultVoice = availableVoices.find(v => v.lang.startsWith(language)) || availableVoices[0];
                setSelectedVoice(defaultVoice);
            }
        };

        updateVoices();

        // Chrome requires this event to load voices
        window.speechSynthesis.onvoiceschanged = updateVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported, language, selectedVoice]);

    // Update default voice when language changes if no manual selection has been made (or force update)
    useEffect(() => {
         if (voices.length > 0) {
            const defaultVoice = voices.find(v => v.lang.startsWith(language));
             if (defaultVoice) {
                 setSelectedVoice(defaultVoice);
             }
         }
    }, [language, voices]);


    const speak = useCallback((text: string) => {
        if (!text || !isSupported) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [language, selectedVoice, isSupported]);

    const cancel = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return {
        isSupported,
        isSpeaking,
        voices,
        selectedVoice,
        setSelectedVoice,
        speak,
        cancel
    };
}
