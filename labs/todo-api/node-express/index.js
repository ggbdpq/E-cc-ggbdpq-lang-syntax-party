const express = require('express');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

let seq = 1;
const todos = [];

const find = (id) => todos.find((t) => t.id === id);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/todos', (_req, res) => res.json({ items: todos }));

app.post('/todos', (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ error: 'title required' });
  const item = { id: seq++, title, done: false };
  todos.push(item);
  res.status(201).json(item);
});

app.patch('/todos/:id', (req, res) => {
  const item = find(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'todo not found' });
  if (typeof req.body?.title === 'string' && req.body.title.trim()) item.title = req.body.title.trim();
  if (typeof req.body?.done === 'boolean') item.done = req.body.done;
  res.json(item);
});

app.delete('/todos/:id', (req, res) => {
  const i = todos.findIndex((t) => t.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: 'todo not found' });
  todos.splice(i, 1);
  res.status(204).end();
});

const PORT = 8012;
app.listen(PORT, () => console.log(`Express todo listening on http://localhost:${PORT}`));
