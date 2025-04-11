import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import concertImage from '../assets/events/concert.jpg';
import artImage from '../assets/events/art.jpg';
import techImage from '../assets/events/tech.jpg';
import image5 from '../assets/events/hero-bg2.jpg';
import EventCard from '../components/EventCard';

// This should match the events data from EventSection and Events page
const allEvents = [
  {
    id: 1,
    image: concertImage,
    title: 'The Big 6 Round Table',
    date: '2 May',
    venue: 'The O2',
    description: 'Join us for an exclusive round table discussion with industry leaders. This event will feature insightful conversations about the future of technology and business in Africa. Network with professionals and gain valuable insights from our distinguished panel of speakers.',
    tickets: [
      { id: 'earlyBird', name: 'Early Bird', price: 495000, available: 50 },
      { id: 'vip', name: 'VIP', price: 750000, available: 20 },
      { id: 'vvip', name: 'VVIP', price: 1000000, available: 10 }
    ]
  },
  {
    id: 2,
    image: artImage,
    title: 'AFROBEATS FESTIVAL 2025',
    date: '15 June',
    venue: 'Nyayo Stadium',
    description: 'Experience the biggest Afrobeat music festival in East Africa! Featuring top artists from across the continent, this event promises an unforgettable night of music, dance, and celebration of African culture.',
    tickets: [
      { id: 'standard', name: 'Standard', price: 2500, available: 1000 },
      { id: 'vip', name: 'VIP', price: 5000, available: 200 }
    ]
  },
  {
    id: 3,
    image: techImage,
    title: 'Tech Conference 2024',
    date: '15 June',
    venue: 'KICC',
    description: 'The premier technology conference in East Africa, bringing together innovators, entrepreneurs, and tech enthusiasts. Learn about the latest trends, network with industry leaders, and discover new opportunities in the tech space.',
    tickets: [
      { id: 'earlyBird', name: 'Early Bird', price: 15000, available: 100 },
      { id: 'standard', name: 'Standard', price: 20000, available: 300 }
    ]
  },
  {
    id: 4,
    image: image5,
    title: 'Art Exhibition',
    date: '20 June',
    venue: 'National Museum',
    description: 'A showcase of contemporary African art featuring works from emerging and established artists. This exhibition explores themes of identity, culture, and social change through various artistic mediums.',
    tickets: [
      { id: 'standard', name: 'Standard', price: 2500, available: 500 }
    ]
  }
];

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ticketCounts, setTicketCounts] = useState({});

  useEffect(() => {
    const foundEvent = allEvents.find(e => e.id === parseInt(id));
    if (foundEvent) {
      setEvent(foundEvent);
      // Initialize ticket counts for each ticket type
      const initialCounts = {};
      foundEvent.tickets.forEach(ticket => {
        initialCounts[ticket.id] = 0;
      });
      setTicketCounts(initialCounts);
    }
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
    const ticket = event.tickets.find(t => t.id === ticketId);
    if (ticketCounts[ticketId] < ticket.available) {
      setTicketCounts(prev => ({
        ...prev,
        [ticketId]: prev[ticketId] + 1
      }));
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.tickets.reduce((total, ticket) => {
      return total + (ticket.price * (ticketCounts[ticket.id] || 0));
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
      {/* Mobile View */}
      <div className="lg:hidden relative h-[60vh] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${event.image}')`,
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
            {/* Event Details */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                {event.title}
              </h1>
              <div className="flex flex-col gap-4 mb-6">
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

            {/* Event Image */}
            <div className="w-96 h-96 self-start">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover rounded-lg shadow-xl"
              />
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
                  <p className="text-gray-600">KSH {ticket.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Available: {ticket.available}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDecrement(ticket.id)}
                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={ticketCounts[ticket.id] === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{ticketCounts[ticket.id] || 0}</span>
                  <button
                    onClick={() => handleIncrement(ticket.id)}
                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={ticketCounts[ticket.id] === ticket.available}
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
                <span>KSH {calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalTickets === 0}
            >
              Get Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Other Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Other Events You Might Like</h2>
          <p className="mt-4 text-gray-600">Discover more exciting events happening soon</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {allEvents
            .filter(e => e.id !== parseInt(id))
            .map(event => (
              <EventCard
                key={event.id}
                id={event.id}
                image={event.image}
                title={event.title}
                date={event.date}
                venue={event.venue}
                price={event.tickets[0].price}
              />
            ))
          }
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Show More
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
