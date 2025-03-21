// src/components/Courses/MaterialItem.js
import React from 'react';

const MaterialItem = ({ material, isActive, progress, onClick }) => {
  const isCompleted = progress?.completed;
  const isViewed = progress?.viewed;
  
  return (
    <button 
      type="button"
      className={`material-item-button ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : isViewed ? 'viewed' : ''}`}
      onClick={() => onClick(material)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 15px 10px 25px',
        borderLeft: '3px solid transparent',
        position: 'relative',
        margin: '2px 0',
        transition: 'all 0.3s ease',
        borderLeftColor: isActive ? '#3498db' : 'transparent',
        backgroundColor: isActive ? 'rgba(52, 152, 219, 0.08)' : 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ 
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: material.type === 'video' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          color: material.type === 'video' ? '#2196f3' : '#f44336'
        }}>
          {material.type === 'video' ? '▶' : '📄'}
        </span>
        <span style={{ fontSize: '0.95rem', color: '#2c3e50' }}>
          {material.name}
        </span>
      </div>
      
      {progress && progress.progress > 0 && (
        <div style={{ 
          height: '4px', 
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '2px',
          overflow: 'hidden',
          width: '100%',
          marginTop: '8px'
        }}>
          <div style={{ 
            height: '100%',
            width: `${progress.progress}%`,
            background: 'linear-gradient(90deg, #3498db, #2ecc71)',
            borderRadius: '2px'
          }}></div>
        </div>
      )}
      
      {isCompleted && (
        <span style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          backgroundColor: '#2ecc71',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.7rem'
        }}>
          ✓
        </span>
      )}
    </button>
  );
};

export default MaterialItem;