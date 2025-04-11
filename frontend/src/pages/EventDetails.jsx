import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketCounts, setTicketCounts] = useState({
    earlyBird: 0,
    advance: 0,
    advancePhase1: 0
  });

  // Simulated event data - replace with actual API call
  useEffect(() => {
    // This is mock data - replace with your actual API call
    const mockEvent = {
      id: id,
      title: "Choma Fest",
      date: "19 Apr",
      venue: "Kastemil Gardens",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      description: "Join us for an amazing evening of food, music, and fun!",
      tickets: [
        { id: 'earlyBird', name: 'Early Bird', price: 500 },
        { id: 'advance', name: 'Advance', price: 700 },
        { id: 'advancePhase1', name: 'Advance Phase 1', price: 1000 }
      ]
    };
    setEvent(mockEvent);
  }, [id]);

  const handleDecrement = (ticketId) => {
    if (ticketCounts[ticketId] > 0) {
      setTicketCounts(prev => ({
        ...prev,
        [ticketId]: prev[ticketId] - 1
      }));
    }
  };

  const handleIncrement = (ticketId) => {
    setTicketCounts(prev => ({
      ...prev,
      [ticketId]: prev[ticketId] + 1
    }));
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.tickets.reduce((total, ticket) => {
      return total + (ticketCounts[ticket.id] * ticket.price);
    }, 0);
  };

  const totalTickets = Object.values(ticketCounts).reduce((a, b) => a + b, 0);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Event Banner Section */}
      <div className="relative h-[60vh] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${event.image}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Event Title Section */}
        <div className="relative h-full flex flex-col justify-end pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xl">{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xl">{event.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">TICKETS</h2>
          
          <div className="space-y-6">
            {event.tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{ticket.name}</h3>
                  <p className="text-gray-600">KSH {ticket.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDecrement(ticket.id)}
                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{ticketCounts[ticket.id]}</span>
                  <button
                    onClick={() => handleIncrement(ticket.id)}
                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Tickets</span>
                <span>{totalTickets}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Processing fees</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Applied discount (0%)</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>KSH {calculateTotal()}</span>
              </div>
            </div>

            <button 
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              disabled={totalTickets === 0}
            >
              Get Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
