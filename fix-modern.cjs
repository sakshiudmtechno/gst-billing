const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Replace Modern Headers
const modernHeaderRegex = /<th className="p-3 text-right w-24">\{isQuote \? 'Amount' : 'Taxable'\}<\/th>\s*\{!isQuote && <th className="p-3 text-center w-14">GST<\/th>\}\s*\{!isQuote && <th className="p-3 text-right w-24">GST Amt<\/th>\}\s*<th className="p-3 text-right w-28">Total<\/th>/;

const modernNewHeaders = `<th className="p-3 text-right w-24">{isQuote ? 'Amount' : 'Taxable'}</th>
                  {!isQuote && <th className="p-3 text-center w-14">GST</th>}
                  {!isQuote && <th className="p-3 text-right w-24">GST Amt</th>}
                  {!isQuote && <th className="p-3 text-right w-28">Total</th>}`;

content = content.replace(modernHeaderRegex, modernNewHeaders);

// Replace Modern Body
const modernBodyRegex = /<td className="p-3 text-right font-mono font-semibold text-slate-900">\{formatINR\(item\.taxableAmount, false\)\}<\/td>\s*\{!isQuote && <td className="p-3 text-center text-slate-600">\{item\.gstRate\}%<\/td>\}\s*\{!isQuote && <td className="p-3 text-right font-mono text-slate-700">\{formatINR\(item\.totalGstAmount, false\)\}<\/td>\}\s*<td className="p-3 text-right font-mono font-bold text-indigo-950">\{formatINR\(isQuote \? item\.taxableAmount : item\.total, false\)\}<\/td>/;

const modernNewBody = `<td className="p-3 text-right font-mono font-semibold text-slate-900">{formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.taxableAmount, false)}</td>
                    {!isQuote && <td className="p-3 text-center text-slate-600">{item.gstRate}%</td>}
                    {!isQuote && <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.totalGstAmount, false)}</td>}
                    {!isQuote && <td className="p-3 text-right font-mono font-bold text-indigo-950">{formatINR(item.total, false)}</td>}`;

content = content.replace(modernBodyRegex, modernNewBody);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
