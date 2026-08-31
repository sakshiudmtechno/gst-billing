const fs = require('fs');

const dbFile = 'db.json';
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}
