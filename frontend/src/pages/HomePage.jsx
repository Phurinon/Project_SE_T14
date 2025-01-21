import PropTypes from "prop-types";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Navigation, Info, AlertTriangle, UtensilsCrossed, Mountain, Church, LayoutGrid } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const SHOPS = [
  {
    id: 1,
    name: "ร้านอาหารเหนือ บ้านไม้",
    type: "ที่กิน",
    distance: 0.3,
    lat: 18.7855,
    lng: 98.9876,
    rating: 4.5,
    openTime: "10:00",
    closeTime: "22:00",
    pm25: 45,
  },
  {
    id: 2,
    name: "คาเฟ่ริมน้ำ",
    type: "ที่เที่ยว",
    distance: 0.7,
    lat: 18.7899,
    lng: 98.9833,
    rating: 4.2,
    openTime: "08:00",
    closeTime: "20:00",
    pm25: 28,
  },
  {
    id: 3,
    name: "ครัวคุณแม่",
    type: "ที่ทำบุญ",
    distance: 0.5,
    lat: 18.7861,
    lng: 98.9842,
    rating: 4.8,
    openTime: "11:00",
    closeTime: "21:00",
    pm25: 65,
  },
];

const CURRENT_LOCATION = { lat: 18.7883, lng: 98.9853 };
const SEARCH_RADIUS = 3 * 1000; // 3 km in meters

const FILTER_TYPES = [
  { 
    id: 'all', 
    label: 'ทั้งหมด', 
    icon: LayoutGrid,
    color: 'bg-amber-400 border-amber-500',
    hoverColor: 'hover:bg-amber-500',
    activeTextColor: 'text-amber-900',
  },
  { 
    id: 'ที่กิน', 
    label: 'ที่กิน', 
    icon: UtensilsCrossed,
    color: 'bg-rose-400 border-rose-500',
    hoverColor: 'hover:bg-rose-500',
    activeTextColor: 'text-rose-900',
  },
  { 
    id: 'ที่เที่ยว', 
    label: 'ที่เที่ยว', 
    icon: Mountain,
    color: 'bg-blue-400 border-blue-500',
    hoverColor: 'hover:bg-blue-500',
    activeTextColor: 'text-blue-900',
  },
  { 
    id: 'ที่ทำบุญ', 
    label: 'ที่ทำบุญ', 
    icon: Church,
    color: 'bg-purple-400 border-purple-500',
    hoverColor: 'hover:bg-purple-500',
    activeTextColor: 'text-purple-900',
  },
];

const getPM25Color = (value) => {
  if (value <= 25) return "#10B981"; // ดี - เขียว
  if (value <= 37) return "#FBBF24"; // ปานกลาง - เหลือง
  if (value <= 50) return "#F97316"; // เริ่มมีผลต่อสุขภาพ - ส้ม
  if (value <= 90) return "#EF4444"; // มีผลต่อสุขภาพ - แดง
  return "#7F1D1D"; // อันตราย - แดงเข้ม
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
        ${isActive 
          ? `${type.color} ${type.activeTextColor} shadow-lg scale-105` 
          : 'bg-white/90 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-white'
        }
        ${type.hoverColor}
        hover:shadow-lg
        active:scale-95
        backdrop-blur-sm
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? type.activeTextColor : 'text-gray-500'}`} />
      <span className="font-kanit text-sm">{type.label}</span>
    </button>
  );
};

FilterButton.propTypes = {
  type: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    hoverColor: PropTypes.string.isRequired,
    activeTextColor: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
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
          <AlertTriangle className="w-4 h-4" style={{ color: getPM25Color(shop.pm25) }} />
          <span className="text-sm font-medium" style={{ color: getPM25Color(shop.pm25) }}>
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
                `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`,
                "_blank"
              )
            }
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>นำทาง</span>
          </button>
          <button
            onClick={() => window.open(`/shop/${shop.id}`, "_blank")}
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

ShopPopup.propTypes = {
  shop: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    distance: PropTypes.number.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    openTime: PropTypes.string.isRequired,
    closeTime: PropTypes.string.isRequired,
    pm25: PropTypes.number.isRequired,
  }).isRequired,
};

export default function HomePage() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredShops = SHOPS.filter(shop => 
    activeFilter === 'all' ? true : shop.type === activeFilter
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
        center={[CURRENT_LOCATION.lat, CURRENT_LOCATION.lng]}
        zoom={14}
        className="w-full h-full rounded-lg shadow-lg border-2 border-gray-300"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Circle
          center={[CURRENT_LOCATION.lat, CURRENT_LOCATION.lng]}
          radius={SEARCH_RADIUS}
          pathOptions={{
            color: "blue",
            fillColor: "#a0c4ff",
            fillOpacity: 0.2,
            weight: 1,
          }}
        />

        <Marker 
          position={[CURRENT_LOCATION.lat, CURRENT_LOCATION.lng]}
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
            position={[shop.lat, shop.lng]}
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
