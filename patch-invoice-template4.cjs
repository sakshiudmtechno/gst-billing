const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

content = content.replace(/GST Tax Invoice\s*<\/span>/, "{docTitle}\n                </span>");

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
