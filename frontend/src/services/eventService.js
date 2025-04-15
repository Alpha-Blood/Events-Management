import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const eventService = {
  // Get all events with optional filters
  getEvents: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters if they exist
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.size) params.append('size', filters.size);
      
      const response = await api.get(`/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch events');
    }
  },

  // Get featured events
  getFeaturedEvents: async (page = 1, size = 4) => {
    try {
      const response = await api.get(`/events/featured?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch featured events');
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch event');
    }
  },

  // Get event categories
  getCategories: async () => {
    try {
      const response = await api.get('/events/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch categories');
    }
  },

  // Create a new event (admin only)
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create event');
    }
  },

  // Update an event (admin only)
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update event');
    }
  },

  // Delete an event (admin only)
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete event');
    }
  },

  // Update event featured status (admin only)
  updateFeaturedStatus: async (id, featured) => {
    try {
      const response = await api.patch(`/events/${id}/featured`, { featured });
      return response.data;
    } catch (error) {
      console.error('Error updating featured status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update featured status');
    }
  }
};

export default eventService; 