import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../common/Button';
import { formatPrice } from '../../utils';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const PaymentFormInner: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setCardError(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess();
    }

    setIsProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-500">{cardError}</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount to pay</span>
          <span className="text-xl font-bold text-gray-900">{formatPrice(amount)}</span>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isProcessing}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay ${formatPrice(amount)}`}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe
      </div>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
        <PaymentFormInner {...props} />
      </div>
    </Elements>
  );
};

export default PaymentForm;