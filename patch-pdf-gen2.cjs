const fs = require('fs');

let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf-8');

const parentOverflowFix = `
    // Temporarily disable parent overflow and height constraints which clip the PDF
    const modifiedParents = [];
    
    // Find ALL scrollable/hidden parents up to document.body and make them visible
    let current = element.parentElement;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      if (style.overflow !== 'visible' || style.overflowY !== 'visible' || style.maxHeight !== 'none' || style.height !== 'auto') {
        modifiedParents.push({
          element: current,
          overflow: current.style.overflow,
          overflowY: current.style.overflowY,
          maxHeight: current.style.maxHeight,
          height: current.style.height
        });
        current.style.overflow = 'visible';
        current.style.overflowY = 'visible';
        current.style.maxHeight = 'none';
        current.style.height = 'auto';
      }
      current = current.parentElement;
    }
`;

const restoreOverflowFix = `
    modifiedParents.forEach(parent => {
      parent.element.style.overflow = parent.overflow;
      parent.element.style.overflowY = parent.overflowY;
      parent.element.style.maxHeight = parent.maxHeight;
      parent.element.style.height = parent.height;
    });
`;

content = content.replace(
  /\/\/ Temporarily disable parent overflow.*?break;\s+\}\s+current = current.parentElement;\s+\}/s,
  parentOverflowFix
);

content = content.replace(
  /if \(parentWithOverflow\)\s*\{\s*parentWithOverflow.style.overflow = originalOverflow;\s*parentWithOverflow.style.maxHeight = originalMaxHeight;\s*\}/s,
  restoreOverflowFix
);

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
