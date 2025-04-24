import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import eventService from '../services/eventService';
import MpesaLogo from '../assets/mpesa-logo.png'; // make sure the path is correct
import { FaCreditCard } from 'react-icons/fa'; // FontAwesome card icon

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');

  // Get event data from location state or saved data
  const savedData = eventService.getEventData();
  const { event, selectedTickets } = location.state || savedData || {};

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('trxref');

    if (reference) {
      verifyPayment(reference);
    }
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const verifyResponse = await api.post(`/payments/verify/${reference}`, {
        payment_method: paymentMethod
      });
      if (verifyResponse.data.status === 'success') {
        // Clear saved event data
        eventService.clearEventData();
        
        navigate('/payment-success', {
          state: {
            event,
            selectedTickets,
            paymentStatus: 'success'
          }
        });
      } else {
        navigate('/payment-failed', {
          state: {
            event,
            selectedTickets,
            paymentStatus: 'failed'
          }
        });
      }
    } catch (err) {
      setError('Payment verification failed. Please contact support.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const total = selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
      
      const response = await api.post('/payments', {
        event_id: event.id,
        amount: total,
        email: email,
        name: name,
        phone: phone,
        callback_url: `${window.location.origin}/checkout`,
        payment_method: paymentMethod,
        tickets: selectedTickets.map(ticket => ({
          name: ticket.name,
          quantity: ticket.quantity,
          price: ticket.price
        }))
      });

      if (paymentMethod === 'paystack') {
        // For card payments, redirect to Paystack payment page
        if (response.data.paystack_authorization_url) {
          window.location.href = response.data.paystack_authorization_url;
        } else {
          setError('No payment URL received from server');
          setIsProcessing(false);
        }
      } else {
        // For mobile money payments, show success message and wait for payment confirmation
        navigate('/payment-pending', {
          state: {
            event,
            selectedTickets,
            paymentReference: response.data.paystack_reference
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!event || !selectedTickets) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No tickets selected</h2>
          <p className="mt-2 text-gray-600">Please select tickets from the event page first.</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const total = selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-12">Checkout</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="mb-6">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
              <p className="text-gray-600">{event.date}</p>
              <p className="text-gray-600">{event.venue}</p>
            </div>

            <div className="space-y-4">
              {selectedTickets.map((ticket, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{ticket.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {ticket.quantity}</p>
                  </div>
                  <p className="text-gray-900">KSH {(ticket.price * ticket.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">KSH {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Payment Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bank & M-Pesa</h2>
            <p className="text-sm text-gray-600 mb-6">You can pay using M-Pesa or your bank card, fill in the details below and click on the button to proceed with payment, a pop up will appear to select your payment method</p>

            <div className="flex items-center space-x-4 mb-6">
              <img src={MpesaLogo} alt="M-Pesa" className="h-10" />
              <FaCreditCard className="text-3xl text-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="2547XXXXXXXX"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Format: 2547XXXXXXXX</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
