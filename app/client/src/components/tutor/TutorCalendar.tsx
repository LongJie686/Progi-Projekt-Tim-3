import React, { useState } from 'react';
import Button from '../common/Button';
import { AvailabilitySlot } from '../../types';
import { formatDate, formatTime } from '../../utils';

interface TutorCalendarProps {
  availability: AvailabilitySlot[];
  onSelectSlot: (slot: AvailabilitySlot) => void;
  selectedSlot?: AvailabilitySlot | null;
  loading?: boolean;
}

const TutorCalendar: React.FC<TutorCalendarProps> = ({
  availability,
  onSelectSlot,
  selectedSlot,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getSlotsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    const dateStr = formatDate(date, 'yyyy-MM-dd');

    return availability.filter(
      (slot) =>
        (slot.isRecurring && slot.dayOfWeek === dayOfWeek) ||
        slot.specificDate === dateStr
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20"></div>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const slots = getSlotsForDate(day);
          const hasSlots = slots.length > 0;
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

          return (
            <div
              key={day}
              className={`h-20 p-1 border rounded-lg ${
                hasSlots ? 'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100' : 'bg-gray-50 border-gray-200'
              } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => hasSlots && onSelectSlot(slots[0])}
            >
              <div className="text-sm font-medium text-gray-900">{day}</div>
              {hasSlots && (
                <div className="mt-1 text-xs text-green-600">
                  {slots.length} slot{slots.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h4 className="font-medium text-primary-900">Selected Time Slot</h4>
          <p className="text-sm text-primary-700 mt-1">
            {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TutorCalendar;