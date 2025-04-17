import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyTickets = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
      } catch (err) {
        setError('Failed to fetch tickets. Please try again later.');
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading your tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
        
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">You haven't purchased any tickets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{ticket.event_title}</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Ticket Type:</span> {ticket.ticket_type_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Quantity:</span> {ticket.quantity}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Total Price:</span> ${ticket.total_price}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        ticket.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Purchase Date:</span>{' '}
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <button
                    onClick={() => window.open(`/tickets/${ticket._id}/download`, '_blank')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
