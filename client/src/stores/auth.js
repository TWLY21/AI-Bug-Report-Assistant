import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('bugsense_token') || null,
    user: null,
    initialized: false,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
  },
  actions: {
    async initializeAuth() {
      if (!this.token) {
        this.initialized = true;
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        this.user = data.user;
      } catch {
        this.logout();
      } finally {
        this.initialized = true;
      }
    },
    async register(payload) {
      this.loading = true;
      try {
        const { data } = await api.post('/auth/register', payload);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('bugsense_token', data.token);
      } finally {
        this.loading = false;
      }
    },
    async login(payload) {
      this.loading = true;
      try {
        const { data } = await api.post('/auth/login', payload);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('bugsense_token', data.token);
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('bugsense_token');
    },
  },
});
