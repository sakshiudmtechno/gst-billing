const fs = require('fs');

let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

// 1. Add editingQuoteId state
content = content.replace(
  /const \[isCreating, setIsCreating\] = useState\(false\);/,
  `const [isCreating, setIsCreating] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [quoteDate, setQuoteDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);`
);

// 2. Add handleEditQuote function
const handleEditQuoteStr = `
  const handleEditQuote = (quote: Quote) => {
    setEditingQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber);
    
    // Parse client name/company if they were merged like "Name (Company)"
    let cName = quote.client.name;
    let compName = '';
    const match = cName.match(/^(.*?)\\s*\\((.*?)\\)$/);
    if (match) {
      cName = match[1];
      compName = match[2];
    }
    
    setClientName(cName);
    setCompanyName(compName);
    setClientEmail(quote.client.email || '');
    setClientPhone(quote.client.phone || '');
    setClientAddress(quote.client.billingAddress || '');
    setClientState(quote.client.state || 'Madhya Pradesh');
    setClientStateCode(quote.client.stateCode || '23');
    setItems(quote.items.map(item => ({...item})));
    
    if (quote.quoteDate) setQuoteDate(quote.quoteDate);
    if (quote.validUntil) setValidUntil(quote.validUntil);
    
    setIsCreating(true);
  };
`;

content = content.replace(
  /const handleAddItem = \(\) => {/,
  handleEditQuoteStr + '\n  const handleAddItem = () => {'
);

// 3. Reset state on cancel or save completion
const resetStateStr = `
  const resetForm = () => {
    setIsCreating(false);
    setEditingQuoteId(null);
    setQuoteNumber(\`EST-\${Date.now().toString().slice(-4)}\`);
    setClientName('');
    setCompanyName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setItems([{ id: '1', name: '', description: '', rate: 0, quantity: 1, gstRate: 18 }]);
    setQuoteDate(new Date().toISOString().split('T')[0]);
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  };
`;

content = content.replace(
  /const handleAddItem = \(\) => {/,
  resetStateStr + '\n  const handleAddItem = () => {'
);

// Replace setIsCreating(false) in handleSaveQuote and UI with resetForm()
content = content.replace(/setIsCreating\(false\)/g, 'resetForm()');

// 4. Modify handleSaveQuote logic
content = content.replace(
  /quoteDate: new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],/,
  `quoteDate: quoteDate,`
);
content = content.replace(
  /validUntil: new Date\(Date\.now\(\) \+ 30 \* 86400000\)\.toISOString\(\)\.split\('T'\)\[0\],/,
  `validUntil: validUntil,`
);

content = content.replace(
  /const savedQuote = await api\.createQuote\(newQuote as any\);\s*resetForm\(\);\s*onRefresh\(\);\s*setViewingQuote\(savedQuote\);/g,
  `if (editingQuoteId) {
        const updatedQuote = await api.updateQuote(editingQuoteId, newQuote as any);
        resetForm();
        onRefresh();
        setViewingQuote(updatedQuote);
      } else {
        const savedQuote = await api.createQuote(newQuote as any);
        resetForm();
        onRefresh();
        setViewingQuote(savedQuote);
      }`
);

// 5. Add edit button in UI
const editBtnStr = `
                      <button
                        onClick={() => handleEditQuote(quote)}
                        className="ml-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Quote"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                      {quote.status !== 'converted' && (
`;

content = content.replace(
  /\{quote\.status !== 'converted' && \(/,
  editBtnStr
);

// Fix heading when editing
content = content.replace(
  /<h2 className="font-bold text-lg text-slate-900">Create Quick Estimate<\/h2>/,
  `<h2 className="font-bold text-lg text-slate-900">{editingQuoteId ? 'Edit Estimate' : 'Create Quick Estimate'}</h2>`
);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
