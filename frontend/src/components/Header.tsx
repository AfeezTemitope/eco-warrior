import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import AuthModal from "./AuthModal";
import { useAuthStore } from "../store/authStore";

const Header = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get auth state from store
    const { user, signOut } = useAuthStore();

    const handleSignOut = () => {
        signOut();
        setIsMenuOpen(false); // Close mobile menu if open
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.img
                                src="/logo.png"
                                alt="EcoWarrior Logo"
                                className="w-12 h-12 object-contain"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            />
                            <span className="text-xl font-bold text-[#2E7D32] group-hover:text-green-700 transition-colors">
                                EcoWarrior
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                to="/about"
                                className="text-gray-600 hover:text-[#2E7D32] transition-colors font-medium"
                            >
                                About
                            </Link>
                            <a
                                href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-[#2E7D32] transition-colors font-medium"
                            >
                                Contact
                            </a>

                            {/* Auth Button - Changes based on login status */}
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FaUser className="w-5 h-5 text-[#2E7D32]" />
                                        <span className="font-medium hidden lg:inline">
                                            {user.username}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                    >
                                        <FaSignOutAlt className="w-4 h-4" />
                                        <span className="hidden sm:inline">Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-md"
                                >
                                    <FaUser className="w-4 h-4" />
                                    <span>Sign In</span>
                                </button>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <motion.div
                        className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200">
                                <img src="/logo.png" alt="Logo" className="w-12 h-12" />
                            </div>
                            <nav className="flex-1 p-4 space-y-2">
                                <Link
                                    to="/about"
                                    className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#2E7D32] transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    About
                                </Link>
                                <a
                                    href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#2E7D32] transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Contact
                                </a>

                                {/* Mobile Auth Section */}
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <FaUser className="w-8 h-8 text-[#2E7D32]" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.username}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                        >
                                            <FaSignOutAlt className="inline w-4 h-4 mr-2" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowAuthModal(true);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        <FaUser className="w-4 h-4" />
                                        <span>Sign In</span>
                                    </button>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
};

export default Header;