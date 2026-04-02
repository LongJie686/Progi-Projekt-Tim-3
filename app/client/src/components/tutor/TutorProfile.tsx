import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Rating from '../common/Rating';
import Button from '../common/Button';
import { Tutor } from '../../types';
import { formatPrice } from '../../utils';

interface TutorProfileProps {
  tutor: Tutor;
  onBook: () => void;
  onFavorite: () => void;
  isFavorite?: boolean;
}

const TutorProfile: React.FC<TutorProfileProps> = ({
  tutor,
  onBook,
  onFavorite,
  isFavorite = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar name={tutor.name} src={tutor.profileImage} size="xl" />
          <div className="text-center md:text-left text-white">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-bold">{tutor.name}</h1>
              {tutor.isVerified && (
                <Badge variant="success">Verified</Badge>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <Rating value={tutor.rating} readonly size="sm" />
              <span className="text-white/90">({tutor.reviewCount} reviews)</span>
            </div>
            {tutor.location && (
              <p className="text-white/80 mt-1 flex items-center justify-center md:justify-start gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tutor.location}
              </p>
            )}
          </div>
          <div className="md:ml-auto flex items-center gap-3">
            <Button
              variant={isFavorite ? 'primary' : 'outline'}
              onClick={onFavorite}
              className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20"
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Button>
            <Button onClick={onBook} className="!bg-white !text-primary-600 hover:!bg-gray-100">
              Book Now - {formatPrice(tutor.hourlyRate)}/hr
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600">{tutor.bio || 'No description provided.'}</p>
            </section>

            {/* Education & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutor.education && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                  <p className="text-gray-600">{tutor.education}</p>
                </section>
              )}
              {tutor.experience && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
                  <p className="text-gray-600">{tutor.experience}</p>
                </section>
              )}
            </div>

            {/* Subjects */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects?.map((subject) => (
                  <Badge key={subject.id} variant="primary">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Languages */}
            {tutor.languages && tutor.languages.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {tutor.languages.map((lang) => (
                    <Badge key={lang} variant="gray">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-medium">{formatPrice(tutor.hourlyRate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium">{tutor.rating.toFixed(1)} / 5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-medium">{tutor.reviewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;