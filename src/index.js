import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/base.css';        // Base styles
import './styles/animations.css';  // Animation utilities
import './styles/responsive.css';  // Responsive utilities
import './index.css';              // Any additional global styles
import App from './App';
import reportWebVitals from './reportWebVitals';

// Load Google API scripts programmatically
const loadGoogleScripts = () => {
  // Load Google API script
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.async = true;
  gapiScript.defer = true;
  document.head.appendChild(gapiScript);

  // Load Google Identity Services script
  const gisScript = document.createElement('script');
  gisScript.src = 'https://accounts.google.com/gsi/client';
  gisScript.async = true;
  gisScript.defer = true;
  document.head.appendChild(gisScript);
};

// Load the Google scripts before rendering the app
loadGoogleScripts();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();