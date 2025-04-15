import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import eventService from '../services/eventService';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    const fetchEventAndFeatured = async () => {
      try {
        setLoading(true);
        const [eventData, featuredData] = await Promise.all([
          eventService.getEventById(id),
          eventService.getFeaturedEvents(1, 4)
        ]);
        setEvent(eventData);
        setFeaturedEvents(featuredData.events || []);
        // Initialize ticket counts
        const initialCounts = {};
        eventData.ticket_types.forEach(ticket => {
          initialCounts[ticket.name] = 0;
        });
        setSelectedTickets(initialCounts);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndFeatured();
  }, [id]);

  const handleDecrement = (ticketName) => {
    if (selectedTickets[ticketName] > 0) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketName]: prev[ticketName] - 1
      }));
    }
  };

  const handleIncrement = (ticketName) => {
    const ticket = event.ticket_types.find(t => t.name === ticketName);
    if (selectedTickets[ticketName] < ticket.quantity) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketName]: prev[ticketName] + 1
      }));
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.ticket_types.reduce((total, ticket) => {
      return total + (ticket.price * (selectedTickets[ticket.name] || 0));
    }, 0);
  };

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

  const handleGetTickets = () => {
    if (totalTickets === 0) {
      alert('Please select at least one ticket');
      return;
    }

    const ticketsToBook = event.ticket_types
      .filter(ticket => selectedTickets[ticket.name] > 0)
      .map(ticket => ({
        ticket_type_name: ticket.name,
        quantity: selectedTickets[ticket.name],
        price: ticket.price,
        total: ticket.price * selectedTickets[ticket.name]
      }));

    navigate('/checkout', {
      state: {
        event_id: event.id,
        event_title: event.title,
        event_date: event.start_date,
        event_venue: event.venue,
        tickets: ticketsToBook,
        total_amount: calculateTotal()
      }
    });
  };

  const handleShowMore = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">Error loading event. Please try again later.</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Event not found</div>
      </div>
    );
  }

  const formattedDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile View */}
      <div className="lg:hidden relative h-[60vh] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${event.image_url || 'https://via.placeholder.com/1200x600?text=Event+Image'})`,
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

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
                <span className="text-xl">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xl">{event.venue}</span>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="mt-4 flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
            >
              <span>Read More</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transform transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isDrawerOpen && (
              <p className="mt-4 text-white text-lg">{event.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex gap-12">
            <div className="flex-1 text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                {event.title}
              </h1>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xl">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xl">{event.venue}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
              >
                <span>Read More</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transform transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isDrawerOpen && (
                <p className="mt-6 text-white text-lg">{event.description}</p>
              )}
            </div>

            <div className="w-96 h-96 self-start">
              <img
                src={event.image_url || 'https://via.placeholder.com/1200x600?text=Event+Image'}
                alt={event.title}
                className="w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Selection Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Select Tickets</h2>
        <div className="space-y-6">
          {event.ticket_types.map((ticket) => (
            <div key={ticket.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{ticket.name}</h3>
                  <p className="text-gray-600">KES {ticket.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{ticket.quantity} tickets remaining</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDecrement(ticket.name)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={selectedTickets[ticket.name] === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{selectedTickets[ticket.name] || 0}</span>
                  <button
                    onClick={() => handleIncrement(ticket.name)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={selectedTickets[ticket.name] === ticket.quantity}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div>
            <p className="text-gray-600">Total Tickets: {totalTickets}</p>
            <p className="text-xl font-semibold">Total: KES {calculateTotal().toLocaleString()}</p>
          </div>
          <button
            onClick={handleGetTickets}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={totalTickets === 0}
          >
            Get Tickets
          </button>
        </div>
      </div>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="bg-gray-50 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">
              Featured Events
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {featuredEvents
                .filter(e => e.id !== event.id)
                .map((featuredEvent) => (
                  <EventCard 
                    key={featuredEvent.id} 
                    event={featuredEvent} 
                  />
                ))
              }
            </div>

            <div className="flex justify-center mt-8 sm:mt-12">
              <button 
                onClick={handleShowMore}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                Show More
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default EventDetails;