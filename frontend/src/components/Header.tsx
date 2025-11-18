import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import AuthModal from "./AuthModal";

const Header = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FaUser className="w-4 h-4" />
                                <span className="font-medium">Sign In</span>
                            </button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Bars3Icon className="w-6 h-6 text-gray-700" />
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
                                <button
                                    onClick={() => {
                                        setShowAuthModal(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 bg-[#2E7D32] text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <FaUser className="w-4 h-4" />
                                    <span>Sign In</span>
                                </button>
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