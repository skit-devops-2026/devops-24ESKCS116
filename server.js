const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Enforce JWT_SECRET requirement with safe local dev fallback
const JWT_SECRET = process.env.JWT_SECRET || 'devflow-default-jwt-secret-key-2026';
if (!process.env.JWT_SECRET) {
  console.warn('Notice: JWT_SECRET environment variable was not set. Using default development secret.');
}

// In-memory data store
const users = [];
const projects = [];
const tasks = [];

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
  const existing = users.find((u) => u.email === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ name: name.trim(), email: normalizedEmail, passwordHash });
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
  const user = users.find((u) => u.email === normalizedEmail);
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

app.post('/api/projects', authenticate, (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
  const project = {
    id,
    userEmail: req.user.email,
    name: name.trim(),
    description: typeof description === 'string' ? description.trim() : '',
  };
  projects.push(project);
  res.status(201).json(project);
});

app.get('/api/projects', authenticate, (req, res) => {
  const userProjects = projects.filter((p) => p.userEmail === req.user.email);
  res.json(userProjects);
});

app.put('/api/projects/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const proj = projects.find((p) => String(p.id) === String(id) && p.userEmail === req.user.email);
  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { name, description } = req.body;
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Valid project name is required' });
    }
    proj.name = name.trim();
  }
  if (description !== undefined) {
    proj.description = typeof description === 'string' ? description.trim() : '';
  }
  res.json(proj);
});

app.delete('/api/projects/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const index = projects.findIndex((p) => String(p.id) === String(id) && p.userEmail === req.user.email);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Delete project
  projects.splice(index, 1);

  // Cascade delete associated tasks
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (String(tasks[i].projectId) === String(id) && tasks[i].userEmail === req.user.email) {
      tasks.splice(i, 1);
    }
  }

  res.status(204).send();
});

// ------ Task routes ------

app.post('/api/tasks', authenticate, (req, res) => {
  const { projectId, title, description, status, priority } = req.body;
  if (!projectId || !title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'projectId and title are required' });
  }

  const project = projects.find((p) => String(p.id) === String(projectId) && p.userEmail === req.user.email);
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

  const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
  const task = {
    id,
    projectId: String(projectId),
    userEmail: req.user.email,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    status: status || 'To Do',
    priority: priority || 'Medium',
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/api/tasks', authenticate, (req, res) => {
  const { projectId } = req.query;
  let userTasks = tasks.filter((t) => t.userEmail === req.user.email);
  if (projectId) {
    userTasks = userTasks.filter((t) => String(t.projectId) === String(projectId));
  }
  res.json(userTasks);
});

app.put('/api/tasks/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const task = tasks.find((t) => String(t.id) === String(id) && t.userEmail === req.user.email);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, status, priority } = req.body;
  const validStatuses = ['To Do', 'In Progress', 'Done'];
  const validPriorities = ['Low', 'Medium', 'High'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Valid title is required' });
    }
    task.title = title.trim();
  }
  if (description !== undefined) {
    task.description = typeof description === 'string' ? description.trim() : '';
  }
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;

  res.json(task);
});

app.delete('/api/tasks/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => String(t.id) === String(id) && t.userEmail === req.user.email);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
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
