import {
  BusinessProfile,
  Client,
  Invoice,
  Quote,
  CreditNote,
  RecurringInvoice,
  Expense,
  InvoiceSettings,
  TaxSettings,
  PaymentSettings,
  PdfSettings,
  AuditLog
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Server error occurred' }));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`);
    return handleResponse<any>(res);
  },

  async login(credentials: { email: string; password?: string }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse<any>(res);
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    return handleResponse<any>(res);
  },

  // Business Profile
  async getBusinessProfile(): Promise<BusinessProfile> {
    const res = await fetch(`${BASE_URL}/business-profile`);
    return handleResponse<BusinessProfile>(res);
  },

  async updateBusinessProfile(data: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const res = await fetch(`${BASE_URL}/business-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<BusinessProfile>(res);
  },

  // Settings
  async getSettings(): Promise<{
    invoiceSettings: InvoiceSettings;
    taxSettings: TaxSettings;
    paymentSettings: PaymentSettings;
    pdfSettings: PdfSettings;
  }> {
    const res = await fetch(`${BASE_URL}/settings`);
    return handleResponse<any>(res);
  },

  async updateSettings(data: {
    invoiceSettings?: Partial<InvoiceSettings>;
    taxSettings?: Partial<TaxSettings>;
    paymentSettings?: Partial<PaymentSettings>;
    pdfSettings?: Partial<PdfSettings>;
  }) {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  // Invoice Number
  async getNextInvoiceNumber(): Promise<{ invoiceNumber: string; nextSequence: number }> {
    const res = await fetch(`${BASE_URL}/invoices/next-number`, { cache: 'no-store' });
    const json = await res.json();
    return { invoiceNumber: json.invoiceNumber, nextSequence: json.nextSequence };
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await fetch(`${BASE_URL}/clients`);
    return handleResponse<Client[]>(res);
  },

  async getClient(id: string): Promise<{ client: Client; stats: any; invoices: Invoice[] }> {
    const res = await fetch(`${BASE_URL}/clients/${id}`);
    return handleResponse<any>(res);
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    const res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Client>(res);
  },

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const res = await fetch(`${BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Client>(res);
  },

  async deleteClient(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/clients/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<any>(res);
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch(`${BASE_URL}/invoices`, { cache: 'no-store' });
    return handleResponse<Invoice[]>(res);
  },

  async getInvoice(id: string): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/invoices/${id}`);
    return handleResponse<Invoice>(res);
  },

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Invoice>(res);
  },

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Invoice>(res);
  },

  async deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/invoices/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<any>(res);
  },

  async recordPayment(id: string, paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
  }): Promise<{ data: Invoice; payment: any }> {
    const res = await fetch(`${BASE_URL}/invoices/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    const json = await res.json();
    return { data: json.data, payment: json.payment };
  },

  async duplicateInvoice(id: string): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/invoices/${id}/duplicate`, {
      method: 'POST'
    });
    return handleResponse<Invoice>(res);
  },

  async cancelInvoice(id: string): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/invoices/${id}/cancel`, {
      method: 'POST'
    });
    return handleResponse<Invoice>(res);
  },

  async sendInvoiceEmail(id: string, payload: { to: string; cc?: string; subject: string; message: string }): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/invoices/${id}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return { message: json.message };
  },

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    const res = await fetch(`${BASE_URL}/quotes`);
    return handleResponse<Quote[]>(res);
  },

  async createQuote(data: Partial<Quote>): Promise<Quote> {
    const res = await fetch(`${BASE_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Quote>(res);
  },

  async updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
    const res = await fetch(`${BASE_URL}/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Quote>(res);
  },

  async deleteQuote(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/quotes/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<any>(res);
  },

  async convertQuoteToInvoice(id: string): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/quotes/${id}/convert-to-invoice`, {
      method: 'POST'
    });
    const json = await res.json();
    return json.invoice;
  },

  // Credit Notes
  async getCreditNotes(): Promise<CreditNote[]> {
    const res = await fetch(`${BASE_URL}/credit-notes`);
    return handleResponse<CreditNote[]>(res);
  },

  async createCreditNote(data: Partial<CreditNote>): Promise<CreditNote> {
    const res = await fetch(`${BASE_URL}/credit-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<CreditNote>(res);
  },

  async deleteCreditNote(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/credit-notes/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<any>(res);
  },

  // Recurring Invoices
  async getRecurringInvoices(): Promise<RecurringInvoice[]> {
    const res = await fetch(`${BASE_URL}/recurring-invoices`);
    return handleResponse<RecurringInvoice[]>(res);
  },

  async createRecurring(data: Partial<RecurringInvoice>): Promise<RecurringInvoice> {
    const res = await fetch(`${BASE_URL}/recurring-invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RecurringInvoice>(res);
  },

  async createRecurringInvoice(data: Partial<RecurringInvoice>): Promise<RecurringInvoice> {
    return this.createRecurring(data);
  },

  async updateRecurring(id: string, data: Partial<RecurringInvoice>): Promise<RecurringInvoice> {
    const res = await fetch(`${BASE_URL}/recurring-invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RecurringInvoice>(res);
  },

  async updateRecurringInvoice(id: string, data: Partial<RecurringInvoice>): Promise<RecurringInvoice> {
    return this.updateRecurring(id, data);
  },

  async deleteRecurring(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/recurring-invoices/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<any>(res);
  },

  async triggerRecurring(id: string): Promise<Invoice> {
    const res = await fetch(`${BASE_URL}/recurring-invoices/${id}/trigger`, {
      method: 'POST'
    });
    const json = await res.json();
    return json.invoice;
  },

  async triggerRecurringInvoice(id: string): Promise<Invoice> {
    return this.triggerRecurring(id);
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch(`${BASE_URL}/expenses`);
    return handleResponse<Expense[]>(res);
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Expense>(res);
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE'
    });
    await handleResponse<any>(res);
  },

  // Reports
  async getReports(filters: { financialYear?: string; month?: string; clientId?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filters.financialYear) params.append('financialYear', filters.financialYear);
    if (filters.month) params.append('month', filters.month);
    if (filters.clientId) params.append('clientId', filters.clientId);

    const res = await fetch(`${BASE_URL}/reports?${params.toString()}`);
    return handleResponse<any>(res);
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    return handleResponse<AuditLog[]>(res);
  }
};
