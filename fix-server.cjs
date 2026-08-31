const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const businessProfileMatch = content.match(/businessProfile: \{[\s\S]*?\},\n  invoiceSettings:/);
const invoiceSettingsMatch = content.match(/invoiceSettings: \{[\s\S]*?\},\n  taxSettings:/);
const taxSettingsMatch = content.match(/taxSettings: \{[\s\S]*?\},\n  paymentSettings:/);
const paymentSettingsMatch = content.match(/paymentSettings: \{[\s\S]*?\},\n  pdfSettings:/);
const pdfSettingsMatch = content.match(/pdfSettings: \{[\s\S]*?\},/);

if (!businessProfileMatch || !invoiceSettingsMatch || !taxSettingsMatch || !paymentSettingsMatch || !pdfSettingsMatch) {
  console.log("Failed to match one of the settings");
  process.exit(1);
}

const newInitialDb = `const initialDb = {
  users: [
    {
      id: 'usr_admin',
      email: 'sankalpnayakk@gmail.com',
      name: 'UDM Admin',
      role: 'admin'
    }
  ],
  ${businessProfileMatch[0].replace(/,\n  invoiceSettings:$/, ',')}
  ${invoiceSettingsMatch[0].replace(/,\n  taxSettings:$/, ',')}
  ${taxSettingsMatch[0].replace(/,\n  paymentSettings:$/, ',')}
  ${paymentSettingsMatch[0].replace(/,\n  pdfSettings:$/, ',')}
  ${pdfSettingsMatch[0]}
  clients: [],
  invoices: [],
  quotes: [],
  creditNotes: [],
  recurringInvoices: [],
  expenses: [],
  auditLogs: []
};`;

const startIndex = content.indexOf('const initialDb = {');
const endIndex = content.indexOf('// Database helper');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newInitialDb + '\n\n' + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Successfully replaced initialDb");
} else {
  console.log("Could not find start or end index");
}
