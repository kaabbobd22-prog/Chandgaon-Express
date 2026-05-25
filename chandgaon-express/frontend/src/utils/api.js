import axios from 'axios';

const api = axios.create({ 
  // এখানে আপনার আসল Render ব্যাকএন্ডের লিংকটি বসান (শেষে যেন /api থাকে)
  baseURL: 'https://chandgaon-express.onrender.com/api', 
  withCredentials: true 
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ce_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ce_token');
      localStorage.removeItem('ce_user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;