const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoiceEditor.tsx', 'utf-8');

content = content.replace(
  /id="live-invoice-pdf"/g,
  `id="live-invoice-pdf"\n                businessProfileFallback={businessProfile}`
);

fs.writeFileSync('src/components/invoices/InvoiceEditor.tsx', content);
