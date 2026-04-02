import React from 'react';
import TutorCard from './TutorCard';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import { Tutor } from '../../types';

interface TutorListProps {
  tutors: Tutor[];
  loading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TutorList: React.FC<TutorListProps> = ({
  tutors,
  loading,
  page,
  totalPages,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading text="Loading tutors..." />
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-12 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tutors Found</h3>
        <p className="text-gray-600">Try adjusting your filters to find more tutors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default TutorList;