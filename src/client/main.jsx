import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './components/Toast';
import './index.css';
import api from './api/client';

// Suppress all known development warnings (these are not errors)
const originalError = console.error.bind(console.error);
console.error = (...args) => {
  const msg = args[0]?.toString?.() || '';
  // Recharts dimension warning
  if (msg.includes('width(-1)') || msg.includes('should be greater than 0')) return;
  // React end attribute warning
  if (msg.includes('Received `true` for a non-boolean attribute `end`')) return;
  originalError(...args);
};

// Rehydrate Authorization header from persisted storage on startup
const rehydrateToken = () => {
  try {
    const raw = localStorage.getItem('so-auth-storage') || localStorage.getItem('so-auth-storage-ALT');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token || parsed?.token || parsed?.accessToken;
      if (token && token.length > 0) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('[Auth] Token rehydrated on startup');
        return true;
      }
    }
  } catch (e) {
    console.error('[Auth] Token rehydration failed:', e);
  }
  return false;
};

rehydrateToken();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);