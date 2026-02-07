import { useState, useEffect, useCallback } from 'react';
import { loadVoices, isSpeechSynthesisSupported } from '@/lib/webSpeech';

export function useSpeechSynthesis() {
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
        setSelectedVoice(availableVoices[0] || null);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
