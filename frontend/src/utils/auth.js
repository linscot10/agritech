// src/services/auth.js
import api from './api';

export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password })
      .then(response => response.data);
  },
  
  register: (userData) => {
    return api.post('/auth/register', userData)
      .then(response => response.data);
  },
  
  getMe: () => {
    return api.get('/auth/me')
      .then(response => response.data);
  },
};