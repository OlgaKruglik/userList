import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/login.css';

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const outRezult = (str) => {
        setMessage(str);
        setTimeout(() => {
            setMessage('');
        }, 1000);
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        if (email && password) {
            try {
                const response = await axios.post('http://localhost:5000/register', { email, password, rememberMe });
                console.log('User registered:', response.data);
                outRezult('Registration successful!');
                setEmail('');
                setPassword('');
            } catch (error) {
                console.error('Error registering user:', error);
                setError(error.response?.data || 'An error occurred during registration.');
            }
        } else {
            outRezult('Please fill in both email and password fields.');
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        if (email && password) {
            try {
                const response = await axios.post('http://localhost:5000/login', { email, password });
                console.log('User logged in:', response.data);
                navigate('/toolbar');
            } catch (error) {
                console.error('Error loging in:', error);
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
                <h2 className="login-header">Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form>
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
                        <button onClick={handleRegister} className="btn-submit right">
                            Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login
