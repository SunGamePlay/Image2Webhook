import { create } from 'zustand';
import { User } from '../types/auth';
import { checkSessionApi, loginApi, logoutApi } from '../api/auth';
import { fetchConfigApi } from '../api/config';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  developerMode: boolean;
  checkSession: () => Promise<void>;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchConfig: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  developerMode: false,

  checkSession: async () => {
    try {
      const user = await checkSessionApi();
      if (user?.authenticated) {
        set({ user, isLoading: false, error: null });
        return;
      }
    } catch (_) {}
    set({ user: null, isLoading: false });
  },

  login: async (username, password) => {
    set({ error: null });
    try {
      const user = await loginApi(username, password);
      set({ user, error: null });
      return true;
    } catch (err: any) {
      set({ error: err.message || '登录失败' });
      return false;
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch (_) {}
    set({ user: null, developerMode: false });
  },

  fetchConfig: async () => {
    try {
      const cfg = await fetchConfigApi();
      set({ developerMode: Boolean(cfg.developer_mode) });
    } catch (_) {
      set({ developerMode: false });
    }
  },
}));