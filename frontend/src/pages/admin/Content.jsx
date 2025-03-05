import { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  XCircle,
  Info,
  ShieldAlert,
  Users,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getReportedReviews,
  moderateReview,
  getReviewReports,
} from "../../api/reviews";
import useDusthStore from "../../Global Store/DusthStore";

export default function Content() {
  const [content, setContent] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useDusthStore();

  const fetchReportedContent = async () => {
    try {
      setLoading(true);
      const reportedContent = await getReportedReviews(token);

      const formattedContent = reportedContent
      .filter(review => review.status !== "rejected" && review.reportCount > 0) // กรองรีวิวที่การรายงานไม่ถูกปฏิเสธ
      .map((review) => ({
        id: review.id,
        type: "review",
        user: review.user?.name || "ผู้ใช้ไม่ทราบชื่อ",
        shop: review.shop?.name || "ร้านค้าไม่ทราบชื่อ",
        content: review.content,
        reported: new Date(review.createdAt).toLocaleDateString(),
        reportCount: review.reportCount || 1,
        reason: "รายงานหลายครั้ง",
        status: review.status || "รอดำเนินการ",
      }));

      const sortedContent = formattedContent.sort(
        (a, b) => (b.reportCount || 0) - (a.reportCount || 0)
      );

      setContent(sortedContent);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reported content", error);
      toast.error("ไม่สามารถโหลดเนื้อหาที่ถูกรายงานได้", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setLoading(false);
    }
  };

  const fetchReviewReports = async (reviewId) => {
    try {
      const reviewReports = await getReviewReports(token, reviewId);
      setReports(reviewReports);
    } catch (error) {
      console.error("Error fetching review reports", error);
      toast.error("ไม่สามารถโหลดรายงานรีวิวได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchReportedContent();
  }, []);

  const handleModeration = async (id, action) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";
      await moderateReview(token, id, status);
  
      if (action === "approve") {
        setContent(prevContent => prevContent.filter(item => item.id !== id));
        toast.success("อนุมัติรีวิวสำเร็จ", {
          icon: <CheckCircle className="text-green-500" />,
        });
      } else {
        setContent(prevContent => prevContent.filter(item => item.id !== id)); // ลบออกจาก UI
        toast.success("ปฏิเสธการรายงานสำเร็จ", { // เปลี่ยนข้อความให้ชัดเจน
          icon: <CheckCircle className="text-green-500" />, // เปลี่ยนไอคอนให้เหมาะสม
        });
        await fetchReportedContent(); // อัปเดตข้อมูลจาก backend
      }
    } catch (error) {
      console.error("Moderation failed", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errorDetails ||
        error.message ||
        "ไม่สามารถดำเนินการได้";
      toast.error(errorMessage, {
        icon: <ShieldAlert className="text-red-500" />,
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const openReportDetails = (review) => {
    setSelectedReview(review);
    fetchReviewReports(review.id);
  };

  const closeReportDetails = () => {
    setSelectedReview(null);
    setReports([]);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin">
          <Info className="w-12 h-12 text-blue-500" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <ShieldAlert className="w-12 h-12 mr-4" />
        <p className="text-xl">เกิดข้อผิดพลาด: {error}</p>
      </div>
    );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <ToastContainer />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <ShieldAlert className="w-8 h-8 mr-3 text-red-500" />
          Content Moderation
        </h2>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gray-100 p-4 border-b flex items-center">
          <Users className="w-6 h-6 mr-3 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700">
            เนื้อหาที่ถูกรายงาน
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {content.length === 0 ? (
            <div className="text-center py-10 text-gray-500 flex flex-col items-center">
              <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-xl">ไม่มีเนื้อหาที่ถูกรายงาน</p>
            </div>
          ) : (
            content.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-800">
                      {item.user}
                    </span>
                    <span className="text-sm text-gray-500">{item.shop}</span>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {item.reportCount} รายงาน
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openReportDetails(item)}
                      className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      <Info className="w-4 h-4" />
                      ดูรายละเอียดการรายงาน
                    </button>
                    <span className="text-xs text-gray-500">
                      {item.reported}
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-gray-700 line-clamp-2">
                  {item.content}
                </p>

                <div className="flex gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => handleModeration(item.id, "approve")}
                  >
                    <CheckCircle className="w-5 h-5" />
                    อนุมัติ
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    onClick={() => handleModeration(item.id, "reject")}
                  >
                    <Trash2 className="w-5 h-5" />
                    ปฏิเสธการรายงาน
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
              <h3 className="text-xl font-bold flex items-center">
                <ShieldAlert className="w-6 h-6 mr-2 text-red-500" />
                รายละเอียดการรายงาน
              </h3>
              <button
                onClick={closeReportDetails}
                className="text-gray-500 hover:text-gray-700 bg-gray-200 rounded-full p-2"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Review Content */}
            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                  รีวิวที่ถูกรายงาน
                </h4>
                <p className="text-gray-700 mb-2">{selectedReview.content}</p>
                <p className="text-sm text-gray-500">
                  โดย {selectedReview.user} - {selectedReview.shop}
                </p>
              </div>

              {/* Reports */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                  รายงานทั้งหมด
                </h4>
                {reports.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 flex flex-col items-center">
                    <Info className="w-12 h-12 mb-4 text-gray-300" />
                    <p>ไม่มีรายงาน</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-gray-50 rounded-lg p-4 mb-3 border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                            {report.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {report.userEmail}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600 flex items-center justify-end">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {report.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
