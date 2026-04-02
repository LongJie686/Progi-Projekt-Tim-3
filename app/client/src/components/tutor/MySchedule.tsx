import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { AvailabilitySlot } from '../../types';

interface MyScheduleProps {
  slots: AvailabilitySlot[];
  onAddSlot: (slot: Omit<AvailabilitySlot, 'id' | 'tutorId'>) => void;
  onDeleteSlot: (id: string) => void;
}

const MySchedule: React.FC<MyScheduleProps> = ({ slots, onAddSlot, onDeleteSlot }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true,
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const groupedSlots = slots.reduce((acc, slot) => {
    const key = slot.isRecurring ? `day-${slot.dayOfWeek}` : `date-${slot.specificDate}`;
    if (!acc[key]) {
      acc[key] = {
        label: slot.isRecurring ? days[slot.dayOfWeek] : slot.specificDate,
        slots: [],
      };
    }
    acc[key].slots.push(slot);
    return acc;
  }, {} as Record<string, { label: string; slots: AvailabilitySlot[] }>);

  const handleAddSlot = () => {
    onAddSlot(newSlot);
    setIsModalOpen(false);
    setNewSlot({
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Add Time Slot
        </Button>
      </div>

      {Object.keys(groupedSlots).length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Availability Set</h3>
            <p className="text-gray-600 mb-4">Add your available time slots for students to book.</p>
            <Button onClick={() => setIsModalOpen(true)}>Add Time Slot</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSlots).map(([key, { label, slots: daySlots }]) => (
            <Card key={key}>
              <h3 className="font-semibold text-gray-900 mb-3">{label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{slot.startTime} - {slot.endTime}</Badge>
                      {slot.isRecurring && (
                        <Badge variant="gray" size="sm">Recurring</Badge>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Time Slot"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={newSlot.dayOfWeek}
              onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {days.map((day, index) => (
                <option key={day} value={index}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newSlot.isRecurring}
              onChange={(e) => setNewSlot({ ...newSlot, isRecurring: e.target.checked })}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Repeat weekly</span>
          </label>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSlot}>Add Slot</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MySchedule;