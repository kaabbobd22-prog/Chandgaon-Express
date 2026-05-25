import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user:        JSON.parse(localStorage.getItem('ce_user') || 'null'),
  token:       localStorage.getItem('ce_token') || null,
  loading:     false,

  sendOTP: async (phone) => {
    set({ loading: true });
    try {
      const data = await api.post('/auth/send-otp', { phone });
      return data;
    } finally { set({ loading: false }); }
  },

  verifyOTP: async (phone, otp) => {
    set({ loading: true });
    try {
      const data = await api.post('/auth/verify-otp', { phone, otp });
      localStorage.setItem('ce_token', data.token);
      localStorage.setItem('ce_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
      return data;
    } finally { set({ loading: false }); }
  },

  updateProfile: async (body) => {
    const data = await api.put('/auth/profile', body);
    const updated = { ...get().user, ...data.user };
    localStorage.setItem('ce_user', JSON.stringify(updated));
    set({ user: updated });
    return data;
  },

  logout: () => {
    localStorage.removeItem('ce_token');
    localStorage.removeItem('ce_user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  isAdmin:    () => get().user?.role === 'admin',
  isRider:    () => get().user?.role === 'rider',
  isCustomer: () => get().user?.role === 'customer',
}));

export default useAuthStore;
