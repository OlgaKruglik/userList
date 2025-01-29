import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/login.css';

function Registration() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  const outRezult = (str) => {
      setMessage(str);
      setTimeout(() => {
          setMessage('');
      }, 1000);
  };

  const handleRegister = async (event) => {
      event.preventDefault();
      if (email && password && name) {
          try {
              const response = await axios.post(`${API_BASE_URL}/register`, { name, email, password, rememberMe }, { withCredentials: true });
              console.log('User registered:', response.data.message);
              outRezult('Registration successful!');
              setName('');
              setEmail('');
              setPassword('');
          } catch (error) {
              console.error('Error registering user:', error);
              setError(error.response?.data || 'An error occurred during registration.');
          }
      } else {
          outRezult('Please fill in all fields (name, email, and password).');
      }
  };

  const handleLogin = async (event) => {
      event.preventDefault();
      if (email && password) {
        console.log('hi');
        try {
            console.log('Sending login request...');
            const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
            console.log('hi2');
            console.log('User logged in:', response.data);
            if (response.status === 200) { 
            console.log('Navigating to /toolbar');
            navigate('/toolbar');
            } else {
                console.log('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError(error.response?.data || 'An error occurred during login.');
        }
        } else {
            outRezult('Please fill in both email and password fields.');
        }
      };


  return (
    <div className="login">
    {message && <div className="text-rezult"><p>{message}</p></div>}
    <div className="login-card-page">
        <h2 className="login-header">Registration</h2>
        {error && <p className="error-message">{error}</p>}
        <form>
            <div className="form-group">
            <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            </div>
            <div className="form-group">
                <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="btnLogin">
                <button onClick={handleLogin} className="btn-submit">
                    Sign in
                </button>
                <button onClick={handleRegister} className="btn-submit-right">
                    Registration
                </button>
            </div>
        </form>
    </div>
</div>
);
}

export default Registration;
