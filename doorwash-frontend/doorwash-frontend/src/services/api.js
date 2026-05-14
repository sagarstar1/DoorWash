import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://doorwash.onrender.com/api',
  withCredentials: true,
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('doorwash_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const msg = err.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('doorwash_token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    } else if (status === 404) {
      toast.error(msg);
    } else if (status >= 500) {
      toast.error('Server error. Please try again.');
    } else if (status !== 400) {
      // 400s handled by forms themselves
      toast.error(msg);
    }

    return Promise.reject(err);
  }
);

export default api;
