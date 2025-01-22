import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, MapPin, Phone, Clock, Flag } from "lucide-react";
import { getShopById } from "../../api/shop";
import { getShopReviews, createReview, reportReview } from "../../api/reviews";
import useDusthStore from "../../Global Store/DusthStore";

const ShopDetail = () => {
  const { id } = useParams();
  const userToken = useDusthStore((state) => state.token);
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
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
        const [shopData, reviewsData] = await Promise.all([
          getShopById(id),
          getShopReviews(id),
        ]);
        setShop(shopData);
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userToken) {
      setError("Please login to submit a review");
      return;
    }
    try {
      const response = await createReview(userToken, {
        ...newReview,
        shopId: id,
      });
      setReviews([response, ...reviews]);
      setNewReview({ content: "", rating: 5, comment: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReportReview = async (reviewId, reason) => {
    if (!userToken) {
      setError("Please login to report a review");
      return;
    }
    try {
      await reportReview(userToken, reviewId, reason);
      // Add UI feedback for successful report
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!shop) return <div className="p-8">Shop not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Shop Details */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{shop.name}</h1>
        <div className="flex items-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(shop.rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-gray-600">
            ({shop.rating?.toFixed(1) || "No ratings"})
          </span>
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
            <span>
              {shop.openTime} - {shop.closeTime}
            </span>
          </div>
          <p className="mt-4">{shop.description}</p>
        </div>

        {/* Shop Images */}
        <div className="grid grid-cols-2 gap-4 mt-6">
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

      {/* Review Form - Only show if logged in */}
      {userToken ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Write a Review</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
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
              <label className="block mb-2">Review</label>
              <textarea
                value={newReview.content}
                onChange={(e) =>
                  setNewReview({ ...newReview, content: e.target.value })
                }
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Review
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700">Please login to write a review</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold">{review.user?.name}</span>
                  <div className="flex items-center gap-2 my-2">
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
                  <p className="text-gray-700">{review.content}</p>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
                {userToken && (
                  <button
                    onClick={() =>
                      handleReportReview(review.id, "inappropriate content")
                    }
                    className="text-gray-500 hover:text-yellow-500"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
