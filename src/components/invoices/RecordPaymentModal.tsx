import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Invoice } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { X, CheckCircle, CreditCard, Banknote, QrCode, Building, Receipt } from 'lucide-react';

interface RecordPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Razorpay' | 'Cheque' | 'Other';
    transactionId?: string;
    notes?: string;
  }) => Promise<void>;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSubmit
}) => {
  const currentBalance = invoice ? (invoice.balanceDue ?? (invoice.grandTotal - (invoice.amountPaid || 0))) : 0;
  const [amount, setAmount] = useState<number>(currentBalance > 0 ? currentBalance : (invoice?.grandTotal || 0));
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'UPI' | 'Razorpay' | 'Cheque' | 'Other'>('Bank Transfer');
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        transactionId,
        notes
      });

      // Celebrate if paid in full
      if (amount >= currentBalance) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to record payment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const methods: Array<{ id: 'Cash' | 'Bank Transfer' | 'UPI' | 'Razorpay' | 'Cheque' | 'Other'; label: string; icon: any }> = [
    { id: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)', icon: Building },
    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'Razorpay', label: 'Razorpay', icon: CreditCard },
    { id: 'Cheque', label: 'Cheque', icon: Receipt },
    { id: 'Other', label: 'Other', icon: CreditCard }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Record Payment</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Invoice #{invoice.invoiceNumber} • {invoice.client.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Overview Balance Card */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Total Amount</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(invoice.grandTotal)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Already Paid</span>
              <span className="font-bold text-emerald-700 text-sm font-mono">{formatINR(invoice.amountPaid || 0)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Balance</span>
              <span className="font-bold text-rose-700 text-sm font-mono">{formatINR(currentBalance)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={invoice.grandTotal}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-hidden text-base font-mono"
              />
            </div>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setAmount(currentBalance)}
                className="text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
              >
                Pay Full Balance ({formatINR(currentBalance)})
              </button>
              {currentBalance > 1000 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(currentBalance / 2))}
                  className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                >
                  Pay 50%
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction / Ref ID</label>
              <input
                type="text"
                placeholder="e.g. UTR / UPI Ref / Cheque No"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Received via NEFT / Client confirmed transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : `Record Payment of ${formatINR(amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
