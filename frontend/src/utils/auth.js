// src/services/auth.js
import api from './api';

export const authAPI = {
  register: (userData) => {
    return api.post('/auth/register', userData)
      .then(response => response.data)
      .catch(error => {
        console.error('API Registration Error:', error);
        throw error;
      });
  },
};

  
  register: (userData) => {
    return api.post('/auth/register', userData)
      .then(response => response.data);
  },
  
  getMe: () => {
    return api.get('/auth/me')
      .then(response => response.data);
  },
};