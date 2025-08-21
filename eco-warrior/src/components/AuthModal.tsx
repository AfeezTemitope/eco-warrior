import React, { useState } from "react";
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient.ts";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
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
            const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            setSuccessMessage("Signed in successfully! 🎉");

            setTimeout(() => {
                if (data && ["admin", "superadmin"].includes(data.role)) {
                    navigate("/admin-panel");
                } else {
                    navigate("/");
                }
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
            const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            setSuccessMessage("Account created successfully! 🎉");

            setTimeout(() => {
                if (data && ["admin", "superadmin"].includes(data.role)) {
                    navigate("/admin-panel");
                } else {
                    navigate("/");
                }
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
            {/* overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md transform transition-all duration-500 ease-out scale-100 opacity-100">
                <div className="bg-white rounded-3xl shadow-2xl shadow-black/25 overflow-hidden transform hover:shadow-3xl hover:shadow-black/30 transition-all duration-300 border border-gray-100/50">
                    <div className="h-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500"></div>
                    <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white px-8 pt-6 pb-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group transform hover:scale-110 active:scale-95"
                        >
                            <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                        {session ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                    <User size={32} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Welcome, {session.user.user_metadata?.username || session.user.email}!
                                </h2>
                                <p className="text-gray-600 mb-6">You're already signed in.</p>
                                <button
                                    onClick={handleSignOut}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg shadow-red-500/30"
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
                                {/* Tabs */}
                                <div className="flex justify-center mb-6">
                                    <button
                                        onClick={() => handleTabSwitch("signin")}
                                        className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${
                                            activeTab === "signin"
                                                ? "text-green-600 border-b-4 border-green-500"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => handleTabSwitch("signup")}
                                        className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${
                                            activeTab === "signup"
                                                ? "text-green-600 border-b-4 border-green-500"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                                {/* Success / Error */}
                                {successMessage && (
                                    <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">🎉</div>
                                        {successMessage}
                                    </div>
                                )}
                                {errors.general && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">⚠️</div>
                                        {errors.general}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp} className="space-y-6">
                                    {activeTab === "signup" && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User size={18} className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl font-medium transition-all duration-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 hover:bg-gray-100/70 ${
                                                        errors.name
                                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                                            : "border-gray-200"
                                                    }`}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-sm font-medium">{errors.name}</p>}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl font-medium transition-all duration-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 hover:bg-gray-100/70 ${
                                                    errors.email
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                                        : "border-gray-200"
                                                }`}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl font-medium transition-all duration-300 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 hover:bg-gray-100/70 ${
                                                    errors.password
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                                                        : "border-gray-200"
                                                }`}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-sm font-medium">{errors.password}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg shadow-green-500/30"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === "signin" ? "Sign In" : "Create Account"}
                                                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                                            </>
                                        )}
                                    </button>
                                </form>
                                <div className="mt-6 text-center">
                                    <p className="text-gray-500 text-sm">
                                        {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            onClick={() => handleTabSwitch(activeTab === "signin" ? "signup" : "signin")}
                                            className="text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline"
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
