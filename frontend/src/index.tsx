import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ResizeObserver 에러 전역 억제
window.addEventListener('error', (e) => {
  if (
    e.message ===
    'ResizeObserver loop completed with undelivered notifications.'
  ) {
    e.stopImmediatePropagation();
  }
});

// 추가적인 에러 핸들링
const resizeObserverErr = (e: any) => {
  if (
    e.target === window &&
    e.message === 'ResizeObserver loop limit exceeded'
  ) {
    e.stopImmediatePropagation();
  }
};

window.addEventListener('error', resizeObserverErr);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
