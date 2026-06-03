import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user } = response.data;
          
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error?.message || 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
        
        delete api.defaults.headers.common['Authorization'];
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await api.get('/auth/me');
          set({
            user: response.data,
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'so-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);