import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';
import { FarmStoreProvider } from './state/FarmStoreProvider';
import App from './App.tsx';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service Worker registration failed gracefully
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FarmStoreProvider>
      <App />
    </FarmStoreProvider>
  </StrictMode>
);
