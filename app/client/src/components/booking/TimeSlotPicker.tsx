import React, { useState } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { AvailabilitySlot } from '../../types';
import { formatDate, formatTime } from '../../utils';

interface TimeSlotPickerProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  loading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.specificDate || getNextDateForDay(slot.dayOfWeek);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const getNextDateForDay = (dayOfWeek: number): string => {
    const today = new Date();
    const targetDay = dayOfWeek;
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return formatDate(targetDate, 'yyyy-MM-dd');
  };

  const dates = Object.keys(slotsByDate).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">No available time slots</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Time</h3>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors ${
              selectedDate === date
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
            }`}
          >
            <div className="text-xs">{formatDate(date, 'EEE')}</div>
            <div className="font-semibold">{formatDate(date, 'd')}</div>
          </button>
        ))}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {slotsByDate[selectedDate]
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((slot, index) => (
              <button
                key={`${slot.id || index}`}
                onClick={() => onSelectSlot(slot)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedSlot?.id === slot.id
                    ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500'
                    : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="font-medium text-gray-900">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {calculateDuration(slot.startTime, slot.endTime)} min
                </div>
              </button>
            ))}
        </div>
      )}

      {!selectedDate && (
        <p className="text-center text-gray-500 py-4">Select a date to see available times</p>
      )}
    </div>
  );
};

function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

export default TimeSlotPicker;