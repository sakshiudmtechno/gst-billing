const http = require('http');

const data = JSON.stringify({
  quoteNumber: "EST-2333",
  clientId: "client_123",
  client: {
    id: "client_123",
    name: "sankalp nayak (shiv shakti borewell )",
    contactPerson: "sankalp nayak (shiv shakti borewell )",
    email: "",
    phone: "",
    billingAddress: "Not Provided",
    city: "",
    state: "Madhya Pradesh",
    stateCode: "23",
    country: "India",
    pinCode: "",
    gstin: "",
    pan: "",
    customerType: "B2B",
    createdAt: new Date().toISOString()
  },
  quoteDate: "2026-08-27",
  validUntil: "2026-09-26",
  status: "draft",
  placeOfSupply: "Madhya Pradesh",
  placeOfSupplyCode: "23",
  currency: "INR",
  items: [
    {
      id: "qi_123_0",
      name: "Business Website",
      description: "...",
      hsnSac: "9983",
      quantity: 1,
      unit: "JOB",
      rate: 8000,
      discountType: "percentage",
      discountValue: 0,
      discountAmount: 0,
      taxableAmount: 8000,
      gstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGstAmount: 0,
      total: 8000
    }
  ],
  subtotal: 8000,
  totalTaxableAmount: 8000,
  totalGst: 0,
  totalCgst: 0,
  totalSgst: 0,
  totalIgst: 0,
  grandTotal: 8000,
  template: "classic",
  showBankDetails: false,
  seller: null
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/quotes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  console.log('STATUS:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', console.error);
req.write(data);
req.end();
