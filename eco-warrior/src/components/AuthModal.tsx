import React, { useState } from "react";
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    redirectPath?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, redirectPath }) => {
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [successMessage, setSuccessMessage] = useState("");

    const { session, signIn, signUp, signOut } = useAuthStore();
    const navigate = useNavigate();

    const clearForm = () => {
        setEmail("");
        setPassword("");
        setName("");
        setErrors({});
        setSuccessMessage("");
    };

    const handleTabSwitch = (tab: "signin" | "signup") => {
        setActiveTab(tab);
        clearForm();
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (activeTab === "signup" && !name) newErrors.name = "Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        try {
            const user = await signIn(email, password);
            if (!user) throw new Error("Login failed");

            // Fetch role to update global store
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            useAuthStore.getState().setRole(profile?.role || "user");

            setSuccessMessage("Signed in successfully! 🎉");

            setTimeout(() => {
                navigate(redirectPath || "/");
                onClose();
                clearForm();
            }, 1000);
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : String(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        try {
            const user = await signUp(email, password, name);
            if (!user) throw new Error("Signup failed");

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            useAuthStore.getState().setRole(profile?.role || "user");

            setSuccessMessage("Account created successfully! 🎉");

            setTimeout(() => {
                navigate(redirectPath || "/");
                onClose();
                clearForm();
            }, 1000);
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : String(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        await signOut();
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md transform transition-all duration-500 scale-100 opacity-100">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50">
                    <div className="h-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500"></div>
                    <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white px-8 pt-6 pb-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                        >
                            <X size={20} className="text-gray-400 hover:text-gray-600" />
                        </button>

                        {session ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <User size={32} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Welcome, {session.user.user_metadata?.username || session.user.email}!
                                </h2>
                                <p className="text-gray-600 mb-6">You're already signed in.</p>
                                <button
                                    onClick={handleSignOut}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            <FaSignOutAlt className="text-xl" />
                                            Sign Out
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-center mb-6">
                                    <button
                                        onClick={() => handleTabSwitch("signin")}
                                        className={`flex-1 py-3 text-lg font-semibold ${
                                            activeTab === "signin"
                                                ? "text-green-600 border-b-4 border-green-500"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => handleTabSwitch("signup")}
                                        className={`flex-1 py-3 text-lg font-semibold ${
                                            activeTab === "signup"
                                                ? "text-green-600 border-b-4 border-green-500"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        Sign Up
                                    </button>
                                </div>

                                {successMessage && (
                                    <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                                        🎉 {successMessage}
                                    </div>
                                )}
                                {errors.general && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                                        ⚠️ {errors.general}
                                    </div>
                                )}

                                <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp} className="space-y-6">
                                    {activeTab === "signup" && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User size={18} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl ${
                                                        errors.name ? "border-red-300" : "border-gray-200"
                                                    }`}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl ${
                                                    errors.email ? "border-red-300" : "border-gray-200"
                                                }`}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl ${
                                                    errors.password ? "border-red-300" : "border-gray-200"
                                                }`}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} className="text-gray-400" />
                                                ) : (
                                                    <Eye size={18} className="text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                {activeTab === "signin" ? "Signing In..." : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === "signin" ? "Sign In" : "Create Account"}
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-gray-500 text-sm">
                                        {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            onClick={() => handleTabSwitch(activeTab === "signin" ? "signup" : "signin")}
                                            className="text-green-600 font-semibold hover:underline"
                                        >
                                            {activeTab === "signin" ? "Sign up here" : "Sign in here"}
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;