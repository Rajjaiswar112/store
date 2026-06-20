import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // PUT YOUR EXISTING REGISTER API LOGIC HERE
    console.log("Registering...", name, email, password);
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>Join the Squad</h2>
        <p>Create an account to start shopping.</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              className="auth-input" 
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
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
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;