import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram, FaHeart, FaEnvelope } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-[#2E7D32] via-green-600 to-emerald-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="EcoWarrior Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <span className="text-xl font-bold">EcoWarrior</span>
                        </div>
                        <p className="text-gray-100 text-sm leading-relaxed mb-4">
                            Championing environmental education and advocacy for sustainable development.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <FaWhatsapp className="text-white text-lg" />
                            </a>
                            <a
                                href="mailto:ecowarriorafricaewa@gmail.com"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <FaEnvelope className="text-white text-lg" />
                            </a>
                            <a
                                href="https://www.instagram.com/ecowarriorafrica?igsh=ZjJ1eGRpYmE0aHBh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <FaInstagram className="text-white text-lg" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-gray-100 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-100 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Get Involved */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Get Involved</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-100 hover:text-white transition-colors"
                                >
                                    Volunteer
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-100 hover:text-white transition-colors"
                                >
                                    Donate
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-100 hover:text-white transition-colors"
                                >
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p className="text-gray-100 mb-4 md:mb-0">
                        © 2025 EcoWarrior. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-gray-100">
                        <span>Built with</span>
                        <FaHeart className="text-red-400" />
                        <span>by</span>
                        <a
                            href="https://afeez-bello-portfolio.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-semibold hover:text-gray-200 transition-colors"
                        >
                            tbelzbby
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}