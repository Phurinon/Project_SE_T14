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

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ทำไมต้องใช้บริการของเรา
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ข้อมูลแบบเรียลไทม์</h3>
              <p className="text-gray-600">ติดตามค่าฝุ่น PM2.5 และคุณภาพอากาศได้ตลอด 24 ชั่วโมง พร้อมการแจ้งเตือนทันทีเมื่อค่าเกินมาตรฐาน</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">รายงานวิเคราะห์</h3>
              <p className="text-gray-600">วิเคราะห์แนวโน้มคุณภาพอากาศในพื้นที่ของคุณ พร้อมคำแนะนำในการป้องกันตัวเองจากมลพิษ</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">แจ้งเตือนอัตโนมัติ</h3>
              <p className="text-gray-600">รับการแจ้งเตือนผ่านแอพและอีเมลเมื่อคุณภาพอากาศแย่ลง เพื่อให้คุณเตรียมพร้อมป้องกันตัวเองได้ทันที</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            พร้อมดูแลสุขภาพของคุณแล้วหรือยัง?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            สมัครใช้งานวันนี้ เพื่อติดตามคุณภาพอากาศในพื้นที่ของคุณ และรับการแจ้งเตือนที่สำคัญเพื่อสุขภาพที่ดีของคุณและครอบครัว
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 rounded-lg bg-white text-blue-600 hover:bg-blue-50 font-medium shadow-lg hover:shadow-xl transition duration-200"
          >
            สมัครใช้งานฟรี
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;