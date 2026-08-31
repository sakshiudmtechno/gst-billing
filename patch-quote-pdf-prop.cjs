const fs = require('fs');
let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

content = content.replace(
  /documentTitle="SERVICE QUOTATION"/g,
  `documentTitle="SERVICE QUOTATION"\n                businessProfileFallback={businessProfile}`
);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
