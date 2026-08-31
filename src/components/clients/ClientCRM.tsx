import React, { useState } from 'react';
import { Client, Invoice } from '../../types';
import { formatINR } from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { ClientModal } from './ClientModal';
import { exportToCSV } from '../../utils/pdfGenerator';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  CreditCard,
  AlertCircle,
  X
} from 'lucide-react';

interface ClientCRMProps {
  clients: Client[];
  invoices: Invoice[];
  onCreateInvoiceForClient: (client: Client) => void;
  onRefresh: () => void;
}

export const ClientCRM: React.FC<ClientCRMProps> = ({
  clients,
  invoices,
  onCreateInvoiceForClient,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Filter clients
  const filteredClients = clients.filter(c => {
    const s = searchTerm.toLowerCase().trim();
    const matchSearch =
      !s ||
      c.name.toLowerCase().includes(s) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(s)) ||
      (c.gstin && c.gstin.toLowerCase().includes(s)) ||
      (c.phone && c.phone.includes(s)) ||
      (c.city && c.city.toLowerCase().includes(s));

    const matchState = stateFilter === 'all' || c.stateCode === stateFilter;
    return matchSearch && matchState;
  });

  // Calculate client financial metrics
  const getClientMetrics = (clientId: string) => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId && inv.status !== 'cancelled');
    const totalInvoices = clientInvoices.length;
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalPaid = clientInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const outstanding = totalBilled - totalPaid;
    const lastInvoice = [...clientInvoices].sort(
      (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    )[0];

    return {
      totalInvoices,
      totalBilled,
      totalPaid,
      outstanding,
      lastInvoice,
      invoices: clientInvoices
    };
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (editingClient) {
      await api.updateClient(editingClient.id, clientData);
    } else {
      await api.createClient(clientData);
    }
    onRefresh();
  };

  const handleDeleteClient = async (client: Client) => {
    if (confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      try {
        await api.deleteClient(client.id);
        if (selectedClientDetail?.id === client.id) {
          setSelectedClientDetail(null);
        }
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete client');
      }
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Client Name',
      'Contact Person',
      'Email',
      'Phone',
      'GSTIN',
      'PAN',
      'State',
      'State Code',
      'City',
      'Billing Address',
      'PIN Code',
      'Customer Type',
      'Total Invoices',
      'Total Billed',
      'Total Paid',
      'Outstanding'
    ];

    const rows = filteredClients.map(c => {
      const stats = getClientMetrics(c.id);
      return [
        c.name,
        c.contactPerson || '',
        c.email || '',
        c.phone || '',
        c.gstin || '',
        c.pan || '',
        c.state,
        c.stateCode,
        c.city,
        c.billingAddress,
        c.pinCode,
        c.customerType,
        stats.totalInvoices,
        stats.totalBilled,
        stats.totalPaid,
        stats.outstanding
      ];
    });

    exportToCSV(`Clients_Master_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Unique states for filter
  const uniqueStates = Array.from(new Set(clients.map(c => JSON.stringify({ code: c.stateCode, name: c.state })))).map(
    s => JSON.parse(s as string) as { code: string; name: string }
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clients CRM</h1>
          <p className="text-xs text-slate-500">
            Manage your B2B / B2C customer master and track outstanding balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Clients CSV
          </button>

          <button
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Search & State Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, contact, GSTIN, city or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden font-medium"
          />
        </div>

        <div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-600 outline-hidden"
          >
            <option value="all">All States & Territories</option>
            {uniqueStates.map(s => (
              <option key={s.code} value={s.code}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Client Cards + Client Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`space-y-3 ${selectedClientDetail ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map(client => {
              const stats = getClientMetrics(client.id);
              const isSelected = selectedClientDetail?.id === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientDetail(client)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900 font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                          {client.clientNumber && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                              {client.clientNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{client.city}, {client.state}</p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {client.customerType || 'B2B'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                    <p className="text-slate-700 font-mono">
                      GSTIN: <span className="font-bold text-indigo-950">{client.gstin || 'Unregistered'}</span>
                    </p>
                    {client.contactPerson && (
                      <p className="text-slate-600">Contact: {client.contactPerson} ({client.phone})</p>
                    )}
                  </div>

                  {/* Financial Mini KPI */}
                  <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Invoices</span>
                      <span className="font-bold text-slate-800">{stats.totalInvoices}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Total Billed</span>
                      <span className="font-bold font-mono text-slate-900">{formatINR(stats.totalBilled, true, 0)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Outstanding</span>
                      <span className={`font-bold font-mono ${stats.outstanding > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatINR(stats.outstanding, true, 0)}
                      </span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateInvoiceForClient(client);
                      }}
                      className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Invoice
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingClient(client);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="Edit Client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Client Detail Card Drawer */}
        {selectedClientDetail && (
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Client Profile</span>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-900">{selectedClientDetail.name}</h2>
                  {selectedClientDetail.clientNumber && (
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-indigo-100">
                      {selectedClientDetail.clientNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {selectedClientDetail.city}, {selectedClientDetail.state} (State Code: {selectedClientDetail.stateCode})
                </p>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Overview */}
            {(() => {
              const stats = getClientMetrics(selectedClientDetail.id);
              return (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Total Billed</span>
                      <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(stats.totalBilled)}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-emerald-700 block text-[11px]">Total Paid</span>
                      <span className="font-bold text-emerald-800 text-sm font-mono">{formatINR(stats.totalPaid)}</span>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                      <span className="text-rose-700 block text-[11px]">Outstanding Amount</span>
                      <span className="font-bold text-rose-800 text-sm font-mono">{formatINR(stats.outstanding)}</span>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <span className="text-indigo-700 block text-[11px]">Total Invoices</span>
                      <span className="font-bold text-indigo-900 text-sm">{stats.totalInvoices} Invoices</span>
                    </div>
                  </div>

                  {/* Client Details Info */}
                  <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800 text-xs">Billing & Contact Information</p>
                    <p className="text-slate-600"><strong className="text-slate-800">Address:</strong> {selectedClientDetail.billingAddress}, {selectedClientDetail.city}, {selectedClientDetail.state} - {selectedClientDetail.pinCode}</p>
                    <p className="text-slate-600 font-mono"><strong className="text-slate-800 font-sans">GSTIN:</strong> {selectedClientDetail.gstin || 'Unregistered'}</p>
                    <p className="text-slate-600 font-mono"><strong className="text-slate-800 font-sans">PAN:</strong> {selectedClientDetail.pan || 'N/A'}</p>
                    {selectedClientDetail.contactPerson && (
                      <p className="text-slate-600"><strong className="text-slate-800">Contact:</strong> {selectedClientDetail.contactPerson} ({selectedClientDetail.phone})</p>
                    )}
                    {selectedClientDetail.email && (
                      <p className="text-slate-600"><strong className="text-slate-800">Email:</strong> {selectedClientDetail.email}</p>
                    )}
                  </div>

                  {/* Invoice History */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-900 text-xs">Invoice History</p>
                      <button
                        onClick={() => onCreateInvoiceForClient(selectedClientDetail)}
                        className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Invoice
                      </button>
                    </div>

                    {stats.invoices.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-4">No invoices created for this client yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {stats.invoices.map(inv => (
                          <div key={inv.id} className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                            <div>
                              <span className="font-bold font-mono text-slate-900">{inv.invoiceNumber}</span>
                              <span className="text-slate-400 text-[10px] block">{inv.invoiceDate}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold font-mono text-slate-900">{formatINR(inv.grandTotal)}</span>
                              <span className="text-[10px] font-bold block uppercase text-slate-500">{inv.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />
    </div>
  );
};
