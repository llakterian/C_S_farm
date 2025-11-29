import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BuildingStorefrontIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import useVoice from '../hooks/useVoice';

const FarmPage = () => {
    const { speak, getGreeting } = useVoice();

    const farmSections = [
        {
            id: 'tea',
            name: 'Tea Plucking',
            icon: '',
            href: '/plucking',
            description: 'Record daily tea harvest',
            color: 'bg-green-100 text-green-800',
        },
        {
            id: 'livestock',
            name: 'Livestock',
            icon: '',
            href: '/livestock',
            description: 'Manage cows, AI services, calvings',
            color: 'bg-amber-100 text-amber-800',
        },
        {
            id: 'poultry',
            name: 'Poultry',
            icon: '',
            href: '/poultry',
            description: 'Track eggs and feed',
            color: 'bg-yellow-100 text-yellow-800',
        },
        {
            id: 'dairy',
            name: 'Dairy',
            icon: '',
            href: '/dairy',
            description: 'Milk production and feeds',
            color: 'bg-blue-100 text-blue-800',
        },
        {
            id: 'avocado',
            name: 'Avocado',
            icon: '',
            href: '/avocado',
            description: 'Sales and revenue tracking',
            color: 'bg-lime-100 text-lime-800',
        },
        {
            id: 'labor',
            name: 'Labor',
            icon: '',
            href: '/labor',
            description: 'Track work hours',
            color: 'bg-orange-100 text-orange-800',
        },
    ];

    React.useEffect(() => {
        speak(`${getGreeting()}! Welcome to your farm overview.`);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BuildingStorefrontIcon className="h-8 w-8 text-farm-600" aria-hidden="true" />
                        My Farm
                    </h1>
                    <p className="mt-2 text-base text-gray-600">
                        Manage all your farm operations in one place
                    </p>
                </div>
            </div>

            {/* Farm Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {farmSections.map((section) => (
                    <Link
                        key={section.id}
                        to={section.href}
                        className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 hover:border-farm-300 touch-manipulation"
                        onClick={() => speak(`Opening ${section.name}`)}
                    >
                        <div className="p-6">
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${section.color} mb-4 text-4xl`}>
                                {section.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-farm-600 transition-colors">
                                {section.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {section.description}
                            </p>

                            {/* Arrow indicator */}
                            <div className="absolute top-4 right-4 text-gray-400 group-hover:text-farm-600 transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-farm-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Link>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-farm-50 to-farm-100 rounded-xl p-6 border border-farm-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-farm-600">5</div>
                        <div className="text-sm text-gray-600 mt-1">Dairy Cows</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-farm-600">40+</div>
                        <div className="text-sm text-gray-600 mt-1">Workers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-farm-600">6</div>
                        <div className="text-sm text-gray-600 mt-1">Enterprises</div>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
                <p className="text-sm text-blue-800 mb-4">
                    Tap any section above to start managing that part of your farm. All data is saved automatically on your device.
                </p>
                <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Works Offline
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Auto-Save
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Voice Guided
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FarmPage;
