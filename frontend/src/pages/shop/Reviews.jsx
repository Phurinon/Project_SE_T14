import { useState, useEffect } from "react";
import { 
  Star, 
  MessageCircle, 
  User, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { getShopReviews, replyToReview } from "../../api/reviews";
import { getMyShop } from "../../api/shop";
import useDusthStore from "../../Global Store/DusthStore";
import { toast } from "react-toastify";

const StarRating = ({ rating, size = 5, className = "" }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${
          i < rating 
            ? "text-yellow-500 fill-yellow-500" 
            : "text-gray-300"
        } ${className}`}
        size={size}
      />
    ))}
  </div>
);

const ReviewCard = ({ review, isShopOwner, onReplySubmit }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error("กรุณากรอกข้อความตอบกลับ");
      return;
    }

    try {
      await onReplySubmit(review.id, replyText);
      setReplyText("");
      toast.success("ตอบกลับรีวิวสำเร็จ");
      setIsReplying(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการตอบกลับรีวิว");
      console.error("Error replying to review:", error);
    }
  };

  const userName = review.user?.name || "ผู้ใช้";
  const userAvatar = review.user?.name 
    ? `https://robohash.org/${review.user.name}?size=40x40`
    : `https://robohash.org/default?size=40x40`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={userAvatar}
            alt="User avatar"
            className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{userName}</h3>
            <StarRating rating={review.rating} size={18} />
          </div>
        </div>
        <span className="text-sm text-gray-500 font-light">
          {new Date(review.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {review.content && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-700 italic">{review.content}</p>
        </div>
      )}

      {review.reply && (
        <div className="bg-blue-50 p-3 rounded-lg ml-8 mb-4 border-l-4 border-blue-300">
          <div className="flex items-center mb-2">
            <CheckCircle className="mr-2 text-blue-500" size={18} />
            <p className="text-sm font-medium text-blue-800">การตอบกลับของร้านค้า</p>
          </div>
          <p className="text-sm text-gray-700">{review.reply}</p>
        </div>
      )}

      {isShopOwner && !review.reply && !isReplying && (
        <button
          onClick={() => setIsReplying(true)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <MessageCircle className="mr-2" size={16} />
          <span className="text-sm font-medium">ตอบกลับ</span>
        </button>
      )}

      {isReplying && (
        <div className="mt-4 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="พิมพ์ข้อความตอบกลับ..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all"
            rows="4"
          />
          <div className="flex space-x-3">
            <button
              onClick={handleSubmitReply}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <CheckCircle className="mr-2" size={16} />
              ส่งข้อความ
            </button>
            <button
              onClick={() => setIsReplying(false)}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              <AlertCircle className="mr-2" size={16} />
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isShopOwner, setIsShopOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useDusthStore();

  useEffect(() => {
    const fetchShopAndReviews = async () => {
      try {
        setLoading(true);
        const shop = await getMyShop(token);
        console.log("Shop ID:", shop.id);
  
        const shopReviews = await getShopReviews(shop.id);
        console.log("Raw Reviews:", shopReviews);
  
        const approvedReviews = shopReviews.filter(
          (review) =>
            review.status === "approved" ||
            review.status === "pending" ||
            !review.status // รวมกรณี status เป็น null หรือ undefined
        );
        console.log("Filtered Reviews:", approvedReviews);
  
        setReviews(approvedReviews);
  
        const averageRating =
          approvedReviews.length > 0
            ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) /
              approvedReviews.length
            : 0;
        setAverageRating(averageRating);
  
        setIsShopOwner(true);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error(
          `เกิดข้อผิดพลาด: ${
            error.response?.data?.message || "ไม่สามารถโหลดรีวิวได้"
          }`
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchShopAndReviews();
  }, [token]);

  const handleReplyToReview = async (reviewId, replyText) => {
    try {
      const updatedReview = await replyToReview(token, reviewId, replyText);
      
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? { ...review, ...updatedReview }
            : review
        )
      );
      
      return updatedReview;
    } catch (error) {
      console.error("Error replying to review:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 bg-blue-50 p-5 rounded-xl shadow-md">
        <div className="flex items-center space-x-3">
          <User className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">รีวิวจากลูกค้า</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-blue-600">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex items-center space-x-1">
            <StarRating rating={Math.round(averageRating)} size={24} />
            <span className="text-gray-500 ml-2">({reviews.length} รีวิว)</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center bg-gray-100 p-8 rounded-xl">
            <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-xl text-gray-600">ยังไม่มีรีวิว</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isShopOwner={isShopOwner}
              onReplySubmit={handleReplyToReview}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;