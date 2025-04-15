// src/components/EventsSection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import eventService from '../services/eventService';

const EventSection = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getFeaturedEvents(1, 6);
        setEvents(response.events || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching featured events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const handleShowMore = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md max-w-sm animate-pulse">
                <div className="w-full h-[200px] sm:h-[300px] bg-gray-200" />
                <div className="p-3 sm:p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-50 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">
            Upcoming Events
          </h2>
          <div className="text-center text-red-500">
            Error loading events. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">
          Upcoming Events
        </h2>

        {events.length === 0 ? (
          <div className="text-center text-gray-500">
            No upcoming events found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
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
          </>
        )}
      </div>
    </section>
  );
};

export default EventSection;