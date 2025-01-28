import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import eye from './image/eyi.png'
import imgEmail from './image/imgEmail.webp';
import useFetchUsers from '../hoock/useUser';
import '../style/registration.css';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const {users, loading, fetchError} = useFetchUsers();
    const navigate = useNavigate();

    const outRezult = (str) => {
        setMessage(str);
        setTimeout(() => {
            setMessage('');
        }, 1000);
    };
  
    
    const handleSubmit = async (event) => {
        event.preventDefault();
      
        if (email && password) {
          try {
            console.log('Sending check-user request...');
            const response = await axios.post('http://localhost:3033/check-user', { email, password, rememberMe });
      
            console.log('Response from server:', response.data);
            console.log('Fetched Users:', users);
      
            const foundUser = users.find(user => user.email === email);
            if (foundUser) {
              if (foundUser.is_blocked === 1) {
                outRezult('Your account is blocked. Redirecting to registration page.');
                navigate('/registration'); 
                return;
              }
              outRezult('Login successful! Redirecting...');
              navigate('/toolbar'); 
            } else {
              outRezult('User not found.');
            }
          } catch (error) {
            console.error('Error checking user:', error);
            setError(error.response?.data || 'An error occurred during check-user.');
          }
        } else {
          alert('Please fill in both email and password fields.');
        }
      };
      
  
    const togglePassword = () => {
      const passwordInput = document.getElementById('password');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    };


    return (
        <div className="login-container">
        <div className="login-form">
          <div className="login-card">
            <h2 className="login-header">Welcome Back!</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)
                  }
                />
                <img src={imgEmail} alt="Email Icon" className="icon" />
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
                <img src={eye} alt="Toggle Password Visibility" className="icon" onClick={togglePassword} />
              </div>
              <div className="form-group form-check">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="form-check-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="form-check-label">Remember Me</label>
              </div>
              <button type="submit" className="btn-submit">Register</button>
            </form>
          </div>
          <div className="form-footer">
            <div className="form-footer-register">
              <p>Already have an account?</p>
              <Link to="/registration">Register</Link>
            </div>
            <div className="form-footer-register">
            <Link to="/registration">Forgot possword</Link>
            </div>
          </div>
        </div>
        <div className="image-container"></div>
      </div>
    );
}

export default Login
