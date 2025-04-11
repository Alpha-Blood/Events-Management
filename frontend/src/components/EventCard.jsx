// src/components/EventCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, id, image, title, date, venue, price }) => {
  const navigate = useNavigate();

  // Use either the event object or individual props
  const eventData = event || { id, image, title, date, venue, price };

  const handleNavigate = () => {
    navigate(`/events/${eventData.id}`);
  };

  if (!eventData || !eventData.image) {
    return null; // or a loading/error state
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition hover:shadow-xl max-w-sm">
      <div 
        onClick={handleNavigate}
        className="relative w-full h-[200px] sm:h-[300px] bg-gray-100 cursor-pointer"
      >
        <img
          src={eventData.image}
          alt={eventData.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-white text-red-700 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full shadow">
          {eventData.date}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
        <h3 
          onClick={handleNavigate}
          className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
        >
          {eventData.title}
        </h3>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-gray-600">{eventData.venue}</p>
          <p className="text-xs sm:text-sm text-blue-600">KES {eventData.price.toLocaleString()}</p>
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

