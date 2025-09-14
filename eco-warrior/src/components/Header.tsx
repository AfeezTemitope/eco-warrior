import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Bars3Icon, XMarkIcon, InformationCircleIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import AuthModal from "./AuthModal";

const Header = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Desktop Header — Hidden on Mobile When Menu Open */}
            <header className="relative z-10 w-full bg-white shadow-md border-b border-gray-200 md:z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    {/* Logo + Brand — Always visible on desktop */}
                    <motion.div
                        className="flex items-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <a href="/" aria-label="Go to homepage" className="flex items-center gap-2">
                            <img src="/logo.png" alt="EcoWarrior Logo" className="w-18 h-18 object-contain" />
                            <span className="text-2xl font-extrabold text-[#2E7D32]">EcoWarrior</span>
                        </a>
                    </motion.div>

                    {/* Desktop Nav Links — Always visible on desktop */}
                    <nav className="hidden md:flex items-center gap-6 text-gray-600">
                        <Link
                            to="/about"
                            className="flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
                            aria-label="Go to About page"
                        >
                            <InformationCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                            <span>About</span>
                        </Link>
                        <a
                            href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
                            aria-label="Contact us on WhatsApp"
                        >
                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 md:w-6 md:h-6" />
                            <span>Contact</span>
                        </a>
                        <div
                            className="text-xl md:text-2xl hover:text-[#2E7D32] cursor-pointer"
                            onClick={() => setShowAuthModal(true)}
                            aria-label="Open user authentication modal"
                        >
                            <FaUser className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </nav>

                    {/* Mobile Hamburger Button — Only visible on mobile */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-[#2E7D32] transition-colors p-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="w-6 h-6 text-gray-800" />
                            ) : (
                                <Bars3Icon className="w-6 h-6 text-gray-800" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Side Menu Overlay — Covers entire screen when open */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop Blur — Covers everything behind */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md"
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Mobile Menu Panel — White, Right-Sliding, Full Height, No Header */}
                    <div className="absolute right-0 top-0 h-full w-5/6 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        {/* Logo Only — Top Left, No Text */}
                        <div className="p-6 border-b border-gray-100 flex items-center">
                            <img src="/logo.png" alt="EcoWarrior Logo" className="w-16 h-16 object-contain" />
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-col space-y-4 p-6">
                            <Link
                                to="/about"
                                className="flex items-center gap-4 p-3 rounded-lg text-gray-800 hover:bg-green-50 hover:text-[#2E7D32] transition-all duration-200"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Go to About page"
                            >
                                <InformationCircleIcon className="w-6 h-6 text-[#2E7D32]" />
                                <span className="font-medium">About</span>
                            </Link>

                            <a
                                href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-3 rounded-lg text-gray-800 hover:bg-green-50 hover:text-[#2E7D32] transition-all duration-200"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Contact us on WhatsApp"
                            >
                                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-[#2E7D32]" />
                                <span className="font-medium">Contact</span>
                            </a>

                            <div
                                className="flex items-center gap-4 p-3 rounded-lg text-gray-800 hover:bg-green-50 hover:text-[#2E7D32] cursor-pointer transition-all duration-200"
                                onClick={() => {
                                    setShowAuthModal(true);
                                    setIsMenuOpen(false);
                                }}
                                aria-label="Open user authentication modal"
                            >
                                <FaUser className="w-6 h-6 text-[#2E7D32]" />
                                <span className="font-medium">Sign In</span>
                            </div>
                        </nav>

                        {/* Close Button — Top Right */}
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close menu"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Authentication Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
};

export default Header;