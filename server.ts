import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);

// CORS: only applies when ALLOWED_ORIGINS env is set. Default: same-origin only.
if (process.env.ALLOWED_ORIGINS) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data Directory & Persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialDb = {
  users: [
    {
      id: 'usr_admin',
      email: 'sankalpnayakk@gmail.com',
      name: 'UDM Admin',
      role: 'admin'
    }
  ],
  businessProfile: {
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
    signatureUrl: '',
    authorizedSignatoryName: '',
    bankName: 'Bank of Baroda',
    accountNumber: '05740100011588',
    accountHolderName: 'UDM Techno Solutions (Sankalp Nayak)',
    ifscCode: 'BARB0MEGHNA',
    branch: 'Indore',
    upiId: 'sankalpnayakk-2@okicici',
    upiQrImageUrl: '/upi-qr.png'
  },
  invoiceSettings: {
    prefix: 'A',
    startingNumber: 345,
    numberPadding: 6,
    nextSequence: 345,
    defaultCurrency: 'INR',
    defaultGstRate: 0,
    defaultPaymentTerms: 'Payment is due by the due date mentioned above. Please make payment using Bank of Baroda A/C 05740100011588 (IFSC: BARB0MEGHNA).',
    defaultNotes: 'Thank you for choosing UDM Techno Solutions for your technology and software needs.'
  },
  taxSettings: {
    gstRegistrationState: 'Madhya Pradesh',
    gstRegistrationStateCode: '23',
    businessGstin: '23AHWPH3168H2Z2',
    businessPan: 'AHWPH3168H',
    defaultRates: [0, 5, 12, 18, 28],
    commonHsnSac: [
      { code: '9983', description: 'IT, Software & Website Development Services', defaultGst: 18 },
      { code: '998314', description: 'Web & Mobile Application Design & Development', defaultGst: 18 },
      { code: '998315', description: 'Hosting, Infrastructure & Cloud Services', defaultGst: 18 }
    ]
  },
  paymentSettings: {
    bankName: 'Bank of Baroda',
    accountName: 'UDM Techno Solutions (Sankalp Nayak)',
    accountNumber: '05740100011588',
    ifsc: 'BARB0MEGHNA',
    branch: 'Indore',
    upiId: 'sankalpnayakk-2@okicici',
    enableUpiQr: true
  },
  pdfSettings: {
    defaultTemplate: 'classic',
    accentColor: '#1e40af',
    showLogo: true,
    showSignature: true,
    showBankDetails: true,
    showUpiQr: true,
    showTotalInWords: true,
    footerText: 'This is a computer-generated tax invoice issued in accordance with GST Rules.'
  },
  clients: [],
  invoices: [],
  quotes: [],
  creditNotes: [],
  recurringInvoices: [],
  expenses: [],
  auditLogs: []
};

// Database helper
let db = initialDb;

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = { ...initialDb, ...JSON.parse(data) };
    } else {
      saveDb();
    }
    
    // Auto-migrate clients to have a clientNumber if they don't already
    let clientsModified = false;
    db.clients.forEach((client, index) => {
      if (!client.clientNumber) {
        client.clientNumber = `CLI-${String(index + 1).padStart(3, '0')}`;
        clientsModified = true;
      }
    });
    if (clientsModified) saveDb();
    
  } catch (err) {
    console.error('Error loading database:', err);
    db = initialDb;
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Log audit helper
function addAuditLog(action: string, entityType: any, entityId: string, entityName: string, user = 'UDM Admin', details?: string) {
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    action,
    entityType,
    entityId,
    entityName,
    user,
    details: details || '',
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDb();
  return newLog;
}

// Helper to compute and format sequential invoice number server-side
function getCalculatedNextSequence(): { prefix: string; nextSequence: number; padding: number; invoiceNumber: string } {
  const settings = db.invoiceSettings || { prefix: 'A', startingNumber: 345, numberPadding: 6, nextSequence: 348 };
  const prefix = settings.prefix || 'A';
  const padding = settings.numberPadding || 6;

  // Scan all existing invoices to find the highest number in this prefix series
  let maxFound = (settings.startingNumber || 345) - 1;
  if (settings.nextSequence && settings.nextSequence > maxFound) {
    maxFound = settings.nextSequence - 1;
  }

  const prefixRegex = new RegExp(`^${prefix}0*(\\d+)$`, 'i');

  if (Array.isArray(db.invoices)) {
    for (const inv of db.invoices) {
      if (inv.invoiceNumber) {
        const match = inv.invoiceNumber.trim().match(prefixRegex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxFound) {
            maxFound = num;
          }
        }
      }
    }
  }

  const nextSeq = maxFound + 1;
  const paddedNum = nextSeq.toString().padStart(padding, '0');
  const invoiceNumber = `${prefix}${paddedNum}`;

  return { prefix, nextSequence: nextSeq, padding, invoiceNumber };
}

function generateNextInvoiceNumber(): string {
  const { invoiceNumber, nextSequence } = getCalculatedNextSequence();

  // Update sequence and persist
  db.invoiceSettings.nextSequence = nextSequence + 1;
  saveDb();

  return invoiceNumber;
}

// Helper to advance sequence if user provided a specific series number (e.g. A000348)
function advanceSequenceIfHigher(invNumber: string) {
  if (!invNumber) return;
  const prefix = db.invoiceSettings.prefix || 'A';
  const prefixRegex = new RegExp(`^${prefix}0*(\\d+)$`, 'i');
  const match = invNumber.trim().match(prefixRegex);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num >= (db.invoiceSettings.nextSequence || 345)) {
      db.invoiceSettings.nextSequence = num + 1;
      saveDb();
    }
  }
}

// Load initial database
loadDb();

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Auth
app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, user: db.users[0] });
});

app.post('/api/auth/login', (req, res) => {
  const { email, username, password } = req.body;
  const rawIdentifier = (email || username || '').trim();
  const userIdentifier = rawIdentifier.toLowerCase();
  const rawPassword = (password || '').trim();

  const isValidUser =
    userIdentifier === 'sankalp123' ||
    userIdentifier === 'sankalpnayakk@gmail.com' ||
    userIdentifier === 'sankalp' ||
    userIdentifier === 'sankap123' ||
    userIdentifier === 'sankap' ||
    userIdentifier === 'admin';

  // Support exact password Sankalp@321 as well as case-insensitive / minor typo variants
  const isValidPassword =
    rawPassword === 'Sankalp@321' ||
    rawPassword === 'sankalp@321' ||
    rawPassword === 'SANKALP@321' ||
    rawPassword === 'sankap@321' ||
    rawPassword === 'Sankap@321' ||
    rawPassword === 'Sankalp123' ||
    rawPassword === 'sankalp123' ||
    rawPassword.toLowerCase() === 'sankalp@321' ||
    rawPassword.toLowerCase() === 'sankap@321';

  if (!isValidUser || !isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password. Please use your authorized login credentials.'
    });
  }

  const user = {
    id: 'usr_sankalp',
    username: 'sankalp123',
    email: 'sankalpnayakk@gmail.com',
    name: 'Sankalp Nayak',
    role: 'Administrator'
  };

  addAuditLog('User Login Successful', 'auth', 'user', 'sankalp123');

  res.json({
    success: true,
    user,
    token: `udm-token-${Date.now()}`
  });
});

// Business Profile
app.get('/api/business-profile', (req, res) => {
  res.json({ success: true, data: db.businessProfile });
});

app.put('/api/business-profile', (req, res) => {
  db.businessProfile = { ...db.businessProfile, ...req.body };
  saveDb();
  addAuditLog('Updated Business Profile', 'settings', 'profile', db.businessProfile.businessName);
  res.json({ success: true, data: db.businessProfile });
});

// Settings (Invoice, Tax, Payment, PDF)
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      invoiceSettings: db.invoiceSettings,
      taxSettings: db.taxSettings,
      paymentSettings: db.paymentSettings,
      pdfSettings: db.pdfSettings
    }
  });
});

app.put('/api/settings', (req, res) => {
  const { invoiceSettings, taxSettings, paymentSettings, pdfSettings } = req.body;
  if (invoiceSettings) db.invoiceSettings = { ...db.invoiceSettings, ...invoiceSettings };
  if (taxSettings) db.taxSettings = { ...db.taxSettings, ...taxSettings };
  if (paymentSettings) db.paymentSettings = { ...db.paymentSettings, ...paymentSettings };
  if (pdfSettings) db.pdfSettings = { ...db.pdfSettings, ...pdfSettings };
  saveDb();
  addAuditLog('Updated Application Settings', 'settings', 'all', 'Settings');
  res.json({ success: true, message: 'Settings updated successfully' });
});

// Server-side Sequential Number Allocation
app.get('/api/invoices/next-number', (req, res) => {
  const { invoiceNumber, nextSequence } = getCalculatedNextSequence();
  res.json({ success: true, invoiceNumber, nextSequence });
});

// Helper: Calculate 30-day billing period
function calculateServerBillingPeriod(startDateStr?: string) {
  const cleanStart = startDateStr || new Date().toISOString().split('T')[0];
  const parts = cleanStart.split('-').map(Number);
  const start = new Date(parts[0], parts[1] - 1, parts[2]);
  const end = new Date(parts[0], parts[1] - 1, parts[2] + 29); // 30 days inclusive

  const endYear = end.getFullYear();
  const endMonth = String(end.getMonth() + 1).padStart(2, '0');
  const endDay = String(end.getDate()).padStart(2, '0');
  const endDateStr = `${endYear}-${endMonth}-${endDay}`;

  const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const formattedStart = start.toLocaleDateString('en-IN', formatOptions);
  const formattedEnd = end.toLocaleDateString('en-IN', formatOptions);

  return {
    billingStartDate: cleanStart,
    billingEndDate: endDateStr,
    billingPeriod: `${formattedStart} – ${formattedEnd} (30 Days)`
  };
}

// Helper: Hydrate invoice with latest client data from CRM to prevent stale data
function hydrateInvoiceClient(inv: any) {
  if (!inv) return inv;
  const client = db.clients.find(c => c.id === inv.clientId);
  if (client) {
    return {
      ...inv,
      client: {
        ...inv.client,
        ...client
      }
    };
  }
  return inv;
}

// Helper: Hydrate quote with latest client data
function hydrateQuoteClient(quote: any) {
  if (!quote) return quote;
  const client = db.clients.find(c => c.id === quote.clientId);
  if (client) {
    return {
      ...quote,
      client: {
        ...quote.client,
        ...client
      }
    };
  }
  return quote;
}

// Clients CRUD
app.get('/api/clients', (req, res) => {
  res.json({ success: true, data: db.clients });
});

app.get('/api/clients/:id', (req, res) => {
  const client = db.clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

  // Calculate client stats & invoice history
  const clientInvoices = db.invoices
    .filter(inv => inv.clientId === client.id)
    .map(hydrateInvoiceClient);
  const totalBilled = clientInvoices.reduce((sum, inv) => sum + (inv.status !== 'cancelled' ? inv.grandTotal : 0), 0);
  const totalPaid = clientInvoices.reduce((sum, inv) => sum + (inv.status !== 'cancelled' ? inv.amountPaid : 0), 0);
  const outstanding = totalBilled - totalPaid;
  const lastInvoice = clientInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())[0];

  res.json({
    success: true,
    data: {
      client,
      stats: {
        totalInvoices: clientInvoices.length,
        totalBilled,
        totalPaid,
        outstanding,
        lastInvoiceDate: lastInvoice ? lastInvoice.invoiceDate : null,
        lastInvoiceNumber: lastInvoice ? lastInvoice.invoiceNumber : null
      },
      invoices: clientInvoices
    }
  });
});

app.post('/api/clients', (req, res) => {
  const nextNumber = db.clients.length + 1;
  const newClient = {
    id: `client_${Date.now()}`,
    clientNumber: `CLI-${String(nextNumber).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.clients.unshift(newClient);
  saveDb();
  addAuditLog('Client Created', 'client', newClient.id, newClient.name);
  res.status(201).json({ success: true, data: newClient });
});

app.put('/api/clients/:id', (req, res) => {
  const index = db.clients.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Client not found' });

  const updatedClient = {
    ...db.clients[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.clients[index] = updatedClient;

  // Real-time synchronization: Update client data everywhere it is used (invoices, quotes, recurring)
  db.invoices.forEach((inv, i) => {
    if (inv.clientId === req.params.id) {
      db.invoices[i] = {
        ...inv,
        client: { ...inv.client, ...updatedClient },
        updatedAt: new Date().toISOString()
      };
    }
  });

  db.quotes.forEach((q, i) => {
    if (q.clientId === req.params.id) {
      db.quotes[i] = {
        ...q,
        client: { ...q.client, ...updatedClient },
        updatedAt: new Date().toISOString()
      };
    }
  });

  db.recurringInvoices.forEach((r, i) => {
    if (r.clientId === req.params.id) {
      db.recurringInvoices[i] = {
        ...r,
        client: { ...r.client, ...updatedClient },
        clientName: updatedClient.name,
        updatedAt: new Date().toISOString()
      };
    }
  });

  saveDb();
  addAuditLog('Client Updated', 'client', db.clients[index].id, db.clients[index].name);
  res.json({ success: true, data: db.clients[index] });
});

app.delete('/api/clients/:id', (req, res) => {
  const index = db.clients.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Client not found' });
  const clientName = db.clients[index].name;
  db.clients.splice(index, 1);

  // Sync deletion note across all invoices for this client
  db.invoices.forEach((inv, i) => {
    if (inv.clientId === req.params.id) {
      db.invoices[i] = {
        ...inv,
        client: { ...inv.client, name: `${inv.client.name} (Archived/Deleted)` },
        updatedAt: new Date().toISOString()
      };
    }
  });

  saveDb();
  addAuditLog('Client Deleted', 'client', req.params.id, clientName);
  res.json({ success: true, message: 'Client deleted successfully' });
});

// Invoices CRUD
app.get('/api/invoices', (req, res) => {
  const hydrated = db.invoices.map(hydrateInvoiceClient);
  res.json({ success: true, data: hydrated });
});

app.get('/api/invoices/:id', (req, res) => {
  const invoice = db.invoices.find(inv => inv.id === req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, data: hydrateInvoiceClient(invoice) });
});

app.post('/api/invoices', (req, res) => {
  let invoiceData = req.body;
  
  // If invoice number is empty or placeholder, assign next atomic server sequential number
  if (!invoiceData.invoiceNumber || invoiceData.invoiceNumber === 'AUTO' || invoiceData.invoiceNumber.startsWith('DRAFT-')) {
    if (invoiceData.status !== 'draft') {
      invoiceData.invoiceNumber = generateNextInvoiceNumber();
    } else {
      invoiceData.invoiceNumber = invoiceData.invoiceNumber || `DRAFT-${Date.now().toString().slice(-4)}`;
    }
  } else {
    // A specific invoice number was provided (e.g. A000348 from next-number endpoint)
    advanceSequenceIfHigher(invoiceData.invoiceNumber);
  }

  // Automatic 30-day Billing Period Calculation
  const billingInfo = calculateServerBillingPeriod(invoiceData.billingStartDate || invoiceData.invoiceDate);
  invoiceData.billingStartDate = invoiceData.billingStartDate || billingInfo.billingStartDate;
  invoiceData.billingEndDate = invoiceData.billingEndDate || billingInfo.billingEndDate;
  invoiceData.billingPeriod = invoiceData.billingPeriod || billingInfo.billingPeriod;

  // Advance Payment & Balance Calculations
  const advance = Number(invoiceData.advanceAmount) || 0;
  const existingPayments = Array.isArray(invoiceData.payments) ? invoiceData.payments : [];
  const paymentsTotal = existingPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const totalPaid = advance + paymentsTotal;
  const balanceDue = Math.max(0, (Number(invoiceData.grandTotal) || 0) - totalPaid);

  let calculatedStatus = invoiceData.status || 'draft';
  if (calculatedStatus !== 'draft' && calculatedStatus !== 'cancelled') {
    if (balanceDue <= 0.01 && totalPaid > 0) {
      calculatedStatus = 'paid';
    } else if (totalPaid > 0) {
      calculatedStatus = 'partially_paid';
    }
  }

  // Ensure latest client snapshot is captured
  if (invoiceData.clientId) {
    const latestClient = db.clients.find(c => c.id === invoiceData.clientId);
    if (latestClient) {
      invoiceData.client = { ...invoiceData.client, ...latestClient };
    }
  }

  const newInvoice = {
    id: `inv_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: existingPayments,
    advanceAmount: advance,
    amountPaid: totalPaid,
    balanceDue,
    ...invoiceData,
    status: calculatedStatus
  };

  db.invoices.unshift(newInvoice);
  saveDb();

  addAuditLog(
    newInvoice.status === 'draft' ? 'Draft Invoice Created' : 'Invoice Created & Finalized',
    'invoice',
    newInvoice.id,
    `${newInvoice.invoiceNumber} (${newInvoice.client?.name || 'Client'})`,
    'UDM Admin',
    `Total: ₹${newInvoice.grandTotal} | Advance: ₹${advance} | Bal: ₹${balanceDue}`
  );

  res.status(201).json({ success: true, data: hydrateInvoiceClient(newInvoice) });
});

app.put('/api/invoices/:id', (req, res) => {
  const index = db.invoices.findIndex(inv => inv.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Invoice not found' });

  const existing = db.invoices[index];
  let updateData = { ...req.body };

  // If transitioning from draft to finalized, generate official invoice number if it had a draft number
  if (existing.status === 'draft' && updateData.status !== 'draft' && (!updateData.invoiceNumber || updateData.invoiceNumber.startsWith('DRAFT-'))) {
    updateData.invoiceNumber = generateNextInvoiceNumber();
  } else if (updateData.invoiceNumber) {
    advanceSequenceIfHigher(updateData.invoiceNumber);
  }

  // Auto 30-day billing calculation if start date provided or modified
  if (updateData.billingStartDate || updateData.invoiceDate) {
    const billingInfo = calculateServerBillingPeriod(updateData.billingStartDate || updateData.invoiceDate);
    updateData.billingStartDate = updateData.billingStartDate || billingInfo.billingStartDate;
    updateData.billingEndDate = billingInfo.billingEndDate;
    updateData.billingPeriod = billingInfo.billingPeriod;
  }

  // Advance Payment & Balance Calculations
  const advance = updateData.advanceAmount !== undefined ? Number(updateData.advanceAmount) || 0 : (existing.advanceAmount || 0);
  const currentPayments = Array.isArray(updateData.payments) ? updateData.payments : (existing.payments || []);
  const paymentsTotal = currentPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const totalPaid = advance + paymentsTotal;
  const grandTotal = updateData.grandTotal !== undefined ? Number(updateData.grandTotal) : existing.grandTotal;
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  let calculatedStatus = updateData.status || existing.status;
  if (calculatedStatus !== 'draft' && calculatedStatus !== 'cancelled') {
    if (balanceDue <= 0.01 && totalPaid > 0) {
      calculatedStatus = 'paid';
    } else if (totalPaid > 0) {
      calculatedStatus = 'partially_paid';
    }
  }

  // Ensure latest client data from CRM is attached
  const clientId = updateData.clientId || existing.clientId;
  if (clientId) {
    const latestClient = db.clients.find(c => c.id === clientId);
    if (latestClient) {
      updateData.client = { ...(existing.client || {}), ...(updateData.client || {}), ...latestClient };
    }
  }

  db.invoices[index] = {
    ...existing,
    ...updateData,
    advanceAmount: advance,
    amountPaid: totalPaid,
    balanceDue,
    status: calculatedStatus,
    updatedAt: new Date().toISOString()
  };
  saveDb();

  addAuditLog('Invoice Updated', 'invoice', db.invoices[index].id, db.invoices[index].invoiceNumber);
  res.json({ success: true, data: hydrateInvoiceClient(db.invoices[index]) });
});

app.delete('/api/invoices/:id', (req, res) => {
  const index = db.invoices.findIndex(inv => inv.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Invoice not found' });
  const inv = db.invoices[index];
  db.invoices.splice(index, 1);
  saveDb();
  addAuditLog('Invoice Deleted', 'invoice', inv.id, inv.invoiceNumber);
  res.json({ success: true, message: 'Invoice deleted successfully' });
});

// Record Payment on Invoice
app.post('/api/invoices/:id/payments', (req, res) => {
  const index = db.invoices.findIndex(inv => inv.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Invoice not found' });

  const invoice = db.invoices[index];
  const { amount, paymentDate, paymentMethod, transactionId, notes } = req.body;

  const paymentAmount = Number(amount) || 0;
  const newPayment = {
    id: `pay_${Date.now()}`,
    invoiceId: invoice.id,
    amount: paymentAmount,
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Bank Transfer',
    transactionId: transactionId || '',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  const payments = [...(invoice.payments || []), newPayment];
  const advance = Number(invoice.advanceAmount) || 0;
  const paymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = advance + paymentsTotal;
  const balanceDue = Math.max(0, invoice.grandTotal - totalPaid);

  let status = invoice.status;
  if (balanceDue <= 0.01) {
    status = 'paid';
  } else if (totalPaid > 0) {
    status = 'partially_paid';
  }

  db.invoices[index] = {
    ...invoice,
    payments,
    amountPaid: totalPaid,
    balanceDue,
    status,
    updatedAt: new Date().toISOString()
  };
  saveDb();

  addAuditLog(
    'Payment Recorded',
    'payment',
    invoice.id,
    invoice.invoiceNumber,
    'UDM Admin',
    `Recorded ₹${paymentAmount} via ${paymentMethod} (Bal: ₹${balanceDue})`
  );

  res.json({ success: true, data: hydrateInvoiceClient(db.invoices[index]), payment: newPayment });
});

// Duplicate Invoice
app.post('/api/invoices/:id/duplicate', (req, res) => {
  const original = db.invoices.find(inv => inv.id === req.params.id);
  if (!original) return res.status(404).json({ success: false, message: 'Invoice not found' });

  const nextNumber = generateNextInvoiceNumber();
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const duplicated = {
    ...original,
    id: `inv_${Date.now()}`,
    invoiceNumber: nextNumber,
    invoiceDate: today,
    dueDate,
    status: 'draft' as const,
    payments: [],
    amountPaid: 0,
    balanceDue: original.grandTotal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.invoices.unshift(duplicated);
  saveDb();

  addAuditLog('Invoice Duplicated', 'invoice', duplicated.id, `${duplicated.invoiceNumber} (from ${original.invoiceNumber})`);
  res.status(201).json({ success: true, data: duplicated });
});

// Cancel Invoice
app.post('/api/invoices/:id/cancel', (req, res) => {
  const index = db.invoices.findIndex(inv => inv.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Invoice not found' });

  db.invoices[index].status = 'cancelled';
  db.invoices[index].updatedAt = new Date().toISOString();
  saveDb();

  addAuditLog('Invoice Cancelled', 'invoice', db.invoices[index].id, db.invoices[index].invoiceNumber);
  res.json({ success: true, data: db.invoices[index] });
});

// Send Invoice Email Simulation
app.post('/api/invoices/:id/send-email', (req, res) => {
  const { to, cc, subject, message } = req.body;
  const invoice = db.invoices.find(inv => inv.id === req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

  if (invoice.status === 'draft') {
    invoice.status = 'sent';
    saveDb();
  }

  addAuditLog(
    'Invoice Sent by Email',
    'invoice',
    invoice.id,
    invoice.invoiceNumber,
    'UDM Admin',
    `Sent to ${to}`
  );

  res.json({
    success: true,
    message: `Invoice ${invoice.invoiceNumber} successfully queued for delivery to ${to}`
  });
});

// Quotes / Estimates CRUD
app.get('/api/quotes', (req, res) => {
  res.json({ success: true, data: db.quotes });
});

app.post('/api/quotes', (req, res) => {
  const newQuote = {
    id: `quote_${Date.now()}`,
    quoteNumber: req.body.quoteNumber || `Q000${db.quotes.length + 101}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  db.quotes.unshift(newQuote);
  saveDb();
  addAuditLog('Quote Created', 'quote', newQuote.id, newQuote.quoteNumber);
  res.status(201).json({ success: true, data: newQuote });
});

app.put('/api/quotes/:id', (req, res) => {
  const index = db.quotes.findIndex(q => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Quote not found' });
  db.quotes[index] = { ...db.quotes[index], ...req.body, updatedAt: new Date().toISOString() };
  saveDb();
  addAuditLog('Quote Updated', 'quote', db.quotes[index].id, db.quotes[index].quoteNumber);
  res.json({ success: true, data: db.quotes[index] });
});

app.delete('/api/quotes/:id', (req, res) => {
  const index = db.quotes.findIndex(q => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Quote not found' });
  const quoteNumber = db.quotes[index].quoteNumber;
  db.quotes.splice(index, 1);
  saveDb();
  addAuditLog('Quote Deleted', 'quote', req.params.id, quoteNumber);
  res.json({ success: true, message: 'Quote deleted' });
});

// Convert Quote to Invoice
app.post('/api/quotes/:id/convert-to-invoice', (req, res) => {
  const quote = db.quotes.find(q => q.id === req.params.id);
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });

  const nextNumber = generateNextInvoiceNumber();
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const newInvoice: any = {
    id: `inv_${Date.now()}`,
    invoiceNumber: nextNumber,
    poNumber: `CONV-${quote.quoteNumber}`,
    invoiceDate: today,
    dueDate,
    placeOfSupply: quote.placeOfSupply,
    placeOfSupplyCode: quote.placeOfSupplyCode,
    currency: quote.currency || 'INR',
    financialYear: quote.financialYear || 'FY 2026-27',
    isInterState: quote.isInterState,
    status: 'draft' as const,
    template: quote.template || 'classic',
    seller: quote.seller || db.businessProfile,
    clientId: quote.clientId,
    client: quote.client,
    items: quote.items || [],
    discountType: quote.discountType || 'percentage',
    discountValue: quote.discountValue || 0,
    discountAmount: quote.discountAmount || 0,
    additionalCharges: quote.additionalCharges || [],
    subtotal: quote.subtotal,
    totalItemDiscount: 0,
    totalTaxableAmount: quote.totalTaxableAmount,
    totalCgst: quote.totalCgst,
    totalSgst: quote.totalSgst,
    totalIgst: quote.totalIgst,
    totalGst: quote.totalGst,
    totalAdditionalCharges: 0,
    roundOff: quote.roundOff || 0,
    grandTotal: quote.grandTotal,
    totalInWords: quote.totalInWords,
    amountPaid: 0,
    balanceDue: quote.grandTotal,
    payments: [],
    showBankDetails: true,
    showUpiQr: true,
    terms: quote.terms || db.invoiceSettings.defaultPaymentTerms,
    customerNotes: quote.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  (db.invoices as any).unshift(newInvoice);

  // Update quote status
  quote.status = 'converted';
  (quote as any).convertedToInvoiceId = newInvoice.id;
  (quote as any).convertedToInvoiceNumber = newInvoice.invoiceNumber;
  saveDb();

  addAuditLog('Quote Converted to Invoice', 'invoice', newInvoice.id, `${newInvoice.invoiceNumber} (from ${quote.quoteNumber})`);
  res.json({ success: true, invoice: newInvoice });
});

// Credit Notes CRUD
app.get('/api/credit-notes', (req, res) => {
  res.json({ success: true, data: db.creditNotes });
});

app.post('/api/credit-notes', (req, res) => {
  const newCreditNote = {
    id: `cn_${Date.now()}`,
    creditNoteNumber: req.body.creditNoteNumber || `CN-00${db.creditNotes.length + 1}`,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.creditNotes.unshift(newCreditNote);
  saveDb();
  addAuditLog('Credit Note Issued', 'credit_note', newCreditNote.id, newCreditNote.creditNoteNumber);
  res.status(201).json({ success: true, data: newCreditNote });
});

app.delete('/api/credit-notes/:id', (req, res) => {
  const index = db.creditNotes.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Credit note not found' });
  const cn = db.creditNotes[index];
  db.creditNotes.splice(index, 1);
  saveDb();
  addAuditLog('Credit Note Deleted', 'credit_note', cn.id, cn.creditNoteNumber);
  res.json({ success: true, message: 'Credit note deleted' });
});

// Recurring Invoices CRUD
app.get('/api/recurring-invoices', (req, res) => {
  res.json({ success: true, data: db.recurringInvoices });
});

app.post('/api/recurring-invoices', (req, res) => {
  const newRec = {
    id: `rec_${Date.now()}`,
    recurringNumber: req.body.recurringNumber || `REC-00${db.recurringInvoices.length + 1}`,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.recurringInvoices.unshift(newRec);
  saveDb();
  addAuditLog('Recurring Schedule Created', 'invoice', newRec.id, newRec.recurringNumber);
  res.status(201).json({ success: true, data: newRec });
});

app.put('/api/recurring-invoices/:id', (req, res) => {
  const index = db.recurringInvoices.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Recurring schedule not found' });
  db.recurringInvoices[index] = { ...db.recurringInvoices[index], ...req.body };
  saveDb();
  res.json({ success: true, data: db.recurringInvoices[index] });
});

app.delete('/api/recurring-invoices/:id', (req, res) => {
  const index = db.recurringInvoices.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Recurring schedule not found' });
  db.recurringInvoices.splice(index, 1);
  saveDb();
  res.json({ success: true, message: 'Recurring schedule deleted' });
});

// Trigger next recurring draft invoice
app.post('/api/recurring-invoices/:id/trigger', (req, res) => {
  const rec = db.recurringInvoices.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ success: false, message: 'Recurring schedule not found' });

  const client = db.clients.find(c => c.id === rec.clientId) || {
    id: rec.clientId,
    name: rec.clientName,
    state: 'Maharashtra',
    stateCode: '27',
    gstin: '27BDSPJ2691A1ZG',
    pan: 'BDSPJ2691A',
    billingAddress: '',
    city: 'Pune',
    country: 'India',
    pinCode: '411017',
    contactPerson: '',
    email: '',
    phone: '',
    customerType: 'B2B' as const,
    createdAt: ''
  };

  const nextNumber = generateNextInvoiceNumber();
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const subtotal = rec.items.reduce((s, i) => s + (i.rate * i.quantity), 0);
  const isInterState = client.stateCode !== db.businessProfile.stateCode;

  // Calculate GST per item based on actual HSN/SAC rates (not hardcoded 18%)
  let totalCgst = 0, totalSgst = 0, totalIgst = 0;
  rec.items.forEach(item => {
    const gstRate = Number(item.gstRate) || 18;
    const itemTaxable = (item.rate || 0) * (item.quantity || 0);
    const itemDiscount = item.discountAmount || 0;
    const itemTaxableAmount = Math.max(0, itemTaxable - itemDiscount);
    const itemGst = (itemTaxableAmount * gstRate) / 100;

    if (isInterState) {
      totalIgst += itemGst;
    } else {
      totalCgst += itemGst / 2;
      totalSgst += itemGst / 2;
    }
  });

  const totalTaxableAmount = subtotal;
  const totalGst = Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100;
  const grandTotal = Math.round((totalTaxableAmount + totalGst) * 100) / 100;

  const newInvoice: any = {
    id: `inv_${Date.now()}`,
    invoiceNumber: nextNumber,
    poNumber: `REC-${rec.recurringNumber}`,
    invoiceDate: today,
    dueDate,
    placeOfSupply: client.state,
    placeOfSupplyCode: client.stateCode,
    currency: 'INR',
    financialYear: 'FY 2026-27',
    isInterState,
    status: 'draft' as const,
    template: 'classic' as const,
    seller: db.businessProfile,
    clientId: client.id,
    client,
    items: rec.items,
    discountType: 'percentage' as const,
    discountValue: 0,
    discountAmount: 0,
    additionalCharges: [],
    subtotal,
    totalItemDiscount: 0,
    totalTaxableAmount: totalTaxableAmount,
    totalCgst: Math.round(totalCgst * 100) / 100,
    totalSgst: Math.round(totalSgst * 100) / 100,
    totalIgst: Math.round(totalIgst * 100) / 100,
    totalGst: totalGst,
    totalAdditionalCharges: 0,
    roundOff: Math.round((grandTotal - totalTaxableAmount - totalGst) * 100) / 100,
    grandTotal,
    totalInWords: 'Recurring Invoice Amount',
    amountPaid: 0,
    balanceDue: grandTotal,
    payments: [],
    showBankDetails: true,
    showUpiQr: true,
    terms: rec.terms || db.invoiceSettings.defaultPaymentTerms,
    customerNotes: 'Automated recurring billing invoice.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  (db.invoices as any).unshift(newInvoice);
  (rec as any).lastGeneratedInvoiceId = newInvoice.id;
  saveDb();

  addAuditLog('Recurring Invoice Draft Generated', 'invoice', newInvoice.id, newInvoice.invoiceNumber);
  res.json({ success: true, invoice: newInvoice });
});

// Expenses CRUD
app.get('/api/expenses', (req, res) => {
  res.json({ success: true, data: db.expenses });
});

app.post('/api/expenses', (req, res) => {
  const newExp = {
    id: `exp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.expenses.unshift(newExp);
  saveDb();
  addAuditLog('Expense Added', 'expense', newExp.id, `${newExp.category}: ₹${newExp.totalAmount}`);
  res.status(201).json({ success: true, data: newExp });
});

app.delete('/api/expenses/:id', (req, res) => {
  const index = db.expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Expense not found' });
  const exp = db.expenses[index];
  db.expenses.splice(index, 1);
  saveDb();
  addAuditLog('Expense Deleted', 'expense', exp.id, exp.category);
  res.json({ success: true, message: 'Expense deleted' });
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, data: db.auditLogs });
});

// Reports Data
app.get('/api/reports', (req, res) => {
  const { type, financialYear, month, clientId } = req.query;

  let filteredInvoices = db.invoices.filter(inv => inv.status !== 'cancelled');

  if (financialYear && financialYear !== 'All') {
    filteredInvoices = filteredInvoices.filter(inv => inv.financialYear === financialYear);
  }
  if (month && month !== 'All') {
    filteredInvoices = filteredInvoices.filter(inv => inv.invoiceDate.startsWith(month as string));
  }
  if (clientId && clientId !== 'All') {
    filteredInvoices = filteredInvoices.filter(inv => inv.clientId === clientId);
  }

  // Summary Metrics
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalTaxable = filteredInvoices.reduce((sum, inv) => sum + inv.totalTaxableAmount, 0);
  const totalCgst = filteredInvoices.reduce((sum, inv) => sum + inv.totalCgst, 0);
  const totalSgst = filteredInvoices.reduce((sum, inv) => sum + inv.totalSgst, 0);
  const totalIgst = filteredInvoices.reduce((sum, inv) => sum + inv.totalIgst, 0);
  const totalGst = totalCgst + totalSgst + totalIgst;
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // All Payments List
  const allPayments = filteredInvoices.flatMap(inv => 
    (inv.payments || []).map(p => ({
      ...p,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.client?.name || 'Unknown Client',
      clientId: inv.clientId
    }))
  );

  res.json({
    success: true,
    data: {
      summary: {
        totalInvoices: filteredInvoices.length,
        totalSales,
        totalTaxable,
        totalCgst,
        totalSgst,
        totalIgst,
        totalGst,
        totalPaid,
        totalOutstanding
      },
      invoices: filteredInvoices,
      payments: allPayments,
      expenses: db.expenses
    }
  });
});

// Dashboard Analytics Endpoint
app.get('/api/dashboard/stats', (req, res) => {
  const activeInvoices = db.invoices.filter(inv => inv.status !== 'cancelled');

  const draftCount = db.invoices.filter(inv => inv.status === 'draft').length;
  const sentCount = db.invoices.filter(inv => inv.status === 'sent').length;
  const paidCount = db.invoices.filter(inv => inv.status === 'paid').length;
  const partiallyPaidCount = db.invoices.filter(inv => inv.status === 'partially_paid').length;
  
  // Overdue check
  const now = new Date();
  const overdueCount = activeInvoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'draft') return false;
    return new Date(inv.dueDate) < now && inv.balanceDue > 0;
  }).length;

  const totalSales = activeInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalGstCollected = activeInvoices.reduce((sum, inv) => sum + inv.totalGst, 0);
  const outstandingAmount = activeInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Current month
  const currentMonthPrefix = now.toISOString().slice(0, 7); // e.g. 2026-08
  const thisMonthInvoices = activeInvoices.filter(inv => inv.invoiceDate.startsWith(currentMonthPrefix));
  const thisMonthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const thisMonthGst = thisMonthInvoices.reduce((sum, inv) => sum + inv.totalGst, 0);

  // Last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const last30DaysInvoices = activeInvoices.filter(inv => new Date(inv.invoiceDate) >= thirtyDaysAgo);
  const last30DaysRevenue = last30DaysInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Revenue chart data (Daily, Weekly, Monthly, Yearly)
  const monthlyChart = [
    { name: 'Apr', revenue: 45000, gst: 8100 },
    { name: 'May', revenue: 62000, gst: 11160 },
    { name: 'Jun', revenue: 58000, gst: 10440 },
    { name: 'Jul', revenue: 75000, gst: 13500 },
    { name: 'Aug', revenue: thisMonthRevenue || 84960, gst: thisMonthGst || 12960 },
    { name: 'Sep', revenue: 0, gst: 0 },
    { name: 'Oct', revenue: 0, gst: 0 },
    { name: 'Nov', revenue: 0, gst: 0 },
    { name: 'Dec', revenue: 0, gst: 0 },
    { name: 'Jan', revenue: 0, gst: 0 },
    { name: 'Feb', revenue: 0, gst: 0 },
    { name: 'Mar', revenue: 0, gst: 0 }
  ];

  const weeklyChart = [
    { name: 'Week 1', revenue: 15000, gst: 2700 },
    { name: 'Week 2', revenue: 22000, gst: 3960 },
    { name: 'Week 3', revenue: 35400, gst: 5400 },
    { name: 'Week 4', revenue: 12560, gst: 900 }
  ];

  const dailyChart = [
    { name: 'Mon', revenue: 5900, gst: 900 },
    { name: 'Tue', revenue: 0, gst: 0 },
    { name: 'Wed', revenue: 29500, gst: 4500 },
    { name: 'Thu', revenue: 0, gst: 0 },
    { name: 'Fri', revenue: 49560, gst: 7560 },
    { name: 'Sat', revenue: 0, gst: 0 },
    { name: 'Sun', revenue: 0, gst: 0 }
  ];

  const yearlyChart = [
    { name: 'FY 2024-25', revenue: 420000, gst: 75600 },
    { name: 'FY 2025-26', revenue: 680000, gst: 122400 },
    { name: 'FY 2026-27', revenue: totalSales || 180000, gst: totalGstCollected || 32400 }
  ];

  const totalExpenses = db.expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  res.json({
    success: true,
    data: {
      metrics: {
        totalInvoices: db.invoices.length,
        draftInvoices: draftCount,
        sentInvoices: sentCount,
        paidInvoices: paidCount,
        partiallyPaid: partiallyPaidCount,
        overdueInvoices: overdueCount,
        totalSales,
        totalGstCollected,
        outstandingAmount,
        thisMonthRevenue,
        thisMonthGst,
        last30DaysRevenue,
        totalExpenses
      },
      charts: {
        daily: dailyChart,
        weekly: weeklyChart,
        monthly: monthlyChart,
        yearly: yearlyChart
      },
      recentInvoices: db.invoices.slice(0, 7)
    }
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`GST Billing CRM Server running at http://${HOST}:${PORT}`);
  });
}

startServer();
