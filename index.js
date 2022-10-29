const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const checkDir = () => {
  const dir = path.join(__dirname, 'files');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

checkDir();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://' + req.headers.host);

  switch (url.pathname) {
    case '/base2png':
      if (req.method === 'POST') {
        const chunk = [];
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        req.on('data', (data) => {
          chunk.push(data);
        });
        req.on('end', () => {
          const id = Date.now() + '_' + crypto.randomUUID();

          const filePath = path.join(__dirname, 'files', id + '.png');
          fs.writeFile(filePath, Buffer.from(Buffer.concat(chunk).toString(), 'base64'), (err) => {
            if (err) {
              res.end('error');
            } else {
              res.end(id);
            }
          });

          setTimeout(() => {
            fs.rmSync(filePath);
          }, 1000 * 60 * 5);

          res.write(id);
          res.end();
        });
      } else if (req.method === 'GET') {
        const id = url.searchParams.get('id');
        if (!id) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('id is required');
          return;
        } else {
          const filePath = path.join(__dirname, 'files', id + '.png');
          if (fs.existsSync(filePath)) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            fs.createReadStream(filePath).pipe(res);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('not found');
          }
        }
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

setInterval(() => {
  try {
    // remove old files
    const dir = path.join(__dirname, 'files');
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const now = Date.now();
      const diff = now - stats.mtimeMs;
      if (diff > 1000 * 60 * 5) {
        fs.rmSync(filePath);
      }
    });
  } catch (err) {
    console.error(err);
  }
}, 1000 * 60 * 30);

server.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on', server.address());
});
