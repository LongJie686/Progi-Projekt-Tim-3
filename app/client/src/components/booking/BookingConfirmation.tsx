import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { Booking } from '../../types';
import { formatDate, formatTime } from '../../utils';

interface BookingConfirmationProps {
  booking: Booking;
  onDone: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onDone }) => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-6">Your session has been successfully booked.</p>

      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID</span>
          <span className="font-medium text-gray-900">#{booking.id.slice(-8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tutor</span>
          <span className="font-medium text-gray-900">{booking.tutor?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Subject</span>
          <span className="font-medium text-gray-900">{booking.subject?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date</span>
          <span className="font-medium text-gray-900">
            {formatDate(booking.startTime, 'EEE, MMM d, yyyy')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time</span>
          <span className="font-medium text-gray-900">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={onDone} fullWidth>
          View My Bookings
        </Button>
        <Link to="/calendar" className="block">
          <Button variant="outline" fullWidth>
            Add to Calendar
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;