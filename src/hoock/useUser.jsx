import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchUsers = () => {
const [users, setUsers] = useState([]); // Состояние для хранения данных
const [loading, setLoading] = useState(false); // Состояние загрузки
const [error, setError] = useState(null); // Состояние ошибок

useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/users');
        console.log('API Response:', response.data);
        
        if (response.headers['content-type'].includes('application/json')) {
          const filteredUsers = response.data.map(user => ({
            id: user.id,
            email: user.email,
            password: user.password,
          }));
          setUsers(filteredUsers);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);
  
// Пустой массив зависимостей — запрос будет выполнен один раз при монтировании

return { users, loading, error };
};

export default useFetchUsers;
