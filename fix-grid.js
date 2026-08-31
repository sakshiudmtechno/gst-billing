const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// Replace grid-cols-12
content = content.replace(/className="grid grid-cols-12 gap-4(.*)"/g, 'className="flex flex-row justify-between$1"');

// Replace col-span-7 and col-span-5
content = content.replace(/className="col-span-7(.*?)"/g, 'className="w-[calc(58.333%-8px)] shrink-0$1"');
content = content.replace(/className="col-span-5(.*?)"/g, 'className="w-[calc(41.666%-8px)] shrink-0$1"');

// Replace grid-cols-2 gap-4
content = content.replace(/<div className="grid grid-cols-2 gap-4(.*?)">([\s\S]*?)<div className="(.*?)"/g, '<div className="flex flex-row justify-between$1">\n            <div className="w-[calc(50%-8px)] shrink-0 $3"');
// We also need to fix the second child of grid-cols-2. Let's just do it manually with sed since regex spanning multiple lines might miss something.

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
