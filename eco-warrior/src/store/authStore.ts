import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
    user: User | null;
    session: Session | null;
    role: string | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setRole: (role: string | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    signUp: (email: string, password: string, name: string) => Promise<User | null>;
    signIn: (email: string, password: string) => Promise<User | null>;
    signOut: () => Promise<void>;
    requireAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    role: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setRole: (role) => set({ role }),
    setLoading: (loading) => set({ loading }),
    setInitialized: (initialized) => set({ initialized }),

    signUp: async (email, password, name) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: name } },
            });
            if (error) throw error;

            const user = data.user;
            const session = data.session;

            if (user) {
                const role = user.email === "fasilahyusuf4peace@gmail.com" ? "superadmin" : "user";

                const { error: insertError } = await supabase.from("profiles").insert({
                    id: user.id,
                    username: name,
                    role,
                });
                if (insertError) throw insertError;

                set({ user, session, role });
                return user;
            }
            return null;
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const { data: profile, error: roleError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .maybeSingle();

            if (roleError) throw roleError;

            set({
                user: data.user,
                session: data.session,
                role: profile?.role || "user",
            });

            return data.user;
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, role: null });
    },

    requireAuth: () => !!get().session,
}));

// Initialize on load
supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true); // ← Must happen

    if (session?.user) {
        supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) console.error("Role fetch error:", error);
                useAuthStore.getState().setRole(data?.role || "user");
            });
    }
});
// Keep in sync
supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);

    if (session?.user) {
        supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => {
                useAuthStore.getState().setRole(data?.role || "user");
            });
    } else {
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setRole(null);
    }
});
