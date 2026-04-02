import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import { Booking } from '../../types';
import { formatDate, formatTime, formatPrice, getStatusColorClass, formatBookingStatus } from '../../utils';

interface MyBookingsProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
  loading?: boolean;
}

const MyBookings: React.FC<MyBookingsProps> = ({ bookings, onCancel, loading }) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; bookingId: string | null }>({
    isOpen: false,
    bookingId: null,
  });

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(booking.startTime) > new Date() && booking.status !== 'cancelled';
    return booking.status === filter;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancelClick = (bookingId: string) => {
    setCancelModal({ isOpen: true, bookingId });
  };

  const handleConfirmCancel = () => {
    if (cancelModal.bookingId) {
      onCancel(cancelModal.bookingId);
    }
    setCancelModal({ isOpen: false, bookingId: null });
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key as typeof filter);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {paginatedBookings.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No bookings found</p>
            </div>
          </Card>
        ) : (
          paginatedBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Avatar name={booking.tutor?.name || 'Tutor'} src={booking.tutor?.profileImage} size="lg" />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{booking.tutor?.name}</h3>
                    <Badge className={getStatusColorClass(booking.status)}>
                      {formatBookingStatus(booking.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{booking.subject?.name}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(booking.startTime, 'EEE, MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </span>
                    <span className="font-medium">{formatPrice(booking.price)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {booking.status === 'confirmed' && new Date(booking.startTime) > new Date() && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelClick(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {booking.meetingLink && booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => window.open(booking.meetingLink, '_blank')}
                    >
                      Join Session
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null })}
        title="Cancel Booking"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setCancelModal({ isOpen: false, bookingId: null })}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            Cancel Booking
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;