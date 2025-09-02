import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    redirectPath?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, redirectPath }) => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [successMessage, setSuccessMessage] = useState('');
    const { session, signIn, signUp, signOut, error: authError } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (authError) {
            setErrors({ general: authError });
        }
    }, [authError]);

    const clearForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setErrors({});
        setSuccessMessage('');
    };

    const handleTabSwitch = (tab: 'signin' | 'signup') => {
        setActiveTab(tab);
        clearForm();
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email.trim())) newErrors.email = 'Invalid email address';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (activeTab === 'signup' && !name.trim()) newErrors.name = 'Name is required';
        else if (activeTab === 'signup' && name.length > 50) newErrors.name = 'Name must be 50 characters or less';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = await signIn(email.trim(), password);
            if (!user) throw new Error('Login failed');

            setSuccessMessage('Signed in successfully! 🎉');
            setTimeout(() => {
                navigate(redirectPath || location.pathname);
                onClose();
                clearForm();
            }, 1000);
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = await signUp(email.trim(), password, name.trim());
            if (!user) throw new Error('Signup failed');

            setSuccessMessage('Account created successfully! 🎉');
            setTimeout(() => {
                navigate(redirectPath || location.pathname);
                onClose();
                clearForm();
            }, 1000);
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
            setSuccessMessage('Signed out successfully!');
            setTimeout(() => {
                navigate('/');
                onClose();
                clearForm();
            }, 1000);
        } catch {
            setErrors({ general: 'Failed to sign out. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
                onClick={onClose}
                aria-label="Close modal"
            />
            <div className="relative w-full max-w-md transform transition-all duration-500 scale-100 opacity-100">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50">
                    <div className="h-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500"></div>
                    <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white px-8 pt-6 pb-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                            aria-label="Close modal"
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
                                    aria-label="Sign out"
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
                                <div className="flex justify-center mb-6" role="tablist">
                                    <button
                                        onClick={() => handleTabSwitch('signin')}
                                        className={`flex-1 py-3 text-lg font-semibold ${
                                            activeTab === 'signin'
                                                ? 'text-green-600 border-b-4 border-green-500'
                                                : 'text-gray-500'
                                        }`}
                                        role="tab"
                                        aria-selected={activeTab === 'signin'}
                                        aria-controls="signin-panel"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => handleTabSwitch('signup')}
                                        className={`flex-1 py-3 text-lg font-semibold ${
                                            activeTab === 'signup'
                                                ? 'text-green-600 border-b-4 border-green-500'
                                                : 'text-gray-500'
                                        }`}
                                        role="tab"
                                        aria-selected={activeTab === 'signup'}
                                        aria-controls="signup-panel"
                                    >
                                        Sign Up
                                    </button>
                                </div>

                                {successMessage && (
                                    <div
                                        className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 flex items-center gap-3"
                                        role="alert"
                                    >
                                        🎉 {successMessage}
                                    </div>
                                )}
                                {errors.general && (
                                    <div
                                        className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3"
                                        role="alert"
                                    >
                                        ⚠️ {errors.general}
                                    </div>
                                )}

                                <form
                                    onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp}
                                    className="space-y-6"
                                    id={activeTab === 'signin' ? 'signin-panel' : 'signup-panel'}
                                    role="tabpanel"
                                >
                                    {activeTab === 'signup' && (
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-semibold text-gray-700"
                                            >
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User size={18} className="text-gray-400" />
                                                </div>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl ${
                                                        errors.name ? 'border-red-300' : 'border-gray-200'
                                                    }`}
                                                    placeholder="Enter your full name"
                                                    required
                                                    maxLength={50}
                                                    aria-invalid={!!errors.name}
                                                    aria-describedby={errors.name ? 'name-error' : undefined}
                                                />
                                            </div>
                                            {errors.name && (
                                                <p id="name-error" className="text-red-500 text-sm">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-semibold text-gray-700"
                                        >
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl ${
                                                    errors.email ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="Enter your email"
                                                required
                                                maxLength={100}
                                                aria-invalid={!!errors.email}
                                                aria-describedby={errors.email ? 'email-error' : undefined}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p id="email-error" className="text-red-500 text-sm">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-semibold text-gray-700"
                                        >
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl ${
                                                    errors.password ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="Enter your password"
                                                required
                                                minLength={6}
                                                maxLength={100}
                                                aria-invalid={!!errors.password}
                                                aria-describedby={errors.password ? 'password-error' : undefined}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} className="text-gray-400" />
                                                ) : (
                                                    <Eye size={18} className="text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p id="password-error" className="text-red-500 text-sm">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                                        aria-label={activeTab === 'signin' ? 'Sign in' : 'Create account'}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                {activeTab === 'signin' ? 'Signing In...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-gray-500 text-sm">
                                        {activeTab === 'signin'
                                            ? "Don't have an account? "
                                            : 'Already have an account? '}
                                        <button
                                            onClick={() =>
                                                handleTabSwitch(activeTab === 'signin' ? 'signup' : 'signin')
                                            }
                                            className="text-green-600 font-semibold hover:underline"
                                            aria-label={
                                                activeTab === 'signin'
                                                    ? 'Switch to sign up'
                                                    : 'Switch to sign in'
                                            }
                                        >
                                            {activeTab === 'signin' ? 'Sign up here' : 'Sign in here'}
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