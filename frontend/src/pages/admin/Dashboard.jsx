import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Store, Wind, MapPin } from 'lucide-react';
import axios from 'axios';
import useDusthStore from "../../Global Store/DusthStore";
import { getAllShops } from "../../api/shop";
import { getAllUsers } from "../../api/admin";
import { getAirPollutionData } from "../../api/air";
import { getAllSafetyLevels } from "../../api/safetyLevels";

const StatCard = ({ title, value, icon: Icon, description, location }) => (
  <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-row items-center justify-between p-4 border-b">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="p-4">
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {location && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      )}
      {description && (
        <div className="text-sm text-gray-600 mt-2 font-medium">{description}</div>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [pmData, setPmData] = useState([]);
  const [stats, setStats] = useState({
    currentPM: '0',
    userCount: '0',
    shopCount: '0'
  });
  const [location, setLocation] = useState(null);
  const [province, setProvince] = useState('กำลังโหลด...');
  const [loading, setLoading] = useState(true);
  const userToken = useDusthStore((state) => state.token);
  const [safetyLevels, setSafetyLevels] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setLocation(loc);
          
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lon}&format=json`
            );
            const provinceData = response.data.address.province || 
                               response.data.address.state || 
                               'เชียงใหม่';
            setProvince(provinceData);
          } catch (error) {
            console.error("Error getting location name:", error);
            setProvince('ไม่สามารถระบุตำแหน่งได้');
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation({
            lat: 13.7563,
            lon: 100.5018
          });
          setProvince('เชียงใหม่');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchDashboardData();
    }
  }, [location, userToken]);

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

  const fetchAirPollutionData = async () => {
    try {
      const response = await getAirPollutionData(location.lat, location.lon);
      return response.pm25;
    } catch (error) {
      console.error('Error fetching air pollution data:', error);
      return 0;
    }
  };

  const generateHistoricalData = (currentValue) => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const variance = Math.random() * 5 - 2.5;
      const value = Math.max(0, currentValue + variance);
      
      data.push({
        date: date.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short'
        }),
        value: parseFloat(value.toFixed(1))
      });
    }
    
    return data;
  };

  const fetchDashboardData = async () => {
    try {
      const [users, shops, currentPM] = await Promise.all([
        getAllUsers(userToken),
        getAllShops(),
        fetchAirPollutionData()
      ]);

      const historicalData = generateHistoricalData(currentPM);
      setPmData(historicalData);
      
      setStats({
        currentPM: `${currentPM.toFixed(1)} µg/m³`,
        userCount: users.length.toLocaleString(),
        shopCount: shops.shops.length.toLocaleString()
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPmLevel = (value, safetyLevels) => {
    const sortedLevels = [...safetyLevels].sort((a, b) => a.maxValue - b.maxValue);
    const level = sortedLevels.find(level => value <= level.maxValue);
    return level ? level.label : sortedLevels[sortedLevels.length - 1].label;
  };

  const getPmColor = (value, safetyLevels) => {
    const sortedLevels = [...safetyLevels].sort((a, b) => a.maxValue - b.maxValue);
    const level = sortedLevels.find(level => value <= level.maxValue);
    return level ? level.color : sortedLevels[sortedLevels.length - 1].color;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard 
          title="ค่า PM2.5"
          value={stats.currentPM}
          icon={Wind}
          location={province}
          description={getPmLevel(parseFloat(stats.currentPM), safetyLevels)}
        />
        <StatCard 
          title="ผู้ใช้งาน"
          value={stats.userCount}
          icon={Users}
          description="ผู้ใช้งานทั้งหมดในระบบ"
        />
        <StatCard 
          title="ร้านค้า"
          value={stats.shopCount}
          icon={Store}
          description="ร้านค้าที่ลงทะเบียน"
        />
      </div>

      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <div className="text-xl font-semibold text-gray-800">ค่าฝุ่นย้อนหลัง 7 วัน</div>
          <div className="text-sm text-gray-600 mt-1">{province}</div>
        </div>
        <div className="p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  label={{ 
                    value: 'PM2.5 (µg/m³)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12, fill: '#6B7280' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value} µg/m³`, 'PM2.5']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getPmColor(parseFloat(stats.currentPM), safetyLevels)}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;