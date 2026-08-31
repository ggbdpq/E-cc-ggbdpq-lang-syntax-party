const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = 8022;
const SECRET = 'syntax-party-jwt-lab';

const users = [
  { id: 1, username: 'demo', role: 'user', passwordHash: bcrypt.hashSync('password', 10) },
  { id: 2, username: 'admin', role: 'admin', passwordHash: bcrypt.hashSync('password', 10) },
];
let nextId = 1;
const todos = [];

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function publicUser(user) {
  return { id: user.id, username: user.username, role: user.role };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, SECRET);
    const user = users.find((u) => u.id === Number(payload.sub));
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function canWrite(user, item) {
  return item.ownerId === user.id || user.role === 'admin';
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/login', (req, res) => {
  const username = String(req.body?.username || '');
  const password = String(req.body?.password || '');
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role },
    SECRET,
    { expiresIn: '1h' },
  );
  res.json({ token, user: publicUser(user) });
});

app.get('/me', requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

app.get('/todos', requireAuth, (req, res) => {
  const items = req.user.role === 'admin'
    ? todos
    : todos.filter((t) => t.ownerId === req.user.id);
  res.json({ items });
});

app.post('/todos', requireAuth, (req, res) => {
  const title = String(req.body?.title || '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  const item = { id: nextId++, title, done: false, ownerId: req.user.id };
  todos.push(item);
  res.status(201).json(item);
});

app.patch('/todos/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const item = todos.find((t) => t.id === id);
  if (!item) return res.status(404).json({ error: 'todo not found' });
  if (!canWrite(req.user, item)) return res.status(403).json({ error: 'forbidden' });
  if (typeof req.body?.title === 'string' && req.body.title.trim()) item.title = req.body.title.trim();
  if (typeof req.body?.done === 'boolean') item.done = req.body.done;
  res.json(item);
});

app.delete('/todos/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((t) => t.id === id);
  if (index < 0) return res.status(404).json({ error: 'todo not found' });
  if (!canWrite(req.user, todos[index])) return res.status(403).json({ error: 'forbidden' });
  todos.splice(index, 1);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`auth-todo-express listening on ${PORT}`);
});
