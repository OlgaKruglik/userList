const express = require('express');
const mysql = require('mysql2/promise'); // Используем промисы
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');

dotenv.config();

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3033; // Изменённый порт

// CORS настройки
console.log("CORS настройки");
const allowedOrigins = [
'http://localhost:3000', 
'http://localhost:5001',
'http://localhost:3001',
'http://localhost:3034',
'ec2-13-60-190-4.eu-north-1.compute.amazonaws.com',
"https://olgakruglik.github.io", // Обновлённый порт
];

// Middleware
console.log("Middleware");
app.use(cors({
  origin: (origin, callback) => {
    console.log('Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use('/api', router);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      },
    },
  })
);

app.use(helmet({ contentSecurityPolicy: false }));

// Подключение к базе данных MySQL
console.log("createConnection к базе данных MySQL");
const db = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
user: process.env.DB_USER || 'your_db_user',
password: process.env.DB_PASSWORD || 'your_db_password',
database: process.env.DB_NAME || 'mydatabase',
});

console.log("Подключение к базе данных MySQL");

// Настройка CORS заголовков
console.log("Настройка CORS заголовков");
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Запуск сервера
console.log("Запуск сервера");
app.listen(PORT, () => {
console.log(`Server is running on http://localhost:${PORT}`);
});

// Маршруты
app.get('/users', async (req, res) => {
const sql = 'SELECT id, name, email, password, last_login, is_blocked FROM users';
try {
const [results] = await db.query(sql);
res.json(results);
} catch (err) {
console.error('Error fetching users:', err);
res.status(500).send('Error fetching users');
}
});

app.post('/check-user', async (req, res) => {
const { email, password } = req.body;

if (!email || !password) {
return res.status(400).json('Email and password are required.');
}

try {
const sql = 'SELECT * FROM users WHERE email = ?';
const [results] = await db.query(sql, [email]);

if (results.length === 0) {
return res.status(404).json('User not found.');
}

const user = results[0];
const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
return res.status(401).json('Invalid email or password.');
}

res.status(200).json({ message: 'User exists and password is valid.' });
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
const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
if (existingUsers.length > 0) {
return res.status(400).json('User with this email already exists.');
}

const hashedPassword = await bcrypt.hash(password, 10);
const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
await db.query(sql, [name, email, hashedPassword]);
res.status(201).json({ message: 'User registered successfully' });
} catch (error) {
console.error('Error registering user:', error);
res.status(500).json('An error occurred during registration');
}
});

app.post('/login', async (req, res) => {
  console.log('Login request received');
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json('Email and password are required.');
  }

  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      console.log('User not found');
      return res.status(404).json('User not found.');
    }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid email or password');
      return res.status(401).json('Invalid email or password.');
    }

    const updateLoginTime = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await db.query(updateLoginTime, [user.id]);

    console.log('Login successful');
    res.status(200).json({ message: 'Login successful.', name: user.name, lastLogin: new Date() });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json('An error occurred during login.');
  }
});

router.post('/users/block', async (req, res) => {
  console.log("/users/block'");
  const { userIds, isBlocked } = req.body;

  if (!Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
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

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [id]);
    res.status(200).json({ message: `User with ID ${id} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user.' });
  }
});


