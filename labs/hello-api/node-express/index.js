const express = require('express');

const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World', language: 'Node.js', framework: 'Express' });
});

const PORT = 8002;
app.listen(PORT, () => console.log(`Express listening on http://localhost:${PORT}`));
