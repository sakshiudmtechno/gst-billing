import React, { useState } from 'react';
import { Expense } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { exportToCSV } from '../../utils/pdfGenerator';
import { Plus, Search, FileSpreadsheet, Receipt, CheckCircle, Trash2, X, ShieldCheck } from 'lucide-react';

interface ExpenseManagerProps {
  expenses: Expense[];
  onRefresh: () => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software & Cloud');
  const [vendorName, setVendorName] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(5000);
  const [gstAmount, setGstAmount] = useState<number>(900);
  const [itcEligible, setItcEligible] = useState<boolean>(true);
  const [paymentMode, setPaymentMode] = useState<'Bank' | 'UPI' | 'Card' | 'Cash'>('Bank');

  const filteredExpenses = expenses.filter(e => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s ||
      (e.title || '').toLowerCase().includes(s) ||
      (e.vendorName || '').toLowerCase().includes(s);
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalITC = expenses.reduce((sum, e) => sum + (e.itcEligible ? e.gstAmount : 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Expense> = {
      title,
      category,
      vendorName,
      vendorGstin,
      date,
      amount,
      gstAmount,
      totalAmount: amount + gstAmount,
      paymentMode,
      itcEligible
    };

    try {
      await api.createExpense(payload);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to record expense');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Title', 'Category', 'Vendor', 'Vendor GSTIN', 'Date', 'Taxable Amount', 'GST Amount', 'Total Amount', 'ITC Eligible', 'Payment Mode'];
    const rows = filteredExpenses.map(e => [
      e.title,
      e.category,
      e.vendorName,
      e.vendorGstin || '',
      e.date,
      e.amount,
      e.gstAmount,
      e.totalAmount,
      e.itcEligible ? 'YES' : 'NO',
      e.paymentMode
    ]);
    exportToCSV(`Expenses_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expense & ITC Tracker</h1>
          <p className="text-xs text-slate-500">Track company operational expenses and claim GST Input Tax Credit</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Business Expenses</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{formatINR(totalExpense)}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Claimable Input Tax Credit (ITC)
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{formatINR(totalITC)}</p>
            <p className="text-[11px] text-slate-400">Can be set off against output GST liability</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="Software & Cloud">Software & Cloud</option>
              <option value="Office Rent">Office Rent</option>
              <option value="Utilities & Internet">Utilities & Internet</option>
              <option value="Hardware">Hardware</option>
              <option value="Travel & Meals">Travel & Meals</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Expense Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Vendor & GSTIN</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Taxable</th>
                <th className="p-3 text-right">GST (₹)</th>
                <th className="p-3 text-right">Total (₹)</th>
                <th className="p-3 text-center">ITC Eligible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                  <td className="p-3 text-slate-600">{exp.category}</td>
                  <td className="p-3 text-slate-800">
                    <p className="font-semibold">{exp.vendorName}</p>
                    <p className="text-[10px] font-mono text-slate-400">{exp.vendorGstin || 'Unregistered'}</p>
                  </td>
                  <td className="p-3 text-slate-600">{exp.date}</td>
                  <td className="p-3 text-right font-mono font-medium">{formatINR(exp.amount)}</td>
                  <td className="p-3 text-right font-mono text-slate-600">{formatINR(exp.gstAmount)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">{formatINR(exp.totalAmount)}</td>
                  <td className="p-3 text-center">
                    {exp.itcEligible ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ITC Yes
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-indigo-950 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Record Expense & ITC</h2>
                <p className="text-xs text-indigo-200">Record purchase with GST invoice details</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Infrastructure Billing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Software & Cloud">Software & Cloud</option>
                    <option value="Office Rent">Office Rent</option>
                    <option value="Utilities & Internet">Utilities & Internet</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Travel & Meals">Travel & Meals</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor GSTIN</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="15-digit GSTIN"
                    value={vendorGstin}
                    onChange={(e) => setVendorGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setAmount(v);
                      setGstAmount(Math.round(v * 0.18));
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={gstAmount}
                    onChange={(e) => setGstAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="itcCheck"
                  checked={itcEligible}
                  onChange={(e) => setItcEligible(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="itcCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Eligible for GST Input Tax Credit (ITC Claim)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-sm">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
