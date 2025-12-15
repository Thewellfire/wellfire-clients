import React, { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import axios from "axios";

const Timeline = () => {
  const [upcomingProjects, setUpcomingProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch upcoming projects from backend
  useEffect(() => {
    const fetchUpcomingProjects = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
        const response = await axios.get(`${backendUrl}/api/investment-product/list`);
        
        if (response.data.success && response.data.products) {
          // Filter for "Upcoming Projects" category
          const upcoming = response.data.products.filter(
            (product) => product.category === "Upcoming Projects"
          );
          setUpcomingProjects(upcoming);
        }
      } catch (error) {
        console.error("Error fetching upcoming projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingProjects();
  }, []);

  return (
    <div className="bg-black text-white py-6 px-6 md:px-8">
      {/* Section Heading */}
      <h1 className="text-2xl md:text-5xl font-bold text-center mb-6 tracking-wide">
        Our Timeline
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : upcomingProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No upcoming projects available</p>
        </div>
      ) : (
        /* Timeline Items */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-2 md:px-0">
          {upcomingProjects.slice(0, 3).map((project, index) => (
            <div key={project._id} className="flex flex-col items-center">
              {/* Product Photo */}
              <div className="mb-3 w-full max-w-sm mx-auto md:max-w-none">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={project.coverImage || project.image || "https://via.placeholder.com/256x256?text=Coming+Soon"}
                    alt={project.productTitle}
                    className="w-full h-56 sm:h-60 md:h-72 object-cover transition-transform duration-500 hover:scale-105 active:scale-105"
                  />
                </div>
              </div>

              {/* Title with numbering */}
              <h2 className="text-xl md:text-4xl font-bold mb-3 text-center">
                {index + 1}.{project.productTitle || 'Title'}
              </h2>

              {/* Subtitle */}
              <h3 className="text-sm md:text-lg font-semibold mb-2 text-gray-300 text-center">
                {project.artistName || 'Sub title here'}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-3 md:line-clamp-5 text-center">
                {project.description || "Lorem ipsum dolor sit amet consectetur. Tellus id sodales dictumst ac in scelerisque diam amet. Sed odio tristique neque morbi etiam lorem metus consequat tempus. A arcu et accumsan ac"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;