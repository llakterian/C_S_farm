import React from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import useVoice from '../hooks/useVoice';

const VoiceButton = ({ className = '' }) => {
    const { isEnabled, isSpeaking, toggle, isSupported } = useVoice();

    if (!isSupported) return null;

    return (
        <button
            onClick={toggle}
            className={`inline-flex items-center justify-center p-2 rounded-full transition-colors touch-manipulation min-h-[48px] min-w-[48px] ${isEnabled
                    ? 'bg-farm-600 text-white hover:bg-farm-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                } ${className}`}
            aria-label={isEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
            title={isEnabled ? 'Voice guidance on' : 'Voice guidance off'}
        >
            {isEnabled ? (
                <SpeakerWaveIcon
                    className={`h-6 w-6 ${isSpeaking ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                />
            ) : (
                <SpeakerXMarkIcon className="h-6 w-6" aria-hidden="true" />
            )}
        </button>
    );
};

export default VoiceButton;
