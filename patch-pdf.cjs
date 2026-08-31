const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf-8');

const target = `    // Temporarily disable parent overflow and height constraints which clip the PDF
    const modifiedParents: {element: HTMLElement, overflow: string, overflowY: string, maxHeight: string, height: string}[] = [];
    
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


    let parentWithTransform: HTMLElement | null = null;
    let originalTransform = '';
    
    if (element.parentElement && element.parentElement.style.transform) {
      parentWithTransform = element.parentElement;
      originalTransform = parentWithTransform.style.transform;
      parentWithTransform.style.transform = 'none';
      
      // Wait a frame for browser to recalculate layout without transform
      await new Promise(resolve => setTimeout(resolve, 50));
    }`;

const replacement = `    // Temporarily disable parent overflow, height constraints, and ALL transforms which distort the PDF
    const modifiedParents: {element: HTMLElement, overflow: string, overflowY: string, maxHeight: string, height: string, transform: string}[] = [];
    
    // Find ALL ancestors up to document.body and make them visible and un-transformed
    let current = element.parentElement;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      
      let changed = false;
      const originalOverflow = current.style.overflow;
      const originalOverflowY = current.style.overflowY;
      const originalMaxHeight = current.style.maxHeight;
      const originalHeight = current.style.height;
      const originalTransform = current.style.transform;

      if (style.overflow !== 'visible' || style.overflowY !== 'visible' || style.maxHeight !== 'none' || style.height !== 'auto' || (style.transform && style.transform !== 'none')) {
        modifiedParents.push({
          element: current,
          overflow: originalOverflow,
          overflowY: originalOverflowY,
          maxHeight: originalMaxHeight,
          height: originalHeight,
          transform: originalTransform
        });
        
        current.style.overflow = 'visible';
        current.style.overflowY = 'visible';
        current.style.maxHeight = 'none';
        current.style.height = 'auto';
        current.style.transform = 'none';
      }
      current = current.parentElement;
    }

    // Also check the target element itself for any scale/transforms
    const targetStyle = window.getComputedStyle(element);
    const targetOriginalTransform = element.style.transform;
    let targetModified = false;
    if (targetStyle.transform && targetStyle.transform !== 'none') {
      element.style.transform = 'none';
      targetModified = true;
    }

    // Wait a frame for browser to recalculate layout without transforms
    await new Promise(resolve => setTimeout(resolve, 50));`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Replaced setup block successfully.");
} else {
  console.log("Could not find setup block.");
}

const restoreTarget = `    // Restore transform immediately after capture
    if (parentWithTransform) {
      parentWithTransform.style.transform = originalTransform;
    }

    
    modifiedParents.forEach(parent => {
      parent.element.style.overflow = parent.overflow;
      parent.element.style.overflowY = parent.overflowY;
      parent.element.style.maxHeight = parent.maxHeight;
      parent.element.style.height = parent.height;
    });`;

const restoreReplacement = `    // Restore immediately after capture
    if (targetModified) {
      element.style.transform = targetOriginalTransform;
    }

    modifiedParents.forEach(parent => {
      parent.element.style.overflow = parent.overflow;
      parent.element.style.overflowY = parent.overflowY;
      parent.element.style.maxHeight = parent.maxHeight;
      parent.element.style.height = parent.height;
      parent.element.style.transform = parent.transform;
    });`;

if (content.includes(restoreTarget)) {
  content = content.replace(restoreTarget, restoreReplacement);
  console.log("Replaced restore block successfully.");
} else {
  console.log("Could not find restore block.");
}

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
