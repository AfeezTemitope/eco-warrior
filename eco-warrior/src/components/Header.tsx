import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { Bars3Icon, XMarkIcon, InformationCircleIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import AuthModal from "./AuthModal";

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="relative z-10 w-full bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="EcoWarrior Logo"
              className="w-18 h-18 object-contain"
            />
            <span className="text-2xl font-extrabold text-[#2E7D32]">
              EcoWarrior
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-gray-600">
            <Link
              to="/about"
              className="flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              aria-label="Go to About page"
            >
              <InformationCircleIcon className="w-6 h-6" />
              <span>About</span>
            </Link>
            <a
              href="https://wa.me/+1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#2E7D32] transition-colors"
              aria-label="Contact us on WhatsApp"
            >
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
              <span>Contact</span>
            </a>
            <div
              className="text-2xl hover:text-[#2E7D32] cursor-pointer"
              onClick={() => setShowAuthModal(true)}
              aria-label="Open user authentication modal"
            >
              <FaUser />
            </div>
          </nav>

          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-[#2E7D32] transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 text-gray-600">
              <Link
                to="/about"
                className="flex items-center gap-2 hover:text-[#2E7D32] transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Go to About page"
              >
                <InformationCircleIcon className="w-6 h-6" />
                <span>About</span>
              </Link>
              <a
                href="https://wa.me/+1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#2E7D32] transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Contact us on WhatsApp"
              >
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
                <span>Contact</span>
              </a>
              <div
                className="flex items-center gap-2 text-2xl hover:text-[#2E7D32] cursor-pointer"
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMenuOpen(false);
                }}
                aria-label="Open user authentication modal"
              >
                <FaUser />
                <span>Sign In</span>
              </div>
            </div>
          </nav>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;