import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Standard ISO A4 Dimensions
 * 210mm x 297mm
 */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Generate standard naming series for exported PDF:
 * Format: "UDM x {Client Name} - Rs.{Amount} - {Invoice Series} - {Invoice Date}.pdf"
 */
export function getInvoicePdfFilename(invoice: {
  client?: { name?: string };
  grandTotal?: number;
  invoiceNumber?: string;
  invoiceDate?: string;
}): string {
  const rawClientName = invoice.client?.name || 'Client';
  const cleanClientName = rawClientName
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
  const amount = Math.round(invoice.grandTotal || 0);
  const series = (invoice.invoiceNumber || 'Invoice').replace(/[\\/:*?"<>|]/g, '').trim();
  const date = invoice.invoiceDate || new Date().toISOString().split('T')[0];

  return `Invoice - UDM x ${cleanClientName} - Rs.${amount} - ${series} - ${date}.pdf`;
}

/**
 * Generate and download high-resolution, pixel-perfect A4 PDF from an HTML invoice element
 */
export async function downloadElementAsPdf(target: HTMLElement | string, filename: string): Promise<void> {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) {
    throw new Error('Target element for PDF generation was not found.');
  }

  // Ensure fonts and stylesheets are fully loaded and computed
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if fonts API throws
    }
  }

  // In production (Vite), CSS is loaded via external <link> tags.
  // html2canvas sometimes fails to read these due to CORS or stylesheet parsing restrictions.
  // We explicitly fetch and inject external stylesheets as inline <style> blocks temporarily.
  const injectedStyles: HTMLStyleElement[] = [];
  try {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    for (const link of links) {
      if (link.href && (link.href.startsWith(window.location.origin) || link.href.startsWith('/'))) {
        try {
          const response = await fetch(link.href);
          let cssText = await response.text();
          
          // html2canvas CSS parser frequently chokes on modern @layer syntax.
          // By replacing the top-level @layer wrappers, we ensure it applies the rules.
          cssText = cssText.replace(/@layer\s+[^{]+\{([\s\S]*?)\n\}\s*(?=@layer|$)/gi, '$1');
          
          const style = document.createElement('style');
          style.textContent = cssText;
          document.head.appendChild(style);
          injectedStyles.push(style);
        } catch (err) {
          console.warn('Could not inline stylesheet for PDF:', link.href, err);
        }
      }
    }
    // Give the browser a moment to apply the injected inline styles
    if (injectedStyles.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (err) {
    console.warn('Error processing stylesheets for PDF:', err);
  }

  try {
    // Temporarily disable parent transforms (like zoom scale in editor) which distort html2canvas coordinates


    // Temporarily disable parent overflow, height constraints, and ALL transforms which distort the PDF
    const modifiedParents: {element: HTMLElement, overflow: string, overflowY: string, maxHeight: string, height: string, transform: string, scale: string, width: string, minWidth: string}[] = [];

    // Find ALL ancestors up to document.body and make them visible and un-transformed
    let current = element.parentElement;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);

      const originalOverflow = current.style.overflow;
      const originalOverflowY = current.style.overflowY;
      const originalMaxHeight = current.style.maxHeight;
      const originalHeight = current.style.height;
      const originalTransform = current.style.transform;
      const originalScale = current.style.scale;
      const originalWidth = current.style.width;
      const originalMinWidth = current.style.minWidth;

      if (style.overflow !== 'visible' || style.overflowY !== 'visible' || style.maxHeight !== 'none' || style.height !== 'auto' || (style.transform && style.transform !== 'none') || (style.scale && style.scale !== '1')) {
        modifiedParents.push({
          element: current,
          overflow: originalOverflow,
          overflowY: originalOverflowY,
          maxHeight: originalMaxHeight,
          height: originalHeight,
          transform: originalTransform,
          scale: originalScale,
          width: originalWidth,
          minWidth: originalMinWidth
        });

        current.style.overflow = 'visible';
        current.style.overflowY = 'visible';
        current.style.maxHeight = 'none';
        current.style.height = 'auto';
        current.style.transform = 'none';
        current.style.scale = '';
        current.style.width = '';
        current.style.minWidth = '';
      }
      current = current.parentElement;
    }

    // Also check the target element itself for any scale/transforms
    const targetStyle = window.getComputedStyle(element);
    const targetOriginalTransform = element.style.transform;
    const targetOriginalScale = element.style.scale;
    let targetModified = false;
    if ((targetStyle.transform && targetStyle.transform !== 'none') || (targetStyle.scale && targetStyle.scale !== '1')) {
      element.style.transform = 'none';
      element.style.scale = '1';
      targetModified = true;
    }

    // Wait for browser to recalculate layout without transforms
    await new Promise(resolve => setTimeout(resolve, 80));

    // Allow browser layout and QR codes/images to settle
    await new Promise(resolve => setTimeout(resolve, 200));

    // High-fidelity rasterization with html2canvas-pro
    const canvas = await html2canvas(element, {
      scale: 2.0, // High-resolution 192+ DPI output
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedElement) => {
        if (!clonedElement) return;
        clonedElement.style.transform = 'none';
        clonedElement.style.scale = '';
        clonedElement.style.zoom = '';

        let parent = clonedElement.parentElement;
        while (parent && parent !== clonedDoc.body) {
          parent.style.transform = 'none';
          parent.style.scale = '';
          parent.style.zoom = '';
          parent.style.overflow = 'visible';
          parent.style.overflowY = 'visible';
          parent.style.maxHeight = 'none';
          parent.style.height = 'auto';
          parent = parent.parentElement;
        }
      }
    });
    
    // Restore immediately after capture
    if (targetModified) {
      element.style.transform = targetOriginalTransform;
    }

    modifiedParents.forEach(parent => {
      parent.element.style.overflow = parent.overflow;
      parent.element.style.overflowY = parent.overflowY;
      parent.element.style.maxHeight = parent.maxHeight;
      parent.element.style.height = parent.height;
      parent.element.style.transform = parent.transform;
      parent.element.style.scale = parent.scale;
      parent.element.style.width = parent.width;
      parent.element.style.minWidth = parent.minWidth;
    });



    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Rendered invoice canvas is empty or invalid.');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Proportional height in millimeters when rendered across full 210mm A4 width
    const fullHeightMm = (canvasHeight * A4_WIDTH_MM) / canvasWidth;

    // Case 1: Standard Single-Page Invoice (scaled gracefully to fit neatly onto 1 sheet)
    if (fullHeightMm <= 325) {
      let renderWidth = A4_WIDTH_MM;
      let renderHeight = fullHeightMm;
      let offsetX = 0;
      let offsetY = 0;

      // If slightly taller than 297mm, scale gently by a few percent to fit 1 clean page
      if (renderHeight > A4_HEIGHT_MM) {
        const scaleFactor = (A4_HEIGHT_MM - 6) / renderHeight;
        renderWidth = A4_WIDTH_MM * scaleFactor;
        renderHeight = renderHeight * scaleFactor;
        offsetX = (A4_WIDTH_MM - renderWidth) / 2;
        offsetY = 3;
      }

      const pageImgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(pageImgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
    } 
    // Case 2: Multi-Page Invoice (splits content across multiple distinct A4 pages)
    else {
      const pageCanvasHeight = Math.floor((canvasWidth * A4_HEIGHT_MM) / A4_WIDTH_MM);
      const totalPages = Math.ceil(canvasHeight / pageCanvasHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const sourceY = i * pageCanvasHeight;
        const currentSliceHeight = Math.min(pageCanvasHeight, canvasHeight - sourceY);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasWidth;
        sliceCanvas.height = pageCanvasHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        if (sliceCtx) {
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(
            canvas,
            0, sourceY, canvasWidth, currentSliceHeight,
            0, 0, canvasWidth, currentSliceHeight
          );

          const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(sliceImgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
        }
      }
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
  } finally {
    // Cleanup injected styles
    injectedStyles.forEach(style => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
  }
}

/**
 * Trigger clean printing of a specific invoice element without app chrome
 */
export function printInvoiceElement(target: HTMLElement | string, title: string = 'Tax Invoice'): void {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) {
    window.print();
    return;
  }

  // Create an isolated hidden iframe to print only the target invoice
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Extract all stylesheets and font styles from current document
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #1e293b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-print-container {
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
        </style>
      </head>
      <body>
        <div class="invoice-print-container">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print failed, falling back to window.print', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1200);
    }
  }, 350);
}

/**
 * Trigger browser printing
 */
export function triggerPrint(): void {
  const target = document.querySelector<HTMLElement>('#live-invoice-pdf-preview, [id^="modal-global-pdf-"], [id^="modal-invoice-pdf-"], #invoice-pdf-container');
  if (target) {
    printInvoiceElement(target, 'UDM_Techno_Tax_Invoice');
  } else {
    window.print();
  }
}

/**
 * Export tabular data to CSV
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(cell => {
        const val = cell !== undefined && cell !== null ? String(cell) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

