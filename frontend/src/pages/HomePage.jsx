import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ยินดีต้อนรับสู่ <span className="text-blue-600">ระบบตรวจวัดคุณภาพอากาศ</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              ติดตามค่าฝุ่น PM2.5 และคุณภาพอากาศในพื้นที่ของคุณแบบเรียลไทม์ เพื่อสุขภาพที่ดีของคุณและครอบครัว
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition duration-200"
              >
                เริ่มต้นใช้งาน
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-lg text-blue-600 bg-white hover:bg-blue-50 font-medium shadow-lg hover:shadow-xl transition duration-200"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;