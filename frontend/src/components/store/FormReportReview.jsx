import {  Flag, X } from "lucide-react";


import { useState } from "react";
const FormReportReview = ({ review, onClose, onReport }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleReport = async () => {
    if (!reason.trim()) {
      setError('กรุณาระบุเหตุผลในการรายงาน');
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
            setError('');
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
}

export default FormReportReview;
