import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Укажите базовый URL вашего API
  withCredentials: true, // Включите эту опцию для передачи cookies
});

export default apiClient;
