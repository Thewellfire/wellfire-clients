import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import aboutImg from "../assets/about_img.png";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    // Trigger visibility for staggered animations
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Number counting animation
  useEffect(() => {
    if (!isVisible) return;

    const targetValues = [500, 98, 5, 24]; // Extract numbers from stats
    const duration = 2000; // 2 seconds
    const steps = 60;
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
  }, [isVisible]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: "easeOut",
      },
    },
  };

  const stats = [
    { number: "500+", label: "Projects Completed", value: 500, suffix: "+" },
    { number: "98%", label: "Client Satisfaction", value: 98, suffix: "%" },
    { number: "5+", label: "Years Experience", value: 5, suffix: "+" },
    { number: "24/7", label: "Support Available", value: 24, suffix: "/7" },
  ];

  return (
    <div className="bg-primary min-h-screen relative overflow-hidden">
      {/* Enhanced Background Elements with Parallax */}
      <motion.div 
        className="gradient-mesh fixed inset-0 pointer-events-none animate-gradient-shift"
        style={{ y: 0 }}
        animate={{ y: [0, -50, 0] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="bg-noise fixed inset-0 pointer-events-none"
        style={{ y: 0 }}
        animate={{ y: [0, -30, 0] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
     
      
      {/* Parallax starfield */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
            animate={{
              y: [0, -window.innerHeight * 2],
              opacity: [0, Math.random() * 0.8 + 0.2, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      {/* Parallax light beams */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute w-0.5 h-screen bg-gradient-to-b from-transparent via-white/10 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              transform: `rotate(${i * 3 - 6}deg)`,
              transformOrigin: 'center top',
            }}
            animate={{
              y: [-window.innerHeight, window.innerHeight],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <section className="relative w-full py-6 md:py-12 lg:py-16 px-6 md:px-12 lg:px-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-12 md:space-y-20"
        >
          {/* Main Content Section */}
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16 lg:gap-20">
            {/* LEFT SIDE IMAGE */}
            <motion.div
              variants={imageVariants}
              className="w-full lg:w-2/5 relative group mb-4 lg:mb-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-card border-2 border-white/30 shadow-2xl shadow-white/20 transition-all duration-700 hover:shadow-red-500/30 hover:scale-105 hover:border-white/70">
                {/* Image container with enhanced styling */}
                <div className="relative overflow-hidden">
                  <motion.img
                    src={aboutImg}
                    alt="About Us"
                    className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[400px] object-cover"
                    whileHover={{ scale: 1.1, rotate: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                  />
                  
                  {/* Multiple overlay layers for depth */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-red-600/30 opacity-80 transition-all duration-700 group-hover:opacity-90 animate-pulse-slow" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-transparent opacity-60 transition-all duration-700 group-hover:opacity-80" />
                  
                  {/* Animated corner accents */}
                  <motion.div 
                    className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-red-500/50 rounded-tl-3xl"
                    animate={{ 
                      width: [80, 100, 80], 
                      height: [80, 100, 80],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-red-500/50 rounded-br-3xl"
                    animate={{ 
                      width: [80, 100, 80], 
                      height: [80, 100, 80],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 2
                    }}
                  />
                  
                  {/* Floating light rays */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"
                        style={{
                          left: `${20 + i * 15}%`,
                          transform: `rotate(${i * 5 - 10}deg)`,
                        }}
                        animate={{
                          opacity: [0, 0.4, 0],
                          x: [0, 20, 0],
                        }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE CONTENT */}
            <motion.div
              variants={textVariants}
              className="w-full lg:w-3/5 text-center lg:text-left space-y-6 md:space-y-10 group"
            >
              {/* Title with character animation */}
              <motion.h1
                variants={itemVariants}
                className="text-display text-lg md:text-3xl lg:text-6xl text-primary font-secondary leading-none hidden md:block transition-colors duration-500"
              >
                {"ABOUT ".split(" ").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  className="text-gradient bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  {" US".split("").map((char, index) => (
                    <motion.span
                      key={index + 6}
                      inion toitial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (index + 6) * 0.1 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </motion.h1>

              {/* Description paragraphs with staggered reveal */}
              <motion.div
                variants={itemVariants}
                className="space-y-3 md:space-y-6 group"
              >
                <motion.p
                  className="text-sm md:text-body text-secondary leading-relaxed font-primary group-hover:text-white transition-colors duration-500"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {"We are a dynamic and driven production house, powered by a collective of young, visionary partners. Our mission is to transform bold ideas into compelling content. We operate across the entire creative lifecycle: we make the initial concepts, produce the high-quality film, video, and digital media, and provide comprehensive, end-to-end production services that guide projects seamlessly from script to screen. We combine youthful energy with technical excellence to deliver work that is fresh, impactful, and ready for the world.".split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 1 + index * 0.02 }}
                      className="inline-block mr-1"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.p>

                {/* Animated underline */}
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 2.2 }}
                />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4"
              >
               
                
              
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative p-6 md:p-8 lg:p-10 text-center group"
                whileHover={{ 
                  scale: 1.05,
                  y: -5
                }}
                transition={{ 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300
                }}
              >
                {/* Animated border - always on with shimmer effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-60 transition-all duration-700 animate-border-shimmer group-hover:opacity-90 group-hover:from-white/20 group-hover:via-white/15 group-hover:to-white/20"></div>
                
                {/* Prominent outer border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 transition-all duration-500 group-hover:border-white/60 group-hover:border-4"></div>
                
                {/* Inner border accent */}
                <div className="absolute inset-[2px] rounded-2xl border border-red-500/30 transition-all duration-500 group-hover:border-red-500/60 group-hover:border-2"></div>
                
                {/* Glow effect - always on */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 opacity-30 transition-all duration-700 group-hover:opacity-60 group-hover:from-red-500/20 group-hover:via-red-500/10 group-hover:to-red-500/20 animate-pulse-slow"></div>
                
                {/* Inner shadow for depth */}
                <div className="absolute inset-0 rounded-2xl shadow-inner bg-black/20 transition-all duration-700 group-hover:bg-black/30"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 transition-all duration-500 group-hover:text-red-400 group-hover:scale-110 group-hover:drop-shadow-lg">
                    {animatedStats[index]}{stat.suffix}
                  </div>
                  <div className="text-sm md:text-base text-gray-300 font-medium uppercase tracking-wider transition-all duration-500 group-hover:text-white group-hover:tracking-wider group-hover:drop-shadow-md">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
          >
           
          </motion.div>

        
         
        </motion.div>
      </section>
    </div>
  );
};

export default About;
