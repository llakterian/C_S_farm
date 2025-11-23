import { useState, useEffect, useCallback } from 'react';

// Check if browser supports speech synthesis
const speechSupported = 'speechSynthesis' in window;

export const useVoice = () => {
    const [isEnabled, setIsEnabled] = useState(() => {
        const saved = localStorage.getItem('voiceEnabled');
        return saved ? JSON.parse(saved) : false;
    });
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        localStorage.setItem('voiceEnabled', JSON.stringify(isEnabled));
    }, [isEnabled]);

    const speak = useCallback((text, options = {}) => {
        if (!speechSupported || !isEnabled || !text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'en-US';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isEnabled]);

    const stop = useCallback(() => {
        if (speechSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    const toggle = useCallback(() => {
        setIsEnabled(prev => !prev);
        if (isEnabled) {
            stop();
        }
    }, [isEnabled, stop]);

    // Greeting based on time of day
    const getGreeting = useCallback(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    return {
        speak,
        stop,
        toggle,
        isEnabled,
        isSpeaking,
        isSupported: speechSupported,
        getGreeting,
    };
};

export default useVoice;
