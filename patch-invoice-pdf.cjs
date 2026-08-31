const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Add businessProfileFallback to props interface
content = content.replace(
  /documentTitle\?: string;\n}/,
  `documentTitle?: string;\n  businessProfileFallback?: any;\n}`
);

// Add to component arguments
content = content.replace(
  /documentTitle\n}\) => {/,
  `documentTitle,\n  businessProfileFallback\n}) => {`
);

// Update logoUrl extraction
content = content.replace(
  /const seller = invoice\.seller;/,
  `const seller = invoice.seller;\n  const logoUrl = seller?.logoUrl || businessProfileFallback?.logoUrl;`
);

// Replace seller.logoUrl with logoUrl in JSX
content = content.replace(/seller\.logoUrl/g, 'logoUrl');

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
