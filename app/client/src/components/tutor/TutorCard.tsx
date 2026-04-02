import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Rating from '../common/Rating';
import { Tutor } from '../../types';
import { formatPrice } from '../../utils';

interface TutorCardProps {
  tutor: Tutor;
  showActions?: boolean;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor, showActions = true }) => {
  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-md transition-shadow p-6">
      <div className="flex items-start gap-4">
        <Avatar name={tutor.name} src={tutor.profileImage} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/instructors/${tutor.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
              {tutor.name}
            </Link>
            {tutor.isVerified && (
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Rating value={tutor.rating} readonly size="sm" />
            <span className="text-sm text-gray-500">({tutor.reviewCount} reviews)</span>
          </div>

          {tutor.bio && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{tutor.bio}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {tutor.subjects?.slice(0, 3).map((subject) => (
              <Badge key={subject.id} variant="primary" size="sm">
                {subject.name}
              </Badge>
            ))}
            {tutor.subjects?.length > 3 && (
              <Badge variant="gray" size="sm">
                +{tutor.subjects.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-lg font-semibold text-primary-600">
              {formatPrice(tutor.hourlyRate)}/hr
            </div>

            {showActions && (
              <Link
                to={`/instructors/${tutor.id}`}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;