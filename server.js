const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/command' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ command: lastCommand || "" }));
  } else if (req.url === '/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      lastCommand = JSON.parse(body).command;
      res.writeHead(200);
      res.end("OK");
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const PORT = process.env.PORT || 3000;
let lastCommand = ""; // Храним последнюю команду

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
