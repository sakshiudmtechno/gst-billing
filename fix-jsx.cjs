const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

content = content.replace(
  /\{\/\* GST Split \*\/\}\s*\{\!isQuote && \(\s*\{isInterState \?\s*\(/,
  "{/* GST Split */}\n              {!isQuote && (\n                isInterState ? ("
);

content = content.replace(
  /\{\/\* GST Split \*\/\}\s*\{\!isQuote && \(\s*isInterState \?\s*\(/,
  "{/* GST Split */}\n              {!isQuote && (\n                isInterState ? ("
);

content = content.replace(
  /<\/div>\s*<\/>\s*\)\}\s*\{invoice\.additionalCharges/g,
  "</div>\n                  </>\n                )\n              )}\n\n              {invoice.additionalCharges"
);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
