require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { connectDB } = require('./config');
const registerRoute = require('./register');
const loginRoute = require('./login');
const { authenticateToken, authorizeRole } = require('./middleware/auth');
const client = require('prom-client'); // 👈 New import

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

connectDB();

// routes
app.use('/register', registerRoute);
app.use('/login', loginRoute);

app.get('/', (req, res) => {
  const podName = process.env.HOSTNAME || 'unknown';
  res.send(`Hello from pod: ${podName}`);
});

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!', user: req.user });
});

app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
