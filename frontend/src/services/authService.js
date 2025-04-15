import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const authService = {
  // Regular authentication
  async register(data) {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  async logout(token) {
    await axios.post(`${API_URL}/auth/logout`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async getCurrentUser(token) {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Social authentication
  async getGoogleAuthUrl() {
    const response = await axios.get(`${API_URL}/auth/google`);
    return response.data.auth_url;
  },

  async getFacebookAuthUrl() {
    const response = await axios.get(`${API_URL}/auth/facebook`);
    return response.data.auth_url;
  },

  // Email verification
  async sendVerificationEmail(token) {
    await axios.post(`${API_URL}/auth/send-verification-email`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async verifyEmail(token) {
    await axios.post(`${API_URL}/auth/verify-email`, { token });
  },

  // Password reset
  async requestPasswordReset(email) {
    await axios.post(`${API_URL}/auth/reset-password`, { email });
  },

  async resetPassword(token, newPassword) {
    await axios.post(`${API_URL}/auth/reset-password/confirm`, { token, newPassword });
  },

  // Token management
  setToken(token) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
  }
};

export default authService; 