// // src/services/api.js
// import axios from 'axios';

// // import { mockWeatherData } from '../utils/mockWeather';
// import { mockAnalyticsData } from '../utils/mockAnalytics';
// import { mockForumData } from '../utils/mockForum';
// import { mockNotificationsData } from '../utils/mockNotifications';
// import { mockProgramsData } from '../utils/mockPrograms';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // ===== Request Interceptor (Adds Auth Token) ===== //
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ===== Response Interceptor (Handles 401) ===== //
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // ===== Mock API Logic for Development (localhost only) ===== //
// const isMock = !import.meta.env.VITE_API_URL || API_BASE_URL === 'http://localhost:5000/api';

// if (isMock) {
//   const originalGet = api.get;
//   const originalPost = api.post;
//   const originalPut = api.put;
//   const originalDelete = api.delete;

//   api.get = async (url, ...rest) => {
//     if (url.startsWith('/weather')) {
//       const params = new URLSearchParams(url.split('?')[1]);
//       const city = params.get('city');
//       return mockWeatherData.get(city);
//     }

//     if (url.startsWith('/analytics')) {
//       return mockAnalyticsData.get(url);
//     }

//     if (url.startsWith('/posts')) {
//       return mockForumData.get(url);
//     }

//     if (url.startsWith('/notifications')) {
//       return mockNotificationsData.get(url);
//     }

//     if (url.startsWith('/programs')) {
//       return mockProgramsData.get(url);
//     }

//     return originalGet.call(api, url, ...rest);
//   };

//   api.post = async (url, data, ...rest) => {
//     if (url.startsWith('/posts') && (url.includes('/like') || url.includes('/comments'))) {
//       return mockForumData.post(url, data);
//     }

//     if (url === '/posts') {
//       return mockForumData.post(url, data);
//     }

//     if (url.includes('/programs') && url.includes('/apply')) {
//       return mockProgramsData.post(url, data);
//     }

//     if (url === '/programs') {
//       return mockProgramsData.post(url, data);
//     }

//     return originalPost.call(api, url, data, ...rest);
//   };

//   api.put = async (url, data, ...rest) => {
//     if (url.includes('/posts/')) {
//       await new Promise(resolve => setTimeout(resolve, 800));
//       return { data: { ...data, _id: url.split('/').pop() } };
//     }

//     if (url.includes('/notifications/') && url.includes('/read')) {
//       return mockNotificationsData.put(url);
//     }

//     if (url.includes('/programs/')) {
//       return mockProgramsData.put(url, data);
//     }

//     return originalPut.call(api, url, data, ...rest);
//   };

//   api.delete = async (url, ...rest) => {
//     if (url.includes('/posts/')) {
//       await new Promise(resolve => setTimeout(resolve, 800));
//       return { data: { success: true } };
//     }

//     if (url.includes('/notifications/')) {
//       return mockNotificationsData.delete(url);
//     }

//     if (url.includes('/programs/')) {
//       return mockProgramsData.delete(url);
//     }

//     return originalDelete.call(api, url, ...rest);
//   };
// }


// export const authAPI = {
//   login: (credentials) => api.post('/auth/login', credentials),
//   register: (userData) => api.post('/auth/register', userData),
//   getMe: () => api.get('/auth/me'),
// };

// export const weatherAPI = {
//   getWeather: (city) => api.get(`/weather?city=${encodeURIComponent(city)}`),
// };


// export default api;


// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ===== Request Interceptor (Adds Auth Token) ===== //
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor (Handles 401) ===== //
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export auth API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const weatherAPI = {
  getWeather: (city) => api.get(`/weather?city=${encodeURIComponent(city)}`),
};

export default api;