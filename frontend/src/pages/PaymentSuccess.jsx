import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const reference = new URLSearchParams(location.search).get('reference');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!reference) {
          console.error('No payment reference found');
          setVerificationError('No payment reference found');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setVerificationError('Please log in to verify your payment');
          return;
        }

        setIsVerifying(true);
        const response = await axios.post(
          `http://localhost:8000/api/v1/payments/verify/${reference}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true
          }
        );

        if (response.data.status === 'success') {
          console.log('Payment verified successfully');
          // Clear any stored redirect URLs
          localStorage.removeItem('redirectUrl');
        } else {
          console.error('Payment verification failed');
          setVerificationError('Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationError('Error verifying payment. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    // Only verify if we have a reference and the user is authenticated
    if (reference && isAuthenticated) {
      verifyPayment();
    } else if (reference && !isAuthenticated) {
      // Store the full URL including the reference
      const currentUrl = `${location.pathname}${location.search}`;
      localStorage.setItem('redirectUrl', currentUrl);
      navigate('/login');
    }
  }, [reference, isAuthenticated, location]);

  if (!isAuthenticated) {
    return null; // Let the useEffect handle the redirect
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Payment...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-red-600">
              Verification Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {verificationError}
            </p>
            <button
              onClick={() => navigate('/my-tickets')}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Check My Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your tickets have been sent to your email.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/my-tickets')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View My Tickets
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 