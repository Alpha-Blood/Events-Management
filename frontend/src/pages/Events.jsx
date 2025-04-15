import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import Header from '../components/Header';
import eventService from '../services/eventService';
import image6 from '../assets/events/hero-bg3.jpg';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const pageSize = 12;

  // Effect to handle URL search params
  useEffect(() => {
    const search = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    if (search) {
      setSearchTerm(search);
    }
    fetchEvents(search, startDate);
  }, [searchParams]);

  const fetchEvents = async (search = searchTerm, startDate = null, currentPage = page) => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        search: search,
        start_date: startDate,
        page: currentPage,
        size: pageSize
      });
      setEvents(response.events || []);
      setTotalEvents(response.total || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    setSearchParams({ search: searchTerm });
    fetchEvents(searchTerm, null, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchEvents(searchTerm, null, newPage);
  };

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.start_date) - new Date(b.start_date);
    } else if (sortBy === 'price') {
      const aPrice = a.ticket_types?.[0]?.price || 0;
      const bPrice = b.ticket_types?.[0]?.price || 0;
      return aPrice - bPrice;
    }
    return 0;
  });

  const totalPages = Math.ceil(totalEvents / pageSize);

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
          <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          </form>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {[...Array(8)].map((_, index) => (
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
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading events. Please try again later.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                {sortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* No Results Message */}
              {sortedEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No events found matching your search.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 sm:mt-12">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;