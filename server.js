const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// In‑memory user store (email → { name, email, passwordHash })
const users = [];
const projects = [];
const tasks = [];

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json()); // parse JSON bodies

// JWT authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.slice(7);
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
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

// ------ Project routes ------
app.post('/api/projects', authenticate, (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }
  const id = Date.now().toString();
  const project = { id, userEmail: req.user.email, name, description: description || '' };
  projects.push(project);
  res.status(201).json(project);
});

app.get('/api/projects', authenticate, (req, res) => {
  const userProjects = projects.filter(p => p.userEmail === req.user.email);
  res.json(userProjects);
});

app.put('/api/projects/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const proj = projects.find(p => p.id === id && p.userEmail === req.user.email);
  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const { name, description } = req.body;
  if (name !== undefined) proj.name = name;
  if (description !== undefined) proj.description = description;
  res.json(proj);
});

app.delete('/api/projects/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const index = projects.findIndex(p => p.id === id && p.userEmail === req.user.email);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects.splice(index, 1);
  res.status(204).send();
});

// ------ Task routes ------
app.post('/api/tasks', authenticate, (req, res) => {
  const { projectId, title, description, status, priority } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ error: 'projectId and title are required' });
  }
  const project = projects.find(p => p.id === projectId && p.userEmail === req.user.email);
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
  const id = Date.now().toString();
  const task = { id, projectId, userEmail: req.user.email, title, description: description || '', status: status || 'To Do', priority: priority || 'Low' };
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/api/tasks', authenticate, (req, res) => {
  const { projectId } = req.query;
  let userTasks = tasks.filter(t => t.userEmail === req.user.email);
  if (projectId) {
    userTasks = userTasks.filter(t => t.projectId === projectId);
  }
  res.json(userTasks);
});

app.put('/api/tasks/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id && t.userEmail === req.user.email);
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
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  res.json(task);
});

app.delete('/api/tasks/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id && t.userEmail === req.user.email);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
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
