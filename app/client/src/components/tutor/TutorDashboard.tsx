import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { Booking, TutorDashboardStats } from '../../types';
import { formatPrice, formatDate, formatTime } from '../../utils';

interface TutorDashboardProps {
  stats: TutorDashboardStats;
  upcomingBookings: Booking[];
}

const TutorDashboard: React.FC<TutorDashboardProps> = ({ stats, upcomingBookings }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
        <p className="mt-1 text-secondary-100">Manage your teaching schedule</p>
        <div className="flex gap-3 mt-4">
          <Link to="/tutor/schedule">
            <Button className="!bg-white !text-secondary-600 hover:!bg-gray-100">
              Manage Schedule
            </Button>
          </Link>
          <Link to="/quizzes/create">
            <Button variant="outline" className="!border-white !text-white hover:!bg-white/10">
              Create Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedSessions}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</div>
              <div className="text-sm text-gray-500">Upcoming</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalEarnings)}</div>
              <div className="text-sm text-gray-500">Total Earnings</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Rating">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
            <div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500">{stats.totalReviews} reviews</div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="flex flex-wrap gap-3">
            <Link to="/tutor/schedule">
              <Button variant="outline" size="sm">Update Schedule</Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
            <Link to="/quizzes/create">
              <Button variant="outline" size="sm">Create Quiz</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card title="Upcoming Sessions">
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No upcoming sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar name={booking.student?.name || 'Student'} src={booking.student?.profileImage} size="md" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{booking.student?.name}</div>
                  <div className="text-sm text-gray-500">{booking.subject?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatDate(booking.startTime, 'MMM d')}</div>
                  <div className="text-sm text-gray-500">{formatTime(booking.startTime)}</div>
                </div>
                <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                  {booking.status}
                </Badge>
              </div>
            ))}
            {upcomingBookings.length > 5 && (
              <Link to="/tutor/bookings" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                View all sessions
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TutorDashboard;