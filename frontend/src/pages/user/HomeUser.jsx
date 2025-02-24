import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import {
  Navigation,
  Info,
  AlertTriangle,
  UtensilsCrossed,
  Mountain,
  Church,
  LayoutGrid,
  Bookmark
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAllShops } from "../../api/shop";
import { getAirPollutionData } from "../../api/air";
import { getAllSafetyLevels } from "../../api/safetyLevels";
import { createBookmark, removeBookmark, checkBookmarkStatus } from "../../api/bookmark";

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const FilterButton = ({ type, isActive, onClick }) => {
  const Icon = type.icon;
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-full border-2 font-medium transition-all duration-200
        flex items-center gap-2
        ${
          isActive
            ? `${type.color} ${type.activeTextColor} shadow-lg scale-105`
            : "bg-white/90 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-white"
        }
        ${type.hoverColor}
        hover:shadow-lg
        active:scale-95
        backdrop-blur-sm
      `}
    >
      <Icon
        className={`w-5 h-5 ${
          isActive ? type.activeTextColor : "text-gray-500"
        }`}
      />
      <span className="font-kanit text-sm">{type.label}</span>
    </button>
  );
};

const getPM25Color = (value, safetyLevels) => {
  const sortedLevels = [...safetyLevels].sort((a, b) => a.maxValue - b.maxValue);
  const level = sortedLevels.find(level => value <= level.maxValue);
  return level ? level.color : sortedLevels[sortedLevels.length - 1].color;
};

const getPM25Level = (value, safetyLevels) => {
  const sortedLevels = [...safetyLevels].sort((a, b) => a.maxValue - b.maxValue);
  const level = sortedLevels.find(level => value <= level.maxValue);
  return level ? level.label : sortedLevels[sortedLevels.length - 1].label;
};

const ShopPopup = ({ shop, safetyLevels }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCategory, setBookmarkCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOpen = () => {
    const now = new Date();
    const currentTime = now.getHours() + ":" + now.getMinutes();
    return currentTime >= shop.openTime && currentTime <= shop.closeTime;
  };

  const handleBookmark = async (category) => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(shop.id);
        setIsBookmarked(false);
        setBookmarkCategory(null);
      } else {
        await createBookmark(shop.id, category);
        setIsBookmarked(true);
        setBookmarkCategory(category);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const bookmarkCategories = [
    { id: "favorite", label: "รายการโปรด", color: "text-yellow-500" },
    { id: "wantToGo", label: "อยากไป", color: "text-blue-500" },
    { id: "visited", label: "เคยไปมาแล้ว", color: "text-green-500" },
    { id: "share", label: "อยากแชร์", color: "text-purple-500" },
  ];

  const getCategoryLabel = () => {
    const category = bookmarkCategories.find(c => c.id === bookmarkCategory);
    return category ? category.label : "";
  };

  return (
    <div className="p-2">
      <h3 className="text-lg font-bold mb-1">{shop.name}</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="w-4 h-4"
            style={{ color: getPM25Color(shop.pm25, safetyLevels) }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: getPM25Color(shop.pm25, safetyLevels) }}
          >
            PM2.5: {shop.pm25} µg/m³
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {getPM25Level(shop.pm25, safetyLevels)}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-sm">
            {shop.openTime} - {shop.closeTime} น.
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              isOpen()
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isOpen() ? "เปิดอยู่" : "ปิดแล้ว"}
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`,
                "_blank"
              )
            }
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>นำทาง</span>
          </button>
          <button
            onClick={() => window.open(`/user/shop/${shop.id}`, "_blank")}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>ดูข้อมูล</span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => isBookmarked ? handleBookmark(null) : setShowDropdown(!showDropdown)}
              disabled={isLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              <span>{isBookmarked ? getCategoryLabel() : "บันทึก"}</span>
            </button>
            
            {showDropdown && !isBookmarked && (
              <div className="absolute right-0 mt-1 py-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {bookmarkCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleBookmark(category.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${category.color}`}
                  >
                    {category.label}
                  </button>
                ))}
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
      color: "bg-amber-400 border-amber-500",
      hoverColor: "hover:bg-amber-500",
      activeTextColor: "text-amber-900",
    }
  ]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [safetyLevels, setSafetyLevels] = useState([]);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'ที่กิน': return UtensilsCrossed;
      case 'ที่เที่ยว': return Mountain;
      case 'ที่ทำบุญ': return Church;
      default: return LayoutGrid;
    }
  };

  const getTypeColors = (type) => {
    switch(type) {
      case 'ที่กิน':
        return {
          color: "bg-rose-400 border-rose-500",
          hoverColor: "hover:bg-rose-500",
          activeTextColor: "text-rose-900",
        };
      case 'ที่เที่ยว':
        return {
          color: "bg-blue-400 border-blue-500",
          hoverColor: "hover:bg-blue-500",
          activeTextColor: "text-blue-900",
        };
      case 'ที่ทำบุญ':
        return {
          color: "bg-purple-400 border-purple-500",
          hoverColor: "hover:bg-purple-500",
          activeTextColor: "text-purple-900",
        };
      default:
        return {
          color: "bg-amber-400 border-amber-500",
          hoverColor: "hover:bg-amber-500",
          activeTextColor: "text-amber-900",
        };
    }
  };

  useEffect(() => {
    const fetchSafetyLevels = async () => {
      try {
        const levels = await getAllSafetyLevels();
        setSafetyLevels(levels);
      } catch (error) {
        console.error("Error fetching safety levels:", error);
      }
    };
    fetchSafetyLevels();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
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
        { enableHighAccuracy: true }
      );
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
  
        // กำหนด types ที่ต้องการแสดง
        const allowedTypes = ['ที่กิน', 'ที่เที่ยว', 'ที่ทำบุญ'];
        
        // Filter เฉพาะ types ที่ต้องการ
        const filteredTypes = response.types.filter(type => allowedTypes.includes(type));
  
        // สร้าง filter types จาก filtered types
        const apiTypes = filteredTypes.map(type => ({
          id: type,
          label: type,
          icon: getTypeIcon(type),
          ...getTypeColors(type)
        }));
  
        // รวม all filter กับ filtered types
        setShopTypes(prev => [...prev, ...apiTypes]);
        
      } catch (error) {
        console.error("Error fetching shops:", error);
        setError("ไม่สามารถดึงข้อมูลร้านค้าได้");
      }
    };
  
    if (currentLocation) {
      fetchShops();
    }
  }, [currentLocation]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        กำลังโหลด...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        กรุณาเปิดการใช้งานตำแหน่งที่ตั้ง
      </div>
    );
  }

  const filteredShops = shops.filter((shop) =>
    activeFilter === "all" ? true : shop.type === activeFilter
  );

  const currentLocationIcon = L.divIcon({
    className: "current-location-marker",
    html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
  });

  return (
    <div className="relative w-full h-full">
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] p-1.5">
        <div className="flex gap-2">
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
        className="w-full h-full rounded-lg shadow-lg border-2 border-gray-300"
        style={{ zIndex: 1 }}
      >
        <MapUpdater center={[currentLocation.lat, currentLocation.lng]} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker
          position={[currentLocation.lat, currentLocation.lng]}
          icon={currentLocationIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold">ตำแหน่งของคุณ</p>
            </div>
          </Popup>
        </Marker>

        {filteredShops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={L.divIcon({
              className: "pm25-marker",
              html: `
                <div class="relative">
                  <div class="absolute -translate-x-1/2 -translate-y-1/2">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-bold" 
                         style="background-color: ${getPM25Color(shop.pm25, safetyLevels)}">
                      ${shop.pm25}
                    </div>
                  </div>
                </div>
              `,
            })}
            eventHandlers={{
              click: () => setSelectedShop(shop),
            }}
          >
            <Popup>
              <ShopPopup shop={shop} safetyLevels={safetyLevels} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}