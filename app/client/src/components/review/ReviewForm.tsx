import React, { useState } from 'react';
import Button from '../common/Button';
import Rating from '../common/Rating';
import Input from '../common/Input';
import { Booking } from '../../types';

interface ReviewFormProps {
  booking: Booking;
  onSubmit: (data: {
    rating: number;
    comment: string;
    aspects?: {
      teaching: number;
      communication: number;
      punctuality: number;
      knowledge: number;
    };
  }) => void;
  loading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ booking, onSubmit, loading }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({
    teaching: 0,
    communication: 0,
    punctuality: 0,
    knowledge: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    onSubmit({
      rating,
      comment,
      aspects: aspects.teaching > 0 ? aspects : undefined,
    });
  };

  const aspectLabels = {
    teaching: 'Teaching Quality',
    communication: 'Communication',
    punctuality: 'Punctuality',
    knowledge: 'Subject Knowledge',
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Write a Review</h3>

      {/* Overall Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating
        </label>
        <div className="flex items-center gap-4">
          <Rating value={rating} onChange={setRating} size="lg" />
          <span className="text-lg font-medium text-gray-900">{rating}/5</span>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">Rate specific aspects (optional)</p>
        <div className="space-y-3">
          {(Object.keys(aspects) as Array<keyof typeof aspects>).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{aspectLabels[key]}</span>
              <Rating value={aspects[key]} onChange={(value) => setAspects({ ...aspects, [key]: value })} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience with this tutor..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <Button type="submit" fullWidth isLoading={loading} disabled={rating === 0}>
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;