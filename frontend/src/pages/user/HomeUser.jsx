import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  Navigation,
  Info,
  AlertTriangle,
  UtensilsCrossed,
  Mountain,
  Church,
  LayoutGrid,
  Bookmark,
  Map as MapIcon,
  FilterIcon,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAllShops } from "../../api/shop";
import { getAirPollutionData } from "../../api/air";
import { getAllSafetyLevels } from "../../api/safetyLevels";
import {
  createBookmark,
  removeBookmark,
  checkBookmarkStatus,
} from "../../api/bookmark";

// Custom dark mode map style
const mapStyle = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

// Component สำหรับแสดงตัวอธิบายระดับคุณภาพอากาศ (Legend) และใช้เป็นตัวกรอง
const SafetyLevelLegend = ({ safetyLevels, activeSafetyFilter, setActiveSafetyFilter }) => {
  // ตรวจสอบว่ามี safetyLevels หรือไม่
  if (!safetyLevels || safetyLevels.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-[999] bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      <div className="text-white text-sm font-medium p-3 bg-gray-800/60 border-b border-gray-700 flex justify-between items-center">
        <span>ระดับคุณภาพอากาศ (PM2.5)</span>
      </div>
      <div className="p-2">
        {safetyLevels.map((level) => (
          <div 
            key={level.id} 
            onClick={() => setActiveSafetyFilter(level.id === activeSafetyFilter ? null : level.id)}
            className={`flex items-center gap-3 p-2 mb-1 rounded-md hover:bg-gray-800/60 transition-colors cursor-pointer
                      ${activeSafetyFilter === level.id ? 'bg-gray-800 ring-1 ring-gray-600' : ''}`}
          >
            <div 
              className="w-5 h-5 rounded-full flex-shrink-0" 
              style={{ 
                backgroundColor: level.color, 
                boxShadow: `0 0 5px ${level.color}`,
                border: "2px solid rgba(255, 255, 255, 0.3)"
              }}
            ></div>
            <span className={`text-sm ${activeSafetyFilter === level.id ? 'text-white font-medium' : 'text-gray-200'}`}>
              {level.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FilterButton = ({ type, isActive, onClick }) => {
  const Icon = type.icon;
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-full transition-all duration-200
        flex items-center gap-2 shadow-lg
        ${
          isActive
            ? `${type.color} ${type.activeTextColor} scale-105`
            : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/90 border-gray-700"
        }
        ${type.hoverColor}
        hover:shadow-xl
        active:scale-95
        backdrop-blur-sm
      `}
    >
      <Icon
        className={`w-5 h-5 ${
          isActive ? type.activeTextColor : "text-gray-300"
        }`}
      />
      <span className="font-medium text-sm">{type.label}</span>
    </button>
  );
};

const getPM25Color = (value, safetyLevels) => {
  const sortedLevels = [...safetyLevels].sort(
    (a, b) => a.maxValue - b.maxValue
  );
  const level = sortedLevels.find((level) => value <= level.maxValue);
  return level ? level.color : sortedLevels[sortedLevels.length - 1].color;
};

const getPM25Level = (value, safetyLevels) => {
  const sortedLevels = [...safetyLevels].sort(
    (a, b) => a.maxValue - b.maxValue
  );
  const level = sortedLevels.find((level) => value <= level.maxValue);
  return level ? level.label : sortedLevels[sortedLevels.length - 1].label;
};

const getLevelIdForValue = (value, levels) => {
  if (!levels || levels.length === 0) return null;
  const level = levels.find(level => 
    value >= (level.minValue || 0) && value <= (level.maxValue || Number.MAX_SAFE_INTEGER)
  );
  return level ? level.id : null;
};

const createMarkerIcon = (color, value, size = 40, isFiltered = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${isFiltered ? 'animate-pulse scale-110' : ''}">
          <div class="flex items-center justify-center" 
               style="
                 width: ${size}px; 
                 height: ${size}px; 
                 border-radius: 50%; 
                 background-color: ${color}; 
                 box-shadow: 0 0 ${isFiltered ? '20px' : '15px'} ${color}; 
                 border: ${isFiltered ? '4px' : '3px'} solid rgba(${isFiltered ? '255, 255, 255' : '200, 200, 200'}, ${isFiltered ? '0.8' : '0.5'}); 
                 color: white; 
                 font-size: 0.875rem; 
                 font-weight: bold;
                 text-align: center;
                 line-height: ${size}px;">
            ${value}
          </div>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const ShopPopup = ({ shop, safetyLevels }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCategory, setBookmarkCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dropdownRef = useRef(null);
  const editDropdownRef = useRef(null);

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const { isBookmarked, category } = await checkBookmarkStatus(shop.id);
        setIsBookmarked(isBookmarked);
        setBookmarkCategory(category);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };
    checkBookmark();
  }, [shop.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (editDropdownRef.current && !editDropdownRef.current.contains(event.target)) {
        setShowEditDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOpen = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const [openHours, openMinutes] = shop.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = shop.closeTime.split(':').map(Number);
    
    // กรณีร้านเปิดข้ามคืน (เช่น 17:00 - 00:00)
    if (closeHours < openHours) {
      // เช็คว่าอยู่ในช่วงเวลาหลังเวลาเปิดหรือก่อนเวลาปิด
      return (currentHours > openHours) || 
             (currentHours === openHours && currentMinutes >= openMinutes) || 
             (currentHours < closeHours) || 
             (currentHours === closeHours && currentMinutes <= closeMinutes);
    }
    
    // กรณีปกติ
    const currentTime = currentHours * 60 + currentMinutes;
    const openTime = openHours * 60 + openMinutes;
    const closeTime = closeHours * 60 + closeMinutes;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const handleBookmark = async (category) => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        // If editing the bookmark category
        if (category !== null) {
          // Remove the existing bookmark first
          await removeBookmark(shop.id);
          // Then create a new bookmark with the new category
          await createBookmark(shop.id, category);
          setBookmarkCategory(category);
        } else {
          // If category is null, it means we're removing the bookmark
          await removeBookmark(shop.id);
          setIsBookmarked(false);
          setBookmarkCategory(null);
        }
      } else {
        // Creating a new bookmark
        await createBookmark(shop.id, category);
        setIsBookmarked(true);
        setBookmarkCategory(category);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
      setShowEditDropdown(false);
    }
  };

  const bookmarkCategories = [
    { id: "favorite", label: "รายการโปรด", color: "text-yellow-400" },
    { id: "wantToGo", label: "อยากไป", color: "text-blue-400" },
    { id: "visited", label: "เคยไปมาแล้ว", color: "text-green-400" },
    { id: "share", label: "อยากแชร์", color: "text-purple-400" },
  ];

  const getCategoryLabel = () => {
    const category = bookmarkCategories.find((c) => c.id === bookmarkCategory);
    return category ? category.label : "";
  };

  const getCategoryColor = () => {
    const category = bookmarkCategories.find((c) => c.id === bookmarkCategory);
    return category ? category.color : "text-gray-200";
  };

  const pm25Color = getPM25Color(shop.pm25, safetyLevels);

  const nextImage = () => {
    if (shop.images && shop.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === shop.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (shop.images && shop.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? shop.images.length - 1 : prevIndex - 1
      );
    }
  };

  const hasImages = shop.images && shop.images.length > 0;

  const handleBookmarkClick = () => {
    if (isBookmarked) {
      // Show edit dropdown when already bookmarked
      setShowEditDropdown(!showEditDropdown);
    } else {
      // Show create dropdown when not bookmarked
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="p-3 bg-gray-900 text-gray-100 rounded-lg shadow-lg border border-gray-700 mx-auto max-w-[315px] min-w-[18rem]">
      <h3 className="text-lg font-bold mb-2 text-white">{shop.name}</h3>
      
      {/* Image Gallery */}
      {hasImages ? (
        <div className="relative mb-3">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
            <img 
              src={shop.images[currentImageIndex].secure_url} 
              alt={`${shop.name} - รูปที่ ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/60"></div>
          </div>
          
          {shop.images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {shop.images.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`ดูรูปที่ ${index + 1}`}
                  ></button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gray-800/60 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5" style={{ color: pm25Color }} />
          <div className="flex flex-col">
            <span className="text-sm font-medium" style={{ color: pm25Color }}>
              PM2.5: {shop.pm25} µg/m³
            </span>
            <div className="text-xs text-gray-400">
              {getPM25Level(shop.pm25, safetyLevels)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-800/60 p-2 rounded-lg">
          <span className="text-sm text-gray-300">
            {shop.openTime} - {shop.closeTime} น.
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              isOpen()
                ? "bg-green-900/60 text-green-300"
                : "bg-red-900/60 text-red-300"
            }`}
          >
            {isOpen() ? "เปิดอยู่" : "ปิดแล้ว"}
          </span>
        </div>

        <div className="flex gap-2 mt-4 items-center justify-between">
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`,
                "_blank"
              )
            }
            className="flex items-center text-nowrap gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
          >
            <Navigation className="w-4 h-4" />
            <span>นำทาง</span>
          </button>
          <button
            onClick={() => window.open(`/user/shop/${shop.id}`, "_blank")}
            className="flex items-center text-nowrap gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors shadow-lg"
          >
            <Info className="w-4 h-4" />
            <span>ดูข้อมูล</span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBookmarkClick}
              disabled={isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors shadow-lg ${
                isBookmarked
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""} ${isBookmarked ? getCategoryColor() : ""}`}
              />
              <span className={` ${isBookmarked ? getCategoryColor() : ""}`}>
                {isBookmarked ? getCategoryLabel() : "บันทึก"}
              </span>
            </button>

            {/* Dropdown for creating new bookmark */}
            {showDropdown && !isBookmarked && (
              <div className="absolute right-0 mt-1 py-1 w-40 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                {bookmarkCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleBookmark(category.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${category.color}`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}

            {/* Dropdown for editing existing bookmark */}
            {showEditDropdown && isBookmarked && (
              <div className="absolute right-0 mt-1 py-1 w-40 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50" ref={editDropdownRef}>
                <div className="px-3 py-1 font-medium text-sm border-b border-gray-700 text-gray-400">
                  เปลี่ยนหมวดหมู่
                </div>
                {bookmarkCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleBookmark(category.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${category.color} ${
                      category.id === bookmarkCategory ? 'bg-gray-700' : ''
                    }`}
                  >
                    {category.label}
                    {category.id === bookmarkCategory && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-700 mt-1">
                  <button
                    onClick={() => handleBookmark(null)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 text-red-400"
                  >
                    ลบออกจากบุ๊คมาร์ค
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomeUser() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const [shopTypes, setShopTypes] = useState([
    {
      id: "all",
      label: "ทั้งหมด",
      icon: LayoutGrid,
      color: "bg-blue-600 border-blue-700",
      hoverColor: "hover:bg-blue-500",
      activeTextColor: "text-white",
    },
  ]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSafetyFilter, setActiveSafetyFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [safetyLevels, setSafetyLevels] = useState([]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "ที่กิน":
        return UtensilsCrossed;
      case "ที่เที่ยว":
        return Mountain;
      case "ที่ทำบุญ":
        return Church;
      default:
        return LayoutGrid;
    }
  };

  const getTypeColors = (type) => {
    switch (type) {
      case "ที่กิน":
        return {
          color: "bg-rose-600 border-rose-700",
          hoverColor: "hover:bg-rose-500",
          activeTextColor: "text-white",
        };
      case "ที่เที่ยว":
        return {
          color: "bg-emerald-600 border-emerald-700",
          hoverColor: "hover:bg-emerald-500",
          activeTextColor: "text-white",
        };
      case "ที่ทำบุญ":
        return {
          color: "bg-purple-600 border-purple-700",
          hoverColor: "hover:bg-purple-500",
          activeTextColor: "text-white",
        };
      default:
        return {
          color: "bg-blue-600 border-blue-700",
          hoverColor: "hover:bg-blue-500",
          activeTextColor: "text-white",
        };
    }
  };

  useEffect(() => {
    const fetchSafetyLevels = async () => {
      try {
        let levels = await getAllSafetyLevels();
        
        // เรียงลำดับตามค่าน้อยไปมาก (บนสมมติฐานว่าแต่ละ level มี maxValue อยู่แล้ว)
        levels = levels.sort((a, b) => a.maxValue - b.maxValue);
        
        // กำหนดค่า minValue สำหรับแต่ละระดับ
        const updatedLevels = levels.map((level, index) => {
          if (index === 0) {
            // ระดับแรก (ค่าต่ำสุด) ไม่มี minValue หรือกำหนดเป็น 0
            return { ...level, minValue: 0 };
          } else {
            // ระดับอื่นๆ ใช้ค่า maxValue ของระดับก่อนหน้า + 0.1 เป็น minValue
            return { ...level, minValue: levels[index - 1].maxValue + 0.1 };
          }
        });
        
        setSafetyLevels(updatedLevels);
      } catch (error) {
        console.error("Error fetching safety levels:", error);
      }
    };
    fetchSafetyLevels();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("ไม่สามารถระบุตำแหน่งของคุณได้");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await getAllShops();
        const shopsWithPM25 = await Promise.all(
          response.shops.map(async (shop) => {
            try {
              const pollutionData = await getAirPollutionData(
                shop.latitude,
                shop.longitude
              );
              return { ...shop, pm25: pollutionData.pm25 || 0 };
            } catch (error) {
              console.error(`Error fetching PM2.5 for shop ${shop.id}:`, error);
              return { ...shop, pm25: 0 };
            }
          })
        );

        setShops(shopsWithPM25);

        const requiredTypes = ["ที่กิน", "ที่เที่ยว", "ที่ทำบุญ"];
        
        const typeButtons = requiredTypes.map((type) => ({
          id: type,
          label: type,
          icon: getTypeIcon(type),
          ...getTypeColors(type),
        }));

        setShopTypes((prev) => [prev[0], ...typeButtons]);
      } catch (error) {
        console.error("Error fetching shops:", error);
        setError("ไม่สามารถดึงข้อมูลร้านค้าได้");
      }
    };

    if (currentLocation) {
      fetchShops();
    }
  }, [currentLocation]);

  // ฟังก์ชั่นสำหรับตรวจสอบว่า shop เข้าเงื่อนไขของ safety level หรือไม่
  const meetsAirQualityCriteria = (shop) => {
    if (!activeSafetyFilter) return true;
    
    const selectedLevel = safetyLevels.find(level => level.id === activeSafetyFilter);
    if (!selectedLevel) return true;
    
    // ตรวจสอบว่าค่า PM2.5 ของร้านนี้อยู่ในช่วงของเกณฑ์คุณภาพอากาศที่เลือกหรือไม่
    if (selectedLevel.minValue !== undefined && selectedLevel.maxValue !== undefined) {
      return shop.pm25 >= selectedLevel.minValue && shop.pm25 <= selectedLevel.maxValue;
    }
    
    // กรณีที่มีแค่ maxValue (สำหรับระดับแรก)
    if (selectedLevel.maxValue !== undefined && selectedLevel.minValue === undefined) {
      return shop.pm25 <= selectedLevel.maxValue;
    }
    
    // กรณีที่มีแค่ minValue (สำหรับระดับสุดท้าย)
    if (selectedLevel.minValue !== undefined && selectedLevel.maxValue === undefined) {
      return shop.pm25 >= selectedLevel.minValue;
    }
    
    return true;
  };

  // ปรับปรุงฟังก์ชั่นกรองร้านค้าให้ใช้ทั้งประเภทร้านและเกณฑ์คุณภาพอากาศ
  const filteredShops = shops.filter(shop => 
    (activeFilter === "all" || shop.type === activeFilter) && 
    meetsAirQualityCriteria(shop)
  );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-medium">กำลังโหลดแผนที่...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-red-400">
        <AlertTriangle className="w-16 h-16 mb-4" />
        <div className="text-xl font-medium">{error}</div>
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-amber-400">
        <MapIcon className="w-16 h-16 mb-4" />
        <div className="text-xl font-medium">
          กรุณาเปิดการใช้งานตำแหน่งที่ตั้ง
        </div>
      </div>
    );
  }

  const currentLocationIcon = L.divIcon({
    className: "current-location-marker",
    html: `
      <div class="w-12 h-12 flex items-center justify-center">
        <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-xl animate-pulse"></div>
        <div class="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  const mapContainerStyle = {
    backgroundColor: "#212329",
    border: "none",
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      <SafetyLevelLegend 
        safetyLevels={safetyLevels} 
        activeSafetyFilter={activeSafetyFilter} 
        setActiveSafetyFilter={setActiveSafetyFilter} 
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[999] p-2 bg-gray-900/40 backdrop-blur-md rounded-full">
        <div className="flex gap-2 overflow-x-auto px-1 py-1 scrollbar-hide">
          {shopTypes.map((type) => (
            <FilterButton
              key={type.id}
              type={type}
              isActive={activeFilter === type.id}
              onClick={() => setActiveFilter(type.id)}
            />
          ))}
        </div>
      </div>

      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={14}
        className="w-full h-full rounded-lg shadow-lg"
        style={mapContainerStyle}
        zoomControl={false}
      >
        <MapUpdater center={[currentLocation.lat, currentLocation.lng]} />
        <TileLayer url={mapStyle.light} attribution={mapStyle.attribution} />

        <Marker
          position={[currentLocation.lat, currentLocation.lng]}
          icon={currentLocationIcon}
        >
          <Popup className="dark-popup">
            <div className="p-2 bg-gray-900 text-white rounded-lg text-center">
              <p className="font-semibold">ตำแหน่งของคุณ</p>
            </div>
          </Popup>
        </Marker>

        {/* Shop markers */}
        {filteredShops.map((shop) => {
          const levelId = getLevelIdForValue(shop.pm25, safetyLevels);
          const isHighlighted = activeSafetyFilter === levelId;
          
          return (
            <Marker
              key={shop.id}
              position={[shop.latitude, shop.longitude]}
              icon={createMarkerIcon(
                getPM25Color(shop.pm25, safetyLevels),
                shop.pm25,
                isHighlighted ? 50 : 40,
                isHighlighted
              )}
              eventHandlers={{
                click: () => setSelectedShop(shop),
              }}
            >
              <Popup className="dark-popup" minWidth={300}>
                <ShopPopup shop={shop} safetyLevels={safetyLevels} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Custom CSS for dark mode popups and animations */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background-color: transparent !important;
          box-shadow: none !important;
        }

        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}