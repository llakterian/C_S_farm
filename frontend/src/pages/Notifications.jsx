import { useState, useEffect } from 'react'
import { notificationService } from '../services/notifications'

export default function Notifications() {
    const [permission, setPermission] = useState('default')
    const [testSent, setTestSent] = useState(false)

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const handleRequestPermission = async () => {
        const granted = await notificationService.requestPermission()
        setPermission(granted ? 'granted' : 'denied')
    }

    const handleTestNotification = async () => {
        await notificationService.showNotification('🎉 Test Notification', {
            body: 'Notifications are working! You will receive alerts for important farm events.',
        })
        setTestSent(true)
        setTimeout(() => setTestSent(false), 3000)
    }

    const handlePayrollReminder = async () => {
        await notificationService.notifyPayrollReady('November', '2024')
    }

    const handlePluckingReminder = async () => {
        await notificationService.notifyPluckingReminder()
    }

    const handleWeatherAlert = async () => {
        await notificationService.notifyWeatherAlert('Heavy rain expected in the next 2 hours')
    }

    return (
        <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Notification Settings</h3>
                    <div className="mt-5 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium text-gray-900">Push Notifications</div>
                                <div className="text-sm text-gray-500">
                                    {permission === 'granted' && '✅ Enabled - You will receive important alerts'}
                                    {permission === 'denied' && '❌ Blocked - Enable in browser settings'}
                                    {permission === 'default' && '⚠️ Not configured - Click to enable'}
                                </div>
                            </div>
                            {permission !== 'granted' && (
                                <button
                                    onClick={handleRequestPermission}
                                    className="rounded-md bg-farm-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-farm-500"
                                >
                                    Enable Notifications
                                </button>
                            )}
                        </div>

                        {permission === 'granted' && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-700 font-medium">✓ Notifications Active</span>
                                </div>
                                <div className="text-sm text-green-600">
                                    You will receive alerts for:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Monthly payroll ready</li>
                                        <li>Daily plucking reminders</li>
                                        <li>Low inventory warnings</li>
                                        <li>Weather alerts</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {permission === 'granted' && (
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Test Notifications</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleTestNotification}
                                className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                            >
                                🔔 Send Test Notification
                            </button>
                            <button
                                onClick={handlePayrollReminder}
                                className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                            >
                                💰 Payroll Ready
                            </button>
                            <button
                                onClick={handlePluckingReminder}
                                className="flex items-center justify-center gap-2 rounded-md bg-yellow-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500"
                            >
                                🌿 Plucking Reminder
                            </button>
                            <button
                                onClick={handleWeatherAlert}
                                className="flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
                            >
                                🌤️ Weather Alert
                            </button>
                        </div>
                        {testSent && (
                            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                                ✓ Notification sent! Check your device.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="text-sm text-blue-700">
                        <div className="font-medium mb-1">Tip: Automatic Reminders</div>
                        <div>
                            The system will automatically send you reminders at key times:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Daily at 6 PM if no plucking recorded</li>
                                <li>End of month when payroll is ready</li>
                                <li>When weather conditions may affect crops</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
