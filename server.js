const http = require('http');
const fetch = require('node-fetch'); // Версия 2.6.7 работает с require()

const WEBHOOK_URL = "https://discord.com/api/webhooks/1397978005007110334/13sdkqWcsZu_YoyBgOpoWgrPfOzHBRL-R8dydXTLYI7KZIc4jSKlpcUX16vrrrC1nQqS";

let lastCommand = "";
let lastArgs = [];
let lastInjectData = null;

const server = http.createServer(async (req, res) => {
    // Прием данных от Lua
    if (req.url === '/inject' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
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
                }
                res.writeHead(200);
                res.end("OK");
            } catch (err) {
                console.error("[ERROR]", err);
                res.writeHead(500);
                res.end("ERROR");
            }
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
