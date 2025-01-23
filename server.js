const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS настройки
app.use(cors({
  origin: 'http://localhost:3000', // Разрешить запросы с вашего фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешенные методы
  credentials: true, // Если нужно передавать куки или заголовки авторизации
}));

// Middleware
app.use(bodyParser.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:"],
      },
    },
  })
);

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'build')));

// Обслуживание manifest.json
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'manifest.json'));
});

// Обработка остальных маршрутов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Подключение к базе данных MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  database: process.env.DB_NAME || 'mydatabase',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the MySQL database.');
});

// Маршрут для регистрации
app.post('/register', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, password, remember_me) VALUES (?, ?, ?)';
    db.query(query, [email, hashedPassword, rememberMe], (err) => {
      if (err) {
        console.error('Database error during registration:', err); // Логирование
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send('User already exists.');
        }
        return res.status(500).send('Error inserting user.');
      }
      res.status(201).send('User registered successfully.');
    });
  } catch (error) {
    console.error('Server error during registration:', error); // Логирование
    res.status(500).send('Server error.');
  }
});


// Маршрут для входа
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Email and password are required.');
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid email or password.');
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid email or password.');
    res.status(200).send('Login successful.');
  });
});
// Маршрут для получения пользователей
app.get('/users', (req, res) => {
  const sql = 'SELECT id, email, password FROM your_actual_database_name'; // Замените "users" на название вашей таблицы
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
      return;
    }
    res.json(results);
  });
});

app.post('/check-user', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send('Email is required.');
  }

  const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error during user check:', err);
      return res.status(500).send('Server error.');
    }
    const userExists = results[0].count > 0;
    res.status(200).json({ exists: userExists });
  });
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the MySQL database.');
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
