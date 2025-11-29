import { create } from 'zustand';
import type { User } from '../types/schema';
// @ts-ignore
import { dbService } from '../services/db.js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await dbService.authenticateUser(email, password);
      set({ user, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false });
      throw err;
    }
  },
  logout: () => set({ user: null, error: null }),
}));

export default useAuthStore;
