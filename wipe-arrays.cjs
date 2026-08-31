const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

// The initialDb is assigned starting around line 21 and ends before loadDb()
// We can use a regex to replace the arrays.
// Or simply find the lines and replace them.

content = content.replace(/clients: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'clients: []$1');
content = content.replace(/invoices: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'invoices: []$1');
content = content.replace(/quotes: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'quotes: []$1');
content = content.replace(/creditNotes: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'creditNotes: []$1');
content = content.replace(/recurringInvoices: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'recurringInvoices: []$1');
content = content.replace(/expenses: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'expenses: []$1');
content = content.replace(/auditLogs: \[\s*\{[\s\S]*?\}\s*\](,?)/, 'auditLogs: []$1');

fs.writeFileSync('server.ts', content);
