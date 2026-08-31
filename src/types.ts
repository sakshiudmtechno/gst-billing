export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'accountant';
}

export interface BusinessProfile {
  businessName: string;
  legalName?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  pinCode: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  signatureUrl?: string;
  authorizedSignatoryName?: string;

  // Banking & UPI
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  qrCodeUrl?: string;
  upiQrImageUrl?: string;

  // Invoicing Preferences
  defaultTerms?: string;
  defaultCustomerNotes?: string;
  invoicePrefix?: string;
  invoiceStartingNumber?: number;
  invoiceTemplate?: 'classic' | 'modern' | 'minimal';
}

export interface Client {
  id: string;
  clientNumber?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  billingAddress: string;
  shippingAddress?: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  pinCode: string;
  gstin: string;
  pan: string;
  customerType: 'B2B' | 'B2C' | 'SEZ' | 'Export';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGstAmount: number;
  total: number;
}

export interface AdditionalCharge {
  id: string;
  name: string; // e.g. Shipping, Installation, Delivery
  amount: number;
  gstApplicable: boolean;
  gstRate?: number;
  gstAmount?: number;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Razorpay' | 'Cheque' | 'Other';
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceTemplateType = 'classic' | 'modern' | 'minimal';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. A000345
  poNumber?: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  currency: string;
  financialYear: string; // e.g. FY 2026-27
  isInterState: boolean;
  status: InvoiceStatus;
  template: InvoiceTemplateType;

  // Billed by snapshot
  seller: BusinessProfile;

  // Billed to snapshot
  clientId: string;
  client: Client;

  // Shipping details
  hasShippingAddress?: boolean;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingStateCode?: string;
  shippingCountry?: string;
  shippingPinCode?: string;
  shippingGstin?: string;

  // Items
  items: InvoiceItem[];

  // Global discount
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;

  // Additional charges
  additionalCharges: AdditionalCharge[];

  // Totals
  subtotal: number;
  totalItemDiscount: number;
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  totalAdditionalCharges: number;
  roundOff: number;
  grandTotal: number;
  totalInWords: string;

  // Payment Tracking
  amountPaid: number;
  balanceDue: number;
  payments: InvoicePayment[];

  // Bank & UPI options
  showBankDetails: boolean;
  showUpiQr: boolean;

  // Notes & terms
  terms: string;
  customerNotes?: string;
  internalNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem extends InvoiceItem {}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. Q000101
  quoteType?: string;
  quoteDate: string;
  validUntil: string;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  currency: string;
  financialYear?: string;
  isInterState?: boolean;
  status: QuoteStatus;
  template?: InvoiceTemplateType;

  seller?: BusinessProfile;
  clientId: string;
  client: Client;

  items: QuoteItem[];
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  additionalCharges?: AdditionalCharge[];

  subtotal: number;
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  roundOff?: number;
  grandTotal: number;
  totalInWords: string;

  terms: string;
  notes?: string;

  convertedToInvoiceId?: string;
  convertedToInvoiceNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditNoteItem {
  id: string;
  name: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string; // e.g. CN-001
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  clientName?: string;
  date: string;
  reason: string;
  items?: CreditNoteItem[];
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status?: string;
  notes?: string;
  createdAt?: string;
}

export interface RecurringInvoice {
  id: string;
  title?: string;
  recurringNumber?: string;
  clientId: string;
  client: Client;
  clientName?: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextInvoiceDate?: string;
  nextRunDate?: string;
  lastGeneratedInvoiceId?: string;
  status: 'active' | 'paused' | 'completed';
  items?: InvoiceItem[];
  invoiceTemplateData?: any;
  terms?: string;
  autoSendEmail?: boolean;
  createdAt?: string;
}

export interface Expense {
  id: string;
  title?: string;
  expenseDate?: string;
  date?: string;
  vendor?: string;
  vendorName?: string;
  vendorGstin?: string;
  category: string;
  description?: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMode?: string;
  paymentMethod?: string;
  itcEligible?: boolean;
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface InvoiceSettings {
  prefix: string;
  startingNumber: number;
  numberPadding: number;
  nextSequence: number;
  defaultCurrency: string;
  defaultGstRate: number;
  defaultPaymentTerms: string;
  defaultNotes: string;
}

export interface TaxSettings {
  gstRegistrationState: string;
  gstRegistrationStateCode: string;
  businessGstin: string;
  businessPan: string;
  defaultRates: number[];
  commonHsnSac: Array<{ code: string; description: string; defaultGst: number }>;
}

export interface PaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  enableUpiQr: boolean;
}

export interface PdfSettings {
  defaultTemplate: InvoiceTemplateType;
  accentColor: string;
  showLogo: boolean;
  showSignature: boolean;
  showBankDetails: boolean;
  showUpiQr: boolean;
  showTotalInWords: boolean;
  footerText: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  performedBy?: string;
  user?: string;
  details?: string;
  timestamp: string;
}
