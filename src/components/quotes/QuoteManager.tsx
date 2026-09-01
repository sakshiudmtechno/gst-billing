import React, { useState, useEffect } from 'react';
import { Quote, Client, BusinessProfile, QuoteItem } from '../../types';
import { api } from '../../utils/api';
import { downloadElementAsPdf, triggerPrint } from '../../utils/pdfGenerator';
import { InvoicePDFTemplate } from '../invoices/InvoicePDFTemplate';
import { PREDEFINED_SERVICES } from '../../constants/services';
import { Plus, Trash2, Download, Eye, X, Send, Clock, Sparkles, Edit, ArrowLeft, Loader2 } from 'lucide-react';

interface QuoteManagerProps {
  quotes: Quote[];
  clients: Client[];
  businessProfile: BusinessProfile | null;
  onRefresh: () => void;
  onConvertToInvoice: (quote: Quote) => void;
}

export const QuoteManager: React.FC<QuoteManagerProps> = ({
  quotes,
  clients,
  businessProfile,
  onRefresh,
  onConvertToInvoice
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [quoteDate, setQuoteDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);
  const [directDownloadQuote, setDirectDownloadQuote] = useState<Quote | null>(null);

  // Quick Quote Form State
  const [quoteNumber, setQuoteNumber] = useState(`EST-${Date.now().toString().slice(-4)}`);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientState, setClientState] = useState('Madhya Pradesh');
  const [clientStateCode, setClientStateCode] = useState('23');
  const [applyGst, setApplyGst] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  const [items, setItems] = useState<Partial<QuoteItem>[]>([
    { id: '1', name: '', description: '', rate: 0, quantity: 1 }
  ]);

  
  const handleEditQuote = (quote: Quote) => {
    setEditingQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber);
    
    // Parse client name/company if they were merged like "Name (Company)"
    let cName = quote.client.name;
    let compName = '';
    const match = cName.match(/^(.*?)\s*\((.*?)\)$/);
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
    if (quote.items && quote.items.length > 0 && quote.items[0].gstRate > 0) {
      setApplyGst(true);
      setGstRate(quote.items[0].gstRate);
    }
    
    if (quote.quoteDate) setQuoteDate(quote.quoteDate);
    if (quote.validUntil) setValidUntil(quote.validUntil);
    
    setIsCreating(true);
  };

  
  const resetForm = () => {
    setEditingQuoteId(null);
    setQuoteNumber(`EST-${Date.now().toString().slice(-4)}`);
    setClientName('');
    setCompanyName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setItems([{ id: '1', name: '', description: '', rate: 0, quantity: 1 }]);
    setApplyGst(false);
    setGstRate(18);
    setQuoteDate(new Date().toISOString().split('T')[0]);
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', description: '', rate: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSaveQuote = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!clientName.trim()) {
      alert('Please enter a Client Name before saving the estimate.');
      return;
    }

    setIsSaving(true);
    
    // Auto-create a temporary client object for the quote
    const formattedClientName = companyName.trim() ? `${clientName.trim()} (${companyName.trim()})` : clientName.trim();
    const tempClientObj: Client = {
      id: `client_${Date.now()}`,
      name: formattedClientName,
      contactPerson: clientName.trim(),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      billingAddress: clientAddress.trim() || 'Not Provided',
      city: '',
      state: clientState,
      stateCode: clientStateCode,
      country: 'India',
      pinCode: '',
      gstin: '',
      pan: '',
      customerType: 'B2B',
      createdAt: new Date().toISOString()
    };

    let subtotal = 0;
    let totalGst = 0;
    const isInter = clientStateCode !== (businessProfile?.stateCode || '23');
    const selectedGstRate = applyGst ? gstRate : 0;

    const finalItems = items.map((item, i) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.quantity) || 1;
      const taxable = rate * qty;
      const gstAmt = (taxable * selectedGstRate) / 100;

      subtotal += taxable;
      totalGst += gstAmt;

      return {
        id: item.id || `qi_${Date.now()}_${i}`,
        name: item.name?.trim() || 'Service',
        description: item.description?.trim() || '',
        hsnSac: item.hsnSac || '9983',
        quantity: qty,
        unit: item.unit || 'JOB',
        rate: rate,
        discountType: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        taxableAmount: taxable,
        gstRate: selectedGstRate,
        cgstAmount: applyGst && !isInter ? gstAmt / 2 : 0,
        sgstAmount: applyGst && !isInter ? gstAmt / 2 : 0,
        igstAmount: applyGst && isInter ? gstAmt : 0,
        totalGstAmount: gstAmt,
        total: taxable + gstAmt
      } as QuoteItem;
    });

    const grandTotal = subtotal + totalGst;

    const newQuote = {
      quoteNumber,
      clientId: tempClientObj.id,
      client: tempClientObj,
      quoteDate: quoteDate,
      validUntil: validUntil,
      status: 'draft',
      placeOfSupply: clientState,
      placeOfSupplyCode: clientStateCode,
      currency: 'INR',
      items: finalItems,
      subtotal,
      totalTaxableAmount: subtotal,
      totalGst: applyGst ? totalGst : 0,
      totalCgst: applyGst && !isInter ? totalGst / 2 : 0,
      totalSgst: applyGst && !isInter ? totalGst / 2 : 0,
      totalIgst: applyGst && isInter ? totalGst : 0,
      grandTotal,
      template: 'classic',
      showBankDetails: false,
      seller: businessProfile ? { ...businessProfile, logoUrl: undefined } : undefined
    };

    try {
      if (editingQuoteId) {
        await api.updateQuote(editingQuoteId, newQuote as any);
      } else {
        await api.createQuote(newQuote as any);
      }
      
      // Refresh list from server so it immediately shows in the table
      await onRefresh();
      
      // Reset form and close the create/edit screen, returning to the Estimates & Quotes table
      resetForm();
      setIsCreating(false);
      setViewingQuote(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save estimate: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadEstimatePdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadElementAsPdf('live-quote-pdf', `Estimate-${quoteNumber}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to generate estimate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadRowPdf = async (quote: Quote) => {
    try {
      setDownloadingQuoteId(quote.id);
      setDirectDownloadQuote(quote);
      // Wait for DOM element render
      await new Promise(resolve => setTimeout(resolve, 150));
      await downloadElementAsPdf(`direct-quote-pdf-${quote.id}`, `Estimate-${quote.quoteNumber}.pdf`);
    } catch (err) {
      console.error('Failed to download quote PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingQuoteId(null);
      setDirectDownloadQuote(null);
    }
  };


  const tempClient: Client = {
    id: `client_${Date.now()}`,
    name: companyName ? `${clientName} (${companyName})` : (clientName || 'New Client'),
    contactPerson: clientName,
    email: clientEmail,
    phone: clientPhone,
    billingAddress: clientAddress || 'Not Provided',
    city: '',
    state: clientState,
    stateCode: clientStateCode,
    country: 'India',
    pinCode: '',
    gstin: '',
    pan: '',
    customerType: 'B2B',
    createdAt: new Date().toISOString()
  };

  let subtotal = 0;
  let totalGst = 0;
  const isInter = clientStateCode !== (businessProfile?.stateCode || '23');
  const selectedGstRate = applyGst ? gstRate : 0;

  const finalItems = items.map((item, i) => {
    const rate = item.rate || 0;
    const qty = item.quantity || 1;
    const taxable = rate * qty;
    const gstAmt = (taxable * selectedGstRate) / 100;

    subtotal += taxable;
    totalGst += gstAmt;

    return {
      id: `qi_${Date.now()}_${i}`,
      name: item.name || 'Service',
      description: item.description || '',
      hsnSac: '9983',
      quantity: qty,
      unit: 'JOB',
      rate: rate,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      taxableAmount: taxable,
      gstRate: selectedGstRate,
      cgstAmount: applyGst && !isInter ? gstAmt / 2 : 0,
      sgstAmount: applyGst && !isInter ? gstAmt / 2 : 0,
      igstAmount: applyGst && isInter ? gstAmt : 0,
      totalGstAmount: gstAmt,
      total: taxable + gstAmt
    } as QuoteItem;
  });

  const grandTotal = subtotal + totalGst;

  const previewQuote = {
    quoteNumber,
    clientId: tempClient.id,
    client: tempClient,
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'draft',
    placeOfSupply: clientState,
    placeOfSupplyCode: clientStateCode,
    currency: 'INR',
    items: finalItems,
    subtotal,
    totalTaxableAmount: subtotal,
    totalGst: applyGst ? totalGst : 0,
    totalCgst: applyGst && !isInter ? totalGst / 2 : 0,
    totalSgst: applyGst && !isInter ? totalGst / 2 : 0,
    totalIgst: applyGst && isInter ? totalGst : 0,
    grandTotal,
    template: 'classic',
    seller: businessProfile,
    showBankDetails: false // Make sure bank details are hidden for quotes!
  };

  return (

    <div className="space-y-6">
      {/* Hidden staging container for direct row download */}
      {directDownloadQuote && (
        <div
          id={`direct-quote-pdf-wrapper-${directDownloadQuote.id}`}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '800px',
            zIndex: -9999,
            opacity: 1,
            pointerEvents: 'none',
            backgroundColor: '#ffffff'
          }}
        >
          <InvoicePDFTemplate
            id={`direct-quote-pdf-${directDownloadQuote.id}`}
            invoice={directDownloadQuote as any}
            documentTitle="SERVICE QUOTATION"
            businessProfileFallback={businessProfile}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estimates & Quotes</h1>
          <p className="text-sm text-slate-500">Create quick estimates for prospective clients.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Quick Estimate
        </button>
      </div>

      {/* List of Quotes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Quote No.</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No quotes found. Create a quick estimate to get started.
                  </td>
                </tr>
              ) : (
                quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-sm font-semibold text-indigo-700">{quote.quoteNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{quote.client.name}</p>
                      <p className="text-xs text-slate-500">{quote.client.email || 'No email'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{new Date(quote.quoteDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-mono font-bold">₹{quote.grandTotal?.toLocaleString() || "0"}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold uppercase">
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingQuote(quote)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                          title="View Estimate Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDownloadRowPdf(quote)}
                          disabled={downloadingQuoteId === quote.id}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                          title="Download Estimate PDF"
                          aria-label={`Download PDF for estimate ${quote.quoteNumber}`}
                        >
                          {downloadingQuoteId === quote.id ? (
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Estimate"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {quote.status !== 'converted' && (
                          <button
                            onClick={() => onConvertToInvoice(quote)}
                            className="ml-1 px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded text-xs font-semibold"
                            title="Convert to Invoice"
                          >
                            Convert to Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* Create Quote Full View */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden animate-in fade-in">
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-lg text-slate-900">{editingQuoteId ? 'Edit Estimate' : 'Create Quick Estimate'}</h2>
              <p className="text-xs text-slate-500">Auto-saves as you type. Real-time preview available.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={handleDownloadEstimatePdf} 
                disabled={isDownloadingPdf}
                className="px-4 py-2 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm flex items-center gap-1.5 border border-indigo-200"
                title="Download Estimate as PDF"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  resetForm();
                  setIsCreating(false);
                }} 
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSaveQuote()} 
                disabled={isSaving}
                className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm text-sm flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : (editingQuoteId ? 'Update Estimate' : 'Save Estimate')}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Left Column: Form */}
            <div className="w-1/2 overflow-y-auto p-6 border-r border-slate-200 bg-white">
              <form id="quote-form" className="space-y-6">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name *</label>
                    <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="e.g. ABC Corp" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                    <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="City, State" />
                  </div>
                </div>

                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Services & Pricing Options</h3>
                  <button type="button" onClick={handleAddItem} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Service Option
                  </button>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyGst}
                      onChange={e => setApplyGst(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm font-semibold text-indigo-900">Apply GST on this estimate</span>
                  </label>
                  {applyGst && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-700">GST Rate (%):</label>
                      <select
                        value={gstRate}
                        onChange={e => setGstRate(Number(e.target.value))}
                        className="px-2 py-1 border border-indigo-200 rounded text-sm font-mono font-bold bg-white"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {items.map((item, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-3 items-start relative">
                      <div className="flex-1 space-y-3">
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-indigo-700 mb-1">
                            Auto-fill from Templates
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                            <input type="text" required value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm font-semibold" placeholder="e.g. Basic Website Package" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Rate (₹) *</label>
                            <input type="number" required value={item.rate} onChange={e => handleItemChange(index, 'rate', Number(e.target.value))} className="w-full px-2 py-1.5 border rounded text-sm font-mono font-bold" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Deliverables (Optional)</label>
                          <textarea value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs" rows={2} placeholder="List what is included..."></textarea>
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(index)} className="mt-6 p-1.5 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleDownloadEstimatePdf} 
                    disabled={isDownloadingPdf}
                    className="px-4 py-2 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm flex items-center gap-1.5 border border-indigo-200"
                    title="Download Estimate as PDF"
                  >
                    {isDownloadingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      resetForm();
                      setIsCreating(false);
                    }} 
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-sm flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSaveQuote()} 
                    disabled={isSaving}
                    className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm text-sm flex items-center gap-2"
                  >
                    {isSaving ? 'Saving...' : (editingQuoteId ? 'Update Estimate' : 'Save Estimate')}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Real-time PDF Preview */}
            <div className="w-1/2 bg-slate-100 overflow-y-auto flex justify-center p-6">
              <div className="scale-[0.85] origin-top">
                <InvoicePDFTemplate
                  id="live-quote-pdf"
                  invoice={previewQuote as any}
                  documentTitle="SERVICE QUOTATION"
                businessProfileFallback={businessProfile}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Quote Modal */}

      {viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-3 text-white flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Estimate Preview</h2>
                <p className="text-xs text-slate-400">Quote #{viewingQuote.quoteNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => downloadElementAsPdf('modal-quote-pdf', `Estimate-${viewingQuote.quoteNumber}.pdf`)} 
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={() => setViewingQuote(null)} className="p-1 rounded hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 bg-slate-100 max-h-[75vh] overflow-y-auto flex justify-center">
              <InvoicePDFTemplate
                id="modal-quote-pdf"
                invoice={viewingQuote as any}
                documentTitle="SERVICE QUOTATION"
                businessProfileFallback={businessProfile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
