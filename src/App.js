import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Registration from './Pages/Registration'; 
import Login from './Pages/Login'; 
import Toolbar from './Pages/Toolbar';
import UserList from './Pages/UserList';

// Создаем маршруты
const router = createBrowserRouter([
  { path: "/userList", element: <UserList /> },
  { path: "/registration", element: <Registration /> },
  { path: "/toolbar", element: <Toolbar /> },
  { path: "/", element: <Login /> },
], {
  future: {
    v7_startTransition: true, // Включает использование React.startTransition
    v7_relativeSplatPath: true, // Обновляет относительный путь сплат-роутов
  },
});

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
