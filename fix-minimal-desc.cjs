const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

const minimalBodyRegex = /<td className="py-2\.5 font-medium">\{item\.name\}<\/td>/;
const minimalNewBody = `<td className="py-2.5">
                    <p className="font-medium text-black">{item.name}</p>
                    {item.description && <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">{item.description}</p>}
                  </td>`;

content = content.replace(minimalBodyRegex, minimalNewBody);

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
