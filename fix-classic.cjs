const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Replace Classic Headers
const classicHeaderRegex = /<th className="p-2 border-r border-indigo-900">Item Description<\/th>\s*<th className="p-2 text-right border-r border-indigo-900 w-24">Amount \(₹\)<\/th>\s*<th className="p-2 text-right border-r border-indigo-900 w-16">Disc<\/th>\s*<th className="p-2 text-right border-r border-indigo-900 w-20">Taxable \(₹\)<\/th>\s*<th className="p-2 text-center border-r border-indigo-900 w-12">GST<\/th>\s*\{isInterState \?\s*\(\s*<th className="p-2 text-right border-r border-indigo-900 w-20">IGST \(₹\)<\/th>\s*\)\s*:\s*\(\s*<>\s*<th className="p-2 text-right border-r border-indigo-900 w-16">CGST<\/th>\s*<th className="p-2 text-right border-r border-indigo-900 w-16">SGST<\/th>\s*<\/>\s*\)\}\s*<th className="p-2 text-right w-24">Total \(₹\)<\/th>/;

const classicNewHeaders = `<th className="p-2 border-r border-indigo-900">Item Description</th>
                  <th className="p-2 text-right border-r border-indigo-900 w-24">Amount (₹)</th>
                  <th className="p-2 text-right border-r border-indigo-900 w-16">Disc</th>
                  {!isQuote && <th className="p-2 text-right border-r border-indigo-900 w-20">Taxable (₹)</th>}
                  {!isQuote && <th className="p-2 text-center border-r border-indigo-900 w-12">GST</th>}
                  {!isQuote && (isInterState ? (
                    <th className="p-2 text-right border-r border-indigo-900 w-20">IGST (₹)</th>
                  ) : (
                    <>
                      <th className="p-2 text-right border-r border-indigo-900 w-16">CGST</th>
                      <th className="p-2 text-right border-r border-indigo-900 w-16">SGST</th>
                    </>
                  ))}
                  <th className="p-2 text-right w-24">Total (₹)</th>`;

content = content.replace(classicHeaderRegex, classicNewHeaders);

// Replace Classic Body
const classicBodyRegex = /<td className="p-2 text-right text-slate-800 border-r border-slate-200 font-mono">\{formatINR\(item\.rate, false\)\}<\/td>\s*<td className="p-2 text-right text-slate-600 border-r border-slate-200 font-mono">\s*\{item\.discountAmount > 0 \? \`-\$\{formatINR\(item\.discountAmount, false\)\}\` : '-'\}\s*<\/td>\s*<td className="p-2 text-right text-slate-800 border-r border-slate-200 font-mono font-semibold">\s*\{formatINR\(item\.taxableAmount, false\)\}\s*<\/td>\s*<td className="p-2 text-center text-slate-700 border-r border-slate-200 font-medium">\{item\.gstRate\}%<\/td>\s*\{isInterState \?\s*\(\s*<td className="p-2 text-right text-slate-700 border-r border-slate-200 font-mono">\s*\{formatINR\(item\.igstAmount \|\| item\.totalGstAmount, false\)\}\s*<\/td>\s*\)\s*:\s*\(\s*<>\s*<td className="p-2 text-right text-slate-700 border-r border-slate-200 font-mono">\s*\{formatINR\(item\.cgstAmount \|\| item\.totalGstAmount \/ 2, false\)\}\s*<\/td>\s*<td className="p-2 text-right text-slate-700 border-r border-slate-200 font-mono">\s*\{formatINR\(item\.sgstAmount \|\| item\.totalGstAmount \/ 2, false\)\}\s*<\/td>\s*<\/>\s*\)\}\s*<td className="p-2 text-right font-bold text-indigo-950 font-mono bg-indigo-50\/30">\s*\{formatINR\(item\.total, false\)\}\s*<\/td>/;

const classicNewBody = `<td className="p-2 text-right text-slate-800 border-r border-slate-200 font-mono">{formatINR(item.rate, false)}</td>
                    <td className="p-2 text-right text-slate-600 border-r border-slate-200 font-mono">
                      {item.discountAmount > 0 ? \`-\${formatINR(item.discountAmount, false)}\` : '-'}
                    </td>
                    {!isQuote && <td className="p-2 text-right text-slate-800 border-r border-slate-200 font-mono font-semibold">
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
                      {formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}
                    </td>`;

content = content.replace(classicBodyRegex, classicNewBody);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
