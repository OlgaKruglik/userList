import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './App.css';

axios.defaults.baseURL = 'http://localhost:3033'; 
axios.defaults.withCredentials = true;

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

