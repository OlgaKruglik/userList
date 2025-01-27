import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Registration from './Pages/Registration'; 
import Login from './Pages/Login'; 
import Toolbar from './Pages/Toolbar';
import UserList from './Pages/UserList';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/userList" element={<UserList />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/toolbar" element={<Toolbar />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

