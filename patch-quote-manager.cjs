const fs = require('fs');
let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

// 1. Strip logoUrl from seller when creating quote
content = content.replace(
  /seller: businessProfile/,
  `seller: businessProfile ? { ...businessProfile, logoUrl: undefined } : undefined`
);

// 2. Make sure viewingQuote PDF uses the latest business profile
content = content.replace(
  /businessProfile=\{viewingQuote\.seller \|\| businessProfile!\}/g,
  `businessProfile={businessProfile!}`
);
content = content.replace(
  /businessProfile=\{quote\.seller \|\| businessProfile!\}/g,
  `businessProfile={businessProfile!}`
);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
