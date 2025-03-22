// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import { Link } from 'react-router-dom';
import googleDriveService from '../../services/googleDrive';
import AuthNotification from '../Notification/AuthNotification';
import './Dashboard.css';
//import animationUtils from '../../utils/animations';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authNotification, setAuthNotification] = useState(false);
  const [authMessage, setAuthMessage] = useState("Authenticating with Google Drive...");
  const [forceRefresh, setForceRefresh] = useState(0);
  const dashboardRef = useRef(null);

  // Your specific folder ID
  const FOLDER_ID = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID;
  
  // Add animation to dashboard when it mounts
  useEffect(() => {
    if (dashboardRef.current) {
      setTimeout(() => {
        dashboardRef.current.classList.add('dashboard-visible');
      }, 100);
    }
  }, []);
  
  // Custom inline styles for course list
  const courseListStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };
  
  const courseItemStyles = {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1.8rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    position: 'relative'
  };
  
  const courseTitleStyles = {
    marginBottom: '1rem',
    color: '#2c3e50',
    fontSize: '1.4rem',
    fontWeight: '600'
  };
  
  const courseStatsStyles = {
    display: 'flex',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#7f8c8d'
  };
  
  const courseLinkStyles = {
    display: 'inline-block',
    padding: '0.7rem 1.5rem',
    backgroundColor: '#3498db',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    boxShadow: '0 2px 5px rgba(52, 152, 219, 0.3)'
  };

  // Add this new function for manual refresh
  const handleManualRefresh = () => {
    // Add rotation animation to button
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
      refreshButton.classList.add('refreshing');
      setTimeout(() => {
        refreshButton.classList.remove('refreshing');
      }, 1000);
    }
    
    // Clear storage to force fresh data
    localStorage.removeItem('gdrive_course_cache');
    
    // Set loading state
    setLoading(true);
    
    // Increment to trigger useEffect
    setForceRefresh(prev => prev + 1);
  };
  
  useEffect(() => {
    const loadGoogleDriveData = async () => {
      try {
        setAuthNotification(true);
        setAuthMessage("Initializing Google Drive API...");
        
        // Clear any cached course data
        localStorage.removeItem('gdrive_course_cache');
        
        // Check if Google APIs are loaded
        if (!window.gapi) {
          throw new Error("Google APIs not available. Please refresh the page and ensure scripts are loaded properly.");
        }
        
        // Initialize the Google Drive API
        await googleDriveService.initGoogleDriveApi();
        
        // If we don't have an access token after initialization, start authentication
        if (!googleDriveService.accessToken) {
          setAuthMessage("Redirecting to Google for authentication...");
          console.log("No access token found, starting authentication");
          
          // This will redirect to Google's auth page
          await googleDriveService.authenticateGoogleDrive();
          
          // We won't reach this point until after redirect back with token
          return;
        }
        
        console.log("Authentication successful, fetching courses...");
        setAuthMessage("Authentication successful. Loading courses...");
        
        // Get courses from your folder using the new folder structure
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const courseData = await googleDriveService.listCourses(FOLDER_ID, timestamp);
        setAuthNotification(false);
        
        if (!courseData || courseData.length === 0) {
          console.log("No courses found");
          setCourses([]);
          setLoading(false);
          return;
        }
        
        console.log(`Found ${courseData.length} courses with materials`);
        setCourses(courseData);
      } catch (error) {
        setAuthNotification(false);
        console.error("Detailed error in loadGoogleDriveData:", error);
        
        // Provide more specific error messages
        if (error.message.includes("scope") || error.message.includes("permission")) {
          setError("Permission denied. The app needs permission to access your Google Drive files.");
        } else if (error.message.includes("network")) {
          setError("Network error. Please check your internet connection and try again.");
        } else {
          setError('Failed to load courses: ' + (error.message || 'Unknown error'));
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadGoogleDriveData();
    } else {
      setLoading(false);
    }
  }, [currentUser, FOLDER_ID, forceRefresh]);

  const handleRetryAuth = () => {
    // Add animation to retry button
    const retryButton = document.querySelector('.retry-button');
    if (retryButton) {
      retryButton.classList.add('button-pulse');
      setTimeout(() => {
        retryButton.classList.remove('button-pulse');
      }, 300);
    }
    
    // Clear any existing tokens to force re-authentication
    googleDriveService.clearAuth();
    localStorage.removeItem('gdrive_course_cache');
    
    // Reload the page to restart the authentication flow
    window.location.reload();
  };

  // Enhanced loading state with animation
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">
          <div className="spinner"></div>
          <div className="loading-text">Loading your courses...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={handleRetryAuth}>
          <span className="retry-icon">🔄</span>
          Retry Authentication
        </button>
      </div>
    );
  }
  
  // Custom CourseList component with inline styles
  const StyledCourseList = ({ courses = [] }) => {
    if (!courses || courses.length === 0) {
      return <p>No courses available. Please check back later.</p>;
    }
    
    return (
      <div style={courseListStyles}>
        {courses.map((course, index) => (
          <div 
            key={course.id || index} 
            style={courseItemStyles}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h3 style={courseTitleStyles}>{course.title || 'Unnamed Course'}</h3>
            <div style={courseStatsStyles}>
              <span style={{ marginRight: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '5px' }}>🎬</span>
                {course.materials ? course.materials.filter(m => m.name && m.name.toLowerCase().endsWith('.mp4')).length : 0} videos
              </span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '5px' }}>📄</span>
                {course.materials ? course.materials.filter(m => m.name && m.name.toLowerCase().endsWith('.pdf')).length : 0} documents
              </span>
            </div>
            <Link 
              to={`/course/${course.id}`} 
              style={courseLinkStyles}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(52, 152, 219, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = '';
                e.target.style.boxShadow = '0 2px 5px rgba(52, 152, 219, 0.3)';
              }}
            >
              View Course
            </Link>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="dashboard" ref={dashboardRef}>
      <AuthNotification visible={authNotification} message={authMessage} />
      
      <div className="dashboard-header">
        <h1>Welcome to your E-Learning Dashboard</h1>
        <button 
          className="refresh-button" 
          onClick={handleManualRefresh}
          disabled={loading}
        >
          <span className="refresh-icon"></span>
          {loading ? 'Refreshing...' : 'Refresh Courses'}
        </button>
      </div>
      
      {!currentUser ? (
        <div className="login-prompt">
          <div className="login-icon">🔐</div>
          <p>Please log in to view your courses.</p>
        </div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div>
              <p>No courses found. Please check your Google Drive folder structure.</p>
              <p className="folder-structure-tip">
                Each course should be in its own folder within your main folder.
                Course materials (videos and PDFs) should be placed inside these course folders.
              </p>
              <button className="retry-button" onClick={handleRetryAuth}>
                <span className="connect-icon"></span>
                Reconnect to Google Drive
              </button>
            </div>
          ) : (
            // Use our custom styled course list instead of the original component
            <StyledCourseList courses={courses} />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;