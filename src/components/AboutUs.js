import React, { useEffect, useRef, useState } from 'react';
import './AboutUs.css';
import emailjs from '@emailjs/browser';

const AboutUs = () => {
  const animatedElements = useRef([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    // Animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all animated elements
    animatedElements.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      animatedElements.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Add elements to the animated elements array
  const addToAnimatedElements = (el) => {
    if (el && !animatedElements.current.includes(el)) {
      animatedElements.current.push(el);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission with EmailJS
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Create template parameters object
    const templateParams = {
      user_name: formData.name,
      user_email: formData.email,
      subject: formData.subject,
      message: formData.message
    };
    
    console.log('Sending email with params:', templateParams);
    
    emailjs.send(
      'service_mk5he2s',
      'template_n90xvoo',
      templateParams,
      'xfSbAYt8uk1F1MDvK'
    )
      .then((result) => {
        console.log('Email sent successfully:', result.text);
        // Show success message
        setFormSubmitted(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Reset form submission status after 3 seconds
        setTimeout(() => {
          setFormSubmitted(false);
        }, 3000);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        // Handle error (show error message to user)
      });
  };

  return (
    <div className="about-us">
      <div className="about-header" ref={addToAnimatedElements}>
        <div className="animated-bg"></div>
        <h1>About Us</h1>
        <p>Learn more about our mission, our team, and why we created this e-learning platform.</p>
      </div>
      
      <div className="about-section" ref={addToAnimatedElements}>
        <div className="about-content">
          <h2>Our Mission</h2>
          <div className="accent-line"></div>
          <p>
            At our E-Learning Platform, we believe that education should be accessible to everyone, 
            anywhere, at any time. Our mission is to empower learners by providing high-quality 
            educational content in a flexible, user-friendly environment.
          </p>
          <p>
            We strive to create an engaging learning experience that adapts to individual needs, 
            making education more personalized and effective. By leveraging technology, we aim to 
            break down barriers to education and foster a global community of lifelong learners.
          </p>
        </div>
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Team collaborating" />
        </div>
      </div>
      
      <div className="about-section reverse" ref={addToAnimatedElements}>
        <div className="about-content">
          <h2>Our Story</h2>
          <div className="accent-line"></div>
          <p>
            Founded in 2023, our platform emerged from a simple observation: traditional 
            learning methods weren't keeping pace with the rapidly changing world. Our founders, 
            a group of educators and technology enthusiasts, saw an opportunity to combine 
            cutting-edge technology with pedagogical expertise.
          </p>
          <p>
            What began as a small project has grown into a comprehensive learning ecosystem that 
            serves thousands of students worldwide. We've continuously evolved our platform based 
            on user feedback, educational research, and technological advancements.
          </p>
        </div>
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Our journey" />
        </div>
      </div>
      
      <div className="values-section" ref={addToAnimatedElements}>
        <h2>Our Core Values</h2>
        <div className="accent-line center"></div>
        <div className="values-grid">
          <div className="value-item" ref={addToAnimatedElements}>
            <div className="value-icon">🔍</div>
            <h3>Excellence</h3>
            <p>We are committed to excellence in every aspect of our platform, from content quality to user experience.</p>
          </div>
          
          <div className="value-item" ref={addToAnimatedElements}>
            <div className="value-icon">🌍</div>
            <h3>Accessibility</h3>
            <p>We believe education should be accessible to everyone, regardless of location, background, or circumstances.</p>
          </div>
          
          <div className="value-item" ref={addToAnimatedElements}>
            <div className="value-icon">💡</div>
            <h3>Innovation</h3>
            <p>We continuously explore new technologies and methodologies to enhance the learning experience.</p>
          </div>
          
          <div className="value-item" ref={addToAnimatedElements}>
            <div className="value-icon">🤝</div>
            <h3>Community</h3>
            <p>We foster a supportive community where learners can connect, collaborate, and grow together.</p>
          </div>
        </div>
      </div>
      
      <div className="team-section" ref={addToAnimatedElements}>
        <h2>Our Team</h2>
        <div className="accent-line center"></div>
        <p className="team-intro">
          Our diverse team brings together expertise in education, technology, design, and business.
          We're united by our passion for transforming education.
        </p>
        
        <div className="team-grid">
          <div className="team-member" ref={addToAnimatedElements}>
            <div className="member-content">
              <h3>Pavan Khedkar</h3>
              <p className="member-title">Founder & CEO</p>
              <p className="member-contact">+91 7721008303</p>
              <p>Leading our vision with expertise in educational technology.</p>
            </div>
            </div>
          
          <div className="team-member" ref={addToAnimatedElements}>
            <div className="member-content">
              <h3>Kamlesh Kolhe</h3>
              <p className="member-title">Chief Technology Officer</p>
              <p className="member-contact">+91 87676 68064</p>
              <p>Driving our technical innovation and platform development.</p>
            </div>
          </div>
          
          <div className="team-member" ref={addToAnimatedElements}>
            <div className="member-content">
              <h3>Om Zade</h3>
              <p className="member-title">Head of Content</p>
              <p className="member-contact">+91 80800 09326</p>
              <p>Curating high-quality educational content and learning experiences.</p>
            </div>
          </div>
          
          <div className="team-member" ref={addToAnimatedElements}>
            <div className="member-content">
              <h3>Mahesh Gira</h3>
              <p className="member-title">User Experience Director</p>
              <p className="member-contact">+91 76668 68982</p>
              <p>Ensuring our platform is intuitive, accessible, and engaging for all users.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="support-section" ref={addToAnimatedElements}>
        <div className="support-card">
          <div className="support-header">
            <div className="support-icon">🛟</div>
            <h2>Need Help?</h2>
          </div>
          <p>
            Experiencing any issues with our platform or have questions about your learning journey? 
            Our dedicated support team is here to help you every step of the way.
          </p>
          <p className="support-highlight">
            Please feel free to contact any of our team members directly for assistance. We're committed 
            to resolving your concerns quickly and ensuring you have the best learning experience.
          </p>
          <div className="support-contact-methods">
            <div className="support-contact">
              <div className="contact-icon">📧</div>
              <p>support@elearningplatform.com</p>
            </div>
            <div className="support-contact">
              <div className="contact-icon">💬</div>
              <p>Live chat available 24/7</p>
            </div>
            <div className="support-contact">
              <div className="contact-icon">📱</div>
              <p>WhatsApp support: +91 7721008303</p>
            </div>
          </div>
          <button className="support-button">Contact Support</button>
        </div>
      </div>
      
      <div className="contact-section" ref={addToAnimatedElements}>
        <h2>Get in Touch</h2>
        <div className="accent-line center"></div>
        <p>
          We'd love to hear from you! Whether you have questions, feedback, or partnership opportunities,
          our team is here to help.
        </p>
        <div className="contact-methods">
          <div className="contact-method" ref={addToAnimatedElements}>
            <div className="contact-icon">📧</div>
            <h3>Email</h3>
            <p>support@elearningplatform.com</p>
          </div>
          
          <div className="contact-method" ref={addToAnimatedElements}>
            <div className="contact-icon">📞</div>
            <h3>Phone</h3>
            <p>Pavan: +91 7721008303</p>
            <p>Kamlesh: +91 87676 68064</p>
          </div>
          
          <div className="contact-method" ref={addToAnimatedElements}>
            <div className="contact-icon">📍</div>
            <h3>Address</h3>
            <p>Titwala Kalyan, Thane<br />PIN 421605</p>
          </div>
        </div>
        
        <form className="contact-form" ref={addToAnimatedElements} onSubmit={handleSubmit}>
          <h3>Send us a message</h3>
          {formSubmitted && (
            <div className="form-success-message">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          <div className="form-group">
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name" 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your Email" 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject" 
              required 
            />
          </div>
          <div className="form-group">
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your Message" 
              rows="5" 
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-button">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default AboutUs;