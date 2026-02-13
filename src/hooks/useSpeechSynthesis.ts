import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadVoices, isSpeechSynthesisSupported } from '@/lib/webSpeech';

interface UseSpeechSynthesisOptions {
  language?: string;
  defaultVoiceURI?: string;
}

export function useSpeechSynthesis(options?: UseSpeechSynthesisOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const isSupported = useMemo(() => isSpeechSynthesisSupported && voices.length > 0, [ voices.length]);
  
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
          return;
        }

        // If a defaultVoiceURI is provided, try to find that voice
        if (options?.defaultVoiceURI) {
          const voice = availableVoices.find(v => v.voiceURI === options.defaultVoiceURI);
          setSelectedVoice(voice || availableVoices[0] || null);
          return;
        }

        setSelectedVoice(availableVoices[0] || null);
      });

    return () => {
      mounted = false;
    };
  }, [options?.language, options?.defaultVoiceURI]);

  const speak = useCallback((text: string) => {
    if (!text || !isSpeechSynthesisSupported) return;
    if(voices.length === 0) return; // Voices not loaded yet
    if(selectedVoice === null) return; // No voice selected

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice ? selectedVoice.lang : '';
    utterance.voice = selectedVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [ selectedVoice, voices ]);

  const cancel = useCallback(() => {
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

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
