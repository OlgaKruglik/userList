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
const router = express.Router();
const PORT = process.env.PORT || 5000;

// CORS настройки
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5001'];

app.use(cors({
  origin: (origin, callback) => {
    // Разрешить запросы без заголовка origin (например, от Postman или серверных запросов)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Разрешить передачу cookies/headers
}));

// Middleware
app.use(bodyParser.json());
app.use(helmet());
app.use('/api', router);

// Подключение к базе данных MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  database: process.env.DB_NAME || 'mydatabase',
});

// Проверка подключения к базе данных
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the MySQL database.');

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5001');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Маршруты
app.get('/users', (req, res) => {
  const sql = 'SELECT id, name, email, password, last_login FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
      return;
    }
    res.json(results);
  });
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json('All fields are required (name, email, and password).');
  }

  try {
    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL-запрос для добавления нового пользователя
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error saving user:', err);
        return res.status(500).json('Error registering user');
      }
      res.status(201).json('User registered successfully');
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json('An error occurred during registration');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Email and password are required.');
  }

  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json('Error during login.');
      }

      if (results.length === 0) {
        return res.status(404).json('User not found.');
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json('Invalid email or password.');
      }

      // Обновить время последнего входа
      const updateLoginTime = 'UPDATE users SET last_login = NOW() WHERE id = ?';
      db.query(updateLoginTime, [user.id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating last login time:', updateErr);
          return res.status(500).json('Error during login.');
        }

        res.status(200).json({ message: 'Login successful.', name: user.name, lastLogin: new Date() });
      });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json('An error occurred during login.');
  }
});



app.post('/check-user', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Email and password are required.');
  }

  try {
    // Проверяем, существует ли пользователь в базе данных
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json('Error checking user.');
      }

      if (results.length === 0) {
        return res.status(404).json('User not found.');
      }

      const user = results[0];

      // Проверяем, соответствует ли пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json('Invalid email or password.');
      }

      res.status(200).json({ message: 'User exists and password is valid.' });
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json('An error occurred while checking the user.');
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json('All fields are required (name, email, and password).');
  }

  try {
    // Проверка на существование email
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    await db.query(sql, [name, email, hashedPassword]);
    res.status(201).json('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json('An error occurred during registration');
  }
});

router.post('/users/block', async (req, res) => {
  const { userIds, isBlocked } = req.body;

  if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
      // Ваша логика обновления базы данных
      await db.query(
          'UPDATE users SET is_blocked = ? WHERE id IN (?)',
          [isBlocked, userIds]
      );
      res.status(200).json({ message: 'Users updated successfully' });
  } catch (error) {
      console.error('Error updating users:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// module.exports = router;


