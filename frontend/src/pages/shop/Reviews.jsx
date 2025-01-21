import { useState } from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

// Move ReviewCard declaration before it's used
const ReviewCard = ({ review, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = () => {
    onReply(review.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <img
              src="https://robohash.org/cartoon?size=40x40"
              alt="User avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium">{review.userName}</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">{review.date}</span>
      </div>

      <p className="text-gray-700 mb-2">{review.comment}</p>

      {review.reply && (
        <div className="bg-gray-50 p-3 rounded-lg ml-8 mb-2">
          <p className="text-sm font-medium mb-1">การตอบกลับของร้านค้า</p>
          <p className="text-sm text-gray-600">{review.reply}</p>
        </div>
      )}

      {!review.reply && !isReplying && (
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

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number.isRequired,
    userName: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    reply: PropTypes.string,
  }).isRequired,
  onReply: PropTypes.func.isRequired,
};

const Reviews = () => {
  const [reviews] = useState([
    {
      id: 1,
      userName: 'คุณ สมชาย',
      rating: 5,
      comment: 'บริการดีมาก สินค้าคุณภาพดี',
      date: '2 วันที่แล้ว',
      reply: 'ขอบคุณสำหรับคำติชมครับ เราจะรักษามาตรฐานการบริการให้ดีเสมอ'
    },
    {
      id: 2,
      userName: 'คุณ สมหญิง',
      rating: 4,
      comment: 'สินค้าดี แต่จัดส่งช้าไปหน่อย',
      date: '1 สัปดาห์ที่แล้ว',
    },
    {
      id: 3,
      userName: 'คุณ มานี',
      rating: 5,
      comment: 'ประทับใจมากค่ะ แนะนำร้านนี้เลย',
      date: '2 สัปดาห์ที่แล้ว',
    }
  ]);

  const handleReply = (reviewId, replyText) => {
    console.log('Reply to review:', reviewId, replyText);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รีวิวจากลูกค้า</h1>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">4.8</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>
          <span className="text-gray-500">(125 รีวิว)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
};

export default Reviews;
