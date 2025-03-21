import React from 'react';
import { Link } from 'react-router-dom';

const CourseItem = ({ course }) => {
  // Extract the course title from the folder name
  const title = course.title || 'Unnamed Course';
  
  // Count materials by type
  const videoCount = course.materials 
    ? course.materials.filter(m => m.name && m.name.toLowerCase().endsWith('.mp4')).length 
    : 0;
    
  const pdfCount = course.materials 
    ? course.materials.filter(m => m.name && m.name.toLowerCase().endsWith('.pdf')).length 
    : 0;

  return (
    <div className="course-item">
      <h3>{title}</h3>
      <div className="course-stats">
        <span>{videoCount} videos</span>
        <span>{pdfCount} documents</span>
      </div>
      <Link to={`/course/${course.id}`} className="course-link">
        View Course
      </Link>
    </div>
  );
};

export default CourseItem;