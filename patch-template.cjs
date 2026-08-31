const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Add documentTitle to props
content = content.replace(/id\?: string;\n  isPrintMode\?: boolean;\n\}/, "id?: string;\n  isPrintMode?: boolean;\n  documentTitle?: string;\n}");

content = content.replace(/isPrintMode = false\n\}\) => \{/, "isPrintMode = false,\n  documentTitle\n}) => {");

// Determine document title based on quoteNumber or fallback
content = content.replace(/const isInterState =.*?;/, `$&
  const isQuote = !!(invoice as any).quoteNumber;
  const docTitle = documentTitle || (isQuote ? 'ESTIMATE / QUOTATION' : 'TAX INVOICE');
`);

// Replace TAX INVOICE hardcodings
content = content.replace(/>TAX INVOICE</g, ">{docTitle}<");
content = content.replace(/>GST Tax Invoice</g, ">{docTitle}<");
content = content.replace(/>Tax Invoice</g, ">{docTitle}<");
content = content.replace(/Invoice No:/g, "{isQuote ? 'Quote No:' : 'Invoice No:'}");
content = content.replace(/Invoice Date:/g, "{isQuote ? 'Quote Date:' : 'Invoice Date:'}");
content = content.replace(/Due Date:/g, "{isQuote ? 'Valid Until:' : 'Due Date:'}");

// Invoice.invoiceNumber doesn't exist on quote, quote has quoteNumber
content = content.replace(/\{invoice\.invoiceNumber\}/g, "{(invoice as any).quoteNumber || invoice.invoiceNumber}");
content = content.replace(/\{invoice\.invoiceDate\}/g, "{(invoice as any).quoteDate || invoice.invoiceDate}");
content = content.replace(/\{invoice\.dueDate\}/g, "{(invoice as any).validUntil || invoice.dueDate}");

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
