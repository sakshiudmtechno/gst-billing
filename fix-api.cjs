const fs = require('fs');

let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

content = content.replace(
  /const quoteRes = await api\.createQuote\(newQuote as any\);\n\s+if \(quoteRes\.success\) \{\n\s+setIsCreating\(false\);\n\s+onRefresh\(\);\n\s+setViewingQuote\(quoteRes\.data\);\n\s+\}/s,
  `const savedQuote = await api.createQuote(newQuote as any);
      setIsCreating(false);
      onRefresh();
      setViewingQuote(savedQuote);`
);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
