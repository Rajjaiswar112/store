import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Auth.css'; // Make sure to import the new CSS!

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // PUT YOUR EXISTING LOGIN API LOGIC HERE
    console.log("Logging in...", email, password);
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>Welcome Back</h2>
        <p>Log in to access your Zenkai Store account.</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="email" 
              className="auth-input" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Create one now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;