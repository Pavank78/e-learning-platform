// src/components/Courses/CourseViewer.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import googleDriveService from '../../services/googleDrive';
import AuthNotification from '../Notification/AuthNotification';
import VideoPlayer from '../Course/VideoPlayer';
import './CourseViewer.css';
import './list-animations.css'; // Import the new animations CSS
import { initializeListAnimations, cleanupListAnimations, updateItemsProgress } from './list-animations'; // Import the animations utilities
import MaterialItem from './MaterialItem';

const CourseViewer = () => {
  const { courseId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [authNotification, setAuthNotification] = useState(false);
  const [authMessage, setAuthMessage] = useState("Authenticating with Google Drive...");
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState({});
  const materialViewerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize list animations
  useEffect(() => {
    // Initialize animations after component loads and data is ready
    if (!loading && course) {
      try {
        setTimeout(() => {
          initializeListAnimations();
        }, 300);
      } catch (error) {
        console.error("Error initializing list animations:", error);
      }
    }
    
    // Clean up event listeners when component unmounts
    return () => {
      try {
        cleanupListAnimations();
      } catch (error) {
        console.error("Error cleaning up list animations:", error);
      }
    };
  }, [loading, course]);
  
  // Auto-expand sections when searching
  useEffect(() => {
    // Auto-expand all sections when searching
    if (searchTerm.length > 0) {
      // No need to change activeSection, we'll handle expansion in the render method
      // Just re-initialize animations when search changes
      setTimeout(() => {
        try {
          initializeListAnimations();
        } catch (error) {
          console.error("Error initializing list animations:", error);
        }
      }, 300);
    }
  }, [searchTerm]);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const loadCourseData = async () => {
      try {
        setAuthNotification(true);
        setAuthMessage("Initializing Google Drive API...");
        
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
        
        console.log("Authentication successful, fetching course materials...");
        setAuthMessage("Authentication successful. Loading course materials...");
        
        // We're now using the courseId as the actual folder ID
        const courseData = await googleDriveService.getCourseMaterials(courseId);
        setAuthNotification(false);
        
        if (!courseData || !courseData.materials || courseData.materials.length === 0) {
          setError('No materials found for this course');
          setLoading(false);
          return;
        }
        
        // Group materials by sections
        const sectionsMap = courseData.materials.reduce((acc, material) => {
          const sectionMatch = material.name.match(/^Section (\d+)/i);
          const sectionNum = sectionMatch ? parseInt(sectionMatch[1]) : 0;
          
          if (!acc[sectionNum]) {
            acc[sectionNum] = {
              id: sectionNum,
              title: sectionMatch ? `Section ${sectionNum}` : 'Introduction',
              materials: []
            };
          }
          
          acc[sectionNum].materials.push(material);
          return acc;
        }, {});
        
        // Convert to array and sort by section number
        const sections = Object.values(sectionsMap).sort((a, b) => a.id - b.id);
        
        // Initialize progress data
        const initialProgress = {};
        courseData.materials.forEach(material => {
          initialProgress[material.id] = {
            viewed: false,
            progress: 0,
            completed: false
          };
        });
        
        // Load saved progress from localStorage
        const savedProgress = localStorage.getItem(`course-progress-${courseId}`);
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress));
        } else {
          setProgress(initialProgress);
        }
        
        setCourse({
          ...courseData,
          sections
        });
        
        // Select the first material by default
        if (courseData.materials.length > 0) {
          setSelectedMaterial(courseData.materials[0]);
        }
        
      } catch (error) {
        setAuthNotification(false);
        console.error("Error loading course:", error);
        setError('Failed to load course: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseData();
  }, [courseId, currentUser, navigate]);
  
  useEffect(() => {
    // Save progress to localStorage whenever it changes
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(progress));
    }
  }, [progress, courseId]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleMaterialSelect = (material, event) => {
    // Add logging
    console.log('Material selected:', material.name, material.id);
    
    // Force update the state directly
    setSelectedMaterial(material);
    
    // Update progress to mark as viewed
    setProgress(prev => ({
      ...prev,
      [material.id]: {
        ...prev[material.id],
        viewed: true
      }
    }));
    
    // Scroll material viewer to top when changing materials
    if (materialViewerRef.current) {
      materialViewerRef.current.scrollTop = 0;
    }
  };
  
  const handleVideoProgress = (materialId, progressPercent) => {
    setProgress(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        progress: progressPercent,
        completed: progressPercent >= 90
      }
    }));
    
    // Update the UI animations for progress
    try {
      updateItemsProgress({
        [materialId]: progressPercent
      });
    } catch (error) {
      console.error("Error updating progress UI:", error);
    }
  };
  
  const toggleSection = (sectionIndex) => {
    setActiveSection(activeSection === sectionIndex ? -1 : sectionIndex);
  };
  
  const calculateCourseProgress = () => {
    if (!course || !course.materials || course.materials.length === 0) return 0;
    
    const totalMaterials = course.materials.length;
    const completedMaterials = course.materials.filter(m => 
      progress[m.id] && progress[m.id].completed
    ).length;
    
    return Math.round((completedMaterials / totalMaterials) * 100);
  };
  
  const handleRetryAuth = () => {
    // Clear any existing tokens to force re-authentication
    googleDriveService.clearAuth();
    
    // Reload the page to restart the authentication flow
    window.location.reload();
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading course materials...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={handleRetryAuth}>
          <span className="retry-icon">↻</span>
          Retry Authentication
        </button>
      </div>
    );
  }
  
  if (!course) return <div className="error">Course not found</div>;
  
  const courseProgress = calculateCourseProgress();
  
  return (
    <div className="course-viewer">
      <AuthNotification visible={authNotification} message={authMessage} />
      
      <div className="course-header">
        <h1>{course.title}</h1>
        <div className="course-progress-container">
          <div className="progress-text">Course Progress: {courseProgress}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${courseProgress}%` }}></div>
          </div>
        </div>
      </div>
      
      <div className="course-content">
        <div className="materials-sidebar">
          <div className="sidebar-header">
            <h3>Course Materials</h3>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search materials..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              <span className="search-icon">🔍</span>
              {searchTerm && (
                <button 
                  className="search-clear-btn" 
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {course.sections && course.sections.map((section, index) => {
            // Filter materials based on search term
            const filteredMaterials = section.materials.filter(material => 
              material.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            // Don't show empty sections when searching
            if (searchTerm && filteredMaterials.length === 0) {
              return null;
            }
            
            return (
              <div key={section.id} className="course-section" data-section-id={section.id}>
                <div 
                  className={`section-header ${activeSection === index ? 'active' : ''}`} 
                  onClick={() => toggleSection(index)}
                >
                  <span className="section-title">{section.title}</span>
                  <span className="section-toggle">{activeSection === index ? '−' : '+'}</span>
                </div>
                
                <ul className={`section-materials ${activeSection === index || searchTerm ? 'expanded' : ''}`} style={{listStyle: 'none', padding: 0}}>
                  {filteredMaterials.map(material => (
                    <li key={material.id} style={{listStyle: 'none', margin: 0, padding: 0}}>
                      <MaterialItem
                        material={material}
                        isActive={selectedMaterial && selectedMaterial.id === material.id}
                        progress={progress[material.id]}
                        onClick={handleMaterialSelect}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          
          {searchTerm && course.sections.every(section => 
            section.materials.every(material => 
              !material.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          ) && (
            <div className="no-search-results">
              <p>No materials found matching "{searchTerm}"</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  console.log('Clearing search');
                }} 
                className="clear-search-btn"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
        
        <div className="material-viewer" ref={materialViewerRef}>
          {selectedMaterial ? (
            <>
              <div className="material-header">
                <h2>{selectedMaterial.name}</h2>
              </div>
              
              <div className="material-content">
                {selectedMaterial.type === 'video' ? (
                  <div className="video-player-wrapper custom-player">
                    <VideoPlayer 
                      fileId={selectedMaterial.id} 
                      onProgressChange={(progress) => handleVideoProgress(selectedMaterial.id, progress)}
                    />
                  </div>
                ) : (
                  <div className="pdf-viewer">
                    <iframe
                      title={selectedMaterial.name}
                      src={`https://drive.google.com/file/d/${selectedMaterial.id}/preview`}
                      width="100%"
                      height="100%"
                      allowFullScreen
                      frameBorder="0"
                    ></iframe>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-material">
              <div className="no-material-icon">📚</div>
              <h3>No Material Selected</h3>
              <p>Please select a course material from the sidebar to view its content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
