import React, { useState } from 'react';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import concertImage from '../assets/events/concert.jpg';
import artImage from '../assets/events/art.jpg';
import techImage from '../assets/events/tech.jpg';
import image5 from '../assets/events/hero-bg2.jpg';
import image6 from '../assets/events/hero-bg3.jpg'

// Sample events data - replace with your actual data source
const sampleEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    venue: "Central Park, Nairobi",
    date: "15 Dec 2023",
    price: 2500,
    image: concertImage
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    venue: "KICC, Nairobi",
    date: "20 Dec 2023",
    price: 5000,
    image: artImage
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    venue: "Sarit Centre, Nairobi",
    date: "25 Dec 2023",
    price: 1500,
    image: techImage
  },
  {
    id: 4,
    title: "Art Exhibition",
    venue: "National Museum, Nairobi",
    date: "30 Dec 2023",
    price: 1000,
    image: image5
  },
  {
    id: 5,
    title: "Comedy Night",
    venue: "Carnivore Grounds, Nairobi",
    date: "5 Jan 2024",
    price: 2000,
    image: artImage
  },
  {
    id: 6,
    title: "Fashion Show",
    venue: "Two Rivers Mall, Nairobi",
    date: "10 Jan 2024",
    price: 3000,
    image: concertImage
  }
];

const Events = () => {
  const [events] = useState(sampleEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Filter and sort events
  const filteredEvents = events
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });

  return (
    <>
      <Header 
        title="Discover Events" 
        subtitle="Find and book tickets for amazing events happening around you"
        backgroundImage={image6}
      />
      <section className="bg-gray-50 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-96">
              <input
                type="text"
                placeholder="Search events or venues..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* No Results Message */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No events found matching your search.</p>
            </div>
          )}

          <div className="flex justify-center mt-8 sm:mt-12">

          </div>
        </div>
      </section>
    </>
  );
};

export default Events;
