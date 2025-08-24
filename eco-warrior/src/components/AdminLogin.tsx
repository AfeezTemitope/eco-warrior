import React, { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            const user = data.user;

            // Fetch role from profiles
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profileError) throw profileError;

            const userRole = profile.role;

            if (!["admin", "superadmin"].includes(userRole)) {
                await supabase.auth.signOut(); // Auto sign out non-admins
                throw new Error("Access denied: Admins only");
            }

            // Reload to enter AdminPanel with valid session
            window.location.href = "/admin-panel";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Lock Icon */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Lock className="text-green-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-400 mt-2">Sign in to manage the dashboard</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                    {error && (
                        <div className="mb-6 p-3 bg-red-900/50 border border-red-700 text-red-200 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-70 flex items-center justify-center gap-2 transform transition hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Admins only. Unauthorized access prohibited.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;