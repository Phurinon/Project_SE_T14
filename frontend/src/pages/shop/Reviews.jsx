import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getShopReviews, replyToReview } from "../../api/reviews";
import { getMyShop } from "../../api/shop";
import useDusthStore from "../../Global Store/DusthStore";
import { toast } from "react-toastify";

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
      toast.success("ตอบกลับรีวิวสำเร็จ");
      setIsReplying(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการตอบกลับรีวิว");
      console.error("Error replying to review:", error);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <img
            src={`https://robohash.org/${review.user.name}?size=40x40`}
            alt="User avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium">{review.user.name}</h3>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <p className="text-gray-700 mb-2">{review.comment}</p>

      {review.reply && (
        <div className="bg-gray-50 p-3 rounded-lg ml-8 mb-2">
          <p className="text-sm font-medium mb-1">การตอบกลับของร้านค้า</p>
          <p className="text-sm text-gray-600">{review.reply}</p>
        </div>
      )}

      {isShopOwner && !review.reply && !isReplying && (
        <button
          onClick={() => setIsReplying(true)}
          className="text-blue-500 text-sm hover:underline"
        >
          ตอบกลับ
        </button>
      )}

      {isReplying && (
        <div className="mt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="พิมพ์ข้อความตอบกลับ..."
            className="w-full p-2 border rounded-lg mb-2"
            rows="3"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSubmitReply}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              ส่งข้อความ
            </button>
            <button
              onClick={() => setIsReplying(false)}
              className="text-gray-500 hover:text-gray-700"
            >
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
        // console.log("Shop data:", shop);

        const shopReviews = await getShopReviews(shop.id);
        // console.log("Shop Reviews:", shopReviews);

        const approvedReviews = shopReviews.filter(
          (review) =>
            review.status === "approved" || review.status === "pending"
        );
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
        toast.error("เกิดข้อผิดพลาด: ไม่สามารถโหลดรีวิวได้");
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
          review.id === reviewId ? updatedReview : review
        )
      );
    } catch (error) {
      console.error("Error replying to review:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รีวิวจากลูกค้า</h1>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500">({reviews.length} รีวิว)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500">ยังไม่มีรีวิว</p>
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
