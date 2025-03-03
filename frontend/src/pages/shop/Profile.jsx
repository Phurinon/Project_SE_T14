import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";
import UploadFile from "../../components/store/UploadFIle";
import useDusthStore from "../../Global Store/DusthStore";
import { getMyShop } from "../../api/shop";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    phone: "",
    email: "",
    openTime: "",
    closeTime: "",
    latitude: "",
    longitude: "",
    type: "",
    images: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userToken = useDusthStore((state) => state.token);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setIsLoading(true);
      const data = await getMyShop(userToken);
      
      // Populate form with existing data
      setForm({
        name: data.name || "",
        address: data.address || "",
        description: data.description || "",
        phone: data.phone || "",
        email: data.email || "",
        openTime: data.openTime || "",
        closeTime: data.closeTime || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        type: data.type || "",
        images: data.images || [],
      });
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลร้านค้าได้");
      console.error("Error fetching shop data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (form.images.length === 0) {
        toast.error("กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป");
        return;
      }

      const shopData = {
        ...form,
        images: form.images.map((img) => ({
          asset_id: img.asset_id,
          public_id: img.public_id,
          url: img.url,
          secure_url: img.secure_url,
        })),
      };

      // Replace with your actual update API call
      await fetch("/api/shop/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(shopData),
      });

      toast.success("อัพเดทข้อมูลร้านค้าสำเร็จ!");
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shopTypes = [
    { value: "ที่กิน", label: "ที่กิน" },
    { value: "ที่เที่ยว", label: "ที่เที่ยว" },
    { value: "ที่ทำบุญ", label: "ที่ทำบุญ" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-center text-3xl font-extrabold text-blue-600 mb-8">
            แก้ไขข้อมูลร้านค้า
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ข้อมูลพื้นฐาน */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  ข้อมูลพื้นฐาน
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อร้านค้า
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภทร้านค้า
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">เลือกประเภทร้านค้า</option>
                    {shopTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดร้านค้า
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* ข้อมูลการติดต่อ */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  ข้อมูลการติดต่อ
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ที่อยู่
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* ที่ตั้งและเวลาทำการ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  ที่ตั้งร้านค้า
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ละติจูด
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ลองจิจูด
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  เวลาทำการ
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เวลาเปิด
                    </label>
                    <input
                      type="time"
                      name="openTime"
                      value={form.openTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เวลาปิด
                    </label>
                    <input
                      type="time"
                      name="closeTime"
                      value={form.closeTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนอัพโหลดรูปภาพ */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                รูปภาพร้านค้า
              </h3>
              <UploadFile form={form} setForm={setForm} />
            </div>

            {/* ปุ่มบันทึก */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "กำลังอัพเดทข้อมูล..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;