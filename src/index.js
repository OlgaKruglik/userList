import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './App.css';

axios.defaults.baseURL = 'https://2e2e-81-199-26-3.ngrok-free.app'; 
axios.defaults.withCredentials = true;

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

