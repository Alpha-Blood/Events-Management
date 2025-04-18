// src/components/EventCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  if (!event) {
    return null;
  }

  const handleNavigate = () => {
    if (event.id) {
      navigate(`/events/${event.id}`);
    }
  };

  // Format date
  const formattedDate = new Date(event.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Get the lowest ticket price
  const ticketPrice = event.ticket_types?.length > 0
    ? Math.min(...event.ticket_types.map(t => t.price))
    : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition hover:shadow-xl max-w-sm">
      <div 
        onClick={handleNavigate}
        className="relative w-full h-[200px] sm:h-[300px] bg-gray-100 cursor-pointer"
      >
        <img
          src={event.image_url || 'https://via.placeholder.com/300x200?text=Event+Image'}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-white text-red-700 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full shadow">
          {formattedDate}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
        <h3 
          onClick={handleNavigate}
          className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
        >
          {event.title}
        </h3>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-gray-600">{event.venue}</p>
          <p className="text-xs sm:text-sm text-blue-600">KES {ticketPrice.toLocaleString()}</p>
        </div>
        <div className="flex justify-end mt-2 sm:mt-3">
          <button 
            onClick={handleNavigate}
            className="border border-blue-600 hover:bg-blue-200 text-blue-600 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg transition-colors duration-200"
          >
            Buy Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
