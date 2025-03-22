import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/base.css';
import './styles/animations.css';
import './styles/responsive.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const loadGoogleScripts = () => {
  return new Promise((resolve) => {
    const gapiScript = document.createElement('script');
    gapiScript.src = `https://apis.google.com/js/api.js?key=${process.env.REACT_APP_GOOGLE_DRIVE_API_KEY}`;
    gapiScript.async = true;
    gapiScript.defer = true;

    const gisScript = document.createElement('script');
    gisScript.src = `https://accounts.google.com/gsi/client?client_id=${process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID}`;
    gisScript.async = true;
    gisScript.defer = true;

    // Wait for both scripts to load
    let loadedScripts = 0;
    const checkLoaded = () => {
      loadedScripts++;
      if (loadedScripts === 2) resolve();
    };

    gapiScript.onload = checkLoaded;
    gisScript.onload = checkLoaded;

    document.head.appendChild(gapiScript);
    document.head.appendChild(gisScript);
  });
};

// Load scripts FIRST, then render the app
loadGoogleScripts()
  .then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error('Failed to load Google scripts:', err);
  });

reportWebVitals();