import React from 'react';
import Card from '../common/Card';
import { formatPrice, formatDate, formatTime, getStatusColorClass, formatBookingStatus } from '../../utils';
import { Booking } from '../../types';

interface IncomeStatsProps {
  totalEarnings: number;
  monthlyEarnings: { month: string; amount: number }[];
  recentPayments: { amount: number; date: string; booking: Booking }[];
}

const IncomeStats: React.FC<IncomeStatsProps> = ({
  totalEarnings,
  monthlyEarnings,
  recentPayments,
}) => {
  return (
    <div className="space-y-6">
      {/* Total Earnings Card */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="text-center">
          <p className="text-green-100 text-sm uppercase tracking-wider">Total Earnings</p>
          <p className="text-4xl font-bold mt-2">{formatPrice(totalEarnings)}</p>
        </div>
      </Card>

      {/* Monthly Earnings */}
      <Card title="Monthly Earnings">
        {monthlyEarnings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No earnings data yet</p>
        ) : (
          <div className="space-y-3">
            {monthlyEarnings.slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-gray-600">{item.month}</span>
                <span className="font-semibold text-gray-900">{formatPrice(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Payments */}
      <Card title="Recent Payments">
        {recentPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent payments</p>
        ) : (
          <div className="space-y-3">
            {recentPayments.slice(0, 10).map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{payment.booking.student?.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(payment.date, 'MMM d, yyyy')}</p>
                </div>
                <span className="font-semibold text-green-600">+{formatPrice(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default IncomeStats;