const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

const target1 = `                  <p className="text-slate-700">
                    <span className="text-slate-500">Place of Supply:</span> <strong className="text-slate-900">{invoice.placeOfSupply || client.state}</strong>
                  </p>
                  <p className="text-slate-700">
                    <span className="text-slate-500">State Code:</span> <strong className="font-mono text-slate-900">{invoice.placeOfSupplyCode || client.stateCode}</strong>
                  </p>`;

const replacement1 = `                  {!isQuote && (
                    <>
                      <p className="text-slate-700">
                        <span className="text-slate-500">Place of Supply:</span> <strong className="text-slate-900">{invoice.placeOfSupply || client.state}</strong>
                      </p>
                      <p className="text-slate-700">
                        <span className="text-slate-500">State Code:</span> <strong className="font-mono text-slate-900">{invoice.placeOfSupplyCode || client.stateCode}</strong>
                      </p>
                    </>
                  )}`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
} else {
  console.log("target1 not found");
}

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
