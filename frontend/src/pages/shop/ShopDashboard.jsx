import { useState } from 'react';
import { Store, TrendingUp, Users, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

const DashboardCard = ({ title, value, icon: Icon}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>
      <Icon className="h-8 w-8 text-blue-500" />
    </div>
  </div>
);

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.number,
};

const ShopDashboard = () => {
  const [recentActivities] = useState([
    { id: 1, action: 'มีการรีวิวใหม่', time: '5 นาทีที่แล้ว' },
    { id: 2, action: 'อัพเดทรูปภาพร้านค้า', time: '2 ชั่วโมงที่แล้ว' },
    { id: 3, action: 'แก้ไขข้อมูลร้านค้า', time: '1 วันที่แล้ว' },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard 
          title="ยอดเข้าชมร้านค้า" 
          value="2,451" 
          icon={Store}
          trend={12.5}
        />
        <DashboardCard 
          title="รีวิวใหม่" 
          value="28" 
          icon={TrendingUp}
          trend={-5.2}
        />
        <DashboardCard 
          title="ผู้ติดตาม" 
          value="1,205" 
          icon={Users}
          trend={8.1}
        />
        <DashboardCard 
          title="เรตติ้งเฉลี่ย" 
          value="4.8" 
          icon={TrendingUp}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">กิจกรรมล่าสุด</h2>
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div key={activity.id} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;