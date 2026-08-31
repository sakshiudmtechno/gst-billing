const http = require('http');

const data = JSON.stringify({
  quoteNumber: 'EST-1234',
  client: { name: 'Test' },
  large: 'A'.repeat(1500000)
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/quotes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  console.log('STATUS:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', console.error);
req.write(data);
req.end();
