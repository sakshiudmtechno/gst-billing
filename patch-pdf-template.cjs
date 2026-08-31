const fs = require('fs');

let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// docTitle logic:
content = content.replace(
  /const docTitle = documentTitle \|\| \(isQuote \? 'ESTIMATE \/ QUOTATION' : 'TAX INVOICE'\);/,
  "const docTitle = documentTitle || (isQuote ? 'SERVICE QUOTATION' : 'TAX INVOICE');"
);

// Billed To -> Quotation For
content = content.replace(
  /Billed To \(Client Details\)/g,
  "{isQuote ? 'Quotation For (Client Details)' : 'Billed To (Client Details)'}"
);
content = content.replace(
  /Billed To<\/span>/g,
  "{isQuote ? 'Quotation For' : 'Billed To'}</span>"
);

// Table headers for CLASSIC
const classicThs = `<th className="p-2 text-left font-semibold">Item Description</th>
                  <th className="p-2 text-right w-24">Amount (₹)</th>
                  <th className="p-2 text-right w-16">Disc</th>
                  {!isQuote && <th className="p-2 text-right border-r border-indigo-900 w-20">Taxable (₹)</th>}
                  {!isQuote && <th className="p-2 text-center border-r border-indigo-900 w-12">GST</th>}
                  {!isQuote && isInterState ? (
                    <th className="p-2 text-right border-r border-indigo-900 w-20">IGST (₹)</th>
                  ) : (!isQuote && (
                    <>
                      <th className="p-2 text-right border-r border-indigo-900 w-16">CGST</th>
                      <th className="p-2 text-right border-r border-indigo-900 w-16">SGST</th>
                    </>
                  ))}
                  <th className="p-2 text-right w-24">Total (₹)</th>`;

content = content.replace(
  /<th className="p-2 text-left font-semibold">Item Description<\/th>[\s\S]*?<th className="p-2 text-right w-24">Total \(₹\)<\/th>/,
  classicThs
);

const classicTds = `<td className="p-2">
                      <p className="font-bold text-slate-900 leading-tight flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                        {item.name}
                      </p>
                      {item.description && <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">{item.description}</p>}
                    </td>
                    <td className="p-2 text-right text-slate-800 font-mono">
                      {formatINR(item.rate * item.quantity, false)}
                    </td>
                    <td className="p-2 text-right text-slate-600 font-mono">
                      {item.discountAmount > 0 ? \`-\${formatINR(item.discountAmount, false)}\` : '-'}
                    </td>
                    {!isQuote && <td className="p-2 text-right text-slate-800 font-mono font-semibold border-r border-slate-200">
                      {formatINR(item.taxableAmount, false)}
                    </td>}
                    {!isQuote && <td className="p-2 text-center text-slate-700 border-r border-slate-200 font-medium">{item.gstRate}%</td>}
                    {!isQuote && (isInterState ? (
                      <td className="p-2 text-right text-slate-700 border-r border-slate-200 font-mono">
                        {formatINR(item.igstAmount || item.totalGstAmount, false)}
                      </td>
                    ) : (
                      <>
                        <td className="p-2 text-right text-slate-700 border-r border-slate-200 font-mono">
                          {formatINR(item.cgstAmount || item.totalGstAmount / 2, false)}
                        </td>
                        <td className="p-2 text-right text-slate-700 border-r border-slate-200 font-mono">
                          {formatINR(item.sgstAmount || item.totalGstAmount / 2, false)}
                        </td>
                      </>
                    ))}
                    <td className="p-2 text-right font-bold text-indigo-950 font-mono bg-indigo-50/30">
                      {formatINR(isQuote ? item.rate * item.quantity - (item.discountAmount || 0) : item.total, false)}
                    </td>`;

content = content.replace(
  /<td className="p-2">[\s\S]*?<td className="p-2 text-right font-bold text-indigo-950 font-mono bg-indigo-50\/30">[\s\S]*?<\/td>/,
  classicTds
);

// Also remove GST summary for quotes
content = content.replace(
  /<span>Taxable Amount:<\/span>\s*<span className="font-mono">\{formatINR\(invoice\.totalTaxableAmount\)\}<\/span>\s*<\/div>\s*\{\/\* GST Split \*\/\}/g,
  `<span>{isQuote ? 'Subtotal:' : 'Taxable Amount:'}</span>
                <span className="font-mono">{formatINR(invoice.totalTaxableAmount)}</span>
              </div>

              {/* GST Split */}
              {!isQuote && (`
);

content = content.replace(
  /<\/div>\s*\)\}\s*\{\/\* Additional Charges \*\/\}/g,
  `</div>
              )}
              
              {/* Additional Charges */}`
);


// Same for modern template
const modernThs = `<th className="p-3 text-left">Item Description</th>
                  <th className="p-3 text-right w-24">Rate</th>
                  <th className="p-3 text-center w-12">Qty</th>
                  <th className="p-3 text-right w-24">{isQuote ? 'Amount' : 'Taxable'}</th>
                  {!isQuote && <th className="p-3 text-center w-14">GST</th>}
                  {!isQuote && <th className="p-3 text-right w-24">GST Amt</th>}
                  <th className="p-3 text-right w-28">Total</th>`;
                  
content = content.replace(
  /<th className="p-3 text-left">Item Description<\/th>[\s\S]*?<th className="p-3 text-right w-28">Total<\/th>/,
  modernThs
);

const modernTds = `<td className="p-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">{item.description}</p>}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.rate, false)}</td>
                    <td className="p-3 text-center font-medium text-slate-700">{item.quantity}</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-900">{formatINR(item.taxableAmount, false)}</td>
                    {!isQuote && <td className="p-3 text-center text-slate-600">{item.gstRate}%</td>}
                    {!isQuote && <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.totalGstAmount, false)}</td>}
                    <td className="p-3 text-right font-mono font-bold text-indigo-950">{formatINR(isQuote ? item.taxableAmount : item.total, false)}</td>`;

content = content.replace(
  /<td className="p-3">\s*<p className="font-bold text-slate-900">\{item\.name\}<\/p>[\s\S]*?<td className="p-3 text-right font-mono font-bold text-indigo-950">\{formatINR\(item\.total, false\)\}<\/td>/,
  modernTds
);

content = content.replace(
  /<span>Taxable Value:<\/span>\s*<span className="font-mono">\{formatINR\(invoice\.totalTaxableAmount\)\}<\/span>\s*<\/div>\s*\{isInterState \?/g,
  `<span>{isQuote ? 'Subtotal:' : 'Taxable Value:'}</span>
                <span className="font-mono">{formatINR(invoice.totalTaxableAmount)}</span>
              </div>
              {!isQuote && (isInterState ?`
);

content = content.replace(
  /<\/div>\s*\)\s*\}\s*<div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-700 mt-2">/g,
  `</div>
              ))}
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-700 mt-2">`
);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
