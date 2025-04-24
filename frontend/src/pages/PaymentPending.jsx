import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const PaymentPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const { event, selectedTickets, paymentReference } = location.state || {};

  useEffect(() => {
    if (!paymentReference) {
      navigate('/');
      return;
    }

    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        const response = await api.post(`/payments/verify/${paymentReference}`, {
          payment_method: 'mpesa'
        });

        if (response.data.status === 'success') {
          navigate('/payment-success', {
            state: {
              event,
              selectedTickets,
              paymentStatus: 'success'
            }
          });
        } else if (response.data.status === 'failed') {
          navigate('/payment-failed', {
            state: {
              event,
              selectedTickets,
              paymentStatus: 'failed'
            }
          });
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Error verifying payment');
      } finally {
        setIsVerifying(false);
      }
    };

    // Check payment status every 5 seconds
    const interval = setInterval(verifyPayment, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [paymentReference, event, selectedTickets, navigate]);

  if (!event || !selectedTickets) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <ClockIcon className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Pending
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please complete your M-Pesa payment on your phone. We'll automatically verify your payment.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {isVerifying && (
            <p className="mt-2 text-sm text-gray-600">
              Verifying payment...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPending; 