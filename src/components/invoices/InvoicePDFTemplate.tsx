import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Invoice, InvoiceTemplateType } from '../../types';
import { formatINR, numberToIndianWords, isInterStateSupply, calculateBillingPeriod } from '../../utils/gstUtils';
import { Building2, Phone, Mail, Globe, CheckCircle2, Calendar } from 'lucide-react';
import { UdmLogo } from '../common/UdmLogo';

interface InvoicePDFTemplateProps {
  invoice: Invoice;
  templateOverride?: InvoiceTemplateType;
  id?: string;
  isPrintMode?: boolean;
  documentTitle?: string;
  businessProfileFallback?: any;
}

export const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({
  invoice,
  templateOverride,
  id = 'invoice-pdf-container',
  isPrintMode = false,
  documentTitle,
  businessProfileFallback
}) => {
  const template = templateOverride || invoice.template || 'classic';
  const seller = invoice.seller || businessProfileFallback || {};
  const logoUrl = seller?.logoUrl || businessProfileFallback?.logoUrl;
  const client = invoice.client;
  const isInterState = invoice.isInterState ?? isInterStateSupply(seller.stateCode, invoice.placeOfSupplyCode || client?.stateCode || '23');
  const isQuote = !!(invoice as any).quoteNumber;
  const docTitle = documentTitle || (isQuote ? 'SERVICE QUOTATION' : 'TAX INVOICE');

  // Compute 30-day billing period
  const billingPeriodDisplay = invoice.billingPeriod || calculateBillingPeriod(invoice.billingStartDate || invoice.invoiceDate).formattedPeriod;

  // Bank & UPI details (Defaults to Bank of Baroda A/C 05740100011588, IFSC BARB0MEGHNA)
  const bankName = seller.bankName || 'Bank of Baroda';
  const accountHolderName = seller.accountHolderName || 'UDM Techno Solutions (Sankalp Nayak)';
  const accountNumber = seller.accountNumber || '05740100011588';
  const ifscCode = seller.ifscCode || 'BARB0MEGHNA';
  const branch = seller.branch || 'Indore';
  const upiId = seller.upiId || 'sankalpnayakk-2@oksbi';
  const customQrImage = seller.upiQrImageUrl || seller.qrCodeUrl;

  const advancePaid = Number(invoice.advanceAmount) || 0;
  const totalAmountPaid = Number(invoice.amountPaid) || advancePaid;
  const grandTotal = isQuote ? invoice.totalTaxableAmount : invoice.grandTotal;
  const currentBalance = invoice.balanceDue !== undefined ? invoice.balanceDue : Math.max(0, grandTotal - totalAmountPaid);

  // Generate UPI payment deep link with current balance or grand total
  const upiAmount = currentBalance > 0 ? currentBalance : grandTotal;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(accountHolderName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${(invoice as any).quoteNumber || invoice.invoiceNumber}`)}`;

  return (
    <div
      id={id}
      className={`w-full max-w-[794px] mx-auto bg-white text-slate-800 text-sm leading-normal p-4 sm:p-6 font-sans border border-slate-200 transition-all ${
        isPrintMode ? 'p-0 sm:p-0 shadow-none border-none max-w-none' : ''
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* -------------------- TEMPLATE: CLASSIC -------------------- */}
      {template === 'classic' && (
        <div>
          {/* ============ HEADER ============ */}
          <div className="flex justify-between items-start pb-2 border-b-2 border-indigo-900">
            {/* Left: Logo + Company info */}
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2">
                {logoUrl && logoUrl !== '/udm-logo.svg' ? (
                  <img src={logoUrl} alt="Logo" className="h-8 object-contain max-w-[130px]" />
                ) : (
                  <UdmLogo className="h-8 w-auto" />
                )}
              </div>
              <div className="mt-1 text-[10.5px] text-slate-600 leading-snug space-y-0">
                <p><span className="font-bold text-slate-800">{seller.businessName}</span>{seller.address && <> &middot; {seller.address}, {seller.city}, {seller.state} - {seller.pinCode}</>}</p>
                <p className="font-mono text-[10px]">
                  <span className="font-bold text-indigo-900">GSTIN:</span> <span className="text-slate-700">{seller.gstin}</span>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="font-bold text-indigo-900">PAN:</span> <span className="text-slate-700">{seller.pan}</span>
                </p>
                <p className="text-[10px]">
                  {seller.phone && <><span className="font-bold text-slate-700">Ph:</span> <span className="text-slate-600">{seller.phone}</span><span className="mx-1 text-slate-300">|</span></>}
                  {seller.email && <><span className="font-bold text-slate-700">Email:</span> <span className="text-slate-600 truncate inline-block max-w-[180px] align-bottom">{seller.email}</span></>}
                </p>
              </div>
            </div>

            {/* Right: Invoice meta */}
            <div className="shrink-0 w-[240px]">
              <div className="bg-indigo-900 text-white text-center py-[3px] px-2 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                {docTitle}
              </div>
              <div className="mt-1 text-[10.5px] space-y-0">
                <div className="flex justify-between border-b border-slate-200 pb-[2px]">
                  <span className="font-bold text-slate-700 whitespace-nowrap">{isQuote ? 'Quote #' : 'Invoice #'}</span>
                  <span className="font-mono font-bold text-indigo-950 truncate ml-2">{(invoice as any).quoteNumber || invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-[2px]">
                  <span className="font-bold text-slate-700 whitespace-nowrap">{isQuote ? 'Quote Date' : 'Invoice Date'}</span>
                  <span className="font-medium text-slate-900 truncate ml-2">{(invoice as any).quoteDate || invoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-[2px]">
                  <span className="font-bold text-slate-700 whitespace-nowrap">Service Period (30D)</span>
                  <span className="font-semibold text-indigo-900 truncate ml-2 text-[9.5px]">{billingPeriodDisplay}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-[2px]">
                  <span className="font-bold text-slate-700 whitespace-nowrap">{isQuote ? 'Valid Until' : 'Due Date'}</span>
                  <span className="font-medium text-slate-900 truncate ml-2">{(invoice as any).validUntil || invoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">FY</span>
                  <span className="text-slate-600">{invoice.financialYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ BILLED TO + SUPPLY CARDS ============ */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Billed To */}
            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <div className="bg-slate-100 px-2 py-[3px] border-b border-slate-300">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-900">Billed To (Client Details)</span>
              </div>
              <div className="p-2 text-[10.5px] text-slate-700 leading-snug">
                <p className="font-bold text-slate-900 text-[12px] leading-tight">{client?.name || 'Client'}</p>
                {client?.contactPerson && <p><span className="font-semibold text-slate-600">Attn:</span> {client.contactPerson}</p>}
                {client?.billingAddress && <p className="whitespace-pre-line leading-snug">{client.billingAddress}</p>}
                <p>{client?.city ? `${client.city}, ` : ''}{client?.state} {client?.pinCode ? `- ${client.pinCode}` : ''}</p>
                <p className="font-mono pt-[2px]">
                  <span className="font-bold text-indigo-900">GSTIN:</span> <span className="font-bold text-slate-800">{client?.gstin || 'URP'}</span>
                </p>
                {client?.pan && <p className="font-mono"><span className="font-bold text-indigo-900">PAN:</span> {client.pan}</p>}
                {client?.phone && <p><span className="font-semibold text-slate-600">Ph:</span> {client.phone}</p>}
                {client?.email && <p className="truncate"><span className="font-semibold text-slate-600">Email:</span> <span className="truncate">{client.email}</span></p>}
              </div>
            </div>

            {/* Billed By */}
            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <div className="bg-slate-100 px-2 py-[3px] border-b border-slate-300">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-900">Billed By & Service Scope</span>
              </div>
              <div className="p-2 text-[10.5px] text-slate-700 leading-snug space-y-[2px]">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">UDM Techno Solutions</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Billing Cycle:</span>
                  <span className="font-semibold text-emerald-800 text-[10px]">30 Days Recurring / Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Contact Support:</span>
                  <span className="font-medium text-slate-900">+91 91091 24357</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Tax Type:</span>
                  <span className="font-bold text-indigo-900">{isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Currency:</span>
                  <span className="font-medium text-slate-900">{invoice.currency || 'INR'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item Table — proportional column widths */}
          <div className="border border-slate-300 rounded-sm overflow-hidden mt-2">
            <table className="w-full text-[10.5px] text-left table-fixed">
              <colgroup>
                {!isQuote ? (
                  isInterState ? (
                    <>
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '32%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '14%' }} />
                    </>
                  ) : (
                    <>
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '26%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '6%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '16%' }} />
                    </>
                  )
                ) : (
                  <>
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '75%' }} />
                    <col style={{ width: '20%' }} />
                  </>
                )}
              </colgroup>
              <thead>
                <tr className="bg-indigo-900 text-white uppercase text-[9px] tracking-wider font-bold">
                  <th className="px-1 py-1.5 text-center border-r border-indigo-800">#</th>
                  <th className="px-1.5 py-1.5 border-r border-indigo-800">{isQuote ? 'Service Details' : 'Item Description'}</th>
                  {!isQuote && <th className="px-1 py-1.5 text-right border-r border-indigo-800">Rate (&#8377;)</th>}
                  {!isQuote && <th className="px-1 py-1.5 text-right border-r border-indigo-800">Disc</th>}
                  {!isQuote && <th className="px-1 py-1.5 text-right border-r border-indigo-800">Taxable (&#8377;)</th>}
                  {!isQuote && <th className="px-1 py-1.5 text-center border-r border-indigo-800">GST</th>}
                  {!isQuote && (isInterState ? (
                    <th className="px-1 py-1.5 text-right border-r border-indigo-800">IGST (&#8377;)</th>
                  ) : (
                    <>
                      <th className="px-1 py-1.5 text-right border-r border-indigo-800">CGST</th>
                      <th className="px-1 py-1.5 text-right border-r border-indigo-800">SGST</th>
                    </>
                  ))}
                  <th className="px-1.5 py-1.5 text-right">{isQuote ? 'Amount (&#8377;)' : 'Total (&#8377;)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-1 py-1.5 text-center text-slate-500 font-mono border-r border-slate-200">{idx + 1}</td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200 overflow-hidden">
                      <p className="font-bold text-slate-900 text-[11px] leading-tight break-words">{item.name}</p>
                      {item.description && <p className="text-[9.5px] text-slate-500 whitespace-pre-line mt-0.5 leading-relaxed break-words">{item.description}</p>}
                    </td>
                    {!isQuote && <td className="px-1 py-1.5 text-right text-slate-700 border-r border-slate-200 font-mono">{formatINR(item.rate, false)}</td>}
                    {!isQuote && <td className="px-1 py-1.5 text-right text-slate-500 border-r border-slate-200 font-mono">
                      {item.discountAmount > 0 ? formatINR(item.discountAmount, false) : '-'}
                    </td>}
                    {!isQuote && <td className="px-1 py-1.5 text-right font-semibold text-slate-800 border-r border-slate-200 font-mono">
                      {formatINR(item.taxableAmount, false)}
                    </td>}
                    {!isQuote && <td className="px-1 py-1.5 text-center text-slate-600 border-r border-slate-200">{item.gstRate}%</td>}
                    {!isQuote && (isInterState ? (
                      <td className="px-1 py-1.5 text-right text-slate-600 border-r border-slate-200 font-mono">
                        {formatINR(item.igstAmount || item.totalGstAmount, false)}
                      </td>
                    ) : (
                      <>
                        <td className="px-1 py-1.5 text-right text-slate-600 border-r border-slate-200 font-mono">
                          {formatINR(item.cgstAmount || item.totalGstAmount / 2, false)}
                        </td>
                        <td className="px-1 py-1.5 text-right text-slate-600 border-r border-slate-200 font-mono">
                          {formatINR(item.sgstAmount || item.totalGstAmount / 2, false)}
                        </td>
                      </>
                    ))}
                    <td className="px-1.5 py-1.5 text-right font-bold text-indigo-950 font-mono text-[11px]">
                      {formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount In Words + Totals Section (Compact 2-col) */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Left: Amount in Words + Bank & QR */}
            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <div className="bg-slate-100 px-2 py-[3px] border-b border-slate-300">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-900">Amount in Words</span>
              </div>
              <div className="p-2">
                <p className="text-[10.5px] font-bold text-indigo-950 italic leading-snug">{invoice.totalInWords || numberToIndianWords(isQuote ? invoice.totalTaxableAmount : invoice.grandTotal)}</p>

                {invoice.showBankDetails !== false && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0 space-y-0 text-[10px] leading-snug">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-[2px]">Bank Details</p>
                        <p><span className="font-bold text-slate-600">Bank:</span> <span className="text-slate-500">{bankName}</span></p>
                        <p><span className="font-bold text-slate-600">A/c:</span> <span className="text-slate-500">{accountHolderName}</span></p>
                        <p><span className="font-bold text-slate-600">No:</span> <span className="font-mono font-bold text-indigo-900">{accountNumber}</span></p>
                        <p><span className="font-bold text-slate-600">IFSC:</span> <span className="font-mono font-bold text-indigo-900">{ifscCode}</span></p>
                        <p><span className="font-bold text-slate-600">Branch:</span> <span className="text-slate-500">{branch}</span></p>
                      </div>
                      {invoice.showUpiQr !== false && (
                        <div className="flex flex-col items-center justify-center shrink-0">
                          {customQrImage ? (
                            <img src={customQrImage} alt="UPI QR Code" className="w-[48px] h-[48px] object-contain rounded" />
                          ) : (
                            <QRCodeSVG value={upiUrl} size={48} level="M" />
                          )}
                          <span className="text-[7.5px] font-bold text-indigo-900 uppercase mt-[1px]">Scan & Pay</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {invoice.terms && (
                  <div className="mt-1 pt-1 border-t border-slate-200 text-[8.5px] text-slate-500 leading-snug">
                    <span className="font-bold text-slate-600 uppercase tracking-wider text-[7.5px]">T&amp;C:</span> {invoice.terms}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Totals Breakdown */}
            <div className="border border-slate-300 rounded-sm overflow-hidden">
              <div className="bg-slate-100 px-2 py-[3px] border-b border-slate-300">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-900">Totals</span>
              </div>
              <div className="p-2 space-y-[2px] text-[10.5px]">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatINR(invoice.subtotal)}</span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">- {formatINR(invoice.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-[2px]">
                  <span>Taxable Amount:</span>
                  <span className="font-mono">{formatINR(invoice.totalTaxableAmount)}</span>
                </div>

                {!isQuote && (isInterState ? (
                  <div className="flex justify-between text-indigo-900 font-semibold">
                    <span>IGST:</span>
                    <span className="font-mono">{formatINR(invoice.totalIgst || invoice.totalGst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-700">
                      <span>CGST:</span>
                      <span className="font-mono">{formatINR(invoice.totalCgst || invoice.totalGst / 2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>SGST:</span>
                      <span className="font-mono">{formatINR(invoice.totalSgst || invoice.totalGst / 2)}</span>
                    </div>
                  </>
                ))}

                {invoice.additionalCharges && invoice.additionalCharges.length > 0 && (
                  <div className="pt-[2px] border-t border-slate-200 space-y-0 mt-[2px]">
                    {invoice.additionalCharges.map((chg, i) => (
                      <div key={i} className="flex justify-between text-slate-600 text-[9.5px]">
                        <span>{chg.name}:</span>
                        <span className="font-mono">+{formatINR(chg.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[9.5px]">
                    <span>Round Off:</span>
                    <span className="font-mono">{formatINR(invoice.roundOff)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-indigo-950 border-t-2 border-indigo-900 pt-[2px] text-[11px]">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[12px]">{formatINR(grandTotal)}</span>
                </div>

                {advancePaid > 0 ? (
                  <div className="pt-1 border-t border-slate-200 space-y-0.5 mt-[2px]">
                    <div className="flex justify-between text-emerald-800 text-[10px] font-semibold">
                      <span>Less: Advance Payment:</span>
                      <span className="font-mono">- {formatINR(advancePaid)}</span>
                    </div>
                    {totalAmountPaid > advancePaid && (
                      <div className="flex justify-between text-emerald-700 text-[9.5px]">
                        <span>Other Payments:</span>
                        <span className="font-mono">- {formatINR(totalAmountPaid - advancePaid)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-800 font-bold text-[11px] border-t border-slate-200 pt-0.5">
                      <span>Balance Due:</span>
                      <span className="font-mono">{formatINR(currentBalance)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 border-t border-slate-200 space-y-0 mt-[2px]">
                    {totalAmountPaid > 0 && (
                      <div className="flex justify-between text-emerald-800 text-[9.5px]">
                        <span>Amount Paid:</span>
                        <span className="font-mono font-semibold">{formatINR(totalAmountPaid)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-800 font-bold text-[10.5px]">
                      <span>Balance Due:</span>
                      <span className="font-mono">{formatINR(currentBalance)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer & Signature Section */}
          <div className="pt-3 border-t border-slate-300 grid grid-cols-2 gap-3">
            <div className="text-[10px] text-slate-500">
              <p className="italic leading-snug">Certified that the particulars given above are true and correct. Thank you for your business!</p>
              <p className="text-slate-400 text-[9px] mt-0.5">This is a computer-generated document.</p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">For, {seller.businessName}</p>
              <div className="h-12 flex items-center justify-end mt-1">
                {seller.signatureUrl ? (
                  <img src={seller.signatureUrl} alt="Signature" className="h-10 object-contain" />
                ) : (
                  <div className="border-b border-dashed border-slate-400 w-36 text-center text-[10px] text-slate-400 pb-1">
                    Digital Signature
                  </div>
                )}
              </div>
              {seller.authorizedSignatoryName ? (
                <>
                  <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider pt-1 border-t border-slate-300 mt-1">
                    {seller.authorizedSignatoryName}
                  </p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Authorized Signatory</p>
                </>
              ) : (
                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider pt-1 border-t border-slate-300 mt-1">
                  Authorized Signatory
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TEMPLATE: MODERN -------------------- */}
      {template === 'modern' && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <div className="mb-3">
                  {logoUrl && logoUrl !== '/udm-logo.svg' ? (
                    <img src={logoUrl} alt="Logo" className="h-10 object-contain brightness-0 invert max-w-[160px]" />
                  ) : (
                    <UdmLogo className="h-10 w-auto" variant="white" />
                  )}
                </div>
                <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {docTitle}
                </span>
                <h1 className="text-xl font-bold mt-2 tracking-tight">{seller.businessName}</h1>
                <p className="text-xs text-indigo-200 mt-1 max-w-md">
                  {seller.address}, {seller.city}, {seller.state} (State Code: {seller.stateCode})
                </p>
                <p className="text-xs text-indigo-300 mt-1 font-mono font-medium">
                  GSTIN: {seller.gstin} | PAN: {seller.pan}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-indigo-300 font-medium">Invoice Number</p>
                <p className="text-2xl font-bold font-mono text-white tracking-tight">{(invoice as any).quoteNumber || invoice.invoiceNumber}</p>
                <div className="mt-2 text-xs text-indigo-200 space-y-0.5">
                  <p>Date: <span className="font-semibold text-white">{(invoice as any).quoteDate || invoice.invoiceDate}</span></p>
                  <p>Period (30D): <span className="font-semibold text-white">{billingPeriodDisplay}</span></p>
                  <p>{isQuote ? 'Valid Until:' : 'Due Date:'} <span className="font-semibold text-white">{(invoice as any).validUntil || invoice.dueDate}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info Grid */}
          <div className="flex flex-row justify-between gap-4">
            <div className="w-[calc(50%-8px)] p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{isQuote ? 'Quotation For' : 'Billed To'}</span>
              <p className="font-bold text-slate-900 text-base">{client.name}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{client.billingAddress}</p>
              <p className="text-xs text-slate-600">{client.city}, {client.state} - {client.pinCode}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-xs space-y-0.5">
                <p className="text-slate-800 font-semibold">GSTIN: <span className="font-mono text-indigo-600">{client.gstin}</span></p>
                <p className="text-slate-600 font-mono">PAN: {client.pan}</p>
              </div>
            </div>

            <div className="w-[calc(50%-8px)] p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed by</span>
                <p className="font-bold text-slate-900 text-sm">{seller.businessName}</p>
                <p className="text-xs text-slate-600 mt-1">Contact Support: <strong>+91 91091 24357</strong></p>
                {seller.phone && <p className="text-xs text-slate-600">Phone: <strong className="text-slate-900">{seller.phone}</strong></p>}
                <p className="text-xs text-slate-600 font-mono">GSTIN: <span className="font-bold text-indigo-600">{seller.gstin}</span></p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600"><span className="font-semibold">Tax Type:</span> {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3 text-left">{isQuote ? 'Service Details' : 'Item Description'}</th>
                  {!isQuote && <th className="p-3 text-right w-24">Rate</th>}
                  {!isQuote && <th className="p-3 text-center w-12">Qty</th>}
                  {!isQuote && <th className="p-3 text-right w-24">Taxable</th>}
                  {!isQuote && <th className="p-3 text-center w-14">GST</th>}
                  {!isQuote && <th className="p-3 text-right w-24">GST Amt</th>}
                  <th className="p-3 text-right w-28">{isQuote ? 'Amount' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line">{item.description}</p>}
                    </td>
                    {!isQuote && <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.rate, false)}</td>}
                    {!isQuote && <td className="p-3 text-center font-medium text-slate-700">{item.quantity}</td>}
                    {!isQuote && <td className="p-3 text-right font-mono font-semibold text-slate-900">{formatINR(item.taxableAmount, false)}</td>}
                    {!isQuote && <td className="p-3 text-center text-slate-600">{item.gstRate}%</td>}
                    {!isQuote && <td className="p-3 text-right font-mono text-slate-700">{formatINR(item.totalGstAmount, false)}</td>}
                    <td className="p-3 text-right font-mono font-bold text-indigo-950">{formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Grid */}
          <div className="flex flex-row justify-between gap-4 text-xs">
            <div className="w-[calc(58.333%-8px)] shrink-0 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Words</span>
                <p className="font-semibold text-slate-800 italic mt-0.5">{invoice.totalInWords}</p>
              </div>

              {invoice.showBankDetails !== false && (
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-indigo-950 text-[11px]">Bank Transfer Details</p>
                    <p className="text-slate-600">A/C: <span className="font-mono font-semibold text-slate-900">{accountNumber}</span> ({bankName})</p>
                    <p className="text-slate-600">IFSC: <span className="font-mono font-semibold text-indigo-900">{ifscCode}</span></p>
                  </div>
                  {invoice.showUpiQr !== false && (
                    <div className="bg-white p-1.5 rounded-lg border border-indigo-200 shrink-0 flex items-center justify-center">
                      {customQrImage ? (
                        <img src={customQrImage} alt="UPI QR Code" className="w-[60px] h-[60px] object-contain rounded" />
                      ) : (
                        <QRCodeSVG value={upiUrl} size={60} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-[calc(41.666%-8px)] shrink-0 p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <div className="flex justify-between text-slate-300 text-xs">
                <span>{isQuote ? 'Subtotal:' : 'Taxable Value:'}</span>
                <span className="font-mono">{formatINR(invoice.totalTaxableAmount)}</span>
              </div>
              {!isQuote && (isInterState ? (
                <div className="flex justify-between text-indigo-300 text-xs">
                  <span>IGST (18%):</span>
                  <span className="font-mono">{formatINR(invoice.totalIgst || invoice.totalGst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-300 text-xs">
                    <span>CGST (9%):</span>
                    <span className="font-mono">{formatINR(invoice.totalCgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-xs">
                    <span>SGST (9%):</span>
                    <span className="font-mono">{formatINR(invoice.totalSgst)}</span>
                  </div>
                  </>
                )
              )}
              <div className="pt-2 border-t border-slate-700 flex justify-between text-base font-bold text-white">
                <span>Total Amount:</span>
                <span className="font-mono text-indigo-300">{formatINR(grandTotal)}</span>
              </div>
              {advancePaid > 0 && (
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Less: Advance Payment:</span>
                  <span className="font-mono">- {formatINR(advancePaid)}</span>
                </div>
              )}
              {totalAmountPaid > advancePaid && (
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Other Payments:</span>
                  <span className="font-mono">- {formatINR(totalAmountPaid - advancePaid)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-700 flex justify-between text-sm font-bold text-rose-300">
                <span>Balance Due:</span>
                <span className="font-mono">{formatINR(currentBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TEMPLATE: MINIMAL -------------------- */}
      {template === 'minimal' && (
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b border-black pb-4">
            <div>
              <div className="mb-2">
                {logoUrl && logoUrl !== '/udm-logo.svg' ? (
                  <img src={logoUrl} alt="Logo" className="h-8 object-contain max-w-[140px]" />
                ) : (
                  <UdmLogo className="h-8 w-auto" />
                )}
              </div>
              <h1 className="text-xl font-light tracking-tight text-black uppercase">{seller.businessName}</h1>
              <p className="text-xs text-slate-600 mt-1">{seller.address}, {seller.city} | GSTIN: {seller.gstin}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{docTitle}</p>
              <p className="text-xl font-mono font-bold text-black">{(invoice as any).quoteNumber || invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-600 mt-1">{(invoice as any).quoteDate || invoice.invoiceDate}</p>
            </div>
          </div>

          <div className="flex flex-row justify-between gap-6 text-xs">
            <div className="w-[calc(50%-12px)]">
              <p className="uppercase text-[10px] font-bold text-slate-400 tracking-wider">Client</p>
              <p className="font-bold text-black text-sm mt-1">{client?.name || 'Client'}</p>
              <p className="text-slate-600">{client?.billingAddress}</p>
              <p className="text-slate-800 font-mono mt-1">GSTIN: {client?.gstin}</p>
            </div>
            <div className="w-[calc(50%-12px)] text-right">
              <p className="uppercase text-[10px] font-bold text-slate-400 tracking-wider">Details</p>
              <p className="text-slate-700 mt-1">Period (30D): <span className="font-semibold text-black">{billingPeriodDisplay}</span></p>
              <p className="text-slate-700 mt-1">{isQuote ? 'Valid Until:' : 'Due Date:'} <span className="font-semibold text-black">{(invoice as any).validUntil || invoice.dueDate}</span></p>
            </div>
          </div>

          <table className="w-full text-xs text-left border-y border-black">
            <thead>
              <tr className="border-b border-slate-300 font-bold uppercase text-[10px]">
                <th className="py-2">{isQuote ? 'Service Details' : 'Item'}</th>
                {!isQuote && <th className="py-2 text-right">Amount</th>}
                {!isQuote && <th className="py-2 text-right">Taxable</th>}
                {!isQuote && <th className="py-2 text-right">GST</th>}
                <th className="py-2 text-right">{isQuote ? 'Amount' : 'Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <p className="font-medium text-black">{item.name}</p>
                    {item.description && <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">{item.description}</p>}
                  </td>
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.rate, false)}</td>}
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.taxableAmount, false)}</td>}
                  {!isQuote && <td className="py-2.5 text-right font-mono">{formatINR(item.totalGstAmount, false)}</td>}
                  <td className="py-2.5 text-right font-mono font-bold text-black">{formatINR(isQuote ? (item.rate * item.quantity - (item.discountAmount || 0)) : item.total, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-1.5 border-b border-black pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono">{formatINR(invoice.totalTaxableAmount)}</span>
              </div>
              {!isQuote && (
                <div className="flex justify-between text-slate-600">
                  <span>Total GST:</span>
                  <span className="font-mono">{formatINR(invoice.totalGst)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-black pt-1 border-t border-slate-300">
                <span>Total Amount:</span>
                <span className="font-mono">{formatINR(grandTotal)}</span>
              </div>
              {advancePaid > 0 && (
                <div className="flex justify-between text-emerald-700 text-xs">
                  <span>Advance Payment:</span>
                  <span className="font-mono">- {formatINR(advancePaid)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-rose-700 pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className="font-mono">{formatINR(currentBalance)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-4 flex justify-between items-end">
            <div>
              <p className="font-semibold text-slate-800">Bank: {bankName} | A/C: {accountNumber} | IFSC: {ifscCode}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-black uppercase text-[10px]">UDM Techno Solutions</p>
              <p className="text-[10px] text-slate-400 mt-4">Authorized Signature</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
