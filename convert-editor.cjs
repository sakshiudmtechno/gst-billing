const fs = require('fs');

let content = fs.readFileSync('src/components/quotes/QuoteEditor.tsx', 'utf-8');

// Replacements
content = content.replace(/InvoiceEditor/g, 'QuoteEditor');
content = content.replace(/InvoiceItem/g, 'QuoteItem');
content = content.replace(/initialInvoice/g, 'initialQuote');
content = content.replace(/savedInvoice/g, 'savedQuote');

// Imports
content = content.replace(/import \{ InvoicePDFTemplate \} from '\.\/InvoicePDFTemplate';/, "import { InvoicePDFTemplate } from '../invoices/InvoicePDFTemplate';");
content = content.replace(/import \{ SendEmailModal \} from '\.\/SendEmailModal';/, "import { SendEmailModal } from '../invoices/SendEmailModal';");

// States & Props
content = content.replace(/invoiceNumber/g, 'quoteNumber');
content = content.replace(/setInvoiceNumber/g, 'setQuoteNumber');
content = content.replace(/invoiceDate/g, 'quoteDate');
content = content.replace(/setInvoiceDate/g, 'setQuoteDate');
content = content.replace(/dueDate/g, 'validUntil');
content = content.replace(/setDueDate/g, 'setValidUntil');
content = content.replace(/Invoice /g, 'Quote ');
content = content.replace(/invoice /g, 'quote ');

content = content.replace(/\/api\/invoices/g, '/api/quotes');

// Since we replaced "Invoice " -> "Quote ", let's fix some types
content = content.replace(/<Quote \| null>/g, '<Quote | null>');
// but we need to ensure Quote is imported
content = content.replace(/Invoice,/, 'Invoice, Quote, QuoteItem,');

// Also, need to map quote variables correctly for the PDF template:
// In QuoteEditor.tsx, it renders <InvoicePDFTemplate invoice={...} />
// We need to pass it as invoice={currentQuote as any}
content = content.replace(/invoice=\{currentQuote\}/g, "invoice={currentQuote as any}");

fs.writeFileSync('src/components/quotes/QuoteEditor.tsx', content);
