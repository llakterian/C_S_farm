// Notification service for C. Sambu Farm Manager

export const notificationService = {
    // Request permission for notifications
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    // Show a local notification
    async showNotification(title, options = {}) {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            console.log('Notification permission denied');
            return;
        }

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Use service worker for persistent notifications
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: options.body || '',
                icon: '/logo192.png',
                badge: '/logo192.png',
                vibrate: [200, 100, 200],
                data: options.data || {},
                ...options
            });
        } else {
            // Fallback to regular notification
            new Notification(title, {
                body: options.body || '',
                icon: '/logo192.png',
                ...options
            });
        }
    },

    // Schedule a reminder
    scheduleReminder(title, body, delayMs) {
        setTimeout(() => {
            this.showNotification(title, { body });
        }, delayMs);
    },

    // Common farm notifications
    async notifyPayrollReady(month, year) {
        await this.showNotification('💰 Payroll Ready', {
            body: `Monthly payroll for ${month}/${year} is ready for review`,
            data: { url: '/payroll' }
        });
    },

    async notifyPluckingReminder() {
        await this.showNotification('🌿 Plucking Reminder', {
            body: 'No tea plucking recorded today. Record your harvest now.',
            data: { url: '/plucking' }
        });
    },

    async notifyLowStock(item) {
        await this.showNotification('⚠️ Low Stock Alert', {
            body: `${item} inventory is running low. Consider restocking.`,
            data: { url: '/expenses' }
        });
    },

    async notifyWeatherAlert(condition) {
        await this.showNotification('🌤️ Weather Alert', {
            body: `${condition}. Plan your farm activities accordingly.`,
            data: { url: '/' }
        });
    }
};

// Auto-request permission on first load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Request permission after 3 seconds to avoid annoying users immediately
        setTimeout(() => {
            notificationService.requestPermission();
        }, 3000);
    });
}
