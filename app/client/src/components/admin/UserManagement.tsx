import React, { useState } from 'react';
import Card from '../common/Card';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Pagination from '../common/Pagination';
import { User } from '../../types';
import { formatDate } from '../../utils';

interface UserManagementProps {
  users: User[];
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onBan,
  onUnban,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'student' | 'tutor' | 'admin'>('all');

  const filteredUsers = filter === 'all' ? users : users.filter((u) => u.role === filter);

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.profileImage} size="sm" />
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'error' : user.role === 'tutor' ? 'primary' : 'secondary'}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <Badge variant="success">Active</Badge>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (user: User) => formatDate(user.createdAt, 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'student', 'tutor', 'admin'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === role
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {role === 'all' ? 'All Users' : `${role}s`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <Table columns={columns} data={filteredUsers} rowKey={(user) => user.id} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} src={selectedUser.profileImage} size="lg" />
              <div>
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Role:</span>{' '}
                <Badge variant="primary">{selectedUser.role}</Badge>
              </div>
              <div>
                <span className="text-gray-500">Joined:</span>{' '}
                {formatDate(selectedUser.createdAt, 'MMM d, yyyy')}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button variant="danger" onClick={() => onBan(selectedUser.id)}>
                Ban User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;