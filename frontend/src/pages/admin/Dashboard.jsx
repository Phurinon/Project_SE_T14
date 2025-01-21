import React from 'react';
import PropTypes from 'prop-types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Users, Store, Wind, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon}) => (
  <div className="border rounded-lg shadow-sm">
    <div className="flex flex-row items-center justify-between p-4 border-b">
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div className="p-4">
      <div className="text-2xl font-bold">{value}</div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  description: PropTypes.string,
};

const Dashboard = () => {
  const [pmData] = React.useState([
    { date: '2024-01-01', value: 25 },
    { date: '2024-01-02', value: 28 },
    { date: '2024-01-03', value: 22 },
    { date: '2024-01-04', value: 31 },
    { date: '2024-01-05', value: 35 },
    { date: '2024-01-06', value: 27 },
    { date: '2024-01-07', value: 24 },
  ]);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          title="ค่า PM2.5"
          value="25.4 µg/m³"
          icon={Wind}
          description="ระดับปานกลาง"
        />
        <StatCard 
          title="ผู้ใช้งาน"
          value="1,234"
          icon={Users}
          description="เพิ่มขึ้น 12% จากเดือนที่แล้ว"
        />
        <StatCard 
          title="ร้านค้า"
          value="89"
          icon={Store}
          description="ร้านค้าที่ลงทะเบียน"
        />
        <StatCard 
          title="การเข้าชม"
          value="45.2K"
          icon={TrendingUp}
          description="ในเดือนนี้"
        />
      </div>

      <div className="border rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="text-xl font-medium">แนวโน้มค่า PM2.5</div>
        </div>
        <div className="p-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pmData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
