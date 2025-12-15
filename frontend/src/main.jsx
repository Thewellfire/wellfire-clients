import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppOptimized from './AppOptimized.jsx'
import ShopContextProvider from './context/ShopContext.jsx'
import './index.css'
import './styles/animations.css'

// Performance optimizations
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, continue without it
    });
  });
}

// Add preload class to prevent transitions during initial load
document.body.classList.add('preload');

// Remove preload class after DOM is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('preload');
  }, 100);
});

// Enable concurrent features
const root = ReactDOM.createRoot(document.getElementById("root"), {
  unstable_concurrentFeatures: true
});

root.render(
  <BrowserRouter>
    <ShopContextProvider>
      <AppOptimized />
    </ShopContextProvider>
  </BrowserRouter>
);
