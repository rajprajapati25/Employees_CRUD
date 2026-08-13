// Protect window.fetch against re-assignment errors in strict browser environments
if (typeof window !== 'undefined' && window.fetch) {
  try {
    let _fetchImpl = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      get: () => _fetchImpl,
      set: (fn) => {
        if (typeof fn === 'function') {
          _fetchImpl = fn;
        }
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // Ignore if property is already defined or protected
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
