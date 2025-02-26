import { useState } from "react";
import { createShop } from "../../api/shop";
import useDusthStore from "../../Global Store/DusthStore";
import { toast } from "react-toastify";
import UploadFile from "../../components/store/UploadFIle";
import { 
  Loader, 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Image, 
  FileText, 
  Tag, 
  Building, 
  Save,
  Map,
  Calendar
} from "lucide-react";

const CreateShop = () => {
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
  const userToken = useDusthStore((state) => state.token);

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
        setIsSubmitting(false);
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

      const newShop = await createShop(shopData, userToken);
      toast.success("สร้างร้านค้าสำเร็จ!");
      console.log("New Shop:", newShop);
      // อาจเพิ่ม redirect ไปยังหน้าร้านค้าที่สร้างเสร็จแล้ว
    } catch (error) {
      console.error("Error creating shop:", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการสร้างร้านค้า");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shopTypes = [
    { value: "ที่กิน", label: "ที่กิน", icon: <Store size={18} /> },
    { value: "ที่เที่ยว", label: "ที่เที่ยว", icon: <Map size={18} /> },
    { value: "ที่ทำบุญ", label: "ที่ทำบุญ", icon: <Building size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-[#212329] to-[#2c303b] px-8 py-6 text-white">
            <div className="flex items-center space-x-2">
              <Store className="w-7 h-7" />
              <h2 className="text-2xl font-bold">สร้างร้านค้าของคุณ</h2>
            </div>
            <p className="mt-2 text-gray-200 max-w-2xl">
              กรอกข้อมูลเพื่อสร้างร้านค้าใหม่ การเพิ่มข้อมูลที่ครบถ้วนจะช่วยให้ลูกค้าค้นพบร้านของคุณได้ง่ายขึ้น
            </p>
          </div>

          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ข้อมูลพื้นฐาน */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#212329]" />
                  <h3 className="text-lg font-semibold text-[#212329]">
                    ข้อมูลพื้นฐาน
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="py-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Store className="w-4 h-4 mr-2 text-[#212329]" />
                      ชื่อร้านค้า
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="ชื่อร้าน"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="py-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 mr-2 text-[#212329]" />
                      ประเภทร้านค้า
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        className="w-full appearance-none px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                      >
                        <option value="">เลือกประเภทร้านค้า</option>
                        {shopTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      {shopTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleChange({ target: { name: 'type', value: type.value } })}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                            form.type === type.value
                              ? 'bg-[#212329] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="py-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 mr-2 text-[#212329]" />
                      รายละเอียดร้านค้า
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="อธิบายเกี่ยวกับร้านของคุณ สินค้า บริการ หรือจุดเด่นต่างๆ"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ข้อมูลการติดต่อ */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-[#212329]" />
                  <h3 className="text-lg font-semibold text-[#212329]">
                    ข้อมูลการติดต่อ
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="py-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2 text-[#212329]" />
                      อีเมล
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="py-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 mr-2 text-[#212329]" />
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="0812345678"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="py-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-[#212329]" />
                      ที่อยู่
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder="ที่อยู่ร้านค้า"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ที่ตั้งและเวลาทำการ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#212329]" />
                  <h3 className="text-lg font-semibold text-[#212329]">
                    ที่ตั้งร้านค้า
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-[#212329]" />
                        ละติจูด
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        required
                        placeholder="เช่น 13.736717"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-[#212329]" />
                        ลองจิจูด
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        required
                        placeholder="เช่น 100.523186"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#212329]" />
                  <h3 className="text-lg font-semibold text-[#212329]">
                    เวลาทำการ
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-[#212329]" />
                        เวลาเปิด
                      </label>
                      <input
                        type="time"
                        name="openTime"
                        value={form.openTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-[#212329]" />
                        เวลาปิด
                      </label>
                      <input
                        type="time"
                        name="closeTime"
                        value={form.closeTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#212329] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนอัพโหลดรูปภาพ */}
            <div className="mt-8 space-y-6">
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-[#212329]" />
                <h3 className="text-lg font-semibold text-[#212329]">
                  รูปภาพร้านค้า
                </h3>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <UploadFile form={form} setForm={setForm} />
              </div>
            </div>

            {/* ปุ่มบันทึก */}
            <div className="mt-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#212329] text-white py-4 px-6 rounded-lg shadow-md hover:bg-[#2c303b] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>กำลังสร้างร้านค้า...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>สร้างร้านค้า</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;