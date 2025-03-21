import React from 'react';
import CourseItem from './CourseItem';

const CourseList = ({ courses = [] }) => {
  if (!courses || courses.length === 0) {
    return <p>No courses available. Please check back later.</p>;
  }

  return (
    <div className="course-list">
      {courses.map(course => (
        <CourseItem key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseList;