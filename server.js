const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// In‑memory user store (email → { name, email, passwordHash })
const users = [];

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json()); // parse JSON bodies

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ------ Authentication routes ------
// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ name, email, passwordHash });
  res.status(201).json({ message: 'User created' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ email: user.email, name: user.name }, secret, { expiresIn: '1h' });
  res.json({ token });
});

// Fallback for unknown routes – serve index.html (optional)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`DevFlow server listening on http://localhost:${PORT}`);
});
