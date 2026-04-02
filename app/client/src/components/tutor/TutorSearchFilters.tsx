import React from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import { TutorSearchFilters, Subject } from '../../types';

interface TutorSearchFiltersProps {
  filters: TutorSearchFilters;
  onFilterChange: (filters: TutorSearchFilters) => void;
  subjects: Subject[];
}

const TutorSearchFilters: React.FC<TutorSearchFiltersProps> = ({
  filters,
  onFilterChange,
  subjects,
}) => {
  const handleChange = (key: keyof TutorSearchFilters, value: string | number | undefined) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const priceRangeOptions = [
    { value: '', label: 'Any Price' },
    { value: '0-25', label: '$0 - $25/hr' },
    { value: '25-50', label: '$25 - $50/hr' },
    { value: '50-100', label: '$50 - $100/hr' },
    { value: '100+', label: '$100+/hr' },
  ];

  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4', label: '4+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '3', label: '3+ Stars' },
  ];

  const availabilityOptions = [
    { value: '', label: 'Any Time' },
    { value: 'weekday', label: 'Weekdays' },
    { value: 'weekend', label: 'Weekends' },
    { value: 'morning', label: 'Mornings' },
    { value: 'afternoon', label: 'Afternoons' },
    { value: 'evening', label: 'Evenings' },
  ];

  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      <div className="space-y-4">
        <Input
          name="search"
          placeholder="Search by name or keyword..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        <Select
          label="Subject"
          options={subjectOptions}
          value={filters.subject || ''}
          onChange={(value) => handleChange('subject', value || undefined)}
        />

        <Select
          label="Price Range"
          options={priceRangeOptions}
          value={filters.minPrice && filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : ''}
          onChange={(value) => {
            if (!value) {
              handleChange('minPrice', undefined);
              handleChange('maxPrice', undefined);
            } else if (value === '100+') {
              handleChange('minPrice', 100);
              handleChange('maxPrice', undefined);
            } else {
              const [min, max] = value.split('-').map(Number);
              handleChange('minPrice', min);
              handleChange('maxPrice', max);
            }
          }}
        />

        <Select
          label="Rating"
          options={ratingOptions}
          value={filters.rating ? String(filters.rating) : ''}
          onChange={(value) => handleChange('rating', value ? parseFloat(value) : undefined)}
        />

        <Select
          label="Availability"
          options={availabilityOptions}
          value={filters.availability || ''}
          onChange={(value) => handleChange('availability', value || undefined)}
        />

        <button
          onClick={() => onFilterChange({})}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default TutorSearchFilters;