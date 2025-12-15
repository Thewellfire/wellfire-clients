import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
// Use dynamic import to handle missing video in production
let heroVideo;
try {
  heroVideo = new URL("../assets/hero.mp4", import.meta.url).href;
} catch (e) {
  heroVideo = null;
}

const Hero = () => {
  const videoRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // start muted for autoplay compatibility
  const [isPlaying, setIsPlaying] = useState(false);

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isTouchDevice = "ontouchstart" in window;
      setIsMobile(width < 768 || isTouchDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      console.log('Video loaded successfully');
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      setIsVideoLoaded(true); // Show video even if there's an error
    };

    video.addEventListener("loadeddata", handleLoadedData);

    return () => video.removeEventListener("loadeddata", handleLoadedData);
  }, []);

  // Handle video and text timing - Fixed syntax error
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;

      // Fixed the visibility ranges syntax
      const shouldShow =
        (t >= 14.7 && t <= 37) || (t >= 42 && t <= 62.7) ;

      if (shouldShow !== showText) {
        setShowText(shouldShow);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [showText]);

  // Try to auto-play video on mobile when it's loaded. Keeping it muted improves autoplay success.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isMobile && isVideoLoaded) {
      try {
        video.muted = true; // ensure muted for autoplay
        const playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch((err) => {
            // Autoplay might be prevented by browser; log for debugging
            console.warn('Hero video autoplay prevented:', err);
          });
        }
      } catch (e) {
        console.warn('Error attempting hero autoplay:', e);
      }
    }
  }, [isMobile, isVideoLoaded]);

  return (
    <div
      className="w-full"
      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "800" }}
    >
      {/* Full Screen Video Background */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-full overflow-hidden bg-black"
        style={{ 
          height: isMobile ? '30vh' : '100vh',
          margin: 0,
          padding: 0,
     
         
        }}
      >
        {/* Loading placeholder */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
            <div className="animate-pulse text-white text-lg">
              Loading...
            </div>
          </div>
        )}

        {/* Full Screen Video or Fallback Image */}
        {heroVideo ? (
          <>
            {/* Mobile-specific CSS to hide native play/pause overlays on iOS/Android WebKit browsers */}
            <style>{`
              @media (max-width: 767px) {
                .hero-video::-webkit-media-controls-start-playback-button,
                .hero-video::-webkit-media-controls-overlay-play-button,
                .hero-video::-webkit-media-controls {
                  display: none !important;
                  -webkit-appearance: none;
                }
                .hero-video { outline: none; pointer-events: none; }
                /* Ensure our overlay buttons remain clickable */
                .hero-video + .hero-controls, .hero-controls { pointer-events: auto; }
              }
            `}</style>

            <video
              ref={videoRef}
              src={heroVideo}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              poster=""
              className={`hero-video absolute inset-0 w-full h-full object-cover ${
                !isVideoLoaded ? "hidden" : ""
              }`}
              style={{
                margin: 0,
                padding: 0,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Mobile-only invisible overlay: tapping the hero will start playback (no native play button) */}
            <div
              className="absolute inset-0 z-20 md:hidden"
              onClick={async (e) => {
                // Prevent clicks on control buttons
                const target = e.target;
                if (target.closest && target.closest('.hero-controls')) return;
                const video = videoRef.current;
                if (!video) return;
                try {
                  // On mobile user gesture, allow sound — unmute and play
                  video.muted = false;
                  setIsMuted(false);
                  await video.play();
                  setIsPlaying(true);
                } catch (err) {
                  console.warn('Play on tap failed:', err);
                  // fallback: try muted play
                  try {
                    video.muted = true;
                    await video.play();
                    setIsPlaying(true);
                  } catch (err2) {
                    console.warn('Fallback muted play failed:', err2);
                  }
                }
              }}
            />

            {/* Mute / Unmute toggle - bottom-right */}
            <div className="hero-controls absolute right-4 bottom-4 z-30">
              <button
                onClick={() => {
                  // Toggle state and ensure video element is updated
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (videoRef.current) videoRef.current.muted = newMuted;
                }}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="bg-black/60 hover:bg-black/70 text-white rounded-full p-2 flex items-center justify-center focus:outline-none"
              >
                {isMuted ? (
                  // Mute icon (speaker with slash) — show when currently muted
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M23 9L15 17" />
                    <path d="M15 9l8 8" />
                  </svg>
                ) : (
                  // Unmute icon (speaker with waves) — show when audio is on
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19 8a5 5 0 0 1 0 8" />
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin: 0,
              padding: 0,
            }}
          />
        )}

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none"></div>

        {/* Content Overlay - Using timing logic (Hidden on mobile) */}
        <AnimatePresence>
          {showText && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="text-center text-white uppercase tracking-wider max-w-4xl mx-auto">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-3xl sm:text-4xl md:text-4xl lg:text-6xl text-center mb-6 sm:mb-8 max-w-7xl leading-tight"
                  style={{ textShadow: "4px 4px 8px rgba(0,0,0,0.8)" }}
                >
                  
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className=" sm:text-lg md:text-lg lg:text-sm text-center mb-6 sm:mb-10 max-w-6xl "
                  style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.8)" }}
                >
                 
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.section>
    </div>
  );
};

export default Hero;