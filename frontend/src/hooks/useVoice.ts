import { useCallback } from 'react';

// Type declarations for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const useVoice = () => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Add Swahili support
      speechSynthesis.speak(utterance);
    }
  }, []);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const listen = useCallback((callback: (transcript: string) => void) => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        callback(transcript);
      };
      recognition.start();
    }
  }, []);

  return { speak, listen, getGreeting };
};
