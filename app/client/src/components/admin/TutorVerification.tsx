import React from 'react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Tutor } from '../../types';
import { formatDate } from '../../utils';

interface TutorVerificationProps {
  tutors: Tutor[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const TutorVerification: React.FC<TutorVerificationProps> = ({
  tutors,
  onApprove,
  onReject,
}) => {
  if (tutors.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No tutors pending verification.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tutors.map((tutor) => (
        <Card key={tutor.id}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4 flex-1">
              <Avatar name={tutor.name} src={tutor.profileImage} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{tutor.name}</h3>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="text-sm text-gray-500">{tutor.email}</p>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  {tutor.education && (
                    <div>
                      <span className="text-gray-500">Education:</span>
                      <p className="text-gray-900">{tutor.education}</p>
                    </div>
                  )}
                  {tutor.experience && (
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <p className="text-gray-900">{tutor.experience}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Hourly Rate:</span>
                    <p className="text-gray-900">${tutor.hourlyRate}/hr</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Applied:</span>
                    <p className="text-gray-900">{formatDate(tutor.createdAt, 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Subjects:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tutor.subjects?.map((subject) => (
                      <Badge key={subject.id} variant="gray" size="sm">{subject.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => onApprove(tutor.id)}>
                Approve
              </Button>
              <Button variant="danger" onClick={() => onReject(tutor.id, '')}>
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TutorVerification;