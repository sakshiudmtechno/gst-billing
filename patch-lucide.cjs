const fs = require('fs');
let content = fs.readFileSync('src/components/quotes/QuoteManager.tsx', 'utf-8');

content = content.replace(
  /import \{ Plus, Trash2, Download, Eye, X, Send, Clock, Sparkles \} from 'lucide-react';/,
  "import { Plus, Trash2, Download, Eye, X, Send, Clock, Sparkles, Edit } from 'lucide-react';"
);

content = content.replace(
  /<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9"\/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"\/><\/svg>/,
  "<Edit className=\"w-4 h-4\" />"
);

fs.writeFileSync('src/components/quotes/QuoteManager.tsx', content);
