import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ticketsService from '../services/ticketsService';

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ticketsService.getBuyerTickets(user.email, page, size);
        console.log('Fetched tickets:', response.tickets); // Debug log
        setTickets(response.tickets);
        setTotalTickets(response.total);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message || 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, navigate, page, size]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date Not Available';
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Time Not Available';
    }
  };

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
          <div className="text-center text-red-600">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="mt-2 text-lg text-gray-600">View and manage your event tickets</p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">You don't have any tickets yet.</p>
            <button
              onClick={() => navigate('/events')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
                    <h2 className="text-xl font-bold truncate">
                      {ticket.event?.title || 'Event Title Not Available'}
                    </h2>
                    <p className="text-sm opacity-90">
                      {ticket.event?.start_date 
                        ? formatDate(ticket.event.start_date)
                        : 'Date Not Available'}
                    </p>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6">
                    {/* QR Code */}
                    <div className="mb-6 flex justify-center">
                      {ticket.qr_code_url ? (
                        <img
                          src={ticket.qr_code_url}
                          alt="Ticket QR Code"
                          className="w-48 h-48 object-contain border-2 border-gray-200 rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                          <p className="text-gray-500 text-center">QR Code Loading...</p>
                        </div>
                      )}
                    </div>

                    {/* Ticket Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ticket Type:</span>
                        <span className="font-medium">{ticket.ticket_type_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{ticket.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="font-medium">${ticket.total_price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          ticket.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Venue:</span> {ticket.event?.venue || 'Venue Not Available'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Time:</span>{' '}
                          {ticket.event?.start_date 
                            ? formatTime(ticket.event.start_date)
                            : 'Time Not Available'}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Actions */}
                    <div className="mt-6 flex justify-between items-center">
                      <button
                        onClick={() => ticket.event?.id && navigate(`/events/${ticket.event.id}`)}
                        className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${!ticket.event?.id && 'opacity-50 cursor-not-allowed'}`}
                        disabled={!ticket.event?.id}
                      >
                        View Event
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        Print Ticket
                      </button>
                    </div>
                  </div>
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
