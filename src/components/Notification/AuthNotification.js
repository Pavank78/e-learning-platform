// src/components/Notification/AuthNotification.js
import React from 'react';
import './AuthNotification.css';

const AuthNotification = ({ visible, message }) => {
  if (!visible) return null;
  
  return (
    <div className="auth-notification">
      <div className="auth-notification-content">
        <p>{message || 'Google Drive authentication required. Please sign in.'}</p>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default AuthNotification;