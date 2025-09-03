import { FaWhatsapp, FaGraduationCap, FaBullhorn, FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

export default function About() {
    const stats = [
        { value: "2.5x", label: "Impact on Sustainable Development Goals" },
        { value: "80%", label: "Increase in Awareness Levels" },
        { value: "3.7x", label: "Community Engagement Growth" },
        { value: "95%", label: "Positive Feedback from Participants" }
    ];

    const missions = [
        {
            icon: <FaGraduationCap className="text-3xl text-[#2E7D32]" />,
            title: "Empowerment Through Education",
            description: "Empowering communities with environmental knowledge and skills for sustainable development."
        },
        {
            icon: <FaBullhorn className="text-3xl text-[#2E7D32]" />,
            title: "Advocacy for Change",
            description: "Advocating for policies and actions that promote social and environmental justice."
        },
        {
            icon: <FaGlobe className="text-3xl text-[#2E7D32]" />,
            title: "SDGs Implementation",
            description: "Contributing to the achievement of the Sustainable Development Goals through active engagement."
        }
    ];

    const testimonials = [
        {
            text: "Ecowarriorafrica's dedication to environmental education is truly inspiring. They are leading the way towards a sustainable future.",
            author: "Jane Smith",
            role: "Environmental Activist"
        },
        {
            text: "I am grateful for the work Ecowarriorafrica does in advocating for a greener world. They are making a real difference.",
            author: "John Doe",
            role: "Climate Change Advocate"
        },
        {
            text: "Ecowarriorafrica's commitment to the SDGs is remarkable. They are creating positive change for our planet.",
            author: "Sarah Johnson",
            role: "Sustainability Expert"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <section className="bg-gray-50 text-gray-900 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="flex flex-col items-center text-center gap-6"
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                            Our Mission
                        </h1>

                        {/* Animated Emoji */}
                        <motion.div
                            className="text-5xl md:text-6xl mb-4"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: [0, -10, 0], opacity: [0, 1, 1] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                                delay: 0.2,
                            }}
                        >
                            🍀
                        </motion.div>

                        {/* Main Statement */}
                        <p className="text-xl md:text-2xl font-semibold max-w-4xl leading-relaxed">
                            Championing Environmental Education and Advocacy in Communities
                        </p>

                        {/* Supporting Statement */}
                        <p className="text-base md:text-lg max-w-3xl opacity-90 leading-relaxed">
                            Join us to create positive changes in society through environmental
                            education and advocacy for a sustainable future.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What we stand for?</h2>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                            We stand for promoting environmental education and advocacy for social change to achieve a sustainable future.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Missions</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {missions.map((mission, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-center mb-4">
                                    {mission.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                    {mission.title}
                                </h3>
                                <p className="text-gray-600 text-center">
                                    {mission.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-[#2E7D32] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Empowering Change Through Environmental Education</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                                <div className="text-lg opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Discover what our clients have to say about Ecowarriorafrica
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-8">
                                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-[#2E7D32] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        {/* Image */}
                        <motion.div
                            className="md:w-1/2 w-full"
                            initial={{ x: -80, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true }}
                        >
                            <img
                                src="/founder.jpg"
                                alt="Founder"
                                className="w-full h-80 md:h-[28rem] object-cover rounded-2xl shadow-md"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400";
                                }}
                            />
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            className="md:w-1/2 w-full text-center md:text-left"
                            initial={{ x: 80, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                                Meet Our Founder
                            </h2>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                                Yusuf Fasilat A.
                            </h3>
                            <p className="text-green-600 font-medium mb-6">
                                Founder || EcoWarrior Africa
                            </p>
                            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                                As a young environmentalist, I founded EcoWarrior Africa to ignite
                                climate consciousness and empower communities to take bold action
                                for our planet. This initiative is more than a project—it’s a
                                movement to inspire, educate, and equip the next generation of
                                eco-leaders across Africa. Together, we can protect our
                                environment and build a sustainable future.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50 text-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="flex flex-col items-center text-center gap-6"
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                            Join the Ecowarriors for a Greener Future
                        </h2>

                        {/* Description */}
                        <p className="text-lg md:text-xl mb-8 max-w-3xl leading-relaxed">
                            Empowering change through environmental education. Driving social
                            change and sustainable development through environmental education
                            and advocacy in Ikom for a greener future aligned with SDGs.
                        </p>

                        {/* WhatsApp Button */}
                        <motion.a
                            href="https://chat.whatsapp.com/F0KT6CLNxhWELrLzL5G7nF?mode=ac_t"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaWhatsapp className="text-2xl" />
                            Contact Us on WhatsApp
                        </motion.a>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    );
}