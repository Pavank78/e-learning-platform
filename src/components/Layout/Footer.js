// src/components/Layout/Footer.js
import React from 'react';
import './1.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} E-Learning Platform. All rights reserved.</p>
    </footer>
  );
};

export default Footer;