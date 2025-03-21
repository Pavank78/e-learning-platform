// src/components/Course/CourseView.js (continued)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import PdfViewer from './PdfViewer';
import { listFiles } from '../../services/googleDrive';

const CourseView = () => {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseMaterials = async () => {
      try {
        // In a real app, you would query by folder ID
        // Here we're filtering by name for simplicity
        const files = await listFiles();
        const courseMaterials = files.filter(file => 
          file.name.startsWith(courseId)
        ).map(file => ({
          id: file.id,
          name: file.name,
          type: file.mimeType.includes('video') ? 'video' : 'pdf',
          url: file.webViewLink
        }));
        
        setMaterials(courseMaterials);
        if (courseMaterials.length > 0) {
          setSelectedMaterial(courseMaterials[0]);
        }
      } catch (error) {
        setError('Failed to load course materials: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseMaterials();
  }, [courseId]);

  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
  };

  if (loading) return <div>Loading course materials...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-view">
      <h1>{courseId}</h1>
      
      <div className="course-content">
        <div className="material-list">
          <h3>Course Materials</h3>
          <ul>
            {materials.map(material => (
              <li 
                key={material.id} 
                className={selectedMaterial && selectedMaterial.id === material.id ? 'active' : ''}
                onClick={() => handleSelectMaterial(material)}
              >
                <span className={`material-type ${material.type}`}>{material.type}</span>
                {material.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="material-viewer">
          {selectedMaterial ? (
            selectedMaterial.type === 'video' ? (
              <VideoPlayer fileId={selectedMaterial.id} />
            ) : (
              <PdfViewer fileId={selectedMaterial.id} />
            )
          ) : (
            <div className="no-material">Select a material to view</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView;