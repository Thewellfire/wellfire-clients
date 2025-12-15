import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import aboutImg from "../assets/about.jpg";

const AboutPreview = ({ showViewMore = true }) => {
    const navigate = useNavigate();
    const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
    const [isStatsVisible, setIsStatsVisible] = useState(false);

    // Stats counting animation
    useEffect(() => {
        if (!isStatsVisible) return;

        const targetValues = [500, 98, 10, 24]; // Extract numbers from stats
        const duration = 3000; // 3 seconds
        const steps = 90; // More steps for smoother animation
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            setAnimatedStats(targetValues.map(target => Math.floor(target * easeProgress)));

            if (step >= steps) {
                setAnimatedStats(targetValues);
                clearInterval(timer);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [isStatsVisible]);

    // Trigger stats animation when component is in view
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsStatsVisible(true);
        }, 1000); // Delay for better user experience

        return () => clearTimeout(timer);
    }, []);

    const handleReadMore = () => {
        window.scrollTo(0, 0);
        navigate('/aboutpreview');
    };

    const stats = [
        { number: "520+", label: "Projects Completed", value: 500, suffix: "+" },
        { number: "98%", label: "Client Satisfaction", value: 98, suffix: "%" },
        { number: "10+", label: "Years Experience", value: 10, suffix: "+" },
        { number: "24/7", label: "Support Available", value: 24, suffix: "/7" },
    ];

    // Animation variants for stagger effect
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <section 
            className="relative w-full min-h-screen bg-black overflow-hidden"
            style={{
                backgroundImage: `url(${aboutImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/70" />
            
            {/* Background Film Grain Effect */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-amber-800/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen px-4 sm:px-6 lg:px-12 xl:px-16 py-1 lg:py-0"
            >
                {/* LEFT SIDE - Heading */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4 lg:space-y-10 py-0 text-center lg:text-left order-1 lg:order-1 mt-4 lg:mt-0">
                    {/* Synopsis Label */}
                    <motion.div 
                        variants={itemVariants}
                        className="flex justify-center lg:justify-start"
                    >
                        <span 
                            className="inline-block text-4xl sm:text-7xl tracking-[0.2em] text-amber-100 py-2 lg:py-10 lg:pt-2 uppercase relative"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            about us
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1 
                        variants={itemVariants}
                        className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-light text-white leading-tight tracking-wide"
                        style={{ fontFamily: "'Cinzel', serif" }}
                    >
                        <span className="block">WE DREAM</span>
                        <span className="block text-amber-400 font-normal">WE CREATE</span>
                        <span className="block">WE PRESENT</span>
                    </motion.h1>

                    {/* Additional Text */}
                    <motion.div 
                        variants={itemVariants}
                        className="max-w-xl mx-auto lg:mx-0"
                    >
                    </motion.div>
                </div>

                {/* RIGHT SIDE - Description and Button */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-2">
                    {/* Description */}
                    <motion.div 
                        variants={itemVariants}
                        className="max-w-xl mx-auto lg:mx-0"
                    >
                        <p 
                            className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed font-light tracking-wide"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            We are a dynamic and driven production house, powered by a collective of young, visionary partners. Our mission is to transform bold ideas into compelling content. We operate across the entire creative lifecycle: we make the initial concepts, produce the high-quality film, video, and digital media, and provide comprehensive, end-to-end production services that guide projects seamlessly from script to screen.
                        </p>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-2 gap-4 lg:gap-6 mt-2 lg:mt-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index}
                                className="text-center p-4 lg:p-6 rounded-lg bg-black/20 border border-amber-400/20 backdrop-blur-sm hover:bg-black/30 hover:border-amber-400/40 transition-all duration-500 group"
                                whileHover={{
                                    scale: 1.05,
                                    y: -3
                                }}
                                transition={{
                                    duration: 0.3,
                                    type: "spring",
                                    stiffness: 300
                                }}
                            >
                                {/* Animated number */}
                                <div className="text-2xl lg:text-3xl font-bold text-amber-400 mb-0.5 lg:mb-2 transition-all duration-500 group-hover:text-amber-300 group-hover:scale-110">
                                    {animatedStats[index]}{stat.suffix}
                                </div>
                                
                                {/* Label */}
                                <div className="text-xs lg:text-sm text-gray-300 font-medium uppercase tracking-wider transition-all duration-500 group-hover:text-white group-hover:tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Additional Text */}
                    <motion.div 
                        variants={itemVariants}
                        className="max-w-xl mx-auto lg:mx-0"
                    >
                        <p 
                            className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed font-light tracking-wide italic"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            We combine youthful energy with technical excellence to deliver work that is fresh, impactful, and ready for the world.
                        </p>
                    </motion.div>

                    {/* Read More Button - Removed as per user request */}
                </div>
            </motion.div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            {/* Add Google Fonts */}
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;600&family=Inter:wght@200;300;400;500&display=swap');
            `}</style>
        </section>
    );
};

export default AboutPreview;
