import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { Booking, Tutor, StudentDashboardStats } from '../../types';
import { formatPrice, formatDate, formatTime } from '../../utils';

interface StudentDashboardProps {
  stats: StudentDashboardStats;
  upcomingBookings: Booking[];
  favoriteTutors: Tutor[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  stats,
  upcomingBookings,
  favoriteTutors,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="mt-1 text-primary-100">Continue your learning journey</p>
        <Link to="/instructors">
          <Button className="mt-4 !bg-white !text-primary-600 hover:!bg-gray-100">
            Find a Tutor
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.totalSessions}</div>
            <div className="text-sm text-gray-500 mt-1">Total Sessions</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completedSessions}</div>
            <div className="text-sm text-gray-500 mt-1">Completed</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.upcomingSessions}</div>
            <div className="text-sm text-gray-500 mt-1">Upcoming</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</div>
            <div className="text-sm text-gray-500 mt-1">Total Spent</div>
          </div>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card title="Upcoming Sessions">
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No upcoming sessions</p>
            <Link to="/instructors" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Book a session
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Avatar name={booking.tutor?.name || 'Tutor'} src={booking.tutor?.profileImage} size="md" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{booking.tutor?.name}</div>
                  <div className="text-sm text-gray-500">{booking.subject?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(booking.startTime, 'MMM d')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(booking.startTime)}
                  </div>
                </div>
              </div>
            ))}
            {upcomingBookings.length > 3 && (
              <Link to="/student/bookings" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                View all bookings
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Favorite Tutors */}
      <Card title="Favorite Tutors">
        {favoriteTutors.length === 0 ? (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-500">No favorite tutors yet</p>
            <Link to="/instructors" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Find tutors to add
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteTutors.slice(0, 4).map((tutor) => (
              <Link
                key={tutor.id}
                to={`/instructors/${tutor.id}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar name={tutor.name} src={tutor.profileImage} size="md" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{tutor.name}</div>
                  <div className="text-sm text-gray-500">{formatPrice(tutor.hourlyRate)}/hr</div>
                </div>
                {tutor.isVerified && (
                  <Badge variant="success" size="sm">Verified</Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;