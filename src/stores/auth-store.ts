import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getRole: () => UserRole | null;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      const data = res.data;
      console.log(data, "line 48");

      const token = data?.data?.tokens?.accessToken;
      const userEmail = data?.data?.email || data?.data?.user?.email;
      const userRole = data?.data?.user?.role || data?.data?.role || 'EMPLOYEE';
      const firstName = data?.data?.user?.firstName || data?.data?.firstName || userEmail?.split('@')[0] || '';
      const lastName = data?.data?.user?.lastName || data?.data?.lastName || '';

      if (token && userEmail) {
        // Construct a User object from the data returned by the API
        const user: User = {
          _id: data?.data?.user?._id || data?.data?.user?.id || userEmail,
          firstName,
          lastName,
          email: userEmail,
          role: userRole,
          leaveBalances: { SICK: 10, CASUAL: 10, ANNUAL: 12 },
          isActive: true,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Set cookie for middleware/proxy (expires in 7 days)
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

        set({ user, token, isAuthenticated: true, isLoading: false });

        // Set default auth header
        import('@/lib/api').then(({ default: api }) => {
          api.defaults.headers.Authorization = `Bearer ${token}`;
        });
        return true;
      }
    } catch (error) {
      console.error('Login API error:', error);
    }

    set({ isLoading: false });
    return false;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    set({ user: null, token: null, isAuthenticated: false });
  },

  getRole: () => {
    return get().user?.role ?? null;
  },
}));
