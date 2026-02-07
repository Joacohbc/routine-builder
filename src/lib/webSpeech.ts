// --- Speech Recognition Types ---

/**
 * Event fired when speech recognition returns results.
 * Contains the transcribed text and whether the result is final or partial.
 */
export interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string; // The recognized text
      };
      isFinal: boolean; // true if final result, false if interim/partial
    };
    length: number; // Total number of results
  };
}

/**
 * Event fired when speech recognition encounters an error.
 * Examples: "no-speech", "network", "not-allowed", "aborted"
 */
export interface SpeechRecognitionErrorEvent {
  error: string; // Error type identifier
}

/**
 * Interface for a SpeechRecognition instance.
 * Represents the object returned by `new SpeechRecognition()` or `new webkitSpeechRecognition()`.
 * Extends EventTarget to support addEventListener/removeEventListener.
 */
export interface SpeechRecognition extends EventTarget {
  continuous: boolean; // Whether the recognition should continue listening after pauses
  interimResults: boolean; // Whether to return partial results while the user is speaking
  lang: string; // Language code (e.g., "es-ES", "en-US")
  start: () => void; // Start listening
  stop: () => void; // Stop listening (processes what was heard)
  abort: () => void; // Cancel immediately (discards everything)
  onresult: (event: SpeechRecognitionEvent) => void; // Handler for recognition results
  onerror: (event: SpeechRecognitionErrorEvent) => void; // Handler for errors
  onend: () => void; // Handler for when recognition ends
}

/**
 * Constructor type for SpeechRecognition.
 * Represents the class itself (not an instance), used to define the type of window.SpeechRecognition.
 * This allows TypeScript to understand: `const API = window.SpeechRecognition; new API();`
 */
interface SpeechRecognitionConstructor {
  new(): SpeechRecognition; // Calling 'new' returns a SpeechRecognition instance
}

/**
 * Extend the global Window interface to include Web Speech API properties.
 * This tells TypeScript that these properties exist on the browser's window object.
 * Both are optional (?) because not all browsers support the Speech Recognition API.
 */
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor; // Standard API (Chrome, Edge, Opera)
    webkitSpeechRecognition?: SpeechRecognitionConstructor; // Prefixed API (Safari, older Chrome)
  }
}

// --- Helper Functions ---
export const isSpeechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export const isSpeechSynthesisSupported = 'speechSynthesis' in window;

/**
 * Represents a language option for speech recognition.
 */
export interface RecognitionLanguage {
  label: string;
  value: string;
}

/**
 * Available languages for speech recognition.
 * Similar to how voices are provided for synthesis.
 */
export const recognitionLanguages: RecognitionLanguage[] = [
  { label: 'Español (ES)', value: 'es-ES' },
  { label: 'Español (MX)', value: 'es-MX' },
  { label: 'Español (AR)', value: 'es-AR' },
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Português (BR)', value: 'pt-BR' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Italiano', value: 'it-IT' },
  { label: '日本語', value: 'ja-JP' },
  { label: '中文', value: 'zh-CN' },
];

/**
 * Creates a configured SpeechRecognition instance
 * @param language - Language code (e.g., "es-ES", "en-US")
 * @returns Promise that resolves with the configured recognition instance
 */
export function createSpeechRecognition(language: string): Promise<SpeechRecognition> {
  return new Promise((resolve, reject) => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      reject(new Error('Speech Recognition not supported'));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    
    // Allow recognition to continue listening even after pauses
    recognition.continuous = true;
    
    // Return partial results while the user is speaking (real-time text)
    recognition.interimResults = true;
    
    // Set the language for recognition (e.g., "es-ES" for Spanish, "en-US" for English)
    recognition.lang = language;

    resolve(recognition);
  });
}

/**
 * Loads available speech synthesis voices
 * @returns Promise that resolves with the list of available voices
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Chrome requires this event to load voices
    window.speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      resolve(loadedVoices);
    };
  });
}
