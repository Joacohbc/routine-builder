import { useState, useEffect, useCallback } from 'react';
import { loadVoices, isSpeechSynthesisSupported } from '@/lib/webSpeech';

interface UseSpeechSynthesisOptions {
  language?: string;
}

export function useSpeechSynthesis(options?: UseSpeechSynthesisOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!isSpeechSynthesisSupported) return;

    let mounted = true;

    loadVoices()
      .then((availableVoices) => {
        if (!mounted) return;

        setVoices(availableVoices);
        
        // If a language is specified, try to find a voice for that language
        if (options?.language) {
          const langCode = options.language.toLowerCase();
          // Try exact match first (e.g., 'es-ES')
          let voice = availableVoices.find(v => v.lang.toLowerCase() === langCode);
          
          // If not found, try language prefix match (e.g., 'es' matches 'es-ES', 'es-MX')
          if (!voice) {
            voice = availableVoices.find(v => v.lang.toLowerCase().startsWith(langCode));
          }
          
          setSelectedVoice(voice || availableVoices[0] || null);
        } else {
          setSelectedVoice(availableVoices[0] || null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [options?.language]);

  const speak = useCallback((text: string) => {
    if (!text || !isSpeechSynthesisSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice ? selectedVoice.lang : '';

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const cancel = useCallback(() => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSupported: isSpeechSynthesisSupported,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    cancel
  };
}
