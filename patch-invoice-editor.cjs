const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoiceEditor.tsx', 'utf-8');

content = content.replace(
  /seller: businessProfile \|\| \{/g,
  `seller: (businessProfile ? { ...businessProfile, logoUrl: undefined } : undefined) || {`
);

fs.writeFileSync('src/components/invoices/InvoiceEditor.tsx', content);
