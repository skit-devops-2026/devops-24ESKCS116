const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/devflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const app = express();
const PORT = process.env.PORT || 3000;
// Enforce JWT_SECRET requirement with safe local dev fallback
if (!process.env.JWT_SECRET) {
  console.error('Fatal: JWT_SECRET environment variable is required but not set.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory data store removed – using MongoDB via Mongoose

// Lightweight in-memory rate limiter for auth routes (15 attempts per 15 minutes)
const authAttempts = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 15;

function authRateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = authAttempts.get(ip) || { count: 0, resetTime: now + AUTH_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + AUTH_WINDOW_MS;
  } else {
    record.count += 1;
  }

  authAttempts.set(ip, record);

  if (record.count > AUTH_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: `Too many attempts from this IP. Please try again in ${retryAfter} seconds.`,
    });
  }

  next();
}

// Middleware: Body parsing
app.use(express.json());

// Middleware: Restrict static file serving to public assets and pages only
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Serve root landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// JWT authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ------ Authentication routes ------

// POST /api/auth/signup
app.post('/api/auth/signup', authRateLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be between 8 and 72 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new User({ name: name.trim(), email: normalizedEmail, passwordHash });
  await newUser.save();
  res.status(201).json({ success: true, message: 'User created' });
});

// POST /api/auth/login
app.post('/api/auth/login', authRateLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token });
});

// ------ Project routes ------

app.post('/api/projects', authenticate, async (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  }
  const project = new Project({
    userEmail: req.user.email,
    name: name.trim(),
    description: typeof description === 'string' ? description.trim() : ''
  });
  await project.save();
  res.status(201).json(project);
});

app.get('/api/projects', authenticate, async (req, res) => {
  const userProjects = await Project.find({ userEmail: req.user.email }).lean();
  res.json(userProjects);
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const update = {};
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Valid project name is required' });
    }
    update.name = name.trim();
  }
  if (description !== undefined) {
    update.description = typeof description === 'string' ? description.trim() : '';
  }
  const proj = await Project.findOneAndUpdate({ _id: id, userEmail: req.user.email }, update, { new: true });
  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(proj);
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const proj = await Project.findOneAndDelete({ _id: id, userEmail: req.user.email });
  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }
  // Cascade delete tasks linked to this project for this user
  await Task.deleteMany({ projectId: id, userEmail: req.user.email });
  res.status(204).send();
});

// ------ Task routes ------

app.post('/api/tasks', authenticate, async (req, res) => {
  const { projectId, title, description, status, priority } = req.body;
  if (!projectId || !title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'projectId and title are required' });
  }

  const project = await Project.findOne({ _id: projectId, userEmail: req.user.email });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const validStatuses = ['To Do', 'In Progress', 'Done'];
  const validPriorities = ['Low', 'Medium', 'High'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  const task = new Task({
    projectId,
    userEmail: req.user.email,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    status: status || 'To Do',
    priority: priority || 'Medium'
  });
  await task.save();
  res.status(201).json(task);
});

app.get('/api/tasks', authenticate, async (req, res) => {
  const { projectId } = req.query;
  const filter = { userEmail: req.user.email };
  if (projectId) {
    filter.projectId = projectId;
  }
  const userTasks = await Task.find(filter).lean();
  res.json(userTasks);
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;
  const validStatuses = ['To Do', 'In Progress', 'Done'];
  const validPriorities = ['Low', 'Medium', 'High'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  const update = {};
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Valid title is required' });
    }
    update.title = title.trim();
  }
  if (description !== undefined) {
    update.description = typeof description === 'string' ? description.trim() : '';
  }
  if (status !== undefined) update.status = status;
  if (priority !== undefined) update.priority = priority;

  const task = await Task.findOneAndUpdate({ _id: id, userEmail: req.user.email }, update, { new: true });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const result = await Task.deleteOne({ _id: id, userEmail: req.user.email });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

// Fallback for unknown routes (returns 404 for unmapped requests)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(PORT, () => {
  console.log(`DevFlow server listening on http://localhost:${PORT}`);
});
