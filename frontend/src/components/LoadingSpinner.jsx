import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
    const sizeClasses = {
        small: 'h-8 w-8',
        medium: 'h-12 w-12',
        large: 'h-16 w-16',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
            {/* Animated Farm Icon */}
            <div className={`${sizeClasses[size]} relative mb-4`}>
                <div className="absolute inset-0 border-4 border-farm-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-farm-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    🌱
                </div>
            </div>

            {/* Loading Message */}
            <p className="text-base text-gray-600 font-medium">
                {message}
            </p>
            <span className="sr-only">Loading, please wait</span>
        </div>
    );
};

export default LoadingSpinner;
