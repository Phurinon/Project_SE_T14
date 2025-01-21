import { useState } from 'react';
import { Trash2, CheckCircle, MessageSquare } from 'lucide-react';
export default function Content() {
  const [content, setContent] = useState([
    {
      id: 1,
      type: 'review',
      user: 'สมชาย ใจดี',
      shop: 'ร้านอาหาร',
      content: 'ร้านนี้บริการแย่มาก ไม่แนะนำ!',
      reported: '2025-01-15',
      reason: 'เนื้อหาไม่เหมาะสม',
      status: 'pending',
    },
    {
      id: 2,
      type: 'comment',
      user: 'สมหญิง รักดี',
      shop: 'ร้านอาหาร',
      content: 'อากาศแย่จริงๆ ควรปรับปรุง',
      reported: '2025-01-14',
      reason: 'ข้อมูลไม่ถูกต้อง',
      status: 'pending',
    },
  ]);

  const handleDelete = (id) => {
    setContent((prevContent) => prevContent.filter((item) => item.id !== id));
  };

  const handleApprove = (id) => {
    setContent((prevContent) =>
      prevContent.map((item) =>
        item.id === id ? { ...item, status: 'approved' } : item
      )
    );
  };
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Content Moderation</h2>

      <div className="border rounded-lg bg-white shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">รายการที่ถูกรายงาน</h3>
        </div>
        <div className="p-4 space-y-4">
          {content.map((item) => (
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
                  onClick={() => handleApprove(item.id)}
                >
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    อนุมัติ
                  </div>
                </button>
                <button
                  className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                  onClick={() => handleDelete(item.id)}
                >
                  <div className="flex items-center gap-1">
                    <Trash2 className="w-4 h-4" />
                    ลบ
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
