import { create } from 'zustand';
import api from '../lib/api';

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    role: string | null;
    loading: boolean;
    initialized: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setRole: (role: string | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    setError: (error: string | null) => void;
    signUp: (email: string, password: string, username: string) => Promise<User | null>;
    signIn: (email: string, password: string) => Promise<User | null>;
    signOut: () => void;
    requireAuth: () => boolean;
    reset: () => void;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    role: null,
    loading: false,
    initialized: false,
    error: null,

    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        set({ token });
    },
    setRole: (role) => set({ role }),
    setLoading: (loading) => set({ loading }),
    setInitialized: (initialized) => set({ initialized }),
    setError: (error) => set({ error }),

    signUp: async (email, password, username) => {
        set({ loading: true, error: null });
        try {
            if (!email || !password || !username) {
                throw new Error('Email, password, and username are required');
            }

            const { data } = await api.post('/auth/signup', {
                email,
                password,
                username: username.trim()
            });

            set({
                user: data.user,
                token: data.token,
                role: data.user.role
            });

            localStorage.setItem('token', data.token);
            return data.user;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Sign-up failed';
            set({ error: errorMessage });
            console.error('Sign-up error:', err);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const { data } = await api.post('/auth/signin', {
                email,
                password
            });

            set({
                user: data.user,
                token: data.token,
                role: data.user.role
            });

            localStorage.setItem('token', data.token);
            return data.user;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Sign-in failed';
            set({ error: errorMessage });
            console.error('Sign-in error:', err);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    signOut: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, role: null, error: null });
    },

    requireAuth: () => {
        const hasToken = !!get().token;
        if (!hasToken) {
            set({ error: 'Please sign in to perform this action' });
        }
        return hasToken;
    },

    reset: () => {
        localStorage.removeItem('token');
        set({
            user: null,
            token: null,
            role: null,
            error: null,
            loading: false,
            initialized: false
        });
    },

    initializeAuth: async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            set({ initialized: true, loading: false });
            return;
        }

        set({ loading: true });
        try {
            const { data } = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({
                user: data.user,
                token,
                role: data.user.role,
                initialized: true,
                loading: false
            });
        } catch (err) {
            console.error('Failed to initialize auth:', err);
            localStorage.removeItem('token');
            set({
                user: null,
                token: null,
                role: null,
                initialized: true,
                loading: false
            });
        }
    }
}));

// Initialize on load
useAuthStore.getState().initializeAuth();