import { useState, useEffect } from 'react';
import { Search, Navigation, Info } from 'lucide-react';
import { getUserBookmarks } from '../../api/bookmark';

const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'favorite', label: 'รายการโปรด' },
    { id: 'wantToGo', label: 'อยากไป' },
    { id: 'visited', label: 'เคยไปมาแล้ว' },
    { id: 'share', label: 'อยากแชร์' }
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
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">การบันทึกของฉัน</h1>
      
      {/* Search and Filter Section */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg border ${
                activeFilter === filter.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>กำลังโหลด...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map(bookmark => (
            <div 
              key={bookmark.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={bookmark.shop.images[0]?.url || "/api/placeholder/400/300"}
                  alt={bookmark.shop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm">
                  ⭐ {bookmark.shop.averageRating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{bookmark.shop.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{bookmark.shop.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                    {filters.find(f => f.id === bookmark.category)?.label || 'ไม่ระบุหมวดหมู่'}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNavigation(bookmark.shop.latitude, bookmark.shop.longitude)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>นำทาง</span>
                  </button>
                  <button
                    onClick={() => handleViewDetails(bookmark.shop.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span>ดูข้อมูล</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredBookmarks.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">ไม่พบรายการบุ๊คมาร์ค</p>
        </div>
      )}
    </div>
  );
};

export default Bookmark;