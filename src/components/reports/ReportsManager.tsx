import React, { useState } from 'react';
import { Invoice, Expense, Client } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { exportToCSV, triggerPrint } from '../../utils/pdfGenerator';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Download,
  Percent,
  Receipt,
  FileCheck,
  CheckCircle,
  Building2
} from 'lucide-react';

interface ReportsManagerProps {
  invoices: Invoice[];
  expenses: Expense[];
  clients: Client[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  invoices,
  expenses,
  clients
}) => {
  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b' | 'pnl' | 'client_ledger'>('gstr1');

  const validInvoices = invoices.filter(i => i.status !== 'cancelled');

  // Total Calculations
  const totalTaxable = validInvoices.reduce((sum, i) => sum + i.totalTaxableAmount, 0);
  const totalCgst = validInvoices.reduce((sum, i) => sum + i.totalCgst, 0);
  const totalSgst = validInvoices.reduce((sum, i) => sum + i.totalSgst, 0);
  const totalIgst = validInvoices.reduce((sum, i) => sum + i.totalIgst, 0);
  const totalOutputGst = totalCgst + totalSgst + totalIgst;
  const totalRevenue = validInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

  const totalExpenseTaxable = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalITC = expenses.reduce((sum, e) => sum + (e.itcEligible ? e.gstAmount : 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  const netGstPayable = Math.max(0, totalOutputGst - totalITC);
  const netProfit = totalRevenue - totalExpenses;

  // HSN Summary aggregation
  const hsnSummary: Record<string, { desc: string; qty: number; taxable: number; gst: number; total: number }> = {};
  validInvoices.forEach(inv => {
    inv.items.forEach(item => {
      const code = item.hsnSac || '9983';
      if (!hsnSummary[code]) {
        hsnSummary[code] = { desc: item.name, qty: 0, taxable: 0, gst: 0, total: 0 };
      }
      hsnSummary[code].qty += Number(item.quantity) || 1;
      hsnSummary[code].taxable += item.taxableAmount;
      hsnSummary[code].gst += item.totalGstAmount;
      hsnSummary[code].total += item.total;
    });
  });

  const exportGstr1Csv = () => {
    const headers = ['GSTIN/UIN of Recipient', 'Receiver Name', 'Invoice Number', 'Invoice date', 'Invoice Value', 'Place Of Supply', 'Reverse Charge', 'Invoice Type', 'Rate', 'Taxable Value', 'Cess Amount'];
    const rows = validInvoices.map(i => [
      i.client.gstin || 'URP',
      i.client.name,
      i.invoiceNumber,
      i.invoiceDate,
      i.grandTotal,
      `${i.placeOfSupplyCode}-${i.placeOfSupply}`,
      'N',
      'Regular',
      '18%',
      i.totalTaxableAmount,
      '0.00'
    ]);
    exportToCSV(`GSTR1_B2B_Report_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">GST Filing & Financial Reports</h1>
          <p className="text-xs text-slate-500">Generate official GSTR-1, GSTR-3B tax summaries and Profit & Loss audits</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerPrint}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={exportGstr1Csv}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export GSTR-1 CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'gstr1', label: 'GSTR-1 Summary (Outward Supplies)' },
          { id: 'gstr3b', label: 'GSTR-3B (Tax Liability & ITC Set-Off)' },
          { id: 'pnl', label: 'Profit & Loss Statement' },
          { id: 'client_ledger', label: 'Client Balances Ledger' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: GSTR-1 Summary */}
      {activeTab === 'gstr1' && (
        <div className="space-y-4">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Taxable Value</span>
              <p className="text-lg font-bold font-mono text-slate-900">{formatINR(totalTaxable)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Central Tax (CGST)</span>
              <p className="text-lg font-bold font-mono text-slate-900">{formatINR(totalCgst)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">State Tax (SGST)</span>
              <p className="text-lg font-bold font-mono text-slate-900">{formatINR(totalSgst)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Integrated Tax (IGST)</span>
              <p className="text-lg font-bold font-mono text-indigo-900">{formatINR(totalIgst)}</p>
            </div>
          </div>

          {/* B2B Invoices Section (Table 4A, 4B, 4C, 6B, 6C) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  4A, 4B, 6B, 6C - B2B Invoices
                </h3>
                <p className="text-[11px] text-slate-500">Taxable outward supplies made to registered persons</p>
              </div>
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {validInvoices.length} Invoices
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">GSTIN/UIN</th>
                    <th className="p-3">Receiver Name</th>
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Invoice Value</th>
                    <th className="p-3">POS (State)</th>
                    <th className="p-3 text-right">Taxable</th>
                    <th className="p-3 text-right">CGST</th>
                    <th className="p-3 text-right">SGST</th>
                    <th className="p-3 text-right">IGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-900">{inv.client.gstin || 'URP'}</td>
                      <td className="p-3 font-medium text-slate-900">{inv.client.name}</td>
                      <td className="p-3 font-mono">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-600">{inv.invoiceDate}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatINR(inv.grandTotal)}</td>
                      <td className="p-3 font-mono">{inv.placeOfSupplyCode}-{inv.placeOfSupply}</td>
                      <td className="p-3 text-right font-mono">{formatINR(inv.totalTaxableAmount)}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{formatINR(inv.totalCgst)}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{formatINR(inv.totalSgst)}</td>
                      <td className="p-3 text-right font-mono text-indigo-900 font-bold">{formatINR(inv.totalIgst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HSN Summary Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                12 - HSN/SAC Summary of Outward Supplies
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">HSN/SAC Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Total Qty</th>
                    <th className="p-3 text-right">Taxable Value</th>
                    <th className="p-3 text-right">GST Amount</th>
                    <th className="p-3 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(hsnSummary).map(([hsn, data]) => (
                    <tr key={hsn} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{hsn}</td>
                      <td className="p-3 text-slate-700">{data.desc}</td>
                      <td className="p-3 text-right font-mono">{data.qty}</td>
                      <td className="p-3 text-right font-mono font-medium">{formatINR(data.taxable)}</td>
                      <td className="p-3 text-right font-mono text-indigo-900 font-bold">{formatINR(data.gst)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{formatINR(data.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GSTR-3B Set-off Summary */}
      {activeTab === 'gstr3b' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-2xs text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">GSTR-3B Monthly Return Summary</h3>
            <p className="text-slate-500">3.1 Details of Outward Supplies and 4. Eligible ITC</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">1. Gross Output Tax Liability</span>
              <p className="text-2xl font-bold font-mono text-slate-900">{formatINR(totalOutputGst)}</p>
              <p className="text-slate-500 text-[11px]">Calculated from sales invoices</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">2. Input Tax Credit (ITC Available)</span>
              <p className="text-2xl font-bold font-mono text-emerald-700">{formatINR(totalITC)}</p>
              <p className="text-emerald-600 text-[11px]">From eligible expense bills</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
              <span className="text-[11px] font-bold text-indigo-900 uppercase">3. Net GST Cash Payable</span>
              <p className="text-2xl font-bold font-mono text-indigo-950">{formatINR(netGstPayable)}</p>
              <p className="text-indigo-700 text-[11px]">Liability after setting off ITC credit</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Profit & Loss Statement */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-2xs text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Profit & Loss Statement</h3>
            <p className="text-slate-500">Gross revenue vs operating expenses overview</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 font-bold">
              <span className="text-emerald-900 text-sm">Total Revenue (Invoiced Sales)</span>
              <span className="text-emerald-900 text-base font-mono">+{formatINR(totalRevenue)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-100 font-bold">
              <span className="text-rose-900 text-sm">Total Operating Expenses (Purchases & Overheads)</span>
              <span className="text-rose-900 text-base font-mono">-{formatINR(totalExpenses)}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-indigo-950 text-white rounded-xl font-bold text-base">
              <span>Net Profit (EBITDA)</span>
              <span className="font-mono text-xl">{formatINR(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Client Balances Ledger */}
      {activeTab === 'client_ledger' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">State</th>
                  <th className="p-3 text-right">Total Invoices</th>
                  <th className="p-3 text-right">Total Billed (₹)</th>
                  <th className="p-3 text-right">Total Paid (₹)</th>
                  <th className="p-3 text-right">Outstanding (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map(c => {
                  const cInvs = validInvoices.filter(i => i.clientId === c.id);
                  const billed = cInvs.reduce((s, i) => s + i.grandTotal, 0);
                  const paid = cInvs.reduce((s, i) => s + (i.amountPaid || 0), 0);
                  const bal = billed - paid;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 font-mono">{c.gstin || 'URP'}</td>
                      <td className="p-3">{c.state}</td>
                      <td className="p-3 text-right font-mono">{cInvs.length}</td>
                      <td className="p-3 text-right font-mono font-semibold">{formatINR(billed)}</td>
                      <td className="p-3 text-right font-mono text-emerald-700">{formatINR(paid)}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">{formatINR(bal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
