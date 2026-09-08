import { create } from 'zustand';
import type { User, AuthState } from '../types/auth';

const getInitialUser = (): User | null => {
  try {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const getInitialToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken() && !!getInitialUser(),
  isLoading: false,

  login: ({ user, token }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },

  hasRole: (role: string | string[]): boolean => {
    const { user } = get();
    if (!user) return false;
    if (user.role_names.includes('super_admin')) return true;

    if (Array.isArray(role)) {
      return role.some((r) => user.role_names.includes(r));
    }
    return user.role_names.includes(role);
  },

  hasPermission: (permission: string | string[]): boolean => {
    const { user } = get();
    if (!user) return false;
    if (user.role_names.includes('super_admin')) return true;

    if (Array.isArray(permission)) {
      return permission.some((p) => user.permissions.includes(p));
    }
    return user.permissions.includes(permission);
  },
}));