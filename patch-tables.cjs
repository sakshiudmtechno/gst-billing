const fs = require('fs');

let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Replace Classic Table
content = content.replace(
  /<thead className="bg-indigo-950 text-white uppercase text-\[10px\] tracking-wider">.*?<\/tbody>/s,
  `<thead className="bg-indigo-950 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  {!isQuote && <th className="p-2 w-8 text-center border-r border-indigo-900">#</th>}
                  <th className="p-2 border-r border-indigo-900">{isQuote ? 'Service Details' : 'Item Description'}</th>
                  {!isQuote && <th className="p-2 text-right border-r border-indigo-900 w-24">Rate (₹)</th>}
                  {!isQuote && <th className="p-2 text-right border-r border-indigo-900 w-16">Disc</th>}
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
                  <th className="p-2 text-right w-24">{isQuote ? 'Amount (₹)' : 'Total (₹)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    {!isQuote && <td className="p-2 text-center text-slate-500 font-mono border-r border-slate-200">{idx + 1}</td>}
                    <td className="p-2 border-r border-slate-200">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {item.description && <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">{item.description}</p>}
                    </td>
                    {!isQuote && <td className="p-2 text-right text-slate-800 border-r border-slate-200 font-mono">{formatINR(item.rate, false)}</td>}
                    {!isQuote && <td className="p-2 text-right text-slate-600 border-r border-slate-200 font-mono">
                      {item.discountAmount > 0 ? formatINR(item.discountAmount, false) : '-'}
                    </td>}
                    {!isQuote && <td className="p-2 text-right font-semibold text-slate-900 border-r border-slate-200 font-mono">
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
                    </td>
                  </tr>
                ))}
              </tbody>`
);

// Replace Modern Table
content = content.replace(
  /<thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-\[10px\]">.*?<\/tbody>/s,
  `<thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3 text-left">{isQuote ? 'Service Details' : 'Item Description'}</th>
                  {!isQuote && <th className="p-3 text-right w-24">Rate</th>}
                  {!isQuote && <th className="p-3 text-center w-12">Qty</th>}
                  {!isQuote && <th className="p-3 text-right w-24">Taxable</th>}
                  {!isQuote && <th className="p-3 text-center w-14">GST</th>}
                  {!isQuote && <th className="p-3 text-right w-24">GST Amt</th>}
                  <th className="p-3 text-right w-28">{isQuote ? 'Amount' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">{item.description}</p>}
                    </td>
                    {!isQuote && <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.rate, false)}</td>}
                    {!isQuote && <td className="p-3 text-center font-medium text-slate-700">{item.quantity}</td>}
                    {!isQuote && <td className="p-3 text-right font-mono font-semibold text-slate-900">{formatINR(item.taxableAmount, false)}</td>}
                    {!isQuote && <td className="p-3 text-center text-slate-600">{item.gstRate}%</td>}
                    {!isQuote && <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.totalGstAmount, false)}</td>}
                    <td className="p-3 text-right font-mono font-bold text-indigo-950">{formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}</td>
                  </tr>
                ))}
              </tbody>`
);

// Replace Minimal Table
content = content.replace(
  /<thead>\s*<tr className="border-b border-slate-300 font-bold uppercase text-\[10px\]">.*?<\/tbody>/s,
  `<thead>
              <tr className="border-b border-slate-300 font-bold uppercase text-[10px]">
                <th className="py-2">{isQuote ? 'Service Details' : 'Item'}</th>
                {!isQuote && <th className="py-2 text-right">Amount</th>}
                {!isQuote && <th className="py-2 text-right">Taxable</th>}
                {!isQuote && <th className="py-2 text-right">GST</th>}
                <th className="py-2 text-right">{isQuote ? 'Amount' : 'Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <p className="font-medium text-black">{item.name}</p>
                    {item.description && <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">{item.description}</p>}
                  </td>
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.rate, false)}</td>}
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.taxableAmount, false)}</td>}
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.totalGstAmount, false)}</td>}
                  <td className="py-2.5 text-right font-mono font-bold text-black">{formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}</td>
                </tr>
              ))}
            </tbody>`
);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
