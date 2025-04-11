// src/components/EventsSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from './EventCard';
import concertImage from '../assets/events/concert.jpg';
import artImage from '../assets/events/art.jpg';
import techImage from '../assets/events/tech.jpg';
import image5 from '../assets/events/hero-bg2.jpg';

const events = [
  {
    id: 1,
    image: concertImage,
    title: 'The Big 6 Round Table',
    date: '2 May',
    venue: 'The O2',
    price: 495000,
  },
  {
    id: 2,
    image: artImage,
    title: 'AFROBEATS FESTIVAL 2025',
    date: '15 June',
    venue: 'Nyayo Stadium',
    price: 2500,
  },
  {
    id: 3,
    image: techImage,
    title: 'Tech Conference 2024',
    date: '15 June',
    venue: 'KICC',
    price: 2500,
  },
  {
    id: 4,
    image: image5,
    title: 'Art Exhibition',
    date: '20 June',
    venue: 'National Museum',
    price: 2500,
  }
];

const EventSection = () => {
  const navigate = useNavigate();

  const handleShowMore = () => {
    navigate('/events');
  };

  return (
    <section className="bg-gray-50 py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">
          Upcoming Events
        </h2>

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
      </div>
    </section>
  );
};

export default EventSection;
