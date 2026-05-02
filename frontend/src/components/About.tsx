import {
    FaWhatsapp,
    FaGraduationCap,
    FaBolt,
    FaSeedling,
    FaUsers,
    FaBookOpen,
    FaRocket,
    FaLeaf,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

export default function About() {
    const stats = [
        { value: "2.5x", label: "Impact on Sustainable Development Goals" },
        { value: "80%", label: "Increase in Awareness Levels" },
        { value: "3.7x", label: "Community Engagement Growth" },
        { value: "95%", label: "Positive Feedback from Participants" },
    ];

    const coreValues = [
        {
            icon: <FaGraduationCap className="text-3xl text-[#2E7D32]" />,
            title: "Education That Inspires",
            description:
                "We believe learning happens best when it's engaging, personal, and memorable. Like the spark that ignites passion, we design experiences that make environmental understanding come alive.",
        },
        {
            icon: <FaBolt className="text-3xl text-[#2E7D32]" />,
            title: "Action Over Awareness",
            description:
                "Knowing about environmental problems isn't enough. We activate young people to become doers — to lead projects, influence their peers, and embed sustainable practices into daily life.",
        },
        {
            icon: <FaSeedling className="text-3xl text-[#2E7D32]" />,
            title: "Africa-Led Solutions",
            description:
                "We build from within. Our solutions are created by Africans, for Africa — rooted in our contexts, our challenges, and our extraordinary potential.",
        },
        {
            icon: <FaUsers className="text-3xl text-[#2E7D32]" />,
            title: "Youth as Leaders",
            description:
                "Young people aren't the future of environmental change; they're the present. We put them in the spotlight, celebrate their accomplishments, and trust them to lead.",
        },
    ];

    const whatWeDo = [
        {
            icon: <FaBookOpen className="text-3xl text-white" />,
            title: "Educate",
            description:
                "We transform environmental education from abstract concepts to lived experiences through workshops, competitions, and hands-on learning in schools across Africa.",
        },
        {
            icon: <FaRocket className="text-3xl text-white" />,
            title: "Activate",
            description:
                "We create inspiring moments and opportunities that empower young people to take environmental action and become champions in their communities.",
        },
        {
            icon: <FaLeaf className="text-3xl text-white" />,
            title: "Practice",
            description:
                "We embed environmental consciousness into daily habits and behaviors, ensuring knowledge becomes action that lasts.",
        },
    ];

    const testimonials = [
        {
            text: "Eco Warrior Africa is a platform dedicated to advocating environmental protection across Nigeria and Africa. It aims to inspire and educate young environmentalists and indigenous communities about sustainability, while raising awareness on how individuals and societies can take practical actions to protect and preserve the earth planet for present and future generations.",
            author: "Oluwatimileyin H. Alofe",
            role: "Environmental Advocate",
        },
        {
            text: "As its name implies, a warrior is one who wars against every form of infiltration. This is the perfect description of a structured initiative in combating attack against our nature, no matter how harmless they may look. It is called the Eco Warrior Africa.",
            author: "Adeola Emmanuel Oluwadamilare",
            role: "Mechanical Engineering Student, FUTA",
        },
        {
            text: "Even without being in Kwara, I felt the impact here in Lagos. Eco Warrior is building real change through structured awareness for a progressive and green society.",
            author: "Engr. Arogundade Timilehin",
            role: "GMNSE",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero / Mission Statement */}
            <section className="bg-gray-50 text-gray-900 py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="flex flex-col items-center text-center gap-6"
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                            Our Mission
                        </h1>

                        <motion.div
                            className="text-5xl md:text-6xl mb-2"
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

                        <p className="text-lg md:text-xl max-w-4xl leading-relaxed text-gray-700">
                            To ignite environmental consciousness across Africa by empowering
                            young people through experiential education, inspiring action, and
                            building sustainable practices — creating a generation of
                            environmental leaders who transform their communities and continent.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            The principles that shape every workshop, every campaign, and every
                            community we touch.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        {coreValues.map((value, index) => (
                            <motion.div
                                key={index}
                                className="bg-gray-50 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-100 p-3 rounded-lg">{value.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {value.title}
                                    </h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What We Do
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            A three-step framework for lasting environmental change.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {whatWeDo.map((item, index) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-br from-[#2E7D32] to-emerald-600 rounded-xl p-8 text-white shadow-md hover:shadow-xl transition-shadow"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-white/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-white/90 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Our Vision
                        </h2>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                            A thriving Africa where environmental stewardship is woven into the
                            identity of every young person, where understanding and protecting our
                            planet is as natural as breathing, and where young environmental
                            warriors lead the way toward a sustainable future.
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-[#2E7D32] tracking-wide">
                            Eco Warrior Africa: Educate. Activate. Practice.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-[#2E7D32] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Empowering Change Through Environmental Education
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm md:text-lg opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Discover what our clients say about EcoWarrior Africa
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="bg-gray-50 rounded-xl p-6 md:p-8 flex flex-col"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-gray-700 mb-6 italic leading-relaxed flex-1">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center mt-auto">
                                    <div className="w-12 h-12 bg-[#2E7D32] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                        <span className="text-white font-bold">
                                            {testimonial.author.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {testimonial.author}
                                        </div>
                                        <div className="text-gray-600 text-sm">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        <motion.div
                            className="md:w-1/2 w-full"
                            initial={{ x: -80, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: true }}
                        >
                            <img
                                src="/founder.webp"
                                alt="Founder Yusuf Fasilat A."
                                className="w-full md:h-[28rem] object-cover rounded-2xl shadow-md"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400";
                                }}
                            />
                        </motion.div>

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
                                Founder · EcoWarrior Africa
                            </p>
                            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                                As a young environmentalist, I founded EcoWarrior Africa to ignite
                                climate consciousness and empower communities to take bold action
                                for our planet. This initiative is more than a project — it's a
                                movement to inspire, educate, and equip the next generation of eco
                                champions across Africa. Together, we can protect our environment
                                and build a sustainable future.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gray-50 text-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="flex flex-col items-center text-center gap-6"
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                            Join the Eco Warriors for a Greener Future
                        </h2>
                        <p className="text-lg md:text-xl mb-4 max-w-3xl leading-relaxed">
                            Empowering change through environmental education. Driving social
                            change and sustainable development through environmental education and
                            advocacy across Africa for a greener future aligned with the SDGs.
                        </p>

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
