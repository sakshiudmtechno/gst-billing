const fs = require('fs');

let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf-8');

content = content.replace(
  /const modifiedParents = \[\];/,
  "const modifiedParents: {element: HTMLElement, overflow: string, overflowY: string, maxHeight: string, height: string}[] = [];"
);

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
