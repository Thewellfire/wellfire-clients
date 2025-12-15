import axios from "axios";
import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const CategoryShowcase = ({ category, title }) => {
    const { navigate } = useContext(ShopContext);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [isMobile, setIsMobile] = useState(() => {
        // Initialize with proper mobile detection on first render
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            return isMobileDevice || width < 768;
        }
        return false;
    });
    const [investmentProducts, setInvestmentProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [videoStats, setVideoStats] = useState({});
    const [videosReady, setVideosReady] = useState(false);
    const [loadedVideoCount, setLoadedVideoCount] = useState(0);

    // Initialize global loading status for this category
    useEffect(() => {
        if (!window.wellfireLoadingStatus) {
            window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
        }
        window.wellfireLoadingStatus[category] = false; // Start as not ready
        console.log(`🚀 ${category}: Initialized loading status for LC1 page`);
    }, [category]);


    // Check if device is mobile with enhanced detection
    useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isMobileWidth = width < 768;

            // Use both user agent and width for better detection
            const shouldBeMobile = isMobileDevice || isMobileWidth;
            setIsMobile(shouldBeMobile);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        window.addEventListener("orientationchange", () => {
            setTimeout(checkMobile, 100); // Delay to ensure proper width calculation
        });

        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("orientationchange", checkMobile);
        };
    }, []);

    // Fetch investment products from backend
    useEffect(() => {
        const fetchInvestmentProducts = async() => {
            try {
                console.log(`🔍 Fetching products for ${category}...`);
                setIsLoading(true);

                // Use env backend URL with localhost fallback
                const backendUrl =
                    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
                console.log(`🔗 Using backend URL: ${backendUrl}`);

                const fullUrl = `${backendUrl}/api/investment-product/list`;
                console.log(`📡 Making request to: ${fullUrl}`);

                const response = await axios.get(fullUrl);

                console.log(`📡 API Response for ${category}:`, response.data);
                console.log(`📡 Response status:`, response.status);
                console.log(`📡 Response success:`, response.data.success);
                console.log(`📡 Products array:`, response.data.products);
                console.log(`📡 Products length:`, response.data.products?.length);

                if (response.data.success && response.data.products) {
                    setInvestmentProducts(response.data.products);
                    console.log(
                        `✅ Products loaded for ${category}:`,
                        response.data.products.length
                    );
                } else {
                    console.log(`❌ API returned success: false or no products`);
                }
            } catch (error) {
                console.error(`❌ Error fetching products for ${category}:`, error);
                console.error(`❌ Error details:`, {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                });
            } finally {
                // Don't set loading to false here - wait for videos to be ready
                console.log(`🏁 API fetch completed, waiting for videos to load...`);
            }
        };

        fetchInvestmentProducts();
    }, [category]);

    // Fetch YouTube stats for videos
    useEffect(() => {
        const fetchAllVideoStats = async() => {
            if (investmentProducts.length === 0) return;

            const stats = {};
            const promises = investmentProducts.map(async(product) => {
                if (product.youtubeLink) {
                    const videoId = getYouTubeVideoId(product.youtubeLink);
                    if (videoId) {
                        const videoStats = await fetchYouTubeStats(videoId);
                        stats[product.id || product.productTitle] = {
                            ...videoStats,
                            videoId
                        };
                    }
                }
            });

            await Promise.all(promises);
            setVideoStats(stats);
        };

        fetchAllVideoStats();
    }, [investmentProducts]);

    // Filter products by category and sort by estimated views
    useEffect(() => {
        if (investmentProducts.length === 0) return;

        console.log(
            `🎯 Filtering ${category} products from ${investmentProducts.length} total products`
        );

        const filtered = investmentProducts.filter((item) => {
            const itemCategory = item.category?.toLowerCase() || "";
            const targetCategory = category.toLowerCase();

            console.log(
                `🔍 Checking: ${item.productTitle} (${item.category}) against ${category}`
            );

            // Exact match (case-insensitive)
            return itemCategory === targetCategory;
        });

        // Sort by estimated views (highest first)
        const sortedFiltered = filtered.sort((a, b) => {
            const aStats = videoStats[a.id || a.productTitle] || { estimatedViews: 0 };
            const bStats = videoStats[b.id || b.productTitle] || { estimatedViews: 0 };

            console.log(`📊 Comparing views: ${a.productTitle} (${aStats.estimatedViews}) vs ${b.productTitle} (${bStats.estimatedViews})`);

            return bStats.estimatedViews - aStats.estimatedViews;
        });

        console.log(
            `🎯 Found ${sortedFiltered.length} products for ${category}, sorted by views:`,
            sortedFiltered.map(p => ({
                title: p.productTitle,
                views: videoStats[p.id || p.productTitle]?.estimatedViews || 0
            }))
        );
        setCategoryProducts(sortedFiltered);

        // Check video readiness after filtering and report to global state
        if (sortedFiltered.length > 0) {
            checkVideoReadiness(sortedFiltered);
        } else {
            // No products for this category, mark as ready
            setVideosReady(true);
            setIsLoading(false);

            // Ensure global status exists and report completion
            if (!window.wellfireLoadingStatus) {
                window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
            }
            window.wellfireLoadingStatus[category] = true;

            console.log(`✅ ${category}: No products found, marking as READY`);
            console.log(`📊 Global status:`, window.wellfireLoadingStatus);
        }
    }, [investmentProducts, category, videoStats]);

    // Check if videos are ready to play
    const checkVideoReadiness = (products) => {
        console.log(`🎬 ${category}: Starting video readiness check...`);

        const videoProducts = products.filter(p => p.youtubeLink);

        if (videoProducts.length === 0) {
            // No videos to load, can finish loading
            setVideosReady(true);
            setIsLoading(false);

            // Ensure global status exists and report completion
            if (!window.wellfireLoadingStatus) {
                window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
            }
            window.wellfireLoadingStatus[category] = true;

            console.log(`✅ ${category}: No videos to load, marking as READY`);
            console.log(`📊 Global status:`, window.wellfireLoadingStatus);
            return;
        }

        console.log(`🎬 Checking readiness for ${videoProducts.length} videos in ${category}...`);

        let readyCount = 0;
        const totalVideos = videoProducts.length;

        videoProducts.forEach((product, index) => {
            const videoId = getYouTubeVideoId(product.youtubeLink);
            if (videoId) {
                // Check if video thumbnail loads (indicates video is accessible)
                const img = new Image();
                img.onload = () => {
                    readyCount++;
                    setLoadedVideoCount(readyCount);
                    console.log(`📹 Video ${readyCount}/${totalVideos} ready for ${category}`);

                    if (readyCount >= totalVideos) {
                        setVideosReady(true);
                        setIsLoading(false);

                        // Ensure global status exists and report completion
                        if (!window.wellfireLoadingStatus) {
                            window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
                        }
                        window.wellfireLoadingStatus[category] = true;

                        console.log(`✅ ${category}: All videos ready, marking as READY`);
                        console.log(`📊 Global status:`, window.wellfireLoadingStatus);
                    }
                };
                img.onerror = () => {
                    readyCount++;
                    setLoadedVideoCount(readyCount);
                    console.log(`⚠️ Video ${readyCount}/${totalVideos} failed but continuing for ${category}`);

                    if (readyCount >= totalVideos) {
                        setVideosReady(true);
                        setIsLoading(false);

                        // Ensure global status exists and report completion
                        if (!window.wellfireLoadingStatus) {
                            window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
                        }
                        window.wellfireLoadingStatus[category] = true;

                        console.log(`✅ ${category}: All videos processed, marking as READY`);
                        console.log(`📊 Global status:`, window.wellfireLoadingStatus);
                    }
                };
                // Use maxresdefault for best quality check
                img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            } else {
                readyCount++;
                setLoadedVideoCount(readyCount);
                if (readyCount >= totalVideos) {
                    setVideosReady(true);
                    setIsLoading(false);

                    // Ensure global status exists and report completion
                    if (!window.wellfireLoadingStatus) {
                        window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
                    }
                    window.wellfireLoadingStatus[category] = true;

                    console.log(`✅ ${category}: All videos counted, marking as READY`);
                    console.log(`📊 Global status:`, window.wellfireLoadingStatus);
                }
            }
        });

        // Fallback timeout - don't wait more than 1 second for videos (YouTube optimization)
        setTimeout(() => {
            if (!videosReady) {
                console.log(`⏰ ${category}: Video loading timeout, forcing completion`);
                setVideosReady(true);
                setIsLoading(false);

                // Ensure global status exists and report completion
                if (!window.wellfireLoadingStatus) {
                    window.wellfireLoadingStatus = { Music: false, Film: false, Commercial: false };
                }
                window.wellfireLoadingStatus[category] = true;

                console.log(`✅ ${category}: Timeout reached, marking as READY`);
                console.log(`📊 Global status:`, window.wellfireLoadingStatus);
            }
        }, 1000);
    };

    const handleImageClick = (product) => {
        // Scroll to top before opening new content
        window.scrollTo(0, 0);

        if (product.youtubeLink) {
            let youtubeUrl = product.youtubeLink;

            // Handle different YouTube link formats
            if (youtubeUrl.includes("youtube.com/watch?v=")) {
                window.open(youtubeUrl, "_blank");
            } else if (youtubeUrl.includes("youtu.be/")) {
                window.open(youtubeUrl, "_blank");
            } else if (youtubeUrl.includes("youtube.com/")) {
                window.open(youtubeUrl, "_blank");
            } else if (youtubeUrl.startsWith("http")) {
                window.open(youtubeUrl, "_blank");
            } else {
                // Try to construct a proper YouTube URL
                const videoId = youtubeUrl
                    .replace("youtube.com/watch?v=", "")
                    .replace("youtu.be/", "");
                if (videoId && videoId.length > 5) {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
                } else {
                    alert("Invalid YouTube link format. Please check the link.");
                }
            }
        } else if (product.videoFile) {
            window.open(product.videoFile, "_blank");
        } else {
            alert("No video content available for this product.");
        }
    };

    const getYouTubeEmbedUrl = (raw) => {
        if (!raw) return null;
        let videoId = null;
        try {
            const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
            if (url.hostname.includes("youtu.be")) {
                videoId = url.pathname.replace("/", "");
            } else if (url.searchParams.get("v")) {
                videoId = url.searchParams.get("v");
            } else if (url.pathname.includes("/shorts/")) {
                videoId = url.pathname.split("/shorts/")[1];
            }
        } catch (_) {
            // Fallback simple parsing
            if (raw.includes("youtu.be/")) videoId = raw.split("youtu.be/")[1];
            if (raw.includes("watch?v=")) videoId = raw.split("watch?v=")[1];
        }
        if (!videoId) return null;
        const id = videoId.split("&")[0];
        // Use medium quality for faster loading (YouTube optimization)
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${id}&start=30&vq=medium`;
    };

    const getYouTubeWatchUrl = (raw) => {
        if (!raw) return null;
        let embed = getYouTubeEmbedUrl(raw);
        if (!embed) return null;
        const id = embed.split("/embed/")[1]?.split("?")[0];
        if (!id) return null;
        return `https://www.youtube.com/watch?v=${id}`;
    };

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
            if (urlObj.hostname.includes("youtu.be")) {
                return urlObj.pathname.replace("/", "");
            } else if (urlObj.searchParams.get("v")) {
                return urlObj.searchParams.get("v");
            } else if (urlObj.pathname.includes("/shorts/")) {
                return urlObj.pathname.split("/shorts/")[1];
            }
        } catch (_) {
            // Fallback simple parsing
            if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
            if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
        }
        return null;
    };

    // Fetch YouTube video statistics (views, likes, etc.)
    const fetchYouTubeStats = async(videoId) => {
        try {
            // Using YouTube oEmbed API to get basic info (no API key required)
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (response.ok) {
                const data = await response.json();
                // Since we can't get view count without API key, we'll use a fallback method
                // We'll scrape view count from the video page or use title/author as indicators
                return {
                    title: data.title,
                    author: data.author_name,
                    thumbnail: data.thumbnail_url,
                    // Estimate popularity based on title keywords and author
                    estimatedViews: estimatePopularity(data.title, data.author_name)
                };
            }
        } catch (error) {
            console.log('YouTube stats fetch failed:', error);
        }
        return { estimatedViews: 0 };
    };

    // Estimate video popularity based on title and author
    const estimatePopularity = (title, author) => {
        let score = Math.random() * 1000000; // Base random score

        // Boost score for popular keywords
        const popularKeywords = ['official', 'music video', 'mv', 'full', 'hd', '4k', 'new', 'latest', 'hit'];
        const titleLower = title?.toLowerCase() || '';
        popularKeywords.forEach(keyword => {
            if (titleLower.includes(keyword)) score += 500000;
        });

        // Boost score for known popular artists/channels
        const popularArtists = ['vevo', 'records', 'music', 'entertainment'];
        const authorLower = author?.toLowerCase() || '';
        popularArtists.forEach(artist => {
            if (authorLower.includes(artist)) score += 1000000;
        });

        return Math.floor(score);
    };

    const ProductCard = ({
        product,
        className = "",
        showTitle = true,
        isScrolling = false,
        isVertical = false,
        isRightSide = false,
    }) => ( <
        motion.div className = { `relative overflow-hidden bg-black group ${className}` }
        initial = { isScrolling ? { opacity: 0, y: 20 } : {} }
        animate = { isScrolling ? { opacity: 1, y: 0 } : {} }
        transition = {
            { duration: 0.6, ease: "easeOut" }
        }
        style = { isRightSide ? { aspectRatio: "5/2" } : {} }
        onClick = {
            () => handleImageClick(product)
        } >
        <
        div className = "relative w-full h-full group" >
        <
        img src = {
            product?.coverImage ||
            product?.image ||
            "https://via.placeholder.com/400x300?text=No+Image"
        }
        alt = { product?.productTitle || product?.name || "Product" }
        className = { `w-full h-full transition-transform duration-700 group-hover:scale-110 cursor-pointer ${
            isVertical || isRightSide ? "object-cover" : "object-contain"
          }` }
        onClick = {
            () => handleImageClick(product)
        }
        />

        {/** Click-through overlay to ensure navigation */ } {
            getYouTubeWatchUrl(product.youtubeLink) && ( <
                a href = { getYouTubeWatchUrl(product.youtubeLink) }
                target = "_blank"
                rel = "noopener noreferrer"
                className = "absolute inset-0 z-0"
                aria-label = "Open on YouTube" /
                >
            )
        }

        {/** Clean video display - no text overlays for video content */ } <
        /div> < /
        motion.div >
    );

    // Continuously running video card with controls for Music and Film left side
    const HoverVideoCard = ({ product, className = "" }) => {
        const [isPlaying, setIsPlaying] = useState(() => {
            // Initialize based on whether video should autoplay
            return !!(product?.videoFile || product?.youtubeLink);
        });
        const [isMuted, setIsMuted] = useState(true);
        const [showControls, setShowControls] = useState(false);
        const [hasInteracted, setHasInteracted] = useState(false);
        const [loadIframe, setLoadIframe] = useState(false); // Lazy load iframe
        const [videoLoading, setVideoLoading] = useState(true); // Show loading until video plays
        const videoRef = useRef(null);
        const iframeRef = useRef(null);

        // Lazy load iframe after component mounts (YouTube optimization)
        useEffect(() => {
            const timer = setTimeout(() => {
                setLoadIframe(true);
                // Hide loading after iframe loads (simulate video ready)
                setTimeout(() => {
                    setVideoLoading(false);
                }, 1500); // Give iframe time to start playing
            }, 100); // Delay iframe load by 100ms for faster initial render
            return () => clearTimeout(timer);
        }, []);

        const togglePlayPause = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setHasInteracted(true);

            if (videoRef.current) {
                if (isPlaying) {
                    videoRef.current.pause();
                } else {
                    videoRef.current.play().catch(console.error);
                }
                setIsPlaying(!isPlaying);
            }
        };

        const stopVideo = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setHasInteracted(true);

            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                setIsPlaying(false);
            }
        };

        const toggleMute = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setHasInteracted(true);

            if (videoRef.current) {
                videoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
            }
        };

        // Handle video events
        const handleVideoPlay = () => setIsPlaying(true);
        const handleVideoPause = () => setIsPlaying(false);
        const handleVideoEnded = () => setIsPlaying(false);

        return ( <
            motion.div className = { `relative overflow-hidden bg-black group ${className}` }
            initial = {
                { opacity: 0, scale: 1.05 }
            }
            animate = {
                { opacity: 1, scale: 1 }
            }
            transition = {
                { duration: 0.6, ease: "easeOut" }
            }
            style = {
                { margin: 0, padding: 0, overflow: 'hidden', border: 'none', borderRadius: 0 }
            }
            onMouseEnter = {
                () => {
                    setShowControls(true);
                    // Pause video when hovering
                    if (videoRef.current && isPlaying) {
                        videoRef.current.pause();
                        setIsPlaying(false);
                    }
                }
            }
            onMouseLeave = {
                () => {
                    setShowControls(false);
                    // Resume video when cursor leaves
                    if (videoRef.current && !isPlaying) {
                        videoRef.current.play().catch(console.error);
                        setIsPlaying(true);
                    }
                }
            }
            onClick = {
                () => handleImageClick(product)
            } >
            <
            div className = "relative w-full h-full group overflow-hidden"
            style = {
                { margin: 0, padding: 0, border: 'none', borderRadius: 0 }
            } > {/** Show thumbnail first, then lazy load iframe - YouTube optimization */ } {
                getYouTubeEmbedUrl(product.youtubeLink) ? ( <
                    >
                    {/** Show thumbnail immediately for fast loading */ } {
                        !loadIframe && ( <
                            img src = { `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/maxresdefault.jpg` }
                            alt = { product.productTitle || "Video" }
                            className = "w-full h-full object-cover"
                            onError = {
                                (e) => {
                                    if (e.target.src.includes('maxresdefault')) {
                                        e.target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/hq720.jpg`;
                                    } else if (e.target.src.includes('hq720')) {
                                        e.target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/hqdefault.jpg`;
                                    }
                                }
                            }
                            />
                        )
                    }

                    {/** Lazy load iframe after delay */ } {
                        loadIframe && ( <
                            iframe ref = { iframeRef }
                            src = { `${getYouTubeEmbedUrl(product.youtubeLink)}&autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&start=30&vq=hd720` }
                            title = { product.productTitle || "Video" }
                            className = "w-full h-full absolute inset-0"
                            style = {
                                {
                                    width: isMobile ? '120%' : '150%',
                                    height: isMobile ? '120%' : '150%',
                                    top: isMobile ? '-10%' : '-25%',
                                    left: isMobile ? '-10%' : '-25%',
                                    border: 'none',
                                    margin: 0,
                                    padding: 0,
                                    transform: isMobile ? 'scale(1.2)' : 'scale(1.3)',
                                    transformOrigin: 'center center'
                                }
                            }
                            frameBorder = "0"
                            allow = "autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen loading = "lazy" /
                            >
                        )
                    } <
                    />
                ) : product?.videoFile ? ( <
                    video ref = { videoRef }
                    src = { product.videoFile }
                    className = { `w-full h-full ${isMobile ? 'object-contain' : 'object-cover'}` }
                    muted = { isMuted }
                    loop playsInline autoPlay onPlay = { handleVideoPlay }
                    onPause = { handleVideoPause }
                    onEnded = { handleVideoEnded }
                    onLoadedData = {
                        () => {
                            // Hide loading when video is ready
                            setVideoLoading(false);
                            // Only auto-play if user hasn't interacted yet, or if they previously had it playing
                            if (videoRef.current && (!hasInteracted || isPlaying)) {
                                videoRef.current.play().catch((error) => {
                                    console.log('Video autoplay failed:', error);
                                    // Try again after a short delay if autoplay fails
                                    setTimeout(() => {
                                        if (videoRef.current && (!hasInteracted || isPlaying)) {
                                            videoRef.current.play().catch(console.error);
                                        }
                                    }, 100);
                                });
                            }
                        }
                    }
                    />
                ) : ( <
                    img src = {
                        product?.coverImage ||
                        product?.image ||
                        `https://img.youtube.com/vi/${getYouTubeEmbedUrl(product.youtubeLink)?.split('/embed/')[1]?.split('?')[0]}/maxresdefault.jpg` ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt = { product?.productTitle || product?.name || "Product" }
                    className = "w-full h-full object-cover cursor-pointer"
                    onError = {
                        (e) => {
                            if (product.youtubeLink) {
                                const videoId = getYouTubeEmbedUrl(product.youtubeLink)?.split('/embed/')[1]?.split('?')[0];
                                if (e.target.src.includes('maxresdefault')) {
                                    e.target.src = `https://img.youtube.com/vi/${videoId}/hq720.jpg`;
                                } else if (e.target.src.includes('hq720')) {
                                    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                }
                            }
                        }
                    }
                    />
                )
            }

           

            {/** Simple Video Controls */ } {
                (product?.videoFile || getYouTubeEmbedUrl(product.youtubeLink)) && ( <
                    div className = { `absolute inset-0 flex items-center justify-center transition-all duration-300 z-20 ${showControls ? 'bg-black bg-opacity-30' : 'bg-transparent'}` } > {/** Single Play/Pause Button */ } <
                    div className = { `transition-all duration-300 transform ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}` } > {
                        product?.videoFile && ( <
                            button onClick = { togglePlayPause }
                            className = "group relative w-16 h-16 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xl"
                            aria-label = { isPlaying ? "Pause" : "Play" } >
                            <
                            div className = "absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" > < /div> {
                            isPlaying ? ( <
                                svg className = "w-8 h-8 text-black relative z-10"
                                fill = "currentColor"
                                viewBox = "0 0 24 24" >
                                <
                                path d = "M6 4h4v16H6V4zm8 0h4v16h-4V4z" / >
                                <
                                /svg>
                            ) : ( <
                                svg className = "w-8 h-8 text-black ml-1 relative z-10"
                                fill = "currentColor"
                                viewBox = "0 0 24 24" >
                                <
                                path d = "M8 5v14l11-7z" / >
                                <
                                /svg>
                            )
                        } <
                        /button>
                    )
                } <
                /div>

                {/** Click-through overlay for opening full video - only when controls are hidden */ } {
                    !showControls && (getYouTubeWatchUrl(product.youtubeLink) || product.videoFile) && ( <
                        a href = { getYouTubeWatchUrl(product.youtubeLink) || product.videoFile }
                        target = "_blank"
                        rel = "noopener noreferrer"
                        className = "absolute inset-0 z-10"
                        aria-label = "Open video" /
                        >
                    )
                } <
                /div>
            )
        }

        <
        /div> < /
        motion.div >
    );
};

// Video-only card for right-side slider with YouTube thumbnails
const ProductVideoCard = ({ product, className = "", isYouTubeThumbnail = false }) => {
        const [loadIframe, setLoadIframe] = useState(false);
        const [videoLoading, setVideoLoading] = useState(false);

        // Only load iframe on hover for better performance
        const handleMouseEnter = () => {
            if (!loadIframe) {
                setVideoLoading(true);
                setLoadIframe(true);
                // Hide loading after iframe loads
                setTimeout(() => {
                    setVideoLoading(false);
                }, 1500);
            }
        };

        return ( <
            motion.div className = { `relative overflow-hidden bg-black group ${className}` }
            initial = {
                { opacity: 0, y: 20 }
            }
            animate = {
                { opacity: 1, y: 0 }
            }
            transition = {
                { duration: 0.6, ease: "easeOut" }
            }
            style = { isYouTubeThumbnail ? { aspectRatio: "16/9" } : { aspectRatio: "5/2" } }
            onClick = {
                () => handleImageClick(product)
            }
            onMouseEnter = { handleMouseEnter } >
            <
            div className = "relative w-full h-full group overflow-hidden" >

            {/** Always show YouTube thumbnail for instant loading */ } {
                getYouTubeWatchUrl(product.youtubeLink) ? ( <
                        >
                        <
                        img src = { `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/maxresdefault.jpg` }
                        alt = { product?.productTitle || "YouTube Thumbnail" }
                        className = "w-full h-full object-cover"
                        loading = "lazy"
                        onError = {
                            (e) => {
                                // Try HD quality first, then fallback to standard
                                if (e.target.src.includes('maxresdefault')) {
                                    e.target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/hq720.jpg`;
                                } else if (e.target.src.includes('hq720')) {
                                    e.target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/hqdefault.jpg`;
                                }
                            }
                        }
                        />

                        {/** Only load iframe on hover for performance */ } {
                            loadIframe && !isYouTubeThumbnail && ( <
                                iframe src = { `${getYouTubeEmbedUrl(product.youtubeLink)}&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&start=30&vq=hd720` }
                                title = { product.productTitle || "Video" }
                                className = "w-full h-full absolute inset-0 pointer-events-none"
                                style = {
                                    {
                                        width: '150%',
                                        height: '150%',
                                        top: '-25%',
                                        left: '-25%',
                                        border: 'none',
                                        margin: 0,
                                        padding: 0,
                                        transform: 'scale(1.3)',
                                        transformOrigin: 'center center'
                                    }
                                }
                                frameBorder = "0"
                                allow = "autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen loading = "lazy" /
                                >
                            )
                        } <
                        />
                    ) : getYouTubeEmbedUrl(product.youtubeLink) && !getYouTubeWatchUrl(product.youtubeLink) ? ( <
                        >
                        <
                        img src = { `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/maxresdefault.jpg` }
                        alt = { product?.productTitle || "YouTube Thumbnail" }
                        className = "w-full h-full object-cover"
                        loading = "lazy"
                        onError = {
                            (e) => {
                                if (e.target.src.includes('maxresdefault')) {
                                    e.target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/hq720.jpg`;
                                } else if (e.target.src.includes('hq720')) {
                                    e.target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(product.youtubeLink)}/hqdefault.jpg`;
                                }
                            }
                        }
                        /> {
                        loadIframe && ( <
                            iframe src = { `${getYouTubeEmbedUrl(product.youtubeLink)}&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&start=30&vq=hd720` }
                            title = { product.productTitle || "Video" }
                            className = "w-full h-full absolute inset-0 pointer-events-none"
                            style = {
                                {
                                    width: '150%',
                                    height: '150%',
                                    top: '-25%',
                                    left: '-25%',
                                    border: 'none',
                                    margin: 0,
                                    padding: 0,
                                    transform: 'scale(1.3)',
                                    transformOrigin: 'center center'
                                }
                            }
                            frameBorder = "0"
                            allow = "autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen loading = "lazy" /
                            >
                        )
                    } <
                    />
            ): product?.videoFile ? ( <
                video src = { product.videoFile }
                className = "w-full h-full object-cover"
                muted loop playsInline autoPlay onLoadStart = {
                    () => setVideoLoading(true)
                }
                onLoadedData = {
                    (e) => {
                        // Hide loading when video is ready
                        setVideoLoading(false);
                        // Start playing immediately when video loads
                        e.target.play().catch((error) => {
                            console.log('Video autoplay failed:', error);
                            // Try again after a short delay if autoplay fails
                            setTimeout(() => {
                                e.target.play().catch(console.error);
                            }, 100);
                        });
                    }
                }
                />
            ) : ( <
                img src = {
                    product?.coverImage ||
                    product?.image ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt = { product?.productTitle || product?.name || "Product" }
                className = "w-full h-full object-cover" /
                >
            )
        }

        {/** Loading Spinner - Show when loading iframe */ } {
            videoLoading && ( <
                div className = "absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-25" >
                <
                div className = "flex flex-col items-center" >
                <
                div className = "animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-2" > < /div> <
                p className = "text-white text-xs" > Loading... < /p> < /
                div > <
                /div>
            )
        }

        {/** Click-through overlay to ensure navigation */ } {
            (getYouTubeWatchUrl(product.youtubeLink) || product.videoFile) && ( <
                a href = { getYouTubeWatchUrl(product.youtubeLink) || product.videoFile }
                target = "_blank"
                rel = "noopener noreferrer"
                className = "absolute inset-0 z-20"
                aria-label = "Open video" /
                >
            )
        }

        {/** YouTube Video Title Overlay for Right Side Videos - No hover effect */ } {
            product.youtubeLink && ( <
                    div className = "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 sm:p-2 z-30" >
                    <
                    h4 className = "text-yellow-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider leading-tight"
                    style = {
                        {
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: "800",
                        }
                    } > { product.productTitle || product.name || "YouTube Video" } <
                    /h4> {
                    product.artistName && ( <
                        p className = "text-gray-300 text-[8px] sm:text-[10px] font-medium mt-0.5" > { product.artistName } <
                        /p>
                    )
                } <
                /div>
        )
    } <
    /div> < /
motion.div >
);
};

if (isLoading) {
    return ( <
        div className = "w-full py-1 sm:py-4" >
        <
        motion.div className = "mb-3 sm:mb-6 px-2 sm:px-0"
        initial = {
            { opacity: 0, y: -20 }
        }
        animate = {
            { opacity: 1, y: 0 }
        }
        transition = {
            { duration: 0.8, ease: "easeOut" }
        } >
        <
        h2 className = { `text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest mb-1 sm:mb-4 ${
              title === "MUSIC VIDEOS PRODUCTION" || title === "FILM ASSOCIATIONS" || title === "ADVERTISING" 
                ? "text-yellow-400 font-bold" 
                : "text-white"
            }` }
        style = {
            {
                fontFamily: "Montserrat, sans-serif",
                fontWeight: title === "MUSIC VIDEOS PRODUCTION" || title === "FILM ASSOCIATIONS" || title === "ADVERTISING" ? "900" : "800",
            }
        } > { title } <
        /h2> < /
        motion.div >

        <
        div className = "w-full flex items-center justify-center rounded-lg shadow-2xl border border-black mx-0.5 sm:mx-0 p-4 sm:p-8" >
        <
        div className = "text-white text-center" >
        <
        div className = "animate-spin rounded-full h-6 w-6 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-2 sm:mb-4" > < /div> <
        p className = "text-sm sm:text-lg" > Loading { title }
        products... < /p> < /
        div > <
        /div> < /
        div >
    );
}

if (categoryProducts.length === 0) {
    return ( <
        div className = "w-full py-1 sm:py-4" > {/** Category Title */ } <
        motion.div className = "mb-3 sm:mb-6 px-2 sm:px-0"
        initial = {
            { opacity: 0, y: -20 }
        }
        animate = {
            { opacity: 1, y: 0 }
        }
        transition = {
            { duration: 0.8, ease: "easeOut" }
        } >
        <
        h2 className = { `text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest mb-1 sm:mb-4 ${
              title === "MUSIC VIDEOS PRODUCTION" || title === "FILM ASSOCIATIONS" || title === "ADVERTISING" 
                ? "text-yellow-400 font-bold" 
                : "text-white"
            }` }
        style = {
            {
                fontFamily: "Montserrat, sans-serif",
                fontWeight: title === "MUSIC VIDEOS PRODUCTION" || title === "FILM ASSOCIATIONS" || title === "ADVERTISING" ? "900" : "800",
            }
        } > { title } <
        /h2> < /
        motion.div >

        <
        div className = "w-full flex items-center justify-center rounded-lg shadow-2xl border border-black mx-0.5 sm:mx-0 p-4 sm:p-8"
        style = {
            {
                aspectRatio: isMobile ? "1/1.2" : "5/2",
                background: "rgba(0, 0, 0, 0.9)",
            }
        } >
        <
        p className = "text-white text-xs sm:text-lg"
        style = {
            { fontFamily: "Montserrat, sans-serif", fontWeight: "800" }
        } >
        No { title }
        products available <
        /p> < /
        div > <
        /div>
    );
}

// Helper function to get width class for commercial items
const getCommercialWidth = (count) => {
    if (count <= 6) {
        return `w-1/${count}`;
    }
    return 'w-1/6';
};

// Dynamic layout logic based on number of products
const totalProducts = categoryProducts.length;
let leftProducts = [];
let rightProducts = [];
let layoutType = '';
let itemWidthClass = '';

// Special handling for Music and Film categories - 1 video on left, scrolling on right
if (category === 'Music' || category === 'Film') {
    if (totalProducts >= 1) {
        // 1 video on left side with hover controls, rest scrolling on right
        leftProducts = categoryProducts.slice(0, 1);
        rightProducts = categoryProducts.slice(1);
        layoutType = 'video-hover-layout';
    }
}
// Special handling for Commercial category
else if (category === 'Commercial') {
    if (totalProducts === 2) {
        // 2 commercial items: both on left side with heading and description on right
        leftProducts = categoryProducts;
        rightProducts = [];
        layoutType = 'commercial-2-items';
    } else {
        // Other commercial item counts: show all in a row
        leftProducts = categoryProducts;
        rightProducts = [];
        layoutType = 'commercial-row';
        itemWidthClass = getCommercialWidth(leftProducts.length);
    }
} else if (totalProducts === 1) {
    // 1 item: show it centered
    leftProducts = categoryProducts.slice(0, 1);
    rightProducts = [];
    layoutType = '1-item';
} else if (totalProducts === 2) {
    // 2 items: 1 on left, 1 on right
    leftProducts = categoryProducts.slice(0, 1);
    rightProducts = categoryProducts.slice(1);
    layoutType = '2-items';
} else if (totalProducts === 3) {
    // 3 items: all 3 in a row
    leftProducts = categoryProducts.slice(0, 3);
    rightProducts = [];
    layoutType = '3-items-row';
} else if (totalProducts === 4) {
    // 4 items: 2 on left, 2 on right
    leftProducts = categoryProducts.slice(0, 2);
    rightProducts = categoryProducts.slice(2);
    layoutType = '4-items';
} else {
    // 5+ items: 2 on left, scrolling right with video content
    leftProducts = categoryProducts.slice(0, 2);
    rightProducts = categoryProducts
        .slice(2)
        .filter((p) => !!p.youtubeLink || !!p.videoFile);
    layoutType = '5-plus-items';
}

return ( <
    div className = "w-full py-1 sm:py-4 lg:px-5" > {/** Category Title with View All Button */ } <
    motion.div className = "mb-3 sm:mb-6 flex justify-between items-center px-2 sm:px-0"
    initial = {
        { opacity: 0, y: -20 }
    }
    animate = {
        { opacity: 1, y: 0 }
    }
    transition = {
        { duration: 0.8, ease: "easeOut" }
    } >
    <
    h2 className = { `text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest mb-1 sm:mb-4 ${
            title === "MUSIC VIDEOS PRODUCTION" || title === "FILM ASSOCIATIONS" || title === "ADVERTISING" 
              ? "text-yellow-400 font-bold" 
              : "text-white"
          }` }
    style = {
        {
            fontFamily: "Montserrat, sans-serif",
            fontWeight: title === "MUSIC VIDEOS PRODUCTION" || title === "FILM ASSOCIATIONS" || title === "ADVERTISING" ? "900" : "800",
        }
    } > { isMobile && title === "MUSIC VIDEOS PRODUCTION" ? "MUSIC PRODUCTION" : title } <
    /h2> {/** Show View All button
    for all sections on mobile */} <
    button onClick = {
        () => {
            window.scrollTo(0, 0);
            navigate("/Photo");
        }
    }
    className = { `text-white hover:text-gray-300 transition-colors duration-300 group ${
            isMobile ? '' : 'hidden sm:block'
          }` }
    style = {
        {
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
        }
    } >
    <
    span className = "text-xs sm:text-sm uppercase tracking-wider border-b border-transparent group-hover:border-white transition-all duration-300" >
    VIEW ALL <
    /span> < /
    button > <
    /motion.div>

    {/** Main Content */ } <
    div className = "w-full overflow-hidden relative mx-0"
    style = {
        {
            aspectRatio: isMobile ? "16/16" : "5/2",
            background: "rgba(0, 0, 0, 0.9)",
            margin: 0,
            padding: 0,
            border: 'none',
            borderRadius: 0
        }
    } > {/** Desktop Layout */ } {
        !isMobile ? ( <
                div className = "flex h-full"
                style = {
                    { margin: 0, padding: 0, gap: 0 }
                } > {/** Dynamic Left Side */ } <
                div className = {
                    [
                        'h-full flex',
                        layoutType === '3-items-row' ? 'w-full' :
                        layoutType === '2-items' ? 'w-full' :
                        layoutType === '1-item' ? 'w-full' :
                        layoutType === 'commercial-row' ? 'w-full' :
                        layoutType === 'commercial-2-items' ? 'w-1/2' :
                        layoutType === 'video-hover-layout' ? 'w-1/2' : 'w-1/2'
                    ].join(' ')
                }
                style = {
                    { margin: 0, padding: 0, border: 'none' }
                } > {
                    leftProducts.map((product, index) => {
                        const itemWidth = layoutType === '3-items-row' ? 'w-1/3' :
                            layoutType === '2-items' ? 'w-1/2' :
                            layoutType === '1-item' ? 'w-full' :
                            layoutType === 'commercial-row' ? itemWidthClass :
                            layoutType === 'commercial-2-items' ? 'w-1/2' :
                            layoutType === 'video-hover-layout' ? 'w-full' : 'w-1/2';

                        return ( <
                            div key = { `left-${index}` }
                            className = {
                                ['h-full', itemWidth].join(' ')
                            }
                            style = {
                                { margin: 0, padding: 0 }
                            } > {
                                layoutType === 'video-hover-layout' ? ( <
                                    HoverVideoCard key = { `hover-video-${product.id || product.productTitle || index}` }
                                    product = { product }
                                    className = "w-full h-full" /
                                    >
                                ) : ( <
                                    motion.div initial = {
                                        { opacity: 0, scale: 1.05 }
                                    }
                                    animate = {
                                        { opacity: 1, scale: 1 }
                                    }
                                    transition = {
                                        { duration: 0.6, delay: index * 0.1 }
                                    }
                                    className = "w-full h-full"
                                    style = {
                                        { margin: 0, padding: 0 }
                                    } >
                                    <
                                    ProductCard product = { product }
                                    className = "w-full h-full"
                                    showTitle = { true }
                                    isVertical = { true }
                                    /> < /
                                    motion.div >
                                )
                            } <
                            /div>
                        );
                    })
                } <
                /div>

                {/** Dynamic Right Side */ } {
                    layoutType !== '1-item' && layoutType !== '2-items' && layoutType !== '3-items-row' && layoutType !== 'commercial-row' && layoutType !== 'commercial-2-items' && ( <
                        div className = "w-1/2 h-full overflow-hidden flex flex-col"
                        style = {
                            { margin: 0, padding: 0, gap: 0 }
                        } > {
                            layoutType === '5-plus-items' || layoutType === 'video-hover-layout' ? (
                                // Scrolling layout for 5+ items
                                rightProducts.length > 0 ? ( <
                                    motion.div className = "flex flex-col gap-0"
                                    animate = {
                                        {
                                            y: ["0%", "-50%"], // Same as mobile pattern - simple infinite loop
                                        }
                                    }
                                    transition = {
                                        {
                                            duration: 15, // Same duration for all sections (Music, Film, Commercial) to ensure synchronized scroll speed
                                            ease: "linear", // Same as mobile - simple linear easing
                                            repeat: Infinity,
                                            repeatType: "loop",
                                        }
                                    } > {
                                        rightProducts
                                        .concat(rightProducts)
                                        .map((product, index) => ( <
                                            div key = { `scroll-${index}` }
                                            className = "flex-shrink-0 mb-0" >
                                            <
                                            ProductVideoCard product = { product }
                                            className = "w-full"
                                            isYouTubeThumbnail = { true }
                                            /> < /
                                            div >
                                        ))
                                    } <
                                    /motion.div>
                                ) : ( <
                                    div className = "w-full h-full flex items-center justify-center"
                                    style = {
                                        {
                                            background: "rgba(0, 0, 0, 0.8)",
                                        }
                                    } >
                                    <
                                    p className = "text-yellow-400 text-lg sm:text-xl md:text-3xl text-center px-4"
                                    style = {
                                        {
                                            fontFamily: "Montserrat, sans-serif",
                                            fontWeight: "800",
                                        }
                                    }
                                    dangerouslySetInnerHTML = {
                                        {
                                            __html: `MORE ${title}<br />coming soon...`
                                        }
                                    }
                                    /> < /
                                    div >
                                )
                            ) : (
                                // Static layout for 3 and 4 items
                                <
                                div className = "h-full flex" > {
                                    rightProducts.map((product, index) => ( <
                                        div key = { `right-${index}` }
                                        className = { `h-full ${layoutType === '3-items' ? 'w-full' : 'w-1/2'}` } >
                                        <
                                        motion.div initial = {
                                            { opacity: 0, scale: 1.05 }
                                        }
                                        animate = {
                                            { opacity: 1, scale: 1 }
                                        }
                                        transition = {
                                            { duration: 0.6, delay: (leftProducts.length + index) * 0.1 }
                                        }
                                        className = "w-full h-full" >
                                        <
                                        ProductCard product = { product }
                                        className = "w-full h-full"
                                        showTitle = { true }
                                        isVertical = { true }
                                        /> < /
                                        motion.div > <
                                        /div>
                                    ))
                                } <
                                /div>
                            )
                        } <
                        /div>
                    )
                } {/** Commercial 2-Items Special Right Side */ } {
                    layoutType === 'commercial-2-items' && ( <
                        div className = "w-1/2 h-full overflow-hidden flex flex-col justify-center p-10 bg-black bg-opacity-80 relative" >

                        <
                        div className = "h-[calc(100%-2rem)] overflow-hidden relative" >
                        <
                        div className = "w-full h-full flex items-center justify-center"
                        style = {
                            {
                                background: "rgba(0, 0, 0, 0.7)",
                            }
                        } >
                        <
                        p className = "!text-yellow-400 text-lg sm:text-xl md:text-3xl text-center px-4 py-2"
                        style = {
                            {
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: "800",
                            }
                        }
                        dangerouslySetInnerHTML = {
                            {
                                __html: `MORE ${title}<br />coming soon...`
                            }
                        }
                        /> < /
                        div > <
                        /div> < /
                        div >
                    )
                } <
                /div>
            ) : (
                /* Mobile Layout - Enhanced for video-hover-layout and commercial-2-items */
                <
                div className = "flex flex-col h-full" > {
                    layoutType === 'video-hover-layout' ? (
                        /* Video-hover layout for Music and Film on mobile */
                        <
                        div className = "flex flex-col h-full py-2" > {/** Main Video Section */ } <
                        div className = "w-full flex-1 mb-8" >
                        <
                        HoverVideoCard key = { `mobile-hover-video-${leftProducts[0]?.id || leftProducts[0]?.productTitle || 'main'}` }
                        product = { leftProducts[0] }
                        className = "w-full h-full" /
                        >
                        <
                        /div>

                        {/** Video Details Below Video */ } {
                            leftProducts[0]?.youtubeLink && ( <
                                    div className = "w-full px-2 pb-1 flex justify-center" >
                                    <
                                    div className = "text-center" >
                                    <
                                    h3 className = "text-yellow-400 text-sm font-bold uppercase tracking-wider leading-tight mb-0.5"
                                    style = {
                                        {
                                            fontFamily: "Montserrat, sans-serif",
                                            fontWeight: "800",
                                        }
                                    } > {
                                        ((leftProducts[0].productTitle || leftProducts[0].name || "YouTube Video").split(' ')[0]) || "VIDEO"
                                    } <
                                    /h3> {
                                    leftProducts[0].artistName && ( <
                                        p className = "text-gray-300 text-[9px] font-medium" > { leftProducts[0].artistName } <
                                        /p>
                                    )
                                } <
                                /div> < /
                            div >
                        )
                    }

                    {/** View More Text */ } <
                    div className = "w-full px-4 pb-2 flex justify-center" >
                    <
                    span className = "text-white text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors duration-300 underline"
                    onClick = {
                        () => {
                            window.scrollTo(0, 0);
                            navigate("/Photo");
                        }
                    }
                    style = {
                        {
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: "600",
                        }
                    } >

                    <
                    /span> < /
                    div > <
                    /div>
                ): layoutType === 'commercial-2-items' ? (
                    /* Commercial 2-items layout for mobile */
                    <
                    div className = "flex flex-col h-full" > {/** Two Commercial Items */ } <
                    div className = "w-full flex-1 flex" > {
                        leftProducts.map((product, index) => ( <
                            div key = { `mobile-commercial-${index}` }
                            className = "w-1/2 h-full" >
                            <
                            ProductCard product = { product }
                            className = "w-full h-full"
                            showTitle = { false }
                            isVertical = { true }
                            /> < /
                            div >
                        ))
                    } <
                    /div>

                    {/** More Advertising Section with View All Button */ } <
                    div className = "w-full flex flex-col items-center justify-center py-4 bg-black bg-opacity-70" >
                    <
                    div className = "text-center mb-3" >
                    <
                    p className = "text-yellow-400 text-xs font-medium"
                    style = {
                        {
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: "500",
                        }
                    } >
                    MORE ADVERTISING < br / > coming soon... <
                    /p> < /
                    div >

                    {/** View All Button for Advertising */ } <
                    button onClick = {
                        () => {
                            window.scrollTo(0, 0);
                            navigate("/Photo");
                        }
                    }
                    className = "text-white hover:text-gray-300 transition-colors duration-300 group px-3 py-1 border border-white border-opacity-30 hover:border-opacity-100 rounded"
                    style = {
                        {
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: "600",
                        }
                    } >
                    <
                    span className = "text-xs uppercase tracking-wider" >
                    VIEW ALL <
                    /span> < /
                    button > <
                    /div> < /
                    div >
                ) : (
                    /* Original mobile layout for other categories */
                    <
                    >
                    {/** Upper Part - 2 Photos */ } <
                    div className = "w-full h-1/2 flex" > {
                        categoryProducts.slice(0, 2).map((product, index) => ( <
                            div key = { `mobile-upper-${index}` }
                            className = "w-1/2 h-full" >
                            <
                            ProductCard product = { product }
                            className = "w-full h-full"
                            showTitle = { false }
                            isVertical = { true }
                            /> < /
                            div >
                        ))
                    } <
                    /div>

                    {/** Lower Part - Smooth Infinite Loop */ } <
                    div className = "w-full h-2/3 overflow-hidden flex flex-col p-1 gap-1" > {
                        categoryProducts.length > 2 ? ( <
                            motion.div animate = {
                                { y: ["0%", "-50%"] }
                            }
                            transition = {
                                {
                                    duration: 12,
                                    ease: "linear",
                                    repeat: Infinity,
                                    repeatType: "loop",
                                }
                            }
                            className = "flex flex-col" > {
                                categoryProducts
                                .slice(2)
                                .concat(categoryProducts.slice(2))
                                .map((product, index) => ( <
                                    div key = { `mobile-loop-${index}` }
                                    className = "flex-shrink-0" >
                                    <
                                    ProductVideoCard product = { product }
                                    className = "w-full"
                                    isYouTubeThumbnail = { true }
                                    showTitle = { false }
                                    /> < /
                                    div >
                                ))
                            } <
                            /motion.div>
                        ) : ( <
                            div className = "w-full h-full flex items-center justify-center rounded"
                            style = {
                                {
                                    background: "rgba(0, 0, 0, 0.7)",
                                }
                            } >
                            <
                            p className = "text-yellow-400 text-xs text-center px-3 py-2"
                            style = {
                                {
                                    fontFamily: "Montserrat, sans-serif",
                                    fontWeight: "500",
                                }
                            } >
                            More { title }
                            coming soon... <
                            /p> < /
                            div >
                        )
                    } <
                    /div> < / >
                )
            } <
            /div>
    )
}

{/** Progress Indicator */ } <
div className = "absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-2" > {
        categoryProducts.slice(0, Math.max(0, (layoutType === '1-item' ? 1 : layoutType === '2-items' ? 2 : layoutType === '3-items' ? 3 : layoutType === '4-items' ? 4 : layoutType === 'commercial-row' ? Math.min(categoryProducts.length, 6) : layoutType === 'commercial-2-items' ? 2 : 2) - (isMobile ? 2 : 0))).map((_, index) => ( <
            motion.div key = { index }
            className = "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white opacity-70"
            whileHover = {
                { scale: 1.3, opacity: 1 }
            }
            />
        ))
    } <
    /div> < /
div > <
    /div>
);
};

const VerticalSplitShowcase = () => {
    const [isMobile, setIsMobile] = useState(() => {
        // Initialize with proper mobile detection on first render
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            return isMobileDevice || width < 768;
        }
        return false;
    });

    // Check if device is mobile with enhanced detection
    useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isMobileWidth = width < 768;

            // Use both user agent and width for better detection
            const shouldBeMobile = isMobileDevice || isMobileWidth;
            setIsMobile(shouldBeMobile);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        window.addEventListener("orientationchange", () => {
            setTimeout(checkMobile, 100); // Delay to ensure proper width calculation
        });

        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("orientationchange", checkMobile);
        };
    }, []);

    return ( <
        div className = "w-full min-h-screen relative overflow-hidden bg-black py-0 pt-6 md:pt-8 lg:pt-12" > {/** Desktop Main Title */ } {
            !isMobile && ( <
                motion.div className = "relative z-20 text-center pt-8 pb-12"
                initial = {
                    { opacity: 0, y: -50 }
                }
                animate = {
                    { opacity: 1, y: 0 }
                }
                transition = {
                    { duration: 1.5, ease: "easeOut" }
                } >
                <
                h1 className = "text-4xl sm:text-5xl md:text-6xl lg:text-4xl text-white mb-0"
                style = {
                    {
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: "400",
                        letterSpacing: "0.1em",
                    }
                } >
                <
                /h1> < /
                motion.div >
            )
        }

        {/** Content Container */ } <
        div className = "relative z-10 px-6 sm:px-2 pb-0 sm:pb-6 space-y-0 sm:space-y-16" > {/** Music Section */ } <
        div className = "w-full mobile-section-tight" >
        <
        CategoryShowcase category = "Music"
        title = "MUSIC VIDEOS PRODUCTION" / >
        <
        /div>

        {/** Film Section */ } <
        div className = "w-full mobile-section-tight" >
        <
        CategoryShowcase category = "Film"
        title = "FILM ASSOCIATIONS" / >
        <
        /div>

        {/** Commercial Section */ } <
        div className = "w-full mobile-last-section" >
        <
        CategoryShowcase category = "Commercial"
        title = "ADVERTISING" / >
        <
        /div> < /
        div > <
        /div>
    );
};

export default VerticalSplitShowcase;
