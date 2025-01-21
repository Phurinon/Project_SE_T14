import { useParams } from "react-router-dom";
import { Star, MapPin, Phone, Clock } from 'lucide-react';

const mockShopData = {
  1: {
    name: "ร้านอาหารเหนือ บ้านไม้",
    rating: 4.5,
    address: "123 ถนนสุขุมวิท กรุงเทพฯ",
    phone: "02-123-4567",
    openHours: "10:00 - 22:00",
    description: "ร้านอาหารไทยต้นตำรับ บรรยากาศร่มรื่น เหมาะสำหรับครอบครัว",
    images: ["/api/placeholder/400/300"],
    reviews: [
      {
        id: 1,
        user: "คุณมานี",
        rating: 5,
        date: "15/01/2025",
        comment: "อาหารอร่อยมาก บริการดีเยี่ยม บรรยากาศดี"
      },
      {
        id: 2,
        user: "คุณสมชาย",
        rating: 4,
        date: "14/01/2025",
        comment: "รสชาติดี แต่ราคาค่อนข้างสูง"
      }
    ]
  }
};

export default function ShopDetail() {
  const { id } = useParams();
  const shop = mockShopData[id];

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (!shop) {
    return <div className="p-4">ไม่พบข้อมูลร้านค้า</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ข้อมูลร้านค้า */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">{shop.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {renderStars(shop.rating)}
            <span className="text-gray-600">({shop.rating})</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span>{shop.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-500" />
            <span>{shop.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span>{shop.openHours}</span>
          </div>
          <p className="mt-4">{shop.description}</p>
        </div>
        
        {/* รูปภาพร้านค้า */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {shop.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${shop.name} ${index + 1}`}
              className="rounded-lg w-full h-48 object-cover"
            />
          ))}
        </div>
      </div>

      {/* รีวิวจากลูกค้า */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">รีวิวจากลูกค้า</h2>
        <div className="space-y-4">
          {shop.reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold">{review.user}</span>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{review.date}</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}