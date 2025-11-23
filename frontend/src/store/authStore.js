import { create } from 'zustand';
import { dbService } from '../services/db';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            // Try to authenticate
            let user;
            try {
                user = await dbService.authenticateUser(email, password);
            } catch (e) {
                // If user not found, for this demo, we might auto-create admin
                if (email === 'admin@farm.com' && password === 'admin123') {
                    user = { email, password, name: 'Farm Admin', role: 'admin' };
                    await dbService.createUser(user);
                } else {
                    throw e;
                }
            }

            localStorage.setItem('user', JSON.stringify(user));
            set({ user, isAuthenticated: true, isLoading: false });

        } catch (error) {
            set({
                error: error.message || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
