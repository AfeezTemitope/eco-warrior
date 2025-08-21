import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    signUp: (email: string, password: string, name: string) => Promise<any>;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    requireAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user || null }),
    setLoading: (loading) => set({ loading }),
    setInitialized: (initialized) => set({ initialized }),

    signUp: async (email, password, name) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: name } }
            });
            if (error) throw error;
            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    username: name,
                    role: data.user.email === 'fasilahyusuf4peace@gmail.com' ? 'superadmin' : 'user'
                });
                set({ user: data.user, session: data.session });
                return data.user;
            }
        } catch (err) {
            if (err instanceof Error) {
                throw err.message;
            }
            throw String(err);
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            set({ user: data.user, session: data.session });
            return data.user;
        } catch (err) {
            if (err instanceof Error) {
                throw err.message;
            }
            throw String(err);
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        set({ loading: true });
        await supabase.auth.signOut();
        set({ user: null, session: null, loading: false });
    },

    requireAuth: () => !!get().session
}));

// Initialize session on load
supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true);
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
});
