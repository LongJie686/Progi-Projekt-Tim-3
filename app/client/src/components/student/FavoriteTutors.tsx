import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Rating from '../common/Rating';
import Button from '../common/Button';
import { Tutor } from '../../types';
import { formatPrice } from '../../utils';

interface FavoriteTutorsProps {
  tutors: Tutor[];
  onRemove: (id: string) => void;
}

const FavoriteTutors: React.FC<FavoriteTutorsProps> = ({ tutors, onRemove }) => {
  if (tutors.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorite Tutors</h3>
          <p className="text-gray-600 mb-4">Start adding tutors to your favorites for quick access.</p>
          <Link to="/instructors">
            <Button>Find Tutors</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutors.map((tutor) => (
        <Card key={tutor.id} className="relative">
          {/* Remove button */}
          <button
            onClick={() => onRemove(tutor.id)}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove from favorites"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="text-center">
            <Avatar name={tutor.name} src={tutor.profileImage} size="xl" />
            <h3 className="mt-3 text-lg font-semibold text-gray-900">{tutor.name}</h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Rating value={tutor.rating} readonly size="sm" />
              <span className="text-sm text-gray-500">({tutor.reviewCount})</span>
            </div>
            {tutor.isVerified && (
              <Badge variant="success" size="sm" className="mt-2">Verified</Badge>
            )}
            <div className="text-primary-600 font-semibold mt-2">
              {formatPrice(tutor.hourlyRate)}/hr
            </div>
            <div className="flex flex-wrap gap-1 justify-center mt-3">
              {tutor.subjects?.slice(0, 3).map((subject) => (
                <Badge key={subject.id} variant="gray" size="sm">{subject.name}</Badge>
              ))}
            </div>
            <Link to={`/instructors/${tutor.id}`} className="mt-4 block">
              <Button variant="outline" fullWidth>View Profile</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FavoriteTutors;