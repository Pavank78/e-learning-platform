// src/components/Course/PdfViewer.js
import React, { useState, useEffect } from 'react';
import { getFileContent } from '../../services/googleDrive';

const PdfViewer = ({ fileId }) => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // For PDFs, we'll use Google Drive's built-in viewer
        const viewerUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        setPdfUrl(viewerUrl);
      } catch (error) {
        setError('Failed to load PDF: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [fileId]);

  if (loading) return <div>Loading PDF...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pdf-viewer">
      <iframe 
        src={pdfUrl} 
        width="100%" 
        height="600" 
        title="PDF Viewer"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default PdfViewer;