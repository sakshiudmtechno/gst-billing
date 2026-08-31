const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Replace Minimal Headers
const minimalHeaderRegex = /<th className="py-2 text-right">Taxable<\/th>\s*<th className="py-2 text-right">GST<\/th>\s*<th className="py-2 text-right">Total<\/th>/;

const minimalNewHeaders = `{!isQuote && <th className="py-2 text-right">Taxable</th>}
                {!isQuote && <th className="py-2 text-right">GST</th>}
                <th className="py-2 text-right">{isQuote ? 'Amount' : 'Total'}</th>`;

content = content.replace(minimalHeaderRegex, minimalNewHeaders);

// Replace Minimal Body
const minimalBodyRegex = /<td className="py-2\.5 text-right font-mono">\{formatINR\(item\.taxableAmount, false\)\}<\/td>\s*<td className="py-2\.5 text-right font-mono">\{formatINR\(item\.totalGstAmount, false\)\}<\/td>\s*<td className="py-2\.5 text-right font-mono font-bold text-black">\{formatINR\(item\.total, false\)\}<\/td>/;

const minimalNewBody = `{!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.taxableAmount, false)}</td>}
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.totalGstAmount, false)}</td>}
                  <td className="py-2.5 text-right font-mono font-bold text-black">{formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}</td>`;

content = content.replace(minimalBodyRegex, minimalNewBody);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
