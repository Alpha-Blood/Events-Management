import api from './api';

const ticketsService = {
  getBuyerTickets: async (buyerEmail, page = 1, size = 10) => {
    try {
      const response = await api.get(`/tickets/buyer/${buyerEmail}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ticketsService; 