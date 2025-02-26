import { useState, useEffect } from 'react';
import { Search, Navigation, Info, Bookmark as BookmarkIcon, Heart, MapPin, Share2, CheckCircle, Loader } from 'lucide-react';
import { getUserBookmarks } from '../../api/bookmark';

const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { id: 'ทั้งหมด', label: 'ทั้งหมด', icon: <BookmarkIcon className="w-4 h-4" /> },
    { id: 'รายการโปรด', label: 'รายการโปรด', icon: <Heart className="w-4 h-4" /> },
    { id: 'อยากไป', label: 'อยากไป', icon: <MapPin className="w-4 h-4" /> },
    { id: 'เคยไปมาแล้ว', label: 'เคยไปมาแล้ว', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'อยากแชร์', label: 'อยากแชร์', icon: <Share2 className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      const response = await getUserBookmarks();
      setBookmarks(response.data);
      setFilteredBookmarks(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = bookmarks.filter(bookmark => {
      const matchesSearch = bookmark.shop.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'all' || bookmark.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
    setFilteredBookmarks(filtered);
  }, [searchQuery, activeFilter, bookmarks]);

  const handleNavigation = (latitude, longitude) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      "_blank"
    );
  };

  const handleViewDetails = (shopId) => {
    window.open(`/user/shop/${shopId}`, "_blank");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-red-500 flex items-center gap-2">
          <span className="text-lg">เกิดข้อผิดพลาด:</span> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <BookmarkIcon className="w-6 h-6 text-[#212329]" />
            <h1 className="text-2xl font-bold text-[#212329]">ที่บันทึกไว้</h1>
          </div>
          
          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาร้านที่บันทึกไว้..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#212329] focus:border-transparent bg-gray-50 text-[#212329]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 scrollbar-hide">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? 'bg-[#212329] text-white border-[#212329]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-md">
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 text-[#212329] animate-spin" />
              <p className="text-[#212329]">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map(bookmark => (
                  <div 
                    key={bookmark.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-56">
                      <img
                        src={bookmark.shop.images[0]?.url || "/api/placeholder/400/300"}
                        alt={bookmark.shop.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#212329]/70 to-transparent" />
                      <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium text-[#212329]">{bookmark.shop.averageRating}</span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-white/90 text-[#212329] rounded-full shadow-md">
                          {filters.find(f => f.id === bookmark.category)?.icon}
                          {filters.find(f => f.id === bookmark.category)?.label || 'ไม่ระบุหมวดหมู่'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-[#212329]">{bookmark.shop.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bookmark.shop.description}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNavigation(bookmark.shop.latitude, bookmark.shop.longitude)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#212329] text-white rounded-lg hover:bg-[#2c303a] transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>นำทาง</span>
                        </button>
                        <button
                          onClick={() => handleViewDetails(bookmark.shop.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-[#212329] text-[#212329] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          <span>ดูข้อมูล</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-6">
                <BookmarkIcon className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">ไม่พบรายการบุ๊คมาร์ค</p>
                <p className="text-gray-400 text-sm text-center">
                  {activeFilter !== 'all' 
                    ? `ลองเปลี่ยนหมวดหมู่หรือลองค้นหาด้วยคำอื่น` 
                    : `คุณยังไม่มีรายการบุ๊คมาร์คที่บันทึกไว้`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Bookmark;