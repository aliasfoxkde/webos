import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
}

const TOKEN_KEY = 'webos-auth-token';
const USER_KEY = 'webos-auth-user';

export const useAuthStore = create<AuthState>((set, _get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  userId: JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')?.id ?? null,
  username: JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')?.username ?? null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,

  async login(username, password) {
    set({ isLoading: true });
    try {
      const { authApi } = await import('@/lib/api-client');
      const result = await authApi.login(username, password);

      if (result.ok && result.token && result.user) {
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        set({
          token: result.token,
          userId: result.user.id,
          username: result.user.username,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  async register(username, password) {
    set({ isLoading: true });
    try {
      const { authApi } = await import('@/lib/api-client');
      const result = await authApi.register(username, password);

      if (result.ok && result.token && result.user) {
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        set({
          token: result.token,
          userId: result.user.id,
          username: result.user.username,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      token: null,
      userId: null,
      username: null,
      isAuthenticated: false,
    });
  },

  async restoreSession() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }

    try {
      const { authApi } = await import('@/lib/api-client');
      const result = await authApi.verify(token);

      if (result.valid) {
        const user = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
        set({
          isAuthenticated: true,
          userId: result.userId ?? user?.id ?? null,
          username: user?.username ?? null,
        });
        return true;
      }

      // Token expired
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ isAuthenticated: false, token: null, userId: null, username: null });
      return false;
    } catch {
      set({ isAuthenticated: false });
      return false;
    }
  },
}));
