import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    role: string | null;
    loading: boolean;
    initialized: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setRole: (role: string | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    setError: (error: string | null) => void;
    signUp: (email: string, password: string, name: string) => Promise<User | null>;
    signIn: (email: string, password: string) => Promise<User | null>;
    signOut: () => Promise<void>;
    requireAuth: () => boolean;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    role: null,
    loading: true,
    initialized: false,
    error: null,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setRole: (role) => set({ role }),
    setLoading: (loading) => set({ loading }),
    setInitialized: (initialized) => set({ initialized }),
    setError: (error) => set({ error }),

    signUp: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
            if (!email || !password || !name) {
                throw new Error('Email, password, and name are required');
            }
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: name.trim() } },
            });
            if (error) throw new Error(`Sign-up failed: ${error.message}`);

            const user = data.user;
            const session = data.session;

            if (!user) {
                throw new Error('No user returned from sign-up');
            }

            const role = user.email === 'fasilahyusuf4peace@gmail.com' ? 'superadmin' : 'user';

            const { error: insertError } = await supabase.from('profiles').upsert({
                id: user.id,
                username: name.trim(),
                role,
            });
            if (insertError) throw new Error(`Profile creation failed: ${insertError.message}`);

            set({ user, session, role });
            return user;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
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
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error(`Sign-in failed: ${error.message}`);

            const { data: profile, error: roleError } = await supabase
                .from('profiles')
                .select('role, username')
                .eq('id', data.user.id)
                .maybeSingle();

            if (roleError) throw new Error(`Profile fetch failed: ${roleError.message}`);

            set({
                user: data.user,
                session: data.session,
                role: profile?.role || 'user',
            });

            return data.user;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            set({ error: errorMessage });
            console.error('Sign-in error:', err);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        try {
            await supabase.auth.signOut();
            set({ user: null, session: null, role: null, error: null });
        } catch (err) {
            console.error('Sign-out error:', err);
            set({ error: 'Failed to sign out' });
        }
    },

    requireAuth: () => {
        const hasSession = !!get().session;
        if (!hasSession) {
            set({ error: 'Please sign in to perform this action' });
        }
        return hasSession;
    },

    reset: () => {
        set({ user: null, session: null, role: null, error: null, loading: false, initialized: false });
    },
}));

// Initialize on load
supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
        console.error('Initial session fetch error:', error);
        useAuthStore.getState().setError('Failed to initialize session');
    }
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true);

    if (session?.user) {
        useAuthStore.getState().setUser(session.user);
        supabase
            .from('profiles')
            .select('role, username')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Initial role fetch error:', error);
                    useAuthStore.getState().setError('Failed to fetch user role');
                }
                useAuthStore.getState().setRole(data?.role || 'user');
            });
    }
});

// Keep in sync
supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);

    if (session?.user) {
        useAuthStore.getState().setUser(session.user);
        supabase
            .from('profiles')
            .select('role, username')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Auth state role fetch error:', error);
                    useAuthStore.getState().setError('Failed to fetch user role');
                }
                useAuthStore.getState().setRole(data?.role || 'user');
            });
    } else {
        useAuthStore.getState().reset();
    }
});