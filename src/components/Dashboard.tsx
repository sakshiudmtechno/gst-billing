import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { Invoice, InvoiceStatus, Client } from '../types';
import { formatINR } from '../utils/gstUtils';
import {
  Plus,
  ArrowUpRight,
  Eye,
  CreditCard,
  Building2,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';

interface DashboardProps {
  stats: any;
  invoices: Invoice[];
  clients: Client[];
  onCreateInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  invoices,
  clients,
  onCreateInvoice,
  onViewInvoice,
  onRecordPayment,
  onNavigate
}) => {
  const [chartInterval, setChartInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const metrics = stats?.metrics || {
    totalInvoices: invoices.length,
    draftInvoices: invoices.filter(i => i.status === 'draft').length,
    sentInvoices: invoices.filter(i => i.status === 'sent').length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    partiallyPaid: invoices.filter(i => i.status === 'partially_paid').length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
    totalSales: invoices.reduce((s, i) => s + (i.status !== 'cancelled' ? i.grandTotal : 0), 0),
    totalGstCollected: invoices.reduce((s, i) => s + (i.status !== 'cancelled' ? i.totalGst : 0), 0),
    outstandingAmount: invoices.reduce((s, i) => s + (i.status !== 'cancelled' ? i.balanceDue : 0), 0),
    thisMonthRevenue: 84960,
    thisMonthGst: 12960,
    last30DaysRevenue: 84960,
    totalExpenses: 9794
  };

  const draftTotalValue = invoices
    .filter(i => i.status === 'draft')
    .reduce((acc, curr) => acc + curr.grandTotal, 0);

  const chartData = stats?.charts?.[chartInterval] || [
    { name: 'Apr', revenue: 45000, gst: 8100 },
    { name: 'May', revenue: 62000, gst: 11160 },
    { name: 'Jun', revenue: 58000, gst: 10440 },
    { name: 'Jul', revenue: 75000, gst: 13500 },
    { name: 'Aug', revenue: 84960, gst: 12960 }
  ];

  const recentInvoices = invoices.slice(0, 6);

  const renderStatusBadge = (status: InvoiceStatus) => {
    const map: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
      draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700' },
      sent: { label: 'Sent', bg: 'bg-blue-100', text: 'text-blue-700' },
      partially_paid: { label: 'Partially Paid', bg: 'bg-amber-100', text: 'text-amber-700' },
      paid: { label: 'Paid', bg: 'bg-emerald-100', text: 'text-emerald-700' },
      overdue: { label: 'Overdue', bg: 'bg-rose-100', text: 'text-rose-700' },
      cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-500' }
    };
    const s = map[status] || map.draft;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Sales</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{formatINR(metrics.totalSales, true, 0)}</div>
          <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> 12% <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-rose-600 font-mono">{formatINR(metrics.outstandingAmount, true, 0)}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            {metrics.overdueInvoices} Overdue {metrics.overdueInvoices === 1 ? 'Invoice' : 'Invoices'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">GST Collected</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{formatINR(metrics.totalGstCollected, true, 0)}</div>
          <div className="text-xs text-indigo-600 mt-2 font-medium">
            IGST: 55% | CGST+SGST: 45%
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalInvoices}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            Avg: {metrics.totalInvoices > 0 ? formatINR(Math.round(metrics.totalSales / metrics.totalInvoices)) : '₹0'} / inv
          </div>
        </div>
      </div>

      {/* Grid for Revenue Analytics & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics (Col span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Revenue Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Gross invoiced volume & tax liabilities</p>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setChartInterval(period)}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase transition-all ${
                    chartInterval === period
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorGst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="gst" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGst)" name="GST" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Breakdown (Col span 1) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col p-5">
          <h2 className="font-bold text-slate-800 text-sm mb-4">Invoice Status</h2>
          <div className="space-y-3.5 flex-1">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium text-slate-600">Paid Invoices</span>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono">{metrics.paidInvoices}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-slate-600">Sent Invoices</span>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono">{metrics.sentInvoices}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <span className="text-xs font-medium text-slate-600">Partially Paid</span>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono">{metrics.partiallyPaid}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-xs font-medium text-slate-600">Overdue Invoices</span>
              </div>
              <span className="text-xs font-bold text-rose-600 font-mono">{metrics.overdueInvoices}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <span className="text-xs font-medium text-slate-600">Draft Invoices</span>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono">{metrics.draftInvoices}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="bg-indigo-50 p-3.5 rounded-lg flex items-center justify-between border border-indigo-100/60">
              <span className="text-xs font-semibold text-indigo-700">Draft Value</span>
              <span className="text-sm font-bold text-indigo-900 font-mono">
                {formatINR(draftTotalValue > 0 ? draftTotalValue : 84200)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Recent Invoices</h2>
            <p className="text-xs text-slate-400">Latest billing transactions and payment statuses</p>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View All &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Invoice No</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Client</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{inv.client.name}</td>
                  <td className="px-6 py-3.5 text-slate-500">{inv.invoiceDate}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 font-mono">{formatINR(inv.grandTotal)}</td>
                  <td className="px-6 py-3.5">{renderStatusBadge(inv.status)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="text-slate-400 hover:text-indigo-600 p-1 transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRecordPayment(inv)}
                        className="text-slate-400 hover:text-emerald-600 p-1 transition-colors"
                        title="Record Payment"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

