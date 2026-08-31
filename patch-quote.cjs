const fs = require('fs');

let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

// Ensure import of PREDEFINED_SERVICES
if (!content.includes('PREDEFINED_SERVICES')) {
  content = content.replace(/import \{ InvoicePDFTemplate \}.*?;/, "import { InvoicePDFTemplate } from '../invoices/InvoicePDFTemplate';\nimport { PREDEFINED_SERVICES } from '../../constants/services';");
}

const selectHtml = `
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Auto-fill from Templates
                        </label>
                        <select 
                          className="w-full px-2 py-1.5 border border-indigo-200 bg-indigo-50/50 rounded text-xs font-medium text-indigo-900"
                          onChange={(e) => {
                            const preset = PREDEFINED_SERVICES.find(s => s.id === e.target.value);
                            if (preset) {
                              handleItemChange(index, 'name', preset.name);
                              handleItemChange(index, 'rate', preset.rate);
                              handleItemChange(index, 'description', preset.description);
                            }
                            e.target.value = "";
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>-- Select a Standard Service Package --</option>
                          {PREDEFINED_SERVICES.map(s => (
                            <option key={s.id} value={s.id}>{s.name} - {s.pricingLabel}</option>
                          ))}
                        </select>
                      </div>
`;

// Insert the select box right after <div className="flex-1 space-y-3">
content = content.replace(/<div className="flex-1 space-y-3">/, '<div className="flex-1 space-y-3">' + selectHtml);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
