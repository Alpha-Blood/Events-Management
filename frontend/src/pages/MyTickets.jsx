import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ticketsService from '../services/ticketsService';

const MyTickets = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketsService.getBuyerTickets(user.email, page, size);
        setTickets(response.tickets);
        setTotalTickets(response.total);
      } catch (err) {
        setError('Failed to fetch tickets. Please try again later.');
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated, navigate, user, page, size]);

  const totalPages = Math.ceil(totalTickets / size);

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
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
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
            <p className="text-gray-500 text-lg">You haven't purchased any tickets yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-2">{ticket.event_name}</h2>
                  <p className="text-gray-600 mb-2">Ticket ID: {ticket.id}</p>
                  <p className="text-gray-600 mb-2">Status: {ticket.status}</p>
                  <p className="text-gray-600 mb-2">Quantity: {ticket.quantity}</p>
                  <p className="text-gray-600 mb-2">Total Price: ${ticket.total_price}</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
