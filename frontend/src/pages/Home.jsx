import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AboutPreview from "../components/AboutPreview";
import Hero from "../components/Hero";
import LatestCollection1 from "../components/LatestCollection1";
import Services from "../pages/Services";
import { StaggerContainer, StaggerItem, FadeIn } from "../components/PageTransition";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section - Full viewport with navbar overlay */}
      <FadeIn duration={0.8}>
        <Hero />
      </FadeIn>
      
      {/* Main Content */}
      <StaggerContainer>
        <div className="py-6 sm:py-4 md:py-6 lg:py-10">
          <StaggerItem>
            <LatestCollection1 />
          </StaggerItem>
          
          <StaggerItem>
            <AboutPreview />
          </StaggerItem>
          
          <StaggerItem>
            <Services />
          </StaggerItem>
        </div>
      </StaggerContainer>
    </motion.div>
  );
};

export default Home;
