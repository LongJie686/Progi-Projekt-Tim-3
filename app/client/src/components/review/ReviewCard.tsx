import React from 'react';
import Avatar from '../common/Avatar';
import Rating from '../common/Rating';
import { Review } from '../../types';
import { formatRelativeTime } from '../../utils';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-start gap-4">
        <Avatar name={review.student?.name || 'Student'} src={review.student?.profileImage} size="md" />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{review.student?.name || 'Anonymous'}</h4>
              <p className="text-sm text-gray-500">{formatRelativeTime(review.createdAt)}</p>
            </div>
            <Rating value={review.rating} readonly size="sm" />
          </div>

          {review.comment && (
            <p className="text-gray-600 mt-3">{review.comment}</p>
          )}

          {review.aspects && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-xs text-gray-500">Teaching</span>
                <div className="font-medium text-gray-900">{review.aspects.teaching}/5</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Communication</span>
                <div className="font-medium text-gray-900">{review.aspects.communication}/5</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Punctuality</span>
                <div className="font-medium text-gray-900">{review.aspects.punctuality}/5</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Knowledge</span>
                <div className="font-medium text-gray-900">{review.aspects.knowledge}/5</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;