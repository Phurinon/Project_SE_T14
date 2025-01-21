import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import axios from "axios";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        const shopId = localStorage.getItem('shopId');
        const token = localStorage.getItem('token');
        
        const { data } = await axios.get(`/api/shops/${shopId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setFormData({
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
        });
      } catch (err) {
        alert('ไม่สามารถโหลดข้อมูลร้านค้าได้');
        console.error('Error:', err);
      }
    };

    fetchShopProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shopId = localStorage.getItem('shopId');
      const token = localStorage.getItem('token');

      await axios.put(`/api/shops/${shopId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert('บันทึกข้อมูลสำเร็จ');
    } catch (err) {
      // ตรวจสอบรายละเอียด error อย่างละเอียด
      let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้';
      
      if (err.response) {
        // กรณีได้รับ response กลับมาจาก server (status code ไม่ใช่ 2xx)
        errorMessage += `: ${err.response.data?.message || err.response.statusText}`;
        console.error('Response error:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        // กรณีส่ง request ไปแล้วไม่ได้รับ response กลับมา
        errorMessage += ': ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        console.error('Request error:', err.request);
      } else {
        // กรณีเกิด error ก่อนส่ง request
        errorMessage += `: ${err.message}`;
        console.error('Error:', err.message);
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">จัดการข้อมูลร้านค้า</h1>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-10">
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                src="/OIP.jpg"
                alt="Shop profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              <button 
                type="button"
                className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 translate-y-1/2 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              >
                <Upload className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อร้านค้า
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบายร้านค้า
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ที่อยู่
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;