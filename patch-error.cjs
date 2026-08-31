const fs = require('fs');
let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

content = content.replace(
  /alert\('Failed to save quote'\);/g,
  'alert(`Failed to save quote: ${err.message || err}`);'
);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
