import { useState, useEffect } from "react";
import { Trash2, CheckCircle, MessageSquare } from "lucide-react";
import { getReportedReviews, moderateReview } from "../../api/reviews";
import useDusthStore from "../../Global Store/DusthStore";

export default function Content() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useDusthStore();

  const fetchReportedContent = async () => {
    try {
      setLoading(true);
      const reportedContent = await getReportedReviews(token);

      const formattedContent = reportedContent.map((review) => ({
        id: review.id,
        type: "review",
        user: review.user?.name || "Unknown User",
        shop: review.shop?.name || "Unknown Shop",
        content: review.content,
        reported: new Date(review.createdAt).toLocaleDateString(),
        reason: review.reason || "No specific reason",
        status: review.status || "pending",
      }));

      setContent(formattedContent);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reported content", error);
      setError("Failed to load reported content");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedContent();
  }, []);

  const handleModeration = async (id, action) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";
      await moderateReview(token, id, status);

      fetchReportedContent();
    } catch (error) {
      console.error("Moderation failed", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to moderate content";

      alert(errorMessage);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Content Moderation</h2>

      <div className="border rounded-lg bg-white shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">รายการที่ถูกรายงาน</h3>
        </div>
        <div className="p-4 space-y-4">
          {content.length === 0 ? (
            <p className="text-center text-gray-500">
              ไม่มีเนื้อหาที่ถูกรายงาน
            </p>
          ) : (
            content.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{item.user}</span>
                    <span className="text-sm text-gray-500">{item.shop}</span>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                      {item.reason}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{item.reported}</span>
                </div>
                <p className="mb-4 text-gray-700">{item.content}</p>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                    onClick={() => handleModeration(item.id, "approve")}
                  >
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      อนุมัติ
                    </div>
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                    onClick={() => handleModeration(item.id, "reject")}
                  >
                    <div className="flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </div>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
