import { FaWhatsapp, FaGraduationCap, FaBullhorn, FaGlobe } from "react-icons/fa";

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
            <section className="bg-gradient-to-br from-[#2E7D32] via-green-600 to-emerald-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">Our Mission</h1>
                        <div className="text-6xl font-bold mb-4">🌍</div>
                        <p className="text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                            Championing Environmental Education and Advocacy in Communities
                        </p>
                        <p className="text-xl max-w-3xl mx-auto opacity-90">
                            Join us to create positive changes in society through environmental education and advocacy for a sustainable future
                        </p>
                    </div>
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
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Meet Our Founder</h2>
                        <div className="max-w-md mx-auto">
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <img
                                    src="/founder.jpg"
                                    alt="Founder"
                                    className="w-full h-64 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400";
                                    }}
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">BadAfeez</h3>
                                    <p className="text-gray-600 mb-4">Founder & Environmental Advocate</p>
                                    <p className="text-gray-700 text-sm">
                                        Passionate about creating sustainable change through education and community engagement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-r from-[#2E7D32] to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Join the Ecowarriors for a Greener Future</h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">
                        Empowering change through environmental education. Driving social change and sustainable development through environmental education and advocacy in Ikom for a greener future aligned with SDGs.
                    </p>
                    <a
                        href="https://wa.me/+2348131125216"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        <FaWhatsapp className="text-2xl" />
                        Contact Us on WhatsApp
                    </a>
                </div>
            </section>
        </div>
    );
}