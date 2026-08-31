import React, { useState } from 'react';
import { RecurringInvoice, Client } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { Plus, Repeat, Play, Pause, Trash2, Calendar, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface RecurringManagerProps {
  recurringInvoices: RecurringInvoice[];
  clients: Client[];
  onRefresh: () => void;
  onInvoiceGenerated: () => void;
}

export const RecurringManager: React.FC<RecurringManagerProps> = ({
  recurringInvoices,
  clients,
  onRefresh,
  onInvoiceGenerated
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('Monthly Cloud & Web Server Maintenance AMC');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [rate, setRate] = useState(15000);

  const handleGenerateNow = async (rec: RecurringInvoice) => {
    try {
      await api.triggerRecurringInvoice(rec.id);
      alert(`Invoice generated successfully from recurring subscription #${rec.id}!`);
      onRefresh();
      onInvoiceGenerated();
    } catch (e: any) {
      alert(e.message || 'Failed to generate invoice');
    }
  };

  const handleToggleStatus = async (rec: RecurringInvoice) => {
    try {
      const nextStatus = rec.status === 'active' ? 'paused' : 'active';
      await api.updateRecurringInvoice(rec.id, { status: nextStatus });
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle status');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cl = clients.find(c => c.id === selectedClientId);
    if (!cl) {
      alert('Please choose a client');
      return;
    }

    const payload: Partial<RecurringInvoice> = {
      title,
      clientId: cl.id,
      client: cl,
      frequency,
      startDate,
      nextInvoiceDate: startDate,
      status: 'active',
      invoiceTemplateData: {
        currency: 'INR',
        placeOfSupply: cl.state,
        placeOfSupplyCode: cl.stateCode,
        items: [
          {
            id: `rec_item_${Date.now()}`,
            name: title,
            description: 'Recurring monthly AMC support and maintenance',
            hsnSac: '9983',
            quantity: 1,
            unit: 'MONTH',
            rate,
            discountType: 'percentage',
            discountValue: 0,
            discountAmount: 0,
            taxableAmount: rate,
            gstRate: 18,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: Math.round(rate * 0.18),
            totalGstAmount: Math.round(rate * 0.18),
            total: Math.round(rate * 1.18)
          }
        ],
        subtotal: rate,
        totalTaxableAmount: rate,
        totalGst: Math.round(rate * 0.18),
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: Math.round(rate * 0.18),
        grandTotal: Math.round(rate * 1.18)
      }
    };

    try {
      await api.createRecurringInvoice(payload);
      setIsCreating(false);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to create recurring profile');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recurring Invoices & AMC</h1>
          <p className="text-xs text-slate-500">Automate recurring monthly, quarterly, or yearly retainer billing</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Setup Recurring Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringInvoices.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{rec.title}</h3>
                  <p className="text-[11px] text-slate-500">{rec.client.name}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                rec.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {rec.status}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Frequency:</span>
                <span className="font-bold text-slate-900 uppercase">{rec.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Scheduled:</span>
                <span className="font-bold font-mono text-indigo-900">{rec.nextInvoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Billed Each Cycle:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">{formatINR(rec.invoiceTemplateData.grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleStatus(rec)}
                className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
              >
                {rec.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {rec.status === 'active' ? 'Pause' : 'Resume'}
              </button>

              <button
                onClick={() => handleGenerateNow(rec)}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded font-bold text-xs flex items-center gap-1 transition-colors"
              >
                Generate Now <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-indigo-950 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">New Recurring Subscription</h2>
                <p className="text-xs text-indigo-200">Auto-recurring GST invoicing template</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subscription Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city}, {c.state})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cycle Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-sm">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
