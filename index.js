const http = require('http');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://' + req.headers.host);

  switch (url.pathname) {
    case '/base2png':
      if (req.method === 'POST') {
        const chunk = [];
        res.writeHead(200, { 'Content-Type': 'image/png' });
        req.on('data', (data) => {
          chunk.push(data);
        });
        req.on('end', () => {
          res.write(Buffer.from(Buffer.concat(chunk).toString(), 'base64'));
          res.end();
        });
      } else {
        res.statusCode = 405;
        res.end();
      }
      break;
    default:
      res.writeHead(404);
      res.end();
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on', server.address());
});
