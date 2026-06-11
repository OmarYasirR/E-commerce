import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './index.css';

// Import toast styles if using react-toastify
import 'react-toastify/dist/ReactToastify.css';

// Initialize theme from localStorage
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return theme;
};

// Initialize theme before rendering
initializeTheme();

// Add loading indicator removal
const removeLoadingIndicator = () => {
  const loadingElement = document.getElementById('initial-loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.remove();
    }, 300);
  }
};

// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with strict mode in development
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
  
  // Remove loading indicator after render
  setTimeout(removeLoadingIndicator, 100);
};

renderApp();

// Enable Hot Module Replacement in development
if (import.meta.env.DEV && module.hot) {
  module.hot.accept('./App', () => {
    renderApp();
  });
  
  module.hot.accept('./store', () => {
    // Handle store hot reload
    const newStore = require('./store').store;
    renderApp();
  });
}

// Log environment in development
if (import.meta.env.DEV) {
  console.log('🚀 App running in development mode');
  console.log(`📍 API URL: ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}`);
  console.log(`🎨 Theme: ${initializeTheme()}`);
}

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}