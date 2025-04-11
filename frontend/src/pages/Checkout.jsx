import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardIcon, MpesaIcon, PayPalIcon } from '../components/PaymentIcons';

const PaymentMethods = {
  CARD: 'card',
  MPESA: 'mpesa',
  PAYPAL: 'paypal'
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, selectedTickets } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethods.CARD);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [mpesaData, setMpesaData] = useState({
    phoneNumber: ''
  });

  const [paypalData, setPaypalData] = useState({
    email: ''
  });

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMpesaChange = (e) => {
    const { name, value } = e.target;
    setMpesaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaypalChange = (e) => {
    const { name, value } = e.target;
    setPaypalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle payment processing based on selected method
    console.log('Payment submitted:', { paymentMethod });
    // Navigate to success page after successful payment
    navigate('/payment-success');
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary - Left Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Event Image and Details */}
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
            
            {/* Tickets Summary */}
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

            {/* Total */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">KSH {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Information - Right Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
            
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setPaymentMethod(PaymentMethods.CARD)}
                className={`p-4 text-center rounded-lg border flex flex-col items-center justify-center space-y-2 ${
                  paymentMethod === PaymentMethods.CARD
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <CardIcon />
                <span>Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod(PaymentMethods.MPESA)}
                className={`p-4 text-center rounded-lg border flex flex-col items-center justify-center space-y-2 ${
                  paymentMethod === PaymentMethods.MPESA
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <MpesaIcon />
                <span>M-Pesa</span>
              </button>
              <button
                onClick={() => setPaymentMethod(PaymentMethods.PAYPAL)}
                className={`p-4 text-center rounded-lg border flex flex-col items-center justify-center space-y-2 ${
                  paymentMethod === PaymentMethods.PAYPAL
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <PayPalIcon />
                <span>PayPal</span>
              </button>
            </div>

            {/* Payment Forms */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {paymentMethod === PaymentMethods.CARD && (
                <>
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={cardData.cardName}
                      onChange={handleCardChange}
                      className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardChange}
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="MM/YY"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === PaymentMethods.MPESA && (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={mpesaData.phoneNumber}
                    onChange={handleMpesaChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="254712345678"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    You will receive an M-Pesa prompt on your phone to complete the payment
                  </p>
                </div>
              )}

              {paymentMethod === PaymentMethods.PAYPAL && (
                <div>
                  <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    id="paypalEmail"
                    name="email"
                    value={paypalData.email}
                    onChange={handlePaypalChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    You will be redirected to PayPal to complete your payment
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                Pay KSH {total.toLocaleString()}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;