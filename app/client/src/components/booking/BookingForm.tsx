import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { Subject, Tutor } from '../../types';

interface BookingFormProps {
  tutor: Tutor;
  selectedTime: { startTime: string; endTime: string; date: string } | null;
  onSubmit: (data: { subjectId: string; notes: string }) => void;
  loading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  tutor,
  selectedTime,
  onSubmit,
  loading = false,
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ subjectId?: string }>({});

  const subjectOptions = tutor.subjects?.map((s) => ({
    value: s.id,
    label: s.name,
  })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId) {
      setErrors({ subjectId: 'Please select a subject' });
      return;
    }

    onSubmit({ subjectId, notes });
  };

  if (!selectedTime) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500">Please select a time slot first</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>

      <div className="space-y-4">
        <Select
          label="Subject"
          options={subjectOptions}
          value={subjectId}
          onChange={(value) => {
            setSubjectId(value);
            setErrors({});
          }}
          error={errors.subjectId}
          placeholder="Select a subject"
        />

        <Input
          label="Notes (optional)"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific topics you want to cover..."
        />

        <Button type="submit" fullWidth isLoading={loading}>
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;