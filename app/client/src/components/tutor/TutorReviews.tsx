import React from 'react';
import Avatar from '../common/Avatar';
import Rating from '../common/Rating';
import { Review } from '../../types';
import { formatRelativeTime } from '../../utils';

interface TutorReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const TutorReviews: React.FC<TutorReviewsProps> = ({
  reviews,
  averageRating,
  totalReviews,
}) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < fullStars
                ? 'text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Reviews</h2>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b">
        <div className="text-center md:text-left">
          <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="mt-1">{renderStars(averageRating)}</div>
          <div className="text-sm text-gray-500 mt-1">{totalReviews} reviews</div>
        </div>

        <div className="flex-1">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600 w-8">{star} star</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start gap-3">
                <Avatar name={review.student?.name || 'Student'} size="md" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {review.student?.name || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatRelativeTime(review.createdAt)}
                      </span>
                    </div>
                    <Rating value={review.rating} readonly size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                  {review.aspects && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      <div className="text-sm">
                        <span className="text-gray-500">Teaching:</span>{' '}
                        <span className="font-medium">{review.aspects.teaching}/5</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Communication:</span>{' '}
                        <span className="font-medium">{review.aspects.communication}/5</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Punctuality:</span>{' '}
                        <span className="font-medium">{review.aspects.punctuality}/5</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Knowledge:</span>{' '}
                        <span className="font-medium">{review.aspects.knowledge}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorReviews;