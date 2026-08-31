import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, Client } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { downloadElementAsPdf, triggerPrint, printInvoiceElement, exportToCSV, getInvoicePdfFilename } from '../../utils/pdfGenerator';
import { RecordPaymentModal } from './RecordPaymentModal';
import { SendEmailModal } from './SendEmailModal';
import { InvoicePDFTemplate } from './InvoicePDFTemplate';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Download,
  Printer,
  Copy,
  CreditCard,
  Send,
  Ban,
  Trash2,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  clients: Client[];
  onCreateNew: () => void;
  onEdit: (invoice: Invoice) => void;
  onRefresh: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  clients,
  onCreateNew,
  onEdit,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modals state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [directDownloadInvoice, setDirectDownloadInvoice] = useState<Invoice | null>(null);

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        inv.invoiceNumber.toLowerCase().includes(search) ||
        inv.client.name.toLowerCase().includes(search) ||
        (inv.client.gstin && inv.client.gstin.toLowerCase().includes(search)) ||
        (inv.client.phone && inv.client.phone.includes(search));

      // Status
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;

      // Client
      const matchClient = clientFilter === 'all' || inv.clientId === clientFilter;

      // Date range filter
      let matchDate = true;
      const today = new Date();
      if (dateFilter === 'this_month') {
        const currentMonth = today.toISOString().slice(0, 7);
        matchDate = inv.invoiceDate.startsWith(currentMonth);
      } else if (dateFilter === 'last_30_days') {
        const past30 = new Date(Date.now() - 30 * 86400000);
        matchDate = new Date(inv.invoiceDate) >= past30;
      }

      return matchSearch && matchStatus && matchClient && matchDate;
    });
  }, [invoices, searchTerm, statusFilter, clientFilter, dateFilter]);

  // Actions
  const handleDuplicate = async (inv: Invoice) => {
    try {
      await api.duplicateInvoice(inv.id);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to duplicate invoice');
    }
  };

  const handleCancel = async (inv: Invoice) => {
    if (confirm(`Are you sure you want to cancel invoice #${inv.invoiceNumber}?`)) {
      try {
        await api.cancelInvoice(inv.id);
        onRefresh();
      } catch (e: any) {
        alert(e.message || 'Failed to cancel invoice');
      }
    }
  };

  const handleDelete = async (inv: Invoice) => {
    if (confirm(`Are you sure you want to permanently delete draft #${inv.invoiceNumber}?`)) {
      try {
        await api.deleteInvoice(inv.id);
        onRefresh();
      } catch (e: any) {
        alert(e.message || 'Failed to delete invoice');
      }
    }
  };

  const handleDownloadInvoice = async (inv: Invoice) => {
    setDownloadingId(inv.id);
    setDirectDownloadInvoice(inv);

    setTimeout(async () => {
      try {
        const el = document.getElementById(`direct-invoice-pdf-${inv.id}`) || document.getElementById(`modal-invoice-pdf-${inv.id}`);
        if (el) {
          const filename = getInvoicePdfFilename(inv);
          await downloadElementAsPdf(el, filename);
        } else {
          throw new Error('Invoice template element could not be found');
        }
      } catch (err: any) {
        console.error('Download failed:', err);
        alert('Failed to generate PDF: ' + (err?.message || 'Error occurred while rendering'));
      } finally {
        setDownloadingId(null);
        setDirectDownloadInvoice(null);
      }
    }, 200);
  };

  const handlePrintModalInvoice = () => {
    if (!viewingInvoice) return;
    const el = document.getElementById(`modal-invoice-pdf-${viewingInvoice.id}`);
    if (el) {
      printInvoiceElement(el, `Tax_Invoice_${viewingInvoice.invoiceNumber}`);
    } else {
      triggerPrint();
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice No',
      'Client Name',
      'GSTIN',
      'Invoice Date',
      'Due Date',
      'Subtotal',
      'Taxable Value',
      'CGST',
      'SGST',
      'IGST',
      'Total GST',
      'Grand Total',
      'Amount Paid',
      'Balance Due',
      'Status'
    ];

    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      inv.client.name,
      inv.client.gstin || '',
      inv.invoiceDate,
      inv.dueDate,
      inv.subtotal,
      inv.totalTaxableAmount,
      inv.totalCgst,
      inv.totalSgst,
      inv.totalIgst,
      inv.totalGst,
      inv.grandTotal,
      inv.amountPaid || 0,
      inv.balanceDue,
      inv.status
    ]);

    exportToCSV(`Invoices_Export_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Status Badge Component
  const renderStatusBadge = (status: InvoiceStatus) => {
    const config: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
      draft: { label: 'Draft', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
      sent: { label: 'Sent', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      partially_paid: { label: 'Partially Paid', bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800' },
      paid: { label: 'Paid', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800' },
      overdue: { label: 'Overdue', bg: 'bg-rose-50 border-rose-300', text: 'text-rose-700' },
      cancelled: { label: 'Cancelled', bg: 'bg-zinc-100 border-zinc-300', text: 'text-zinc-500' }
    };

    const s = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Hidden staging container for direct row download */}
      {directDownloadInvoice && (
        <div
          id={`direct-invoice-pdf-wrapper-${directDownloadInvoice.id}`}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '800px',
            zIndex: -9999,
            opacity: 1,
            pointerEvents: 'none',
            backgroundColor: '#ffffff'
          }}
        >
          <InvoicePDFTemplate
            id={`direct-invoice-pdf-${directDownloadInvoice.id}`}
            invoice={directDownloadInvoice}
          />
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">GST Invoices</h1>
          <p className="text-xs text-slate-500">
            Total {filteredInvoices.length} invoices found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice no, client, GSTIN, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden font-medium"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-600 outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-600 outline-hidden"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-600 outline-hidden"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Invoice No</th>
                <th className="p-3.5">Client & GSTIN</th>
                <th className="p-3.5">Date / Due</th>
                <th className="p-3.5 text-right">Taxable</th>
                <th className="p-3.5 text-right">GST</th>
                <th className="p-3.5 text-right">Total (₹)</th>
                <th className="p-3.5 text-right">Paid / Balance</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400">
                    No invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-indigo-950 text-xs">
                      {inv.invoiceNumber}
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{inv.client.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {inv.client.gstin || 'Unregistered'}
                      </p>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <p className="font-medium">{inv.invoiceDate}</p>
                      <p className="text-[11px] text-slate-400">Due: {inv.dueDate}</p>
                    </td>

                    <td className="p-3.5 text-right font-mono font-medium text-slate-700">
                      {formatINR(inv.totalTaxableAmount, false)}
                    </td>

                    <td className="p-3.5 text-right font-mono text-slate-600">
                      {formatINR(inv.totalGst, false)}
                      <span className="block text-[10px] text-slate-400">
                        {inv.isInterState ? 'IGST' : 'CGST+SGST'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-slate-950 text-sm">
                      {formatINR(inv.grandTotal)}
                    </td>

                    <td className="p-3.5 text-right font-mono">
                      <p className="font-semibold text-emerald-700">{formatINR(inv.amountPaid || 0, false)}</p>
                      <p className="text-[11px] text-rose-700 font-medium">Bal: {formatINR(inv.balanceDue, false)}</p>
                    </td>

                    <td className="p-3.5 text-center">
                      {renderStatusBadge(inv.status)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="View Invoice Modal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEdit(inv)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-download-invoice-${inv.id}`}
                          onClick={() => handleDownloadInvoice(inv)}
                          disabled={downloadingId === inv.id}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                          title="Download Tax Invoice PDF"
                          aria-label={`Download PDF for invoice ${inv.invoiceNumber}`}
                        >
                          {downloadingId === inv.id ? (
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setPaymentInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Record Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEmailInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Send Email"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(inv)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {inv.status === 'draft' ? (
                          <button
                            onClick={() => handleDelete(inv)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : inv.status !== 'cancelled' ? (
                          <button
                            onClick={() => handleCancel(inv)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Cancel Invoice"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Full View Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-3.5 text-white flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Tax Invoice Preview</h2>
                <p className="text-xs text-slate-400">Invoice #{viewingInvoice.invoiceNumber} • {viewingInvoice.client.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const el = document.getElementById(`modal-invoice-pdf-${viewingInvoice.id}`);
                    if (el) {
                      setDownloadingId(viewingInvoice.id);
                      try {
                        const filename = getInvoicePdfFilename(viewingInvoice);
                        await downloadElementAsPdf(el, filename);
                      } finally {
                        setDownloadingId(null);
                      }
                    }
                  }}
                  disabled={downloadingId === viewingInvoice.id}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {downloadingId === viewingInvoice.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handlePrintModalInvoice}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-100 max-h-[75vh] overflow-y-auto flex justify-center">
              <InvoicePDFTemplate
                id={`modal-invoice-pdf-${viewingInvoice.id}`}
                invoice={viewingInvoice}
              />
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSubmit={async (pData) => {
            await api.recordPayment(paymentInvoice.id, pData);
            onRefresh();
          }}
        />
      )}

      {/* Send Email Modal */}
      {emailInvoice && (
        <SendEmailModal
          invoice={emailInvoice}
          isOpen={!!emailInvoice}
          onClose={() => setEmailInvoice(null)}
          onSend={async (pData) => {
            await api.sendInvoiceEmail(emailInvoice.id, pData);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
