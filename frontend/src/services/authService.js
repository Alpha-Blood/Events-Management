import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add token to all requests if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Regular authentication
  async register(userData) {
    const response = await axiosInstance.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email, password) {
    const response = await axiosInstance.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    await axiosInstance.post('/auth/logout', null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return null;
    }
  },

  // Social authentication
  async getGoogleAuthUrl(fromUrl) {
    const savedRedirect = localStorage.getItem('redirectUrl');
    const redirectTo = fromUrl || savedRedirect || '/';
    this.setRedirectUrl(redirectTo);
    const response = await axios.get(`${API_URL}/auth/google?from_url=${encodeURIComponent(redirectTo)}`);
    return response.data.auth_url;
  },

  async getFacebookAuthUrl(fromUrl) {
    const savedRedirect = localStorage.getItem('redirectUrl');
    const redirectTo = fromUrl || savedRedirect || '/';
    this.setRedirectUrl(redirectTo);
    const response = await axios.get(`${API_URL}/auth/facebook?from_url=${encodeURIComponent(redirectTo)}`);
    return response.data.auth_url;
  },

  // Email verification
  async sendVerificationEmail(token) {
    await axios.post(`${API_URL}/auth/send-verification-email`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async verifyEmail(token) {
    await axios.post(`${API_URL}/auth/verify-email`, { token });
  },

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

  // Redirect helpers
  setRedirectUrl(url) {
    if (
      url &&
      url !== '/login' &&
      !url.startsWith('/auth') &&
      url !== '/register'
    ) {
      localStorage.setItem('redirectUrl', url);
    }
  },
  

  getRedirectUrl() {
    const url = localStorage.getItem('redirectUrl');
    return url || '/';
  },
};

export default authService;
