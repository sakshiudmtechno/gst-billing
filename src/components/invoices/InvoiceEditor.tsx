import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Invoice,
  InvoiceItem,
  AdditionalCharge,
  Client,
  BusinessProfile,
  InvoiceTemplateType
} from '../../types';
import {
  INDIAN_STATES,
  COMMON_HSN_SAC,
  GST_RATES,
  formatINR,
  numberToIndianWords,
  isInterStateSupply,
  getFinancialYear,
  calculateBillingPeriod
} from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { InvoicePDFTemplate } from './InvoicePDFTemplate';
import { downloadElementAsPdf, triggerPrint, printInvoiceElement, getInvoicePdfFilename } from '../../utils/pdfGenerator';
import { ClientModal } from '../clients/ClientModal';
import { SendEmailModal } from './SendEmailModal';
import {
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  Send,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Settings,
  HelpCircle,
  QrCode,
  Building,
  UserPlus,
  Loader2,
  Sparkles,
  Layers,
  ChevronDown,
  Eye,
  FileEdit,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import { PREDEFINED_SERVICES, ServicePackage } from '../../constants/services';

interface InvoiceEditorProps {
  initialInvoice?: Invoice | null;
  onBack: () => void;
  onSaveSuccess: (savedInvoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  initialInvoice,
  onBack,
  onSaveSuccess,
  onRecordPayment
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Responsive device view state for mobile & tablet (under 1024px)
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');
  const [pdfZoom, setPdfZoom] = useState<number>(1);

  // Form States
  const [invoiceNumber, setInvoiceNumber] = useState<string>('AUTO');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billingStartDate, setBillingStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState<string>('INR');
  const [template, setTemplate] = useState<InvoiceTemplateType>('classic');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [placeOfSupply, setPlaceOfSupply] = useState<string>('Madhya Pradesh');
  const [placeOfSupplyCode, setPlaceOfSupplyCode] = useState<string>('23');

  // Shipping Details
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingStateCode, setShippingStateCode] = useState('');
  const [shippingPinCode, setShippingPinCode] = useState('');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item_init_1',
      name: '🌐 Basic Website',
      description: 'Landing Page, About Us, Services, Contact Form, Lead Form, WhatsApp Integration, Basic SEO, Mobile Responsive Design, Google Maps',
      hsnSac: '998314',
      quantity: 1,
      unit: 'NOS',
      rate: 5000,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      taxableAmount: 5000,
      gstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGstAmount: 0,
      total: 5000
    }
  ]);

  // Overall Discount & Extra Charges
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);

  // Notes & Terms
  const [terms, setTerms] = useState<string>(
    'Payment is due by the due date mentioned above. Please make payment using the provided bank or UPI details.'
  );
  const [customerNotes, setCustomerNotes] = useState<string>('Thank you for your business with UDM Techno Solutions.');
  const [internalNotes, setInternalNotes] = useState<string>('');

  // Toggles
  const [showBankDetails, setShowBankDetails] = useState<boolean>(true);
  const [showUpiQr, setShowUpiQr] = useState<boolean>(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [profile, clientList, nextNum] = await Promise.all([
          api.getBusinessProfile(),
          api.getClients(),
          !initialInvoice ? api.getNextInvoiceNumber() : Promise.resolve(null)
        ]);

        setBusinessProfile(profile);
        setClients(clientList);

        if (initialInvoice) {
          // Editing existing invoice
          setInvoiceNumber(initialInvoice.invoiceNumber);
          setInvoiceDate(initialInvoice.invoiceDate);
          setBillingStartDate(initialInvoice.billingStartDate || initialInvoice.invoiceDate || new Date().toISOString().split('T')[0]);
          setAdvanceAmount(initialInvoice.advanceAmount !== undefined ? initialInvoice.advanceAmount : (initialInvoice.amountPaid || 0));
          setDueDate(initialInvoice.dueDate);
          setPlaceOfSupply(initialInvoice.placeOfSupply);
          setPlaceOfSupplyCode(initialInvoice.placeOfSupplyCode);
          setTemplate(initialInvoice.template || 'classic');
          setSelectedClientId(initialInvoice.clientId);
          setSelectedClient(initialInvoice.client);
          setItems(initialInvoice.items);
          setGlobalDiscountType(initialInvoice.discountType || 'percentage');
          setGlobalDiscountValue(initialInvoice.discountValue || 0);
          setAdditionalCharges(initialInvoice.additionalCharges || []);
          setTerms(initialInvoice.terms || '');
          setCustomerNotes(initialInvoice.customerNotes || '');
          setInternalNotes(initialInvoice.internalNotes || '');
          setShowBankDetails(initialInvoice.showBankDetails !== false);
          setShowUpiQr(initialInvoice.showUpiQr !== false);
          setHasShippingAddress(!!initialInvoice.hasShippingAddress);
          setShippingName(initialInvoice.shippingName || '');
          setShippingAddress(initialInvoice.shippingAddress || '');
          setShippingCity(initialInvoice.shippingCity || '');
          setShippingState(initialInvoice.shippingState || '');
          setShippingStateCode(initialInvoice.shippingStateCode || '');
          setShippingPinCode(initialInvoice.shippingPinCode || '');
        } else {
          // New Invoice
          if (nextNum) {
            setInvoiceNumber(nextNum.invoiceNumber);
          }
          if (clientList.length > 0) {
            const defaultCl = clientList.find(c => c.name.includes('RADICAL')) || clientList[0];
            setSelectedClientId(defaultCl.id);
            setSelectedClient(defaultCl);
            setPlaceOfSupply(defaultCl.state);
            setPlaceOfSupplyCode(defaultCl.stateCode);
          }
        }
      } catch (err) {
        console.error('Failed to load invoice editor dependencies:', err);
      }
    }
    loadData();
  }, [initialInvoice]);

  // Handle Client change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setPlaceOfSupply(client.state);
      setPlaceOfSupplyCode(client.stateCode);
      if (hasShippingAddress && !shippingName) {
        setShippingName(client.name);
        setShippingAddress(client.shippingAddress || client.billingAddress);
        setShippingCity(client.city);
        setShippingState(client.state);
        setShippingStateCode(client.stateCode);
        setShippingPinCode(client.pinCode);
      }
    }
  };

  // Tax treatment calculation
  const sellerStateCode = businessProfile?.stateCode || '23';
  const isInterState = isInterStateSupply(sellerStateCode, placeOfSupplyCode);

  // Recalculate item financials whenever fields change
  const calculateItem = (item: InvoiceItem, isInter: boolean): InvoiceItem => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const gross = qty * rate;

    let discountAmount = 0;
    if (item.discountType === 'percentage') {
      discountAmount = (gross * (Number(item.discountValue) || 0)) / 100;
    } else {
      discountAmount = Number(item.discountValue) || 0;
    }

    const taxableAmount = Math.max(0, gross - discountAmount);
    const gstRate = Number(item.gstRate) || 0;
    const totalGst = (taxableAmount * gstRate) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInter) {
      igst = totalGst;
    } else {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    }

    const total = taxableAmount + totalGst;

    return {
      ...item,
      quantity: qty,
      rate: rate,
      discountAmount,
      taxableAmount,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalGstAmount: totalGst,
      total
    };
  };

  // Recalculate all items when place of supply changes
  useEffect(() => {
    setItems(prevItems => prevItems.map(item => calculateItem(item, isInterState)));
  }, [placeOfSupplyCode, sellerStateCode]);

  // Handle Item row updates
  const updateItemField = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      updated[index] = calculateItem(item, isInterState);
      return updated;
    });
  };

  const applyPresetToItem = (index: number, serviceId: string) => {
    if (serviceId === 'custom') return;
    const preset = PREDEFINED_SERVICES.find(s => s.id === serviceId);
    if (!preset) return;
    setItems(prev => {
      const updated = [...prev];
      const item = {
        ...updated[index],
        name: preset.name,
        description: preset.description,
        rate: preset.rate,
        hsnSac: preset.hsnSac || updated[index].hsnSac || '998314',
        unit: preset.unit || 'NOS'
      };
      updated[index] = calculateItem(item, isInterState);
      return updated;
    });
  };

  const addPresetService = (service: ServicePackage) => {
    const isFirstItemEmpty = items.length === 1 && !items[0].name.trim() && items[0].rate === 0;

    const newItem: InvoiceItem = {
      id: `item_${Date.now()}_${items.length}`,
      name: service.name,
      description: service.description,
      hsnSac: service.hsnSac || '998314',
      quantity: 1,
      unit: service.unit || 'NOS',
      rate: service.rate,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      taxableAmount: 0,
      gstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGstAmount: 0,
      total: 0
    };

    const calculated = calculateItem(newItem, isInterState);

    if (isFirstItemEmpty) {
      setItems([calculated]);
    } else {
      setItems(prev => [...prev, calculated]);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}_${items.length}`,
      name: '',
      description: '',
      hsnSac: '998314',
      quantity: 1,
      unit: 'NOS',
      rate: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      taxableAmount: 0,
      gstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGstAmount: 0,
      total: 0
    };
    setItems(prev => [...prev, calculateItem(newItem, isInterState)]);
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    const duplicated: InvoiceItem = {
      ...target,
      id: `item_${Date.now()}_dup`
    };
    setItems(prev => [...prev, duplicated]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations for Entire Invoice
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalItemDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);

  let globalDiscountAmount = 0;
  if (globalDiscountType === 'percentage') {
    globalDiscountAmount = ((subtotal - totalItemDiscount) * (Number(globalDiscountValue) || 0)) / 100;
  } else {
    globalDiscountAmount = Number(globalDiscountValue) || 0;
  }

  // After item discounts, remaining taxable pool before global discount
  const afterItemDiscount = Math.max(0, subtotal - totalItemDiscount);
  // After global discount — this is the actual taxable amount
  const totalTaxableAmount = Math.max(0, afterItemDiscount - globalDiscountAmount);

  // GST-compliant calculation: recalculate taxes on the final discounted amounts
  // Each item's share of the global discount is proportional to its taxable amount
  const discountRatio = afterItemDiscount > 0 ? totalTaxableAmount / afterItemDiscount : 0;
  let totalCgst = 0, totalSgst = 0, totalIgst = 0;
  items.forEach(item => {
    const itemDiscountedTaxable = item.taxableAmount * discountRatio;
    const gstRate = Number(item.gstRate) || 0;
    const itemGst = (itemDiscountedTaxable * gstRate) / 100;
    if (isInterState) {
      totalIgst += itemGst;
    } else {
      totalCgst += itemGst / 2;
      totalSgst += itemGst / 2;
    }
  });

  // Round to 2 decimal places
  totalCgst = Math.round(totalCgst * 100) / 100;
  totalSgst = Math.round(totalSgst * 100) / 100;
  totalIgst = Math.round(totalIgst * 100) / 100;
  const totalGst = Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100;

  const totalAdditionalCharges = additionalCharges.reduce((sum, chg) => sum + chg.amount, 0);
  const exactGrandTotal = totalTaxableAmount + totalGst + totalAdditionalCharges;
  const grandTotal = Math.round(exactGrandTotal * 100) / 100;
  const roundOff = Math.round((grandTotal - exactGrandTotal) * 100) / 100;
  const totalInWords = numberToIndianWords(grandTotal);

  // 30-Day Auto Billing Period Calculation
  const billingInfo = calculateBillingPeriod(billingStartDate || invoiceDate);
  const effectiveAdvance = Math.max(0, Number(advanceAmount) || 0);
  const otherPayments = initialInvoice?.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const totalAmountPaid = effectiveAdvance + otherPayments;
  const calculatedBalanceDue = Math.max(0, Math.round((grandTotal - totalAmountPaid) * 100) / 100);

  // Construct complete invoice object for preview & save
  const currentInvoiceData: Invoice = {
    id: initialInvoice?.id || `inv_${Date.now()}`,
    invoiceNumber: invoiceNumber || 'A000345',
    invoiceDate,
    billingStartDate: billingInfo.startDate,
    billingEndDate: billingInfo.endDate,
    billingPeriod: billingInfo.periodText,
    advanceAmount: effectiveAdvance,
    dueDate,
    placeOfSupply,
    placeOfSupplyCode,
    currency,
    financialYear: getFinancialYear(invoiceDate),
    isInterState,
    status: initialInvoice?.status || 'draft',
    template,
    seller: (businessProfile ? { ...businessProfile, logoUrl: undefined } : undefined) || {
      businessName: 'UDM Techno Solutions',
      legalName: 'UDM Techno Solutions Pvt. Ltd.',
      address: 'Shagun Tower, Office No.508, Plot No. 7 PU4, AB Rd, above Apna Sweets, Vijay Nagar, Scheme No 54',
      city: 'Indore',
      state: 'Madhya Pradesh',
      stateCode: '23',
      country: 'India',
      pinCode: '452010',
      gstin: '23AHWPH3168H2Z2',
      pan: 'AHWPH3168H',
      phone: '+91 99936 63668',
      email: 'Contact@udmtechno.com',
      website: 'https://Udmtechno.com',
      logoUrl: '/udm-logo.svg',
      bankName: 'Bank of Baroda',
      accountNumber: '05740100011588',
      accountHolderName: 'UDM Techno Solutions (Sankalp Nayak)',
      ifscCode: 'BARB0MEGHNA',
      branch: 'Indore',
      upiId: 'sankalpnayakk-2@okicici',
      upiQrImageUrl: '/upi-qr.png'
    },
    clientId: selectedClientId,
    client: selectedClient || {
      id: 'temp_client',
      name: 'Client Name',
      contactPerson: '',
      email: '',
      phone: '',
      billingAddress: '',
      city: '',
      state: placeOfSupply,
      stateCode: placeOfSupplyCode,
      country: 'India',
      pinCode: '',
      gstin: '',
      pan: '',
      customerType: 'B2B',
      createdAt: ''
    },
    hasShippingAddress,
    shippingName,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingStateCode,
    shippingPinCode,
    items: items.map(item => {
      const itemDiscountedTaxable = item.taxableAmount * (afterItemDiscount > 0 ? totalTaxableAmount / afterItemDiscount : 0);
      const itemGst = (itemDiscountedTaxable * (Number(item.gstRate) || 0)) / 100;
      const itemCgst = isInterState ? 0 : itemGst / 2;
      const itemSgst = isInterState ? 0 : itemGst / 2;
      const itemIgst = isInterState ? itemGst : 0;
      return {
        ...item,
        taxableAmount: Math.round(itemDiscountedTaxable * 100) / 100,
        cgstAmount: Math.round(itemCgst * 100) / 100,
        sgstAmount: Math.round(itemSgst * 100) / 100,
        igstAmount: Math.round(itemIgst * 100) / 100,
        totalGstAmount: Math.round(itemGst * 100) / 100,
        total: Math.round((itemDiscountedTaxable + itemGst) * 100) / 100
      };
    }),
    discountType: globalDiscountType,
    discountValue: globalDiscountValue,
    discountAmount: globalDiscountAmount,
    additionalCharges,
    subtotal,
    totalItemDiscount,
    totalTaxableAmount,
    totalCgst,
    totalSgst,
    totalIgst,
    totalGst,
    totalAdditionalCharges,
    roundOff,
    grandTotal,
    totalInWords,
    amountPaid: totalAmountPaid,
    balanceDue: calculatedBalanceDue,
    payments: initialInvoice?.payments || [],
    showBankDetails,
    showUpiQr,
    terms,
    customerNotes,
    internalNotes,
    createdAt: initialInvoice?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save Invoice action
  const handleSave = async (finalize: boolean = false) => {
    if (!selectedClientId) {
      alert('Please select a client for this invoice.');
      return;
    }
    if (items.length === 0 || items.some(i => !i.name.trim() || i.rate <= 0)) {
      alert('Please add at least one valid invoice item with name and rate.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Invoice> = {
        ...currentInvoiceData,
        status: finalize ? (currentInvoiceData.amountPaid >= grandTotal ? 'paid' : 'sent') : 'draft'
      };

      let saved: Invoice;
      if (initialInvoice?.id) {
        saved = await api.updateInvoice(initialInvoice.id, payload);
      } else {
        saved = await api.createInvoice(payload);
      }

      setSaveMessage(finalize ? 'Invoice Finalized & Saved!' : 'Draft Saved!');
      setTimeout(() => setSaveMessage(null), 3000);
      onSaveSuccess(saved);
    } catch (err: any) {
      alert(err.message || 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const filename = getInvoicePdfFilename(currentInvoiceData);
      const invoiceData = currentInvoiceData;

      const wrapperId = `pdf-capture-wrapper-${Date.now()}`;
      const wrapper = document.createElement('div');
      wrapper.id = wrapperId;
      wrapper.style.cssText = 'position:fixed;left:0;top:0;width:800px;z-index:-9999;pointer-events:none;backgroundColor:#ffffff';
      wrapper.setAttribute('data-invoice-id', invoiceData.id);
      document.body.appendChild(wrapper);

      const invoiceEl = document.createElement('div');
      invoiceEl.id = `pdf-capture-invoice-${invoiceData.id}`;
      invoiceEl.style.cssText = 'width:100%';
      wrapper.appendChild(invoiceEl);

      const root = createRoot(invoiceEl);
      root.render(
        <InvoicePDFTemplate
          id={`pdf-capture-invoice-${invoiceData.id}`}
          invoice={invoiceData}
          templateOverride={template}
        />
      );

      await new Promise(r => setTimeout(r, 400));

      await downloadElementAsPdf(`pdf-capture-invoice-${invoiceData.id}`, filename);

      root.unmount();
      document.body.removeChild(wrapper);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('PDF download failed: ' + (err.message || 'Unknown error. Check browser console (F12) for details.'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Print Invoice
  const handlePrintInvoice = () => {
    printInvoiceElement('live-invoice-pdf-preview');
  };

  const handleClientSaved = async (newClientData: Partial<Client>) => {
    const created = await api.createClient(newClientData);
    setClients(prev => [created, ...prev]);
    setSelectedClientId(created.id);
    setSelectedClient(created);
    setPlaceOfSupply(created.state);
    setPlaceOfSupplyCode(created.stateCode);
  };

  // Expose a ref/effect to open payment modal from parent
  useEffect(() => {
    if (onRecordPayment && initialInvoice) {
      (window as any).__openPaymentForInvoice = (inv: Invoice) => onRecordPayment(inv);
    }
  }, [onRecordPayment, initialInvoice]);

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors shrink-0"
              title="Back to Invoices"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {initialInvoice ? `Edit #${invoiceNumber}` : 'Create GST Tax Invoice'}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap ${
                  isInterState ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isInterState ? 'IGST (Inter-State)' : 'CGST + SGST (Intra-State)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Billed by: <strong className="text-slate-800">{businessProfile?.businessName || 'UDM Techno Solutions'}</strong> (MP-23)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {saveMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
              </span>
            )}

            {/* Template Style Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 px-1.5 font-medium text-[11px] hidden sm:inline">Style:</span>
              {(['classic', 'modern', 'minimal'] as InvoiceTemplateType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-2 py-1 rounded capitalize text-xs font-medium transition-all ${
                    template === t ? 'bg-white text-indigo-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Download PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="hidden md:inline">{isDownloadingPdf ? 'Generating...' : 'PDF'}</span>
            </button>

            <button
              onClick={handlePrintInvoice}
              className="p-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Print</span>
            </button>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="p-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition-colors"
              title="Send Email"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Email</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Finalize & Save'}</span>
            </button>
          </div>
        </div>

        {/* Payment / Due Tracker Bar */}
        {initialInvoice && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grand Total</span>
                <p className="text-sm font-bold font-mono">{formatINR(grandTotal)}</p>
              </div>
              <div className="w-px h-8 bg-slate-600"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Advance Paid</span>
                <p className="text-sm font-bold font-mono text-emerald-400">{formatINR(initialInvoice.amountPaid || 0)}</p>
              </div>
              <div className="w-px h-8 bg-slate-600"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Balance Due</span>
                <p className="text-lg font-bold font-mono text-rose-400">{formatINR(Math.max(0, grandTotal - (initialInvoice.amountPaid || 0)))}</p>
              </div>
            </div>
            <button
              onClick={() => onRecordPayment?.(initialInvoice!)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment / Advance
            </button>
          </div>
        )}

        {/* Mobile / Tablet Tab Switcher (< 1024px) */}
        <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileActiveTab('editor')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileActiveTab === 'editor'
                ? 'bg-white text-indigo-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span>Invoice Form & Services</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('preview')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileActiveTab === 'preview'
                ? 'bg-white text-indigo-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Live A4 Preview (₹{(grandTotal || 0).toLocaleString('en-IN')})</span>
          </button>
        </div>
      </div>

      {/* Main Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: FORM CONTROLS ================= */}
        <div className={`space-y-4 lg:col-span-6 ${mobileActiveTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Section 1: General Info & Place of Supply */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              Invoice Meta & 30-Day Billing Period
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setInvoiceDate(newDate);
                    if (!billingStartDate || billingStartDate === invoiceDate) {
                      setBillingStartDate(newDate);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Billing Start Date
                </label>
                <input
                  type="date"
                  value={billingStartDate}
                  onChange={(e) => setBillingStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
                />
              </div>
            </div>

            {/* Billing Period Auto Calculation Banner */}
            <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  30-Day Period
                </span>
                <span className="text-slate-600">Service Coverage:</span>
                <strong className="text-indigo-950 font-semibold font-mono">{billingInfo.periodText}</strong>
              </div>
              <span className="text-[11px] text-indigo-700 font-medium">Auto-calculated 30 Days</span>
            </div>
          </div>

          {/* Section 2: Billed To / Client Selection */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                Billed To (Customer Details)
              </h2>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" /> + New Client
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Existing Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden truncate"
              >
                <option value="">-- Choose Existing Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city}, {c.state} • GSTIN: {c.gstin || 'Unregistered'})
                  </option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">{selectedClient.name}</p>
                <p className="text-slate-600">{selectedClient.billingAddress}</p>
                <p className="text-slate-600">{selectedClient.city}, {selectedClient.state} - {selectedClient.pinCode}</p>
                <div className="pt-1 flex flex-wrap gap-4 text-slate-700 font-mono text-[11px]">
                  <span>GSTIN: <strong className="text-indigo-900">{selectedClient.gstin || 'URP'}</strong></span>
                  <span>PAN: <strong>{selectedClient.pan || 'N/A'}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Dynamic Item Table with Service Packages */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="min-w-0">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Invoice Line Items & Services ({items.length})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select a predefined service package or create a custom service. All fields are 100% editable.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Quick Add Preset Dropdown */}
                <div className="relative inline-block">
                  <select
                    onChange={(e) => {
                      const serviceId = e.target.value;
                      if (serviceId === 'custom') {
                        addItem();
                      } else if (serviceId) {
                        const s = PREDEFINED_SERVICES.find(p => p.id === serviceId);
                        if (s) addPresetService(s);
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors outline-hidden pr-7"
                  >
                    <option value="" disabled>+ Add Service Package...</option>
                    <option value="custom">✨ + Custom / Blank Service</option>
                    <optgroup label="🌐 Website Development">
                      <option value="basic-website">🌐 Basic Website (₹5,000)</option>
                      <option value="business-website">💼 Business Website (₹10,000)</option>
                      <option value="business-pro-website">🚀 Business Pro Website (₹15,000)</option>
                      <option value="ecommerce-website">🛒 E-Commerce Website (₹25,000)</option>
                    </optgroup>
                    <optgroup label="📄 Landing Pages">
                      <option value="single-landing-page">📄 Single Landing Page (₹2,500)</option>
                    </optgroup>
                    <optgroup label="📈 Digital Marketing & SEO">
                      <option value="google-business-profile-management">📍 Google Business Profile Management (₹7,500/Mo)</option>
                      <option value="google-ads-management">🔎 Google Ads Management (₹7,500/Mo)</option>
                      <option value="meta-ads-management">📱 Meta Ads Management (₹7,500/Mo)</option>
                    </optgroup>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Blank Item
                </button>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-4">
              {items.map((item, idx) => {
                const matchingPreset = PREDEFINED_SERVICES.find(s => s.name === item.name);
                const currentPresetId = matchingPreset ? matchingPreset.id : 'custom';

                return (
                  <div key={item.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    {/* Item Top Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <label className="text-[11px] font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Package:
                        </label>

                        <select
                          value={currentPresetId}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              // Leave current text as is
                            } else {
                              applyPresetToItem(idx, val);
                            }
                          }}
                          className="flex-1 min-w-0 px-2.5 py-1 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200 rounded text-xs font-semibold text-indigo-950 focus:ring-2 focus:ring-indigo-500 outline-hidden truncate"
                        >
                          <option value="custom">✨ Custom / Freeform Service</option>
                          <optgroup label="🌐 Website Development">
                            <option value="basic-website">🌐 Basic Website — ₹5,000 One-Time</option>
                            <option value="business-website">💼 Business Website — ₹10,000 One-Time</option>
                            <option value="business-pro-website">🚀 Business Pro Website — ₹15,000 One-Time</option>
                            <option value="ecommerce-website">🛒 E-Commerce Website — ₹25,000 One-Time</option>
                          </optgroup>
                          <optgroup label="📄 Landing Page">
                            <option value="single-landing-page">📄 Single Landing Page — ₹2,500 One-Time</option>
                          </optgroup>
                          <optgroup label="📈 Digital Marketing & SEO (Monthly)">
                            <option value="google-business-profile-management">📍 Google Business Profile Management — ₹7,500/Month</option>
                            <option value="google-ads-management">🔎 Google Ads Management — ₹7,500/Month</option>
                            <option value="meta-ads-management">📱 Meta Ads Management — ₹7,500/Month</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => duplicateItem(idx)}
                          className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Duplicate Row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Duplicate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length <= 1}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-30"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Item Name & Deliverables Fields */}
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Service Head / Item Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 🌐 Basic Website or Custom IT Service"
                          value={item.name}
                          onChange={(e) => updateItemField(idx, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Key Deliverables & Scope of Work
                          </label>
                          <span className="text-[10px] text-slate-400">Included on PDF Invoice</span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Key deliverables, scope of work, features included..."
                          value={item.description || ''}
                          onChange={(e) => updateItemField(idx, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden resize-y min-h-[52px]"
                        />
                      </div>
                    </div>

                    {/* Pricing, Quantity, Unit, GST, Total Row (HSN/SAC removed from UI as requested) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rate / Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.rate}
                          onChange={(e) => updateItemField(idx, 'rate', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItemField(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Unit</label>
                        <select
                          value={item.unit || 'NOS'}
                          onChange={(e) => updateItemField(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                        >
                          <option value="NOS">NOS</option>
                          <option value="MONTH">MONTH</option>
                          <option value="HRS">HRS</option>
                          <option value="SET">SET</option>
                          <option value="PCS">PCS</option>
                          <option value="DAYS">DAYS</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">GST Rate</label>
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItemField(idx, 'gstRate', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                        >
                          {GST_RATES.map(r => (
                            <option key={r} value={r}>{r}% GST</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Total (incl. GST)</label>
                        <div className="px-2 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold font-mono text-indigo-950 text-right truncate">
                          {formatINR(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Discount, Advance Payment & Additional Charges */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Discounts, Advance Payment & Charges</span>
              <span className="text-[10px] font-normal text-emerald-700 font-mono">
                Balance Due: {formatINR(calculatedBalanceDue)}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              {/* Advance Payment Field */}
              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
                <label className="block font-bold text-emerald-900 mb-1 flex items-center justify-between">
                  <span>Advance Payment (₹)</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">Paid upfront</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={advanceAmount || ''}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value) || 0)}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-950 text-xs focus:ring-2 focus:ring-emerald-600 outline-hidden"
                />
                <p className="text-[10px] text-emerald-700 mt-1">
                  Deducted directly from total amount.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Overall Discount</label>
                <div className="flex gap-2">
                  <select
                    value={globalDiscountType}
                    onChange={(e) => setGlobalDiscountType(e.target.value as any)}
                    className="w-24 px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs shrink-0"
                  >
                    <option value="percentage">% Percent</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={globalDiscountValue}
                    onChange={(e) => setGlobalDiscountValue(Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Additional Charges</label>
                <button
                  type="button"
                  onClick={() => {
                    const chargeName = prompt('Enter charge name (e.g. Delivery / Installation / Setup):', 'Setup & Delivery');
                    if (chargeName) {
                      const amountStr = prompt('Enter charge amount (₹):', '500');
                      const amount = Number(amountStr) || 0;
                      setAdditionalCharges(prev => [...prev, {
                        id: `chg_${Date.now()}`,
                        name: chargeName,
                        amount,
                        gstApplicable: false
                      }]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Extra Charge
                </button>
              </div>
            </div>

            {/* Advance Payment Calculation Breakdown Summary */}
            <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Total Invoice Amount:</span>
                <span className="font-bold">{formatINR(grandTotal)}</span>
              </div>
              {effectiveAdvance > 0 && (
                <div className="flex justify-between text-emerald-400 text-[11px]">
                  <span>Less: Advance Payment Received:</span>
                  <span className="font-bold">- {formatINR(effectiveAdvance)}</span>
                </div>
              )}
              {otherPayments > 0 && (
                <div className="flex justify-between text-emerald-300 text-[11px]">
                  <span>Other Recorded Payments:</span>
                  <span className="font-bold">- {formatINR(otherPayments)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-700 flex justify-between text-sm font-bold text-rose-300">
                <span className="font-sans">Balance Due:</span>
                <span>{formatINR(calculatedBalanceDue)}</span>
              </div>
            </div>

            {additionalCharges.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {additionalCharges.map((chg, i) => (
                  <div key={chg.id || i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800">{chg.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">+{formatINR(chg.amount)}</span>
                      <button
                        type="button"
                        onClick={() => setAdditionalCharges(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove Charge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Terms, Notes & Bank Toggle */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              Payment Terms & Display Preferences
            </h2>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBankDetails}
                  onChange={(e) => setShowBankDetails(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Show Bank Details on Invoice
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUpiQr}
                  onChange={(e) => setShowUpiQr(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Show UPI QR Code
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden resize-y"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Facing Note</label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Note (Private)</label>
                <input
                  type="text"
                  placeholder="Only visible inside CRM dashboard..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LIVE A4 PDF PREVIEW ================= */}
        <div className={`space-y-3 lg:col-span-6 ${isFullscreenPreview ? '!col-span-12' : ''} ${
          mobileActiveTab === 'editor' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">Live A4 PDF Preview</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 px-1.5 py-0.5 rounded-lg text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setPdfZoom(z => Math.max(0.5, z - 0.1))}
                  className="p-1 hover:text-indigo-300 text-slate-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-medium px-1 text-slate-300">
                  {Math.round(pdfZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPdfZoom(z => Math.min(1.5, z + 0.1))}
                  className="p-1 hover:text-indigo-300 text-slate-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPdfZoom(1)}
                  className="p-1 hover:text-indigo-300 text-slate-400 text-[10px]"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 text-xs flex items-center gap-1"
                title={isFullscreenPreview ? 'Exit Fullscreen' : 'Preview Fullscreen'}
              >
                {isFullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isFullscreenPreview ? 'Split View' : 'Fullscreen'}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-slate-100 p-2 sm:p-4 rounded-xl border border-slate-300 shadow-inner overflow-x-auto min-h-[500px]">
            <div
              className="flex justify-center transition-transform duration-150 origin-top"
              style={{ transform: `scale(${pdfZoom})` }}
            >
              <InvoicePDFTemplate
                id="live-invoice-pdf-preview"
                invoice={currentInvoiceData}
                templateOverride={template}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client Creation Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleClientSaved}
      />

      {/* Email Modal */}
      <SendEmailModal
        invoice={currentInvoiceData}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={async (payload) => {
          await api.sendInvoiceEmail(currentInvoiceData.id, payload);
        }}
      />
    </div>
  );
};
