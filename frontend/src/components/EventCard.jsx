// src/components/EventCard.jsx
import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition hover:shadow-xl max-w-sm">
      <div className="relative w-full h-[200px] sm:h-[300px] bg-gray-100">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-white text-red-700 font-semibold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full shadow">
          {event.date}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600">{event.venue}</p>
        <div className="flex justify-end mt-1 sm:mt-2">
          <div className="border border-blue-600 rounded-lg px-2 sm:px-3 py-0.5 sm:py-1">
            <p className="text-xs sm:text-sm text-blue-600 font-bold">KES {event.price.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

