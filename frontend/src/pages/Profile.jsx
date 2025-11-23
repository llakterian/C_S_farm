import React from 'react';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import useVoice from '../hooks/useVoice';
import VoiceButton from '../components/VoiceButton';

const ProfilePage = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { isEnabled, isSupported } = useVoice();

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <UserCircleIcon className="h-8 w-8 text-farm-600" aria-hidden="true" />
                    Profile & Settings
                </h1>
                <p className="mt-2 text-base text-gray-600">
                    Manage your account and app preferences
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-farm-600 to-farm-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-4xl">
                            👨‍🌾
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{user?.name || 'Farm Manager'}</h2>
                            <p className="text-farm-100">{user?.email || 'admin@farm.com'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <p className="text-base text-gray-900">Administrator</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Farm Name
                        </label>
                        <p className="text-base text-gray-900">C. Sambu Farm</p>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Cog6ToothIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                        App Settings
                    </h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {/* Voice Guidance */}
                    {isSupported && (
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="text-base font-medium text-gray-900">Voice Guidance</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Enable voice announcements and guidance
                                </p>
                            </div>
                            <VoiceButton />
                        </div>
                    )}

                    {/* Data Storage */}
                    <div className="p-6">
                        <h4 className="text-base font-medium text-gray-900 mb-2">Data Storage</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            All your farm data is stored locally on this device for offline access.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Working Offline
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ✓ Auto-Save Enabled
                            </span>
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="p-6">
                        <h4 className="text-base font-medium text-gray-900 mb-2">App Information</h4>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Version</dt>
                                <dd className="text-gray-900 font-medium">1.0.0 - Phase 1</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Build</dt>
                                <dd className="text-gray-900 font-medium">Production</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Last Updated</dt>
                                <dd className="text-gray-900 font-medium">Nov 2025</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to export all farm data?')) {
                            alert('Export feature coming soon!');
                        }
                    }}
                    className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-500 transition-colors touch-manipulation min-h-[48px]"
                >
                    Export Farm Data
                </button>

                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to sign out?')) {
                            logout();
                        }
                    }}
                    className="w-full flex items-center justify-center px-6 py-3 border border-red-300 shadow-sm text-base font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors touch-manipulation min-h-[48px]"
                >
                    Sign Out
                </button>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📞 Need Help?</h3>
                <p className="text-sm text-blue-800 mb-4">
                    Having issues or questions about the farm manager? We're here to help!
                </p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation min-h-[44px]">
                    Contact Support
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
