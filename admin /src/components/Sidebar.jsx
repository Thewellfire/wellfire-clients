import { NavLink, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/add",
      icon: assets.add_icon,
      label: "Add Products",
      description: "Create new investment products",
    },
    {
      path: "/list",
      icon: assets.order_icon,
      label: "Manage Products",
      description: "View and edit existing products",
    },
  ];

  return (
    <div className="w-[240px] min-h-screen bg-black text-white shadow-lg relative border-r border-gray-800">
    

      {/* Navigation */}
      <div className="px-8 py-8 flex-1">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-6">
            Management
          </p>
        </div>

        <nav className="space-y-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-4 px-4 py-5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black shadow-md"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-black/20"
                      : "bg-gray-800 group-hover:bg-gray-700"
                  }`}
                >
                  <img
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? "filter brightness-0"
                        : "filter brightness-0 invert opacity-80 group-hover:opacity-100"
                    }`}
                    src={item.icon}
                    alt=""
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-base transition-colors duration-200 ${
                      isActive
                        ? "text-black"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

     
     
    </div>
  );
};

export default Sidebar;
