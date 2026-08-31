const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

content = content.replace(/TAX INVOICE\s*<\/div>/, "{docTitle}\n                </div>");
content = content.replace(/GST Tax Invoice\s*<\/div>/, "{docTitle}\n                </div>");
content = content.replace(/Tax Invoice\s*<\/p>/, "{docTitle}\n              </p>");
content = content.replace(/\{docTitle\}<\/p>/, "{docTitle}</p>");

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
