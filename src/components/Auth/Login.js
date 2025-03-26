// src/components/Auth/Login.js (with reset password functionality)
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './LoginAnimation.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(`Failed to ${isSignUp ? 'sign up' : 'log in'}: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError('Please enter your email address');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setIsResetting(false);
    } catch (error) {
      setError(`Failed to reset password: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className={`login-animation-container ${isSignUp ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {isResetting ? (
            <form onSubmit={handleResetPassword} className="sign-in-form">
              <h2 className="title">Reset Password</h2>
              
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn solid" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <p className="reset-toggle" onClick={() => setIsResetting(false)}>
                Back to Sign In
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="sign-in-form">
              <h2 className="title">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
              
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {isSignUp && (
                <div className="input-field">
                  <i className="fas fa-lock"></i>
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <button type="submit" className="btn solid" disabled={loading}>
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
              
              {!isSignUp && (
                <p className="reset-toggle" onClick={() => setIsResetting(true)}>
                  Forgot password?
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>Create an account to start your learning journey with us!</p>
            <button 
              className="btn transparent" 
              onClick={() => {
                setIsSignUp(true);
                setIsResetting(false);
                setError('');
                setMessage('');
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
        
        <div className="panel right-panel">
          <div className="content">
            <h3>Already have an account?</h3>
            <p>Sign in to continue your learning journey!</p>
            <button 
              className="btn transparent" 
              onClick={() => {
                setIsSignUp(false);
                setIsResetting(false);
                setError('');
                setMessage('');
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;