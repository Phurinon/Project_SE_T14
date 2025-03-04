import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, LogIn, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import { getAirPollutionData } from '../api/air';

const HomePage = () => {
  const [pm25Data, setPm25Data] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to determine air quality category and color
  const getAirQualityInfo = (pm25) => {
    if (pm25 <= 25) return { 
      category: "คุณภาพอากาศดี", 
      color: "bg-[#00d2ff] text-white",
      ringColor: "ring-green-500",
      gradient: "from-green-500/20 to-green-500/5",
      emoji: "😊"
    };
    if (pm25 <= 50) return { 
      category: "ปานกลาง", 
      color: "bg-[#7bc96c] text-white",
      ringColor: "ring-yellow-500",
      gradient: "from-yellow-500/20 to-yellow-500/5",
      emoji: "🙂"
    };
    if (pm25 <= 100) return { 
      category: "เริ่มมีผลกระทบต่อสุขภาพ", 
      color: "bg-[#ffd700] text-white",
      ringColor: "ring-orange-500",
      gradient: "from-orange-500/20 to-orange-500/5",
      emoji: "😐"
    };
    if (pm25 <= 200) return { 
      category: "มีผลกระทบต่อสุขภาพ", 
      color: "bg-[#ff8c00] text-white",
      ringColor: "ring-red-500",
      gradient: "from-red-500/20 to-red-500/5",
      emoji: "😷"
    };
    if (pm25 <= 999) return { 
      category: "อันตราย", 
      color: "bg-[#ff0000] text-white",
      ringColor: "ring-purple-500",
      gradient: "from-purple-500/20 to-purple-500/5",
      emoji: "🤢"
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user's current location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Fetch reverse geocoding to get province name
              const geocodeResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=th`
              );
              const geocodeData = await geocodeResponse.json();
              setLocation(geocodeData.principalSubdivision); // Province/state name
              
              // Fetch air pollution data
              const airData = await getAirPollutionData(latitude, longitude);
              setPm25Data(airData.pm25);
              setLoading(false);
            } catch (err) {
              console.error("Error:", err);
              setError("ไม่สามารถดึงข้อมูลคุณภาพอากาศได้");
              setLoading(false);
            }
          },
          (err) => {
            console.error("Geolocation error:", err);
            setError("ไม่สามารถระบุตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get air quality info if pm25Data is available
  const airQualityInfo = pm25Data ? getAirQualityInfo(pm25Data) : null;
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 bg-[#212329] min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute opacity-5 top-10 right-10 animate-pulse">
          <Cloud size={220} color="#ffffff" />
        </div>
        <div className="absolute opacity-5 bottom-10 left-10">
          <Cloud size={180} color="#ffffff" />
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-[#212329] opacity-80"></div>
        
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ยินดีต้อนรับสู่ <span className="text-blue-400">ระบบตรวจวัดคุณภาพอากาศ</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
              ติดตามค่าฝุ่น PM2.5 และคุณภาพอากาศในพื้นที่ของคุณแบบเรียลไทม์ เพื่อสุขภาพที่ดีของคุณและครอบครัว
            </p>
            
            {/* Feature card - PM2.5 value - Beautified */}
            <div className="flex justify-center mb-12">
              {loading ? (
                <div className="bg-[#2a2d36]/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center w-80 h-80">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-10"></div>
                    <div className="bg-blue-500 bg-opacity-20 p-6 rounded-full mb-6 relative z-10">
                      <Loader size={36} className="text-blue-400 animate-spin" />
                    </div>
                  </div>
                  <div className="text-gray-300 font-medium text-lg">กำลังโหลดข้อมูล...</div>
                </div>
              ) : error ? (
                <div className="bg-[#2a2d36]/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center w-80 h-80">
                  <div className="bg-red-500 bg-opacity-20 p-6 rounded-full mb-6">
                    <AlertCircle size={36} className="text-red-400" />
                  </div>
                  <div className="text-gray-300 font-medium text-lg mb-2">เกิดข้อผิดพลาด</div>
                  <div className="text-gray-400 text-sm text-center">{error}</div>
                </div>
              ) : (
                <div className={`bg-gradient-br ${airQualityInfo.gradient} backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-black/30 flex flex-col items-center justify-center w-80 h-80 border border-[#3a3d46] transition-all duration-500`}>
                  <div className="text-gray-200 text-sm font-medium mb-3 bg-[#212329]/70 px-4 py-1 rounded-full">
                    {location || "พื้นที่ของคุณ"}
                  </div>
                  
                  <div className="relative mb-4">
                    {/* Animated rings */}
                    <div className={`absolute inset-0 rounded-full animate-ping ${airQualityInfo.color} opacity-10`}></div>
                    <div className={`absolute inset-0 rounded-full ${airQualityInfo.color} opacity-5 scale-125`}></div>
                    
                    {/* Main circle */}
                    <div className={`ring-4 ${airQualityInfo.ringColor} ring-opacity-30 bg-[#212329] p-6 rounded-full flex items-center justify-center relative z-10`}>
                      <span className="text-5xl">{airQualityInfo.emoji}</span>
                    </div>
                  </div>
                  
                  <div className="text-white text-4xl font-bold mb-2">
                    {pm25Data.toFixed(1)}
                  </div>
                  
                  <div className="text-gray-300 text-sm mb-4">
                    <span className="opacity-80">หน่วย:</span> μg/m³
                  </div>
                  
                  <div className={`${airQualityInfo.color} font-medium text-lg px-4 py-1 rounded-full bg-[#212329]/70`}>
                    {airQualityInfo.category}
                  </div>
                  
                  <div className="text-gray-400 text-sm mt-4">
                    อัพเดทล่าสุด: {new Date().toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center mt-8">
              <Link
                to="/register"
                className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-500 font-medium shadow-lg hover:shadow-xl transition duration-200 flex items-center gap-2"
              >
                เริ่มต้นใช้งาน <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-lg text-blue-400 bg-[#2a2d36] hover:bg-[#30343f] font-medium shadow-lg hover:shadow-xl transition duration-200 flex items-center gap-2"
              >
                <LogIn size={18} /> เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#212329]"></div>
      </section>
    </>
  );
};

export default HomePage;