// src/components/Home.js
import React, { useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './Auth/AuthContext';
import './Home.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  
  // Ref for FAQ items
  const faqRefs = useRef([]);
  
  // Handle scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
  
  // Toggle FAQ items
  const toggleFaq = (index) => {
    const faqItem = faqRefs.current[index];
    const question = faqItem.querySelector('.faq-question');
    const answer = faqItem.querySelector('.faq-answer');
    
    question.classList.toggle('active');
    answer.classList.toggle('active');
  };
  
  // Testimonial data
  const testimonials = [
    {
      text: "This platform has completely transformed my learning experience. The video courses are engaging and the materials are comprehensive.",
      author: "Sarah Johnson",
      title: "Computer Science Student",
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      text: "As an instructor, I find the platform incredibly easy to use. My students love the accessibility and organization of the content.",
      author: "Michael Chen",
      title: "Data Science Professor",
      image: "https://randomuser.me/api/portraits/men/44.jpg"
    },
    {
      text: "The cloud storage feature is a game-changer. I can access my learning materials from anywhere, anytime.",
      author: "Priya Patel",
      title: "Software Developer",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];
  
  // Stats data
  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "500+", label: "Courses" },
    { number: "50+", label: "Expert Instructors" },
    { number: "98%", label: "Satisfaction Rate" }
  ];
  
  // FAQ data - Removed the certificate FAQ
  const faqs = [
    {
      question: "How do I access my courses?",
      answer: "After logging in, you can access all your enrolled courses from your dashboard. Click on any course to start learning."
    },
    {
      question: "Can I download materials for offline use?",
      answer: "Yes, all PDF materials and selected videos can be downloaded for offline viewing. Look for the download icon in the course materials."
    },
    {
      question: "How long do I have access to a course?",
      answer: "Once enrolled, you have lifetime access to the course materials, including all future updates."
    }
  ];
  
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to E-Learning Platform</h1>
        <p>Access your courses anytime, anywhere. Learn at your own pace with our comprehensive library of courses.</p>
        
        {currentUser ? (
          <Link to="/dashboard" className="cta-button">
            Go to Dashboard
          </Link>
        ) : (
          <div className="cta-buttons">
            <Link to="/login" className="cta-button">
              Log In
            </Link>
            <Link to="/register" className="cta-button secondary">
              Register
            </Link>
          </div>
        )}
      </div>
      
      <div className="features-header reveal">
        <h2>Our Platform Features</h2>
        <p>Everything you need to enhance your learning experience</p>
      </div>
      
      <div className="features">
        <div className="feature reveal">
          <div className="feature-icon">🎥</div>
          <h2>Video Courses</h2>
          <p>Learn with high-quality video content tailored to your learning pace and style.</p>
        </div>
        
        <div className="feature reveal">
          <div className="feature-icon">📄</div>
          <h2>PDF Materials</h2>
          <p>Access comprehensive documentation and guides to supplement your learning.</p>
        </div>
        
        <div className="feature reveal">
          <div className="feature-icon">☁️</div>
          <h2>Cloud Storage</h2>
          <p>All materials stored securely on Google Drive for access on any device.</p>
        </div>
      </div>
      
      <div className="wave-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#f7f9fc" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div className="stat-item reveal" key={index}>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="testimonials">
        <h2 className="reveal">What Our Students Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card reveal" key={index}>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <img src={testimonial.image} alt={testimonial.author} />
                <div className="author-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="faq-section">
        <h2 className="reveal">Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <div 
            className="faq-item reveal" 
            key={index} 
            ref={el => faqRefs.current[index] = el}
          >
            <div 
              className="faq-question" 
              onClick={() => toggleFaq(index)}
            >
              {faq.question}
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cta-section">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of students who are already enhancing their skills on our platform.</p>
        <Link to="/register" className="cta-button">
          Get Started for Free
        </Link>
      </div>
      
      {/* Loading animation (used when needed) */}
      {/* 
      <div className="text-center mt-5 mb-5">
        <div className="loading">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Loading courses...</p>
      </div>
      */}
    </div>
  );
};

export default Home;