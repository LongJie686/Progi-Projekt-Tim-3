import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { Tutor, AvailabilitySlot } from '../../types';
import { formatPrice, formatDate, formatTime } from '../../utils';

interface BookingSummaryProps {
  tutor: Tutor;
  selectedSlot: AvailabilitySlot | null;
  subjectName: string;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  tutor,
  selectedSlot,
  subjectName,
  onConfirm,
  onBack,
  loading = false,
}) => {
  if (!selectedSlot) {
    return null;
  }

  const duration = calculateDuration(selectedSlot.startTime, selectedSlot.endTime);
  const total = (tutor.hourlyRate * duration) / 60;

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

      {/* Tutor Info */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Avatar name={tutor.name} src={tutor.profileImage} size="md" />
        <div>
          <div className="font-medium text-gray-900">{tutor.name}</div>
          <div className="text-sm text-gray-500">{subjectName}</div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="py-4 border-b space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date</span>
          <span className="font-medium text-gray-900">
            {selectedSlot.specificDate
              ? formatDate(selectedSlot.specificDate, 'EEEE, MMM d, yyyy')
              : 'Select date'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time</span>
          <span className="font-medium text-gray-900">
            {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium text-gray-900">{duration} minutes</span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="py-4 border-b space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Hourly Rate</span>
          <span className="text-gray-900">{formatPrice(tutor.hourlyRate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Platform Fee</span>
          <span className="text-gray-900">{formatPrice(0)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="py-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-primary-600">{formatPrice(total)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onConfirm} className="flex-1" isLoading={loading}>
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

export default BookingSummary;