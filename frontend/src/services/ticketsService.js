import api from './api';

const ticketsService = {
  getBuyerTickets: async (buyerEmail, page = 1, size = 10) => {
    try {
      const response = await api.get(`/tickets/buyer/${buyerEmail}`, {
        params: { page, size }
      });

      // Fetch event details for each ticket
      const ticketsWithEvents = await Promise.all(
        response.data.tickets.map(async (ticket) => {
          try {
            if (ticket.event_id) {
              const eventResponse = await api.get(`/events/${ticket.event_id}`);
              return {
                ...ticket,
                event: eventResponse.data,
                // Ensure required fields have default values
                status: ticket.status || 'pending',
                total_price: ticket.total_price || ticket.total_amount || 0,
                qr_code_url: ticket.qr_code_url || null
              };
            }
            return {
              ...ticket,
              event: null,
              status: ticket.status || 'pending',
              total_price: ticket.total_price || ticket.total_amount || 0,
              qr_code_url: ticket.qr_code_url || null
            };
          } catch (error) {
            console.error(`Error fetching event details for ticket ${ticket.id}:`, error);
            return {
              ...ticket,
              event: null,
              status: ticket.status || 'pending',
              total_price: ticket.total_price || ticket.total_amount || 0,
              qr_code_url: ticket.qr_code_url || null
            };
          }
        })
      );

      return {
        ...response.data,
        tickets: ticketsWithEvents
      };
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch tickets');
    }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      let eventData = null;

      if (response.data.event_id) {
        try {
          const eventResponse = await api.get(`/events/${response.data.event_id}`);
          eventData = eventResponse.data;
        } catch (error) {
          console.error('Error fetching event details:', error);
        }
      }

      return {
        ...response.data,
        event: eventData,
        status: response.data.status || 'pending',
        total_price: response.data.total_price || response.data.total_amount || 0,
        qr_code_url: response.data.qr_code_url || null
      };
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch ticket');
    }
  },

  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create ticket');
    }
  },

  updateTicket: async (ticketId, ticketData) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update ticket');
    }
  },

  verifyTicket: async (ticketId) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Error verifying ticket:', error);
      throw new Error(error.response?.data?.detail || 'Failed to verify ticket');
    }
  }
};

export default ticketsService; 