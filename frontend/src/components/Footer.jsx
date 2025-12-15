import {
    Instagram,
    Youtube,
    Linkedin
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import footerImg from "../assets/footer-image.jpg";

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        window.scrollTo(0, 0);
        navigate(path);
    };

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            }, { threshold: 0.1 }
        );

        const footerElement = document.getElementById('footer-section');
        if (footerElement) {
            observer.observe(footerElement);
        }

        return () => observer.disconnect();
    }, []);

    return ( <
        footer id = "footer-section"
        className = "w-full min-h-[75vh] sm:min-h-[70vh] relative overflow-hidden bg-black sm:bg-cover sm:bg-center sm:bg-no-repeat"
        style = {
            {
                backgroundImage: window.innerWidth >= 640 ? `url(${footerImg})` : 'none',
            }
        } >
        { /* Dark overlay */ } <
        div className = "absolute inset-0 bg-black/80 min-h-screen -top-12 -bottom-12" / >

        { /* Main content */ } <
        div className = "relative min-h-[10vh] flex items-center justify-center px-4 sm:px-8 lg:px-12 pt-8 sm:pt-6" >
        <
        div className = "w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center ml-4 sm:ml-0" >

        { /* Left side - Company info */ } <
        div className = { `space-y-6 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}` } > { /* Logo */ } <
        div className = "space-y-4" >
        <
        h1 className = "text-4xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight" >
        The Wellfire Media Network<
        span className = "inline-flex items-center ml-2" >
        <
        span className = "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 border-2 border-white rounded-full flex items-center justify-center text-sm sm:text-base lg:text-lg font-light" > ©
        <
        /span> <
        /span> <
        /h1>

        { /* Address */ } <
        div className = "space-y-1 text-white/80 text-sm sm:text-base font-light tracking-wide" >
        <
        p > info.wellfire @gmail.com < /p> <
        p > careers @thewellfire.com < /p> <
        p > +91 7710000706 < /p> <
        p > +91 7506312117 < /p> <
        /div>

        { /* Social Icons */ } <
        div className = "flex gap-3 pt-2" >
        <
        a href = "https://www.instagram.com/thewellfiremedianetwork?igsh=MW5uYTFqamN0bG1tcw==&utm_source=qr"
        target = "_blank"
        rel = "noopener noreferrer"
        className = "w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 hover:scale-110" >
        <
        Instagram className = "w-4 h-4" / >
        <
        /a> <
        a href = "https://www.youtube.com/@TheWellfirestudios"
        target = "_blank"
        rel = "noopener noreferrer"
        className = "w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 hover:scale-110" >
        <
        Youtube className = "w-4 h-4" / >
        <
        /a> <
        a href = "https://www.linkedin.com/company/wellfire-studios/"
        target = "_blank"
        rel = "noopener noreferrer"
        className = "w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 hover:scale-110" >
        <
        Linkedin className = "w-4 h-4" / >
        <
        /a> <
        /div> <
        /div> <
        /div>

        { /* Right side - Main content */ } <
        div className = { `space-y-8 transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}` } > { /* Category */ } <
        div className = "text-white/60 text-sm sm:text-base font-light tracking-[0.15em] uppercase" >
        CREATIVE STUDIO <
        /div>

        { /* Main heading */ } <
        div className = "space-y-2" >
        <
        h2 className = "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight" >
        ENJOY THE CLASSICS, <
        br / >
        LATEST RELEASES &
        <
        br / >
        MUCH MORE WITH US. <
        /h2> <
        /div>

        { /* CTA Buttons */ } <
        div className = "pt-4 flex flex-row gap-3" >
        <
        button onClick = {
            () => handleNavigation('/contact') }
        className = "group relative px-3 py-2 sm:px-5 sm:py-3 border-2 border-white text-white font-medium text-xs sm:text-sm tracking-wide uppercase transition-all duration-300 sm:hover:bg-white sm:hover:text-black" >
        <
        span className = "relative z-10" > Contact Us < /span> <
        div className = "absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" / >
        <
        /button> <
        button onClick = {
            () => handleNavigation('/investors') }
        className = "group relative px-3 py-2 sm:px-5 sm:py-3 border-2 border-white text-white font-medium text-xs sm:text-sm tracking-wide uppercase transition-all duration-300 sm:hover:bg-white sm:hover:text-black" >
        <
        span className = "relative z-10" > Invest in Us < /span> <
        div className = "absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" / >
        <
        /button> <
        /div> <
        /div> <
        /div> <
        /div>

        { /* Bottom copyright */ } <
        div className = "absolute bottom-4 right-4" >
        <
        p className = { `text-white/40 text-xs tracking-wider transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}` } > ©2025 WELLFIRE STUDIO, ALL RIGHTS RESERVED <
        /p> <
        /div>

        { /* Subtle animated elements */ } <
        div className = "absolute top-20 right-20 w-2 h-2 bg-white/20 rounded-full animate-pulse"
        style = {
            { animationDuration: '3s' } }
        /> <
        div className = "absolute bottom-1/3 left-10 w-1 h-1 bg-white/30 rounded-full animate-pulse"
        style = {
            { animationDuration: '4s', animationDelay: '1s' } }
        /> <
        div className = "absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"
        style = {
            { animationDuration: '5s', animationDelay: '2s' } }
        /> <
        /footer>
    );
};

export default Footer;