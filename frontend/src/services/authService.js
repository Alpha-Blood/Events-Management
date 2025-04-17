import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';
const FRONTEND_GOOGLE_CALLBACK = 'http://localhost:5173/auth/google/callback';
const FRONTEND_FACEBOOK_CALLBACK = 'http://localhost:5173/auth/facebook/callback';

const authService = {
  // Regular authentication
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed';
    }
  },

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Login failed';
    }
  },

  async logout() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    await axios.post(`${API_URL}/auth/logout`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(token) {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Social authentication
  async getGoogleAuthUrl(fromUrl = window.location.pathname) {
    const response = await axios.get(`${API_URL}/auth/google?from_url=${encodeURIComponent(fromUrl)}`);
    return response.data.auth_url;
  },

  async getFacebookAuthUrl(fromUrl = window.location.pathname) {
    const response = await axios.get(`${API_URL}/auth/facebook?from_url=${encodeURIComponent(fromUrl)}`);
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
  },

  // Store redirect URL in localStorage
  setRedirectUrl(url) {
    localStorage.setItem('redirectUrl', url);
  },

  // Get and clear redirect URL
  getRedirectUrl() {
    const url = localStorage.getItem('redirectUrl');
    localStorage.removeItem('redirectUrl');
    return url || '/';
  }
};

export default authService; 