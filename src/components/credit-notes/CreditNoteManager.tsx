import React, { useState } from 'react';
import { CreditNote, Invoice, Client, BusinessProfile } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { Plus, Search, FileText, CheckCircle, Trash2, X, AlertCircle } from 'lucide-react';

interface CreditNoteManagerProps {
  creditNotes: CreditNote[];
  invoices: Invoice[];
  clients: Client[];
  businessProfile: BusinessProfile | null;
  onRefresh: () => void;
}

export const CreditNoteManager: React.FC<CreditNoteManagerProps> = ({
  creditNotes,
  invoices,
  clients,
  businessProfile,
  onRefresh
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState(`CN-${Date.now().toString().slice(-4)}`);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [reason, setReason] = useState('Service adjustment / Discount revised');
  const [amount, setAmount] = useState<number>(1000);
  const [gstAmount, setGstAmount] = useState<number>(180);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) {
      alert('Please select an invoice to link this credit note to');
      return;
    }

    const payload: Partial<CreditNote> = {
      creditNoteNumber,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      client: inv.client,
      date: new Date().toISOString().split('T')[0],
      reason,
      taxableAmount: amount,
      gstAmount,
      totalAmount: amount + gstAmount,
      status: 'active'
    };

    try {
      await api.createCreditNote(payload);
      setIsCreating(false);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to create credit note');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Credit Notes / Debit Notes</h1>
          <p className="text-xs text-slate-500">Manage tax adjustments, sales returns, and revised rate credits</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Credit Note
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Credit Note No</th>
                <th className="p-3.5">Linked Invoice</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5 text-right">Taxable</th>
                <th className="p-3.5 text-right">GST</th>
                <th className="p-3.5 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creditNotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No credit notes issued.
                  </td>
                </tr>
              ) : (
                creditNotes.map((cn) => (
                  <tr key={cn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-indigo-950">{cn.creditNoteNumber}</td>
                    <td className="p-3.5 font-mono text-slate-700 font-semibold">{cn.invoiceNumber}</td>
                    <td className="p-3.5 font-medium text-slate-900">{cn.client.name}</td>
                    <td className="p-3.5 text-slate-600">{cn.date}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{cn.reason}</td>
                    <td className="p-3.5 text-right font-mono font-medium text-slate-700">{formatINR(cn.taxableAmount)}</td>
                    <td className="p-3.5 text-right font-mono text-slate-600">{formatINR(cn.gstAmount)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-rose-700">{formatINR(cn.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-indigo-950 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Issue Credit Note</h2>
                <p className="text-xs text-indigo-200">Linked to original GST invoice</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Note Number</label>
                <input
                  type="text"
                  required
                  value={creditNoteNumber}
                  onChange={(e) => setCreditNoteNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Original Invoice</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      #{inv.invoiceNumber} • {inv.client.name} ({formatINR(inv.grandTotal)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Credit</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxable Adjustment (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAmount(val);
                      setGstAmount(Math.round(val * 0.18));
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Adjustment (₹)</label>
                  <input
                    type="number"
                    required
                    value={gstAmount}
                    onChange={(e) => setGstAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-sm">Issue Credit Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
