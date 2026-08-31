const fs = require('fs');

let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf-8');

const parentOverflowFix = `
    // Temporarily disable parent overflow and height constraints which clip the PDF
    let parentWithOverflow = null;
    let originalOverflow = '';
    let originalMaxHeight = '';
    
    // Find closest scrollable parent (like the modal body)
    let current = element.parentElement;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      if (style.overflow === 'auto' || style.overflowY === 'auto' || style.overflow === 'hidden' || style.overflowY === 'hidden') {
        parentWithOverflow = current;
        originalOverflow = current.style.overflow;
        originalMaxHeight = current.style.maxHeight;
        current.style.overflow = 'visible';
        current.style.maxHeight = 'none';
        break;
      }
      current = current.parentElement;
    }
`;

const restoreOverflowFix = `
    if (parentWithOverflow) {
      parentWithOverflow.style.overflow = originalOverflow;
      parentWithOverflow.style.maxHeight = originalMaxHeight;
    }
`;

content = content.replace(
  /let parentWithTransform: HTMLElement \| null = null;/,
  parentOverflowFix + '\n    let parentWithTransform: HTMLElement | null = null;'
);

content = content.replace(
  /if \(parentWithTransform\) \{\s*parentWithTransform\.style\.transform = originalTransform;\s*\}/,
  "if (parentWithTransform) {\n      parentWithTransform.style.transform = originalTransform;\n    }\n" + restoreOverflowFix
);

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
