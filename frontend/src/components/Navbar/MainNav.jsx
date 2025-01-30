import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserProfile } from "../../api/users";
import useDusthStore from "../../Global Store/DusthStore";

export default function MainNav() {
  const navigate = useNavigate();
  const logout = useDusthStore((state) => state.logout);
  const userToken = useDusthStore((state) => state.token);
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userToken) {
        setProfileData(null);
        return;
      }

      try {
        const data = await getCurrentUserProfile(userToken);
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        logout();
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [userToken, logout, navigate]);

  return (
    <nav className="bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link
              to="/user"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-transform duration-200 hover:scale-105"
            >
              LOGO
            </Link>
            {userToken ? (
              <>
                <Link
                  to="/user"
                  className="text-gray-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50"
                >
                  Home
                </Link>
              </>
            ) : null}
          </div>

          {/* User Profile Section */}
          {profileData ? (
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                      {profileData.name}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                      {profileData.email}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    } group-hover:text-gray-600`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <NavLink
                        to="/user/create-shop"
                        className="group w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-300">
                          <Store className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700 group-hover:text-blue-600">
                            สร้างร้านค้า
                          </span>
                        </div>
                      </NavLink>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600"
                    : "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              >
                Register
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-md"
                    : "px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                }
              >
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
