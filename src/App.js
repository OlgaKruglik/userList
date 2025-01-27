import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Registration from './Pages/Registration'; 
import Login from './Pages/Login'; 
import Toolbar from './Pages/Toolbar';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/registration" element={<Registration />} />
        <Route path="/toolbar" element={<Toolbar />} />
        <Route path="/" element={<Login />} /> 
      </Routes>
    </div>
  );
}

export default App;

