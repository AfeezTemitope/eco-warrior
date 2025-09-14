import { Link } from "react-router-dom";
import {FaWhatsapp, FaInstagram, FaHeart, FaMailBulk} from "react-icons/fa";
import { motion, easeOut } from "framer-motion";

export default function Footer() {
    const containerVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    };

    return (
        <motion.footer
            className="bg-gradient-to-br from-[#2E7D32] via-green-600 to-emerald-600 text-white"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="EcoWarrior Logo"
                                className="w-19 h-19 object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span className="text-2xl font-bold text-white">EcoWarrior</span>
                        </div>
                        <p className="text-gray-100 mb-6 max-w-md leading-relaxed">
                            Championing environmental education and advocacy for sustainable development.
                            Join us in creating positive changes for a greener future.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { href: "https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t", icon: <FaWhatsapp className="text-white" /> },
                                { href: "mailto:ecowarriorafricaewa@gmail.com", icon: <FaMailBulk className="text-white" /> },
                                { href: "https://www.instagram.com/ecowarriorafrica?igsh=ZjJ1eGRpYmE0aHBh", icon: <FaInstagram className="text-white" /> },
                                // { href: "#", icon: <FaLinkedin className="text-white" /> },
                            ].map((social, idx) => (
                                <motion.a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    // className={`w-10 h-10 ${social.bg} rounded-full flex items-center justify-center transition-transform`}
                                    whileHover={{ scale: 1.2 }}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-100 hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-100 hover:text-white transition-colors">About Us</Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Contact / Get Involved */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-lg font-semibold mb-4 text-white">Get Involved</h3>
                        <ul className="space-y-2">
                            <li><a href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t" className="text-gray-100 hover:text-white transition-colors">Volunteer</a></li>
                            <li><a href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t" className="text-gray-100 hover:text-white transition-colors">Donate</a></li>
                            {/*<li><a href="#" className="text-gray-100 hover:text-white transition-colors">Partner with Us</a></li>*/}
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
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    className="border-t border-green-500 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
                >
                    <div className="text-gray-100 text-sm mb-4 md:mb-0 text-center md:text-left">
                        © 2025 EcoWarrior. All rights reserved.
                    </div>
                    <div className="flex items-center gap-2 text-gray-100 text-sm justify-center md:justify-end">
                        {/*<span>Developed with</span>*/}
                        <FaHeart className="text-green-300" />
                        <span>by</span>
                        <a
                            href="https://afeez-bello-portfolio.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-200 hover:text-green-400 font-semibold transition-colors"
                        >
                            tbelzbby
                        </a>
                        <FaHeart className="text-green-300" />

                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
}
