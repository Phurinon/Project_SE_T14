import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
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
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAllShops } from "../../api/shop";
import { getAirPollutionData } from "../../api/air";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const SEARCH_RADIUS = 2;
const FILTER_TYPES = [
  {
    id: "all",
    label: "ทั้งหมด",
    icon: LayoutGrid,
    color: "bg-amber-400 border-amber-500",
    hoverColor: "hover:bg-amber-500",
    activeTextColor: "text-amber-900",
  },
  {
    id: "ที่กิน",
    label: "ที่กิน",
    icon: UtensilsCrossed,
    color: "bg-rose-400 border-rose-500",
    hoverColor: "hover:bg-rose-500",
    activeTextColor: "text-rose-900",
  },
  {
    id: "ที่เที่ยว",
    label: "ที่เที่ยว",
    icon: Mountain,
    color: "bg-blue-400 border-blue-500",
    hoverColor: "hover:bg-blue-500",
    activeTextColor: "text-blue-900",
  },
  {
    id: "ที่ทำบุญ",
    label: "ที่ทำบุญ",
    icon: Church,
    color: "bg-purple-400 border-purple-500",
    hoverColor: "hover:bg-purple-500",
    activeTextColor: "text-purple-900",
  },
];

const getPM25Color = (value) => {
  if (value <= 25) return "#10B981";
  if (value <= 37) return "#FBBF24";
  if (value <= 50) return "#F97316";
  if (value <= 90) return "#EF4444";
  return "#7F1D1D";
};

const getPM25Level = (value) => {
  if (value <= 25) return "คุณภาพอากาศดี";
  if (value <= 37) return "คุณภาพอากาศปานกลาง";
  if (value <= 50) return "เริ่มมีผลต่อสุขภาพ";
  if (value <= 90) return "มีผลต่อสุขภาพ";
  return "อันตราย";
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

const ShopPopup = ({ shop }) => {
  const isOpen = () => {
    const now = new Date();
    const currentTime = now.getHours() + ":" + now.getMinutes();
    return currentTime >= shop.openTime && currentTime <= shop.closeTime;
  };

  return (
    <div className="p-2">
      <h3 className="text-lg font-bold mb-1">{shop.name}</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="w-4 h-4"
            style={{ color: getPM25Color(shop.pm25) }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: getPM25Color(shop.pm25) }}
          >
            PM2.5: {shop.pm25} µg/m³
          </span>
        </div>
        <div className="text-sm text-gray-600">{getPM25Level(shop.pm25)}</div>
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
        </div>
      </div>
    </div>
  );
};

export default function HomeUser() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const allShops = await getAllShops();
        const shopsWithPM25 = await Promise.all(
          allShops.map(async (shop) => {
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
        
        console.log('Shops with PM2.5:', shopsWithPM25);
        setShops(shopsWithPM25);

        if (currentLocation) {
          const nearby = shopsWithPM25.filter(
            (shop) =>
              calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                shop.latitude,
                shop.longitude
              ) <= SEARCH_RADIUS
          );
          setNearbyShops(nearby);
        }
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

  const filteredShops = nearbyShops.filter((shop) =>
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
          {FILTER_TYPES.map((type) => (
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

        <Circle
          center={[currentLocation.lat, currentLocation.lng]}
          radius={SEARCH_RADIUS * 1000}
          pathOptions={{
            color: "blue",
            fillColor: "#a0c4ff",
            fillOpacity: 0.2,
            weight: 1,
          }}
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
                         style="background-color: ${getPM25Color(shop.pm25)}">
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
              <ShopPopup shop={shop} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
