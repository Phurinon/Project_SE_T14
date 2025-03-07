import React, { useState, useEffect } from 'react';
import { 
  MapPin, Star, Clock, TrendingUp 
} from 'lucide-react';
import { getMyShop } from '../../api/shop';
import { getShopReviews } from '../../api/reviews';
import useDusthStore from '../../Global Store/DusthStore';

const DashboardCard = ({ title, value, icon: Icon, trend, subtitle, loading }) => {
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:scale-105">
        <div className="animate-pulse flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-6 w-32 bg-white/10 rounded"></div>
            {subtitle && <div className="h-4 w-36 bg-white/10 rounded"></div>}
          </div>
          <div className="h-8 w-8 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold ">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-sm flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/10">
          <Icon className="h-8 w-8 /70" />
        </div>
      </div>
    </div>
  );
};

const ShopDashboard = () => {
  const [shopData, setShopData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useDusthStore((state) => state.token);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const shop = await getMyShop(token);
        setShopData(shop);
        
        if (shop && shop.id) {
          const shopReviews = await getShopReviews(shop.id);
          setReviews(shopReviews);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const calculateMetrics = () => {
    if (!reviews.length) return {
      averageRating: 0,
      monthlyReviews: 0,
      totalReviews: 0,
      reviewTrend: 0
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthReviews = reviews.filter(review => 
      new Date(review.createdAt).getMonth() === currentMonth
    ).length;

    const lastMonthReviews = reviews.filter(review => 
      new Date(review.createdAt).getMonth() === lastMonth
    ).length;

    const reviewTrend = lastMonthReviews === 0 ? 100 :
      ((currentMonthReviews - lastMonthReviews) / lastMonthReviews) * 100;

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    return {
      averageRating: averageRating.toFixed(1),
      monthlyReviews: currentMonthReviews,
      totalReviews: reviews.length,
      reviewTrend: Math.round(reviewTrend)
    };
  };

  const metrics = calculateMetrics();

  if (error) {
    return (
      <div className="p-6 min-h-screen ">
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen  space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold ">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="คะแนนรีวิวเฉลี่ย"
          value={`${metrics.averageRating}/5.0`}
          icon={Star}
          subtitle={`จากทั้งหมด ${metrics.totalReviews} รีวิว`}
          loading={loading}
        />
        
        <DashboardCard 
          title="รีวิวเดือนนี้"
          value={metrics.monthlyReviews}
          icon={TrendingUp}
          trend={metrics.reviewTrend}
          subtitle="เทียบกับเดือนที่แล้ว"
          loading={loading}
        />

        <DashboardCard 
          title="เวลาทำการ"
          value={shopData ? `${shopData.openTime || '-'} - ${shopData.closeTime || '-'}` : '-'}
          icon={Clock}
          subtitle="เวลาเปิด-ปิดร้าน"
          loading={loading}
        />

        <DashboardCard 
          title="ประเภทร้านค้า"
          value={shopData?.type || '-'}
          icon={MapPin}
          subtitle={shopData?.address}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ShopDashboard;