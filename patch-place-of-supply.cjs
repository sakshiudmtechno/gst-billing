const fs = require('fs');
let content = fs.readFileSync('src/components/invoices/InvoicePDFTemplate.tsx', 'utf-8');

// CLASSIC TEMPLATE PATCH
// 1. Make the left box take full width if isQuote
const classicLeftTarget = `<div className="flex flex-row justify-between gap-4 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
            <div className="w-[calc(58.333%-8px)] shrink-0">`;
const classicLeftReplacement = `<div className="flex flex-row justify-between gap-4 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
            <div className={isQuote ? "w-full" : "w-[calc(58.333%-8px)] shrink-0"}>`;
if (content.includes(classicLeftTarget)) {
  content = content.replace(classicLeftTarget, classicLeftReplacement);
} else {
  console.log("Could not find classicLeftTarget");
}

// 2. Wrap the right box (Supply & Service Details) in {!isQuote && ( ... )}
const classicRightTarget = `<div className="w-[calc(41.666%-8px)] shrink-0 bg-white p-3 rounded border border-slate-200 flex flex-col justify-between">`;
const classicRightReplacement = `{!isQuote && (
              <div className="w-[calc(41.666%-8px)] shrink-0 bg-white p-3 rounded border border-slate-200 flex flex-col justify-between">`;
if (content.includes(classicRightTarget)) {
  content = content.replace(classicRightTarget, classicRightReplacement);
} else {
  console.log("Could not find classicRightTarget");
}

// 3. Close the {!isQuote && ( ... )} block
const classicRightEndTarget = `</div>
            </div>
          </div>

          {/* Item Table */}`;
const classicRightEndReplacement = `</div>
            </div>
            )}
          </div>

          {/* Item Table */}`;
if (content.includes(classicRightEndTarget)) {
  content = content.replace(classicRightEndTarget, classicRightEndReplacement);
} else {
  console.log("Could not find classicRightEndTarget");
}


// MODERN TEMPLATE PATCH
// Hide the Tax Treatment info
const modernTaxTarget = `<div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Taxation & Payment</span>
                <p className="text-xs text-slate-600"><span className="font-semibold">Tax Treatment:</span> {isInterState ? 'Inter-State (IGST 18%)' : 'Intra-State (CGST 9% + SGST 9%)'}</p>
              </div>`;
const modernTaxReplacement = `<div>
                {!isQuote && (
                  <>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Taxation & Payment</span>
                    <p className="text-xs text-slate-600"><span className="font-semibold">Tax Treatment:</span> {isInterState ? 'Inter-State (IGST 18%)' : 'Intra-State (CGST 9% + SGST 9%)'}</p>
                  </>
                )}
              </div>`;
if (content.includes(modernTaxTarget)) {
  content = content.replace(modernTaxTarget, modernTaxReplacement);
} else {
  console.log("Could not find modernTaxTarget");
}

fs.writeFileSync('src/components/invoices/InvoicePDFTemplate.tsx', content);
console.log("Patched successfully!");
