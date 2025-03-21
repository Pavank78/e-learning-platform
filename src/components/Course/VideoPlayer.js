// src/components/Course/VideoPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ fileId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Reset states when fileId changes
    setLoading(true);
    setError(null);
    
    // Simulate loading completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [fileId]);

  return (
    <div className="video-player-container" ref={containerRef}>
      <div className="video-player">
        <div className="loading-bar" style={{ display: loading ? 'block' : 'none' }}></div>
        
        {loading && (
          <div className="video-loading">
            <div className="loader">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32"></circle>
              </svg>
            </div>
          </div>
        )}
        
        {error && (
          <div className="video-error">
            <div>
              <i className="error-icon">!</i>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          </div>
        )}
        
        <iframe
          title={`Video ${fileId}`}
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          width="100%"
          height="100%"
          allowFullScreen
          frameBorder="0"
          style={{ opacity: loading ? 0 : 1 }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Failed to load video. Please check your connection and try again.");
          }}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;