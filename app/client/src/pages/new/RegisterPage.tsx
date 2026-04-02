import React from 'react';
import { RegisterForm } from '../../components/auth';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join our platform as a student or tutor</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;