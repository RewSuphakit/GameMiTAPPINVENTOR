/**
 * ==============================================================================
 * ULTRA-LIGHTWEIGHT ZERO-DEPENDENCY HTTP SERVER (server.js)
 * ==============================================================================
 * เซิร์ฟเวอร์ในเครื่องขนาดเล็กพิเศษ พัฒนาด้วย Node.js Built-in Modules 100%
 * ไม่ต้องติดตั้ง npm packages ใด ๆ รันได้ทันที
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8'
};

// ค้นหา Local IPv4 สำหรับให้นักเรียนเชื่อมต่อผ่าน Wi-Fi
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  // รองรับ CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // แปลง URL ให้เป็น File Path
  let cleanUrl = req.url.split('?')[0];
  if (cleanUrl === '/' || cleanUrl === '') cleanUrl = '/index.html';

  // ป้องกัน Path Traversal
  const safePath = path.normalize(decodeURIComponent(cleanUrl)).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>ไม่พบไฟล์: ${safePath}</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const localIps = getLocalIPs();
  console.clear();
  console.log('================================================================');
  console.log('  🤖 App Inventor: The Code Breaker Mission (Local Server)');
  console.log('================================================================');
  console.log(`\n  💻 เปิดใช้งานในเครื่องนี้:  http://localhost:${PORT}`);
  if (localIps.length > 0) {
    console.log(`  📱 ให้นักเรียนเปิดบนมือถือ (Wi-Fi เดียวกัน):`);
    localIps.forEach(ip => {
      console.log(`     👉 http://${ip}:${PORT}`);
    });
  }
  console.log('\n  (กด Ctrl + C เมื่อต้องการหยุดเซิร์ฟเวอร์)');
  console.log('================================================================\n');

  // เปิดเบราว์เซอร์อัตโนมัติบน Windows
  exec(`start http://localhost:${PORT}`, (err) => {
    if (err) console.log('กำลังเปิดเบราว์เซอร์...');
  });
});
