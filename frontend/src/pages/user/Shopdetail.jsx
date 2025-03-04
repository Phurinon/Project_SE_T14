import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Flag,
  X,
  MessageSquare,
  Camera,
  Calendar,
  Award,
  User,
  Heart,
  Info,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getShopById } from "../../api/shop";
import {
  getShopReviews,
  createReview,
  reportReview,
  likeReview,
  calculateAverageRating,
  checkUserShopReview,
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
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border-l-4 border-red-500">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center mb-6">
          <Flag className="mr-3 text-red-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-800">รายงานรีวิว</h2>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-800">
              {review.user?.name}
            </span>
          </div>
          <p className="text-gray-700 italic pl-6">"{review.content}"</p>
        </div>

        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all outline-none text-gray-700"
          placeholder="เหตุผลในการรายงาน (เช่น เนื้อหาไม่เหมาะสม)"
          rows="4"
        />

        {error && (
          <p className="text-red-500 mb-4 bg-red-50 p-3 rounded-lg flex items-center">
            <Info className="w-5 h-5 mr-2 text-red-500" />
            {error}
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-gray-700 font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleReport}
            className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium flex items-center"
          >
            <Flag className="w-4 h-4 mr-2" />
            รายงาน
          </button>
        </div>
      </div>
    </div>
  );
};

const ShopReplySection = ({ reply }) => {
  if (!reply) return null;

  return (
    <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-700 mb-1">
            การตอบกลับจากร้านค้า
          </h4>
          <p className="text-gray-700">{reply}</p>
        </div>
      </div>
    </div>
  );
};

// Component for image gallery with lightbox
const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-[#212329]" />
          <h3 className="text-lg font-bold text-[#212329]">รูปภาพร้านค้า</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.secure_url}
                alt={`รูปภาพร้านค้า ${index + 1}`}
                className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <span className="bg-white p-2 rounded-full">
                    <Info className="w-4 h-4 text-[#212329]" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage.secure_url}
            alt="รูปขยาย"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

const ShopDetail = () => {
  const { id } = useParams();
  const userToken = useDusthStore((state) => state.token);
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReviewToReport, setSelectedReviewToReport] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userLikes, setUserLikes] = useState(new Set());
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [newReview, setNewReview] = useState({
    content: "",
    rating: 5,
    comment: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get shop data and reviews in parallel
        const [shopData, reviewsData] = await Promise.all([
          getShopById(id),
          getShopReviews(id),
        ]);
  
        setShop(shopData);
        setReviews(reviewsData || []);
  
        // Initialize userLikes set based on reviews the user has already liked
        if (userToken && reviewsData) {
          const userId = typeof userToken === "object" ? userToken.userId : null;
          if (userId) {
            const likedReviews = new Set(
              reviewsData
                .filter(review => 
                  Array.isArray(review.likedBy) && 
                  review.likedBy.some(like => like.userId === userId)
                )
                .map(review => review.id)
            );
            setUserLikes(likedReviews);
          }
        }
  
        // Check if user has already reviewed this shop
        if (userToken) {
          try {
            // ตรวจสอบโดยตรงจาก reviews ก่อน (เป็นวิธีที่แน่นอนกว่า)
            const userId = typeof userToken === "object" ? userToken.userId : null;
            if (userId && reviewsData) {
              const userReview = reviewsData.find(
                (review) =>
                  review.userId === userId ||
                  (review.user && review.user.id === userId)
              );
              
              if (userReview) {
                setHasReviewed(true);
                return; // หากพบแล้วให้ออกจาก block นี้เลย
              }
            }
            
            // ถ้ายังไม่พบจาก reviews ค่อยเรียก API
            const hasReviewed = await checkUserShopReview(userToken, id);
            setHasReviewed(hasReviewed);
          } catch (err) {
            console.log("Error checking if user reviewed shop:", err);
            // ยังคงการตรวจสอบจาก reviews โดยตรงไว้เป็น fallback
            const userId = typeof userToken === "object" ? userToken.userId : null;
            if (userId) {
              const userReviews = reviewsData.filter(
                (review) =>
                  review.userId === userId ||
                  (review.user && review.user.id === userId)
              );
              setHasReviewed(userReviews.length > 0);
            }
          }
        }
      } catch (err) {
        console.log("Error fetching shop data:", err);
        setError("ไม่สามารถโหลดข้อมูลร้านค้าได้");
        toast.error("ไม่สามารถโหลดข้อมูลร้านค้าได้");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, userToken]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userToken) {
      toast.error("กรุณาเข้าสู่ระบบก่อนส่งรีวิว");
      return;
    }

    if (hasReviewed) {
      toast.error("คุณได้รีวิวร้านนี้ไปแล้ว");
      return;
    }

    if (!newReview.content.trim()) {
      toast.error("กรุณาเขียนเนื้อหารีวิว");
      return;
    }

    try {
      const response = await createReview(userToken, {
        ...newReview,
        shopId: id,
      });
      setReviews([response, ...reviews]);
      setNewReview({ content: "", rating: 5, comment: "" });
      setHasReviewed(true);
      toast.success("ส่งรีวิวสำเร็จ");
    } catch (err) {
      console.log("Error creating review:", err);
      toast.error("ไม่สามารถส่งรีวิวได้คุณเคยรีวิวร้านนี้ไปแล้ว");
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
      
      // Update the reviews state with the returned data from the API
      if (response && response.review) {
        setReviews(
          reviews.map((review) =>
            review.id === reviewId ? response.review : review
          )
        );
      } else {
        // If the API doesn't return the updated review, handle it locally
        setReviews(
          reviews.map((review) => {
            if (review.id === reviewId) {
              const userId = typeof userToken === "object" ? userToken.userId : null;
              const userLiked = userLikes.has(reviewId);
              
              // Create a proper likes array based on current state
              const updatedLikes = userLiked
                ? (Array.isArray(review.likes) 
                  ? review.likes.filter(like => like.userId !== userId) 
                  : [])
                : [
                  ...(Array.isArray(review.likes) ? review.likes : []),
                  { userId: userId }
                ];
                
              return { ...review, likes: updatedLikes };
            }
            return review;
          })
        );
      }
      
      // Toggle the like in userLikes Set
      setUserLikes((prev) => {
        const newLikes = new Set(prev);
        if (response.userLiked) {
          newLikes.add(reviewId);
        } else {
          newLikes.delete(reviewId);
        }
        return newLikes;
      });
      
    } catch (err) {
      console.log("Error liking review:", err);
      toast.error(`เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถกดไลค์ได้"}`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-20 h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#212329] border-opacity-20 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#212329] font-medium">
            กำลังโหลดข้อมูลร้านค้า...
          </p>
        </div>
      </div>
    );

  if (error || !shop) {
    return (
      <div className="p-8 text-center">
        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">ไม่พบร้านค้า</h2>
        <p className="text-gray-500 mt-2">
          ร้านค้าที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ
        </p>
      </div>
    );
  }

  const averageRating = calculateAverageRating(reviews);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen pb-20">
      {/* Shop Header - Hero Section */}
      <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg">
        {shop.images && shop.images.length > 0 ? (
          <div className="h-48 md:h-64 w-full">
            <img
              src={shop.images[0].secure_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#212329] to-transparent"></div>
          </div>
        ) : (
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-[#212329] to-gray-700"></div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
          <div className="flex items-center gap-2 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-white font-semibold">
              ({averageRating.toFixed(1)})
            </span>
            <span className="text-gray-200 text-sm">
              จาก {reviews.length} รีวิว
            </span>
          </div>
        </div>
      </div>

      {/* Shop Details Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-l-4 border-[#212329]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4 text-[#212329] flex items-center">
              <Info className="w-5 h-5 mr-2" />
              ข้อมูลร้านค้า
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#212329] text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">ที่อยู่</div>
                  <span className="text-gray-800">{shop.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#212329] text-white">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">เบอร์โทร</div>
                  <span className="text-gray-800">{shop.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#212329] text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">เวลาเปิด-ปิด</div>
                  <span className="text-gray-800">
                    {shop.openTime} - {shop.closeTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-[#212329] flex items-center">
              <Award className="w-5 h-5 mr-2" />
              เกี่ยวกับร้าน
            </h2>
            <div
              className={`text-gray-700 relative ${
                !expandedDescription && shop.description?.length > 150
                  ? "max-h-28 overflow-hidden"
                  : ""
              }`}
            >
              <p>{shop.description}</p>
              {!expandedDescription && shop.description?.length > 150 && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </div>
            {shop.description?.length > 150 && (
              <button
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="mt-2 flex items-center text-[#212329] hover:text-gray-700 font-medium text-sm"
              >
                {expandedDescription ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    แสดงน้อยลง
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    อ่านเพิ่มเติม
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Shop Images Gallery */}
        <ImageGallery images={shop.images} />
      </div>

      {/* Review Form */}
      {userToken ? (
        hasReviewed ||
        reviews.some(
          (review) =>
            review.userId ===
              (typeof userToken === "object" ? userToken.userId : null) ||
            (review.user &&
              review.user.id ===
                (typeof userToken === "object" ? userToken.userId : null))
        ) ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700">คุณได้รีวิวร้านนี้ไปแล้ว</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
              เขียนรีวิว
            </h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block mb-2 font-medium text-gray-700">
                  ให้คะแนนร้านค้า
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= newReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  ความคิดเห็นของคุณ
                </label>
                <textarea
                  value={newReview.content}
                  onChange={(e) =>
                    setNewReview({ ...newReview, content: e.target.value })
                  }
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all outline-none"
                  placeholder="แชร์ประสบการณ์ของคุณเกี่ยวกับร้านนี้..."
                  rows="4"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#212329] text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                ส่งรีวิว
              </button>
            </form>
          </div>
        )
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <p className="text-blue-700">กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว</p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center border-b pb-4">
          <MessageSquare className="w-5 h-5 mr-2 text-[#212329]" />
          รีวิวทั้งหมด
          <span className="ml-2 bg-[#212329] text-white text-sm py-1 px-2 rounded-full">
            {reviews.length}
          </span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              ยังไม่มีรีวิว เป็นคนแรกที่รีวิวร้านนี้
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#212329] text-white flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {review.user?.name}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.createdAt && (
                        <span className="text-xs text-gray-500 flex items-center ml-auto">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString(
                            "th-TH"
                          )}
                        </span>
                      )}
                    </div>

                    <div className="pl-10">
                      <p className="text-gray-700 mb-3">{review.content}</p>

                      {/* Like and Action Buttons */}
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => handleLikeReview(review.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                            userLikes.has(review.id)
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                          }`}
                        >
                          {userLikes.has(review.id) ? (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                          <span>{typeof review.likes === 'number' ? review.likes : (review.likes?.length || 0)}</span>
                        </button>

                        <button
                          onClick={() => setSelectedReviewToReport(review)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition border border-transparent"
                        >
                          <Flag className="w-4 h-4" />
                          <span>รายงาน</span>
                        </button>
                      </div>

                      {/* Shop Reply Section */}
                      <ShopReplySection reply={review.reply} />
                    </div>
                  </div>
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

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
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
