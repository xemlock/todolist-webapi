const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 8765;
const app = express();

let todosCounter = 0;
const todos = [];

function unslash(str) {
  return String(str).replace(/^\/+|\/+$/, '');
}

function absUrl(req, path) {
  return `${req.protocol}://${unslash(req.get('host')).replace()}/${unslash(path)}`;
}

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.append('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    next();
});

app.use(bodyParser.json({
  type: '*/*',
}));

app.get('/todos', (req, res) => {
  res.json({ todos });
});

app.post('/todos', (req, res) => {
  if (!req.body) {
    res.status(400).send();
    return;
  }

  const id = ++todosCounter;
  const todoItem = {
    id,
    title: String(req.body.title || ''),
    completed: Boolean(req.body.completed),
    _links: {
      self: {
        href: absUrl(req, `/todos/${id}`),
      },
    },
  };
  todos.push(todoItem);

  res.status(201);
  res.set('Location', todoItem._links.self.href);
  res.send();
});

app.get('/todos/:id', (req, res) => {
  const id = +req.params.id;
  const item = todos.filter(item => item.id === id)[0];

  if (!item) {
    res.status(404).send();
    return;
  }

  res.json(item);
});

app.put('/todos/:id', (req, res) => {
  const id = +req.params.id;
  const item = todos.filter(item => item.id === id)[0];

  if (!item) {
    res.status(404).send();
    return;
  }

  if (!req.body) {
    res.status(400).send();
    return;
  }

  if ('title' in req.body) {
    item.title = String(req.body.title);
  }
  if ('completed' in req.body) {
    item.completed = Boolean(req.body.completed);
  }

  res.status(204).send();
});

app.delete('/todos/:id', (req, res) => {
  const id = +req.params.id;
  const index = todos.findIndex(item => item.id === id);

  if (index == -1) {
    res.status(404).send();
    return;
  }

  todos.splice(index, 1);

  res.status(204).send();
});

app.options('*', (req, res) => {
  res.send();
});

app.listen(port, () => {
  console.log(`Todolist WebAPI is listening on port ${port}`);
});
