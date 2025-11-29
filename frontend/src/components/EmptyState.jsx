import React from 'react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    illustration
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {/* Illustration or Icon */}
            {illustration ? (
                <div className="mb-6 text-8xl" role="img" aria-label={title}>
                    {illustration}
                </div>
            ) : Icon ? (
                <Icon className="h-24 w-24 text-gray-300 mb-6" aria-hidden="true" />
            ) : null}

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-base text-gray-500 mb-6 max-w-md">
                {description}
            </p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-farm-600 hover:bg-farm-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 transition-colors touch-manipulation min-h-[48px]"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
