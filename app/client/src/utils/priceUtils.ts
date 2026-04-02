export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

export const calculateSessionPrice = (hourlyRate: number, durationMinutes: number): number => {
  const hours = durationMinutes / 60;
  return hourlyRate * hours;
};

export const calculateTotalEarnings = (sessions: { price: number }[]): number => {
  return sessions.reduce((total, session) => total + session.price, 0);
};

export const calculateAverageRating = (reviews: { rating: number }[]): number => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
};