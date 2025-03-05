import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, Store, Home, Bookmark, Search, MapPin, Star, ShoppingBag, Shield } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getCurrentUserProfile } from "../../api/users";
import { getAllShops } from "../../api/shop";
import useDusthStore from "../../Global Store/DusthStore";

export default function MainNav() {
  const navigate = useNavigate();
  const logout = useDusthStore((state) => state.logout);
  const userToken = useDusthStore((state) => state.token);
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Real API fetch for search results
  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      // Using the actual API to get all shops
      const { shops } = await getAllShops();
      
      // Filter results based on search query
      const filteredResults = shops.filter(shop => 
        shop.name.toLowerCase().includes(query.toLowerCase()) ||
        (shop.description && shop.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      setSearchValue("");
      setShowResults(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim().length > 2) {
      fetchSearchResults(value);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectShop = (shopId) => {
    navigate(`/user/shop/${shopId}`);
    setSearchValue("");
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <nav className="bg-[#212329] text-white shadow-lg relative z-[1001]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-4 md:gap-8">
            <Link
              to="/user"
              className="text-2xl font-bold text-white hover:opacity-90 transition-transform duration-200 hover:scale-105 flex items-center"
            >
              <div className="relative overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 w-10 h-10 flex items-center justify-center">
                <img src="/LOGO.webp" alt="Logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-blue-300 opacity-20"></div>
              </div>
              <span className="ml-2 font-extrabold tracking-tight hidden sm:block">DUST WATCH</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {userToken ? (
                <>
                  <Link
                    to="/user"
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:text-blue-300 hover:bg-[#2c2e36] flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/user/bookmark"
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:text-blue-300 hover:bg-[#2c2e36] flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmark</span>
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          {/* Search Bar - Desktop - With Results Dropdown */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อร้านค้า..."
                  value={searchValue}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchValue.trim().length > 2) {
                      setShowResults(true);
                    }
                  }}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-10 pr-12 py-2 rounded-lg border ${
                    isSearchFocused 
                      ? 'border-transparent focus:outline-none focus:ring-2 focus:ring-[#212329]' 
                      : 'border-gray-600'
                  } bg-white text-[#212329] placeholder-gray-400`}
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 rounded-r-lg"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-[1003] max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-600">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#212329]"></div>
                      </div>
                      <p className="mt-2">กำลังค้นหา...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((shop) => (
                        <div 
                          key={shop.id}
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => handleSelectShop(shop.id)}
                        >
                          <div className="flex items-start">
                            <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                              {shop.images && shop.images.length > 0 ? (
                                <img 
                                  src={shop.images[0].secure_url} 
                                  alt={shop.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img 
                                  src="/api/placeholder/64/64" 
                                  alt={shop.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-[#212329]">{shop.name}</h4>
                                {shop.reviews && shop.reviews.length > 0 ? (
                                  <div className="flex items-center text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1 text-sm font-medium">
                                      {(shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length).toFixed(1)}
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-1 mt-1">{shop.description}</p>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="line-clamp-1">{shop.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchValue.trim().length > 2 ? (
                    <div className="p-4 text-center text-gray-600">
                      <p>ไม่พบร้านค้าที่ตรงกับ "{searchValue}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </form>
          </div>

          {/* User Profile Section - Desktop */}
          {profileData ? (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-[#2c2e36] group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 ring-2 ring-blue-400 ring-opacity-30">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
                      {profileData.name}
                    </span>
                    <span className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                      {profileData.email}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    } group-hover:text-gray-200`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#272a33] rounded-lg shadow-xl border border-gray-700 overflow-hidden z-[1002]">
                    <div className="py-1">
                      <NavLink
                        to="/user/create-shop"
                        className="group w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#31343f] transition-all duration-300"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:from-blue-600 group-hover:to-indigo-700 transition-colors duration-300 shadow-md">
                          <Store className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white group-hover:text-blue-300">
                            สร้างร้านค้า
                          </span>
                        </div>
                      </NavLink>

                      {/* Conditional rendering based on user role */}
                      {profileData.role === 'store' && (
                        <NavLink
                          to={`/shop`}
                          className="group w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#31343f] transition-all duration-300"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 group-hover:from-green-600 group-hover:to-emerald-700 transition-colors duration-300 shadow-md">
                            <ShoppingBag className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-white group-hover:text-green-300">
                              หน้าร้านค้า
                            </span>
                          </div>
                        </NavLink>
                      )}

                      {profileData.role === 'admin' && (
                        <NavLink
                          to="/admin"
                          className="group w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#31343f] transition-all duration-300"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 group-hover:from-purple-600 group-hover:to-indigo-700 transition-colors duration-300 shadow-md">
                          <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-white group-hover:text-purple-300">
                              หน้าแอดมิน
                            </span>
                          </div>
                        </NavLink>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-red-900/30 hover:text-red-300 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-900/50 transition-colors duration-300">
                          <LogOut className="w-4 h-4 text-red-300" />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg text-sm font-medium bg-[#2c2e36] text-blue-300 border border-blue-500/30"
                    : "px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#2c2e36] hover:text-blue-300 transition-all duration-200"
                }
              >
                Register
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-md"
                    : "px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all duration-200"
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
