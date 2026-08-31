const fs = require('fs');

let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Replace {formatINR(invoice.grandTotal)} with {formatINR(isQuote ? invoice.totalTaxableAmount : invoice.grandTotal)} globally
content = content.replace(/formatINR\(invoice\.grandTotal\)/g, "formatINR(isQuote ? invoice.totalTaxableAmount : invoice.grandTotal)");
content = content.replace(/numberToIndianWords\(invoice\.grandTotal\)/g, "numberToIndianWords(isQuote ? invoice.totalTaxableAmount : invoice.grandTotal)");

// For modern template, there's a TAX INVOICE at the top right maybe?
// Let's check where 'TAX INVOICE' is used.
content = content.replace(
  />TAX INVOICE</g,
  ">{docTitle}<"
);
content = content.replace(
  />Tax Invoice</gi,
  ">{docTitle}<"
);
content = content.replace(
  />GST Tax Invoice</gi,
  ">{docTitle}<"
);


// We might have missed some "TAX INVOICE" strings. Let's do a case-insensitive replace where appropriate, but docTitle is uppercase.
fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
