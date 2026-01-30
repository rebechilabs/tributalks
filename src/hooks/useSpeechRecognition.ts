import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Convert spoken digits to numbers (e.g., "um dois três" -> "123")
const convertSpokenDigits = (text: string): string => {
  const digitMap: Record<string, string> = {
    'zero': '0',
    'um': '1',
    'uma': '1',
    'dois': '2',
    'duas': '2',
    'três': '3',
    'tres': '3',
    'quatro': '4',
    'cinco': '5',
    'seis': '6',
    'meia': '6', // "meia" is commonly used for 6
    'sete': '7',
    'oito': '8',
    'nove': '9',
  };

  // Split by spaces and convert consecutive number words to digits
  const words = text.toLowerCase().split(/\s+/);
  const result: string[] = [];
  let digitBuffer = '';

  for (const word of words) {
    const cleanWord = word.replace(/[.,]/g, '');
    if (digitMap[cleanWord] !== undefined) {
      digitBuffer += digitMap[cleanWord];
    } else {
      if (digitBuffer) {
        result.push(digitBuffer);
        digitBuffer = '';
      }
      result.push(word);
    }
  }
  
  if (digitBuffer) {
    result.push(digitBuffer);
  }

  return result.join(' ');
};

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI || isListening) return;
    
    // Abort any existing session first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
    }
    
    // Create a fresh instance for each session
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Convert spoken digits to numbers
      const rawTranscript = finalTranscript || interimTranscript;
      const convertedTranscript = convertSpokenDigits(rawTranscript);
      setTranscript(convertedTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setIsListening(true);
    
    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
