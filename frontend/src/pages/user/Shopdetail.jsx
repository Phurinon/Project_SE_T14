import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Star, MapPin, Phone, Clock, Flag, X, ThumbsUp } from "lucide-react";
import { getShopById } from "../../api/shop";
import {
  getShopReviews,
  createReview,
  reportReview,
  likeReview,
  calculateAverageRating,
} from "../../api/reviews";
import useDusthStore from "../../Global Store/DusthStore";

const ReportReviewPopup = ({ review, onClose, onReport }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleReport = async () => {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลในการรายงาน");
      return;
    }

    try {
      await onReport(review.id, reason);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center mb-4">
          <Flag className="mr-2 text-red-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-red-600">รายงานรีวิว</h2>
        </div>

        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <label className="block mb-2 text-gray-700">
            รีวิวของ: <span className="font-semibold">{review.user?.name}</span>
          </label>
          <p className="text-gray-600 italic">"{review.content}"</p>
        </div>

        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-red-200 transition-all"
          placeholder="เหตุผลในการรายงาน (เช่น เนื้อหาไม่เหมาะสม)"
          rows="4"
        />

        {error && (
          <p className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</p>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleReport}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            รายงาน
          </button>
        </div>
      </div>
    </div>
  );
};

const ShopDetail = () => {
  const { id } = useParams();
  const userToken = useDusthStore((state) => state.token);
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReviewToReport, setSelectedReviewToReport] = useState(null);
  const [newReview, setNewReview] = useState({
    content: "",
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopData, reviewsData] = await Promise.all([
          getShopById(id),
          getShopReviews(id),
        ]);
        setShop(shopData);
        setReviews(reviewsData);
      } catch (err) {
        toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userToken) {
      toast.error("กรุณาเข้าสู่ระบบก่อนส่งรีวิว");
      return;
    }
    try {
      const response = await createReview(userToken, {
        ...newReview,
        shopId: id,
      });
      setReviews([response, ...reviews]);
      setNewReview({ content: "", rating: 5, comment: "" });
      toast.success("ส่งรีวิวสำเร็จ");
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const handleReportReview = async (reviewId, reason) => {
    if (!userToken) {
      toast.error("กรุณาเข้าสู่ระบบก่อนรายงาน");
      return;
    }
    try {
      await reportReview(userToken, reviewId, reason);
      toast.success("รายงานสำเร็จ");
      setSelectedReviewToReport(null);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!userToken) {
      toast.error("กรุณาเข้าสู่ระบบก่อนกดไลค์");
      return;
    }
    try {
      const response = await likeReview(userToken, reviewId);

      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, likes: response.review.likes }
            : review
        )
      );

    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  if (loading)
    return <div className="flex justify-center p-8">กำลังโหลด...</div>;
  if (!shop) return <div className="p-8">ไม่พบร้านค้า</div>;

  const averageRating = calculateAverageRating(reviews);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Shop Details Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-t-4 border-blue-500">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{shop.name}</h1>

        {/* Rating Display */}
        <div className="flex items-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < Math.round(averageRating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-gray-600 font-semibold">
            ({averageRating.toFixed(1)} จาก {reviews.length} รีวิว)
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-500" />
            <span>{shop.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-green-500" />
            <span>{shop.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-purple-500" />
            <span>
              {shop.openTime} - {shop.closeTime}
            </span>
          </div>
        </div>
        <p className="text-gray-700 mt-6">{shop.description}</p>

        {/* Shop Images */}
        <div className="grid grid-cols-2 gap-4 mt-6 justify-items-center">
          {shop.images?.map((img, index) => (
            <img
              key={index}
              src={img.secure_url}
              alt={`${shop.name} ${index + 1}`}
              className="rounded-lg w-full h-48 object-cover"
            />
          ))}
        </div>
      </div>

      {/* Review Form */}
      {userToken ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">เขียนรีวิว</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">คะแนน</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        rating <= newReview.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={newReview.content}
              onChange={(e) =>
                setNewReview({ ...newReview, content: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
              placeholder="เขียนรีวิวของคุณ"
              rows="4"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              ส่งรีวิว
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700">กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">รีวิวทั้งหมด</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center">ยังไม่มีรีวิว</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b pb-4 last:border-b-0 hover:bg-gray-50 p-3 rounded-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.user?.name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.content}</p>

                    {/* Like Section */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleLikeReview(review.id)}
                        className="flex items-center text-gray-600 hover:text-blue-500 transition"
                        disabled={!userToken}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span>{review.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                  {userToken && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReviewToReport(review)}
                        className="text-gray-500 hover:text-red-500 transition"
                      >
                        <Flag className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Review Popup */}
      {selectedReviewToReport && (
        <ReportReviewPopup
          review={selectedReviewToReport}
          onClose={() => setSelectedReviewToReport(null)}
          onReport={handleReportReview}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ShopDetail;
