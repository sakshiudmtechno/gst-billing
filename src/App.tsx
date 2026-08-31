import React, { useState, useEffect } from 'react';
import {
  Invoice,
  Client,
  Quote,
  CreditNote,
  RecurringInvoice,
  Expense,
  AuditLog,
  BusinessProfile
} from './types';
import { api } from './utils/api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceEditor } from './components/invoices/InvoiceEditor';
import { ClientCRM } from './components/clients/ClientCRM';
import { QuoteManager } from './components/quotes/QuoteManager';
import { CreditNoteManager } from './components/credit-notes/CreditNoteManager';
import { RecurringManager } from './components/recurring/RecurringManager';
import { ExpenseManager } from './components/expenses/ExpenseManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { AuditLogs } from './components/audit/AuditLogs';
import { RecordPaymentModal } from './components/invoices/RecordPaymentModal';
import { InvoicePDFTemplate } from './components/invoices/InvoicePDFTemplate';
import { LoginScreen } from './components/auth/LoginScreen';
import { downloadElementAsPdf, triggerPrint, printInvoiceElement, getInvoicePdfFilename } from './utils/pdfGenerator';
import { Download, Printer, X, Loader2 } from 'lucide-react';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('udm_auth_user') || sessionStorage.getItem('udm_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Editing state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Quick modals
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const fetchAllData = async () => {
    try {
      const [
        invList,
        clientList,
        quoteList,
        cnList,
        recList,
        expList,
        profile,
        stats,
        logs
      ] = await Promise.all([
        api.getInvoices(),
        api.getClients(),
        api.getQuotes(),
        api.getCreditNotes(),
        api.getRecurringInvoices(),
        api.getExpenses(),
        api.getBusinessProfile(),
        api.getDashboardStats(),
        api.getAuditLogs()
      ]);

      setInvoices(invList);
      setClients(clientList);
      setQuotes(quoteList);
      setCreditNotes(cnList);
      setRecurringInvoices(recList);
      setExpenses(expList);
      setBusinessProfile(profile);
      setDashboardStats(stats);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('udm_auth_user');
    sessionStorage.removeItem('udm_auth_user');
    setCurrentUser(null);
  };

  const handleStartCreateInvoice = (client?: Client) => {
    setEditingInvoice(null);
    setActiveTab('create_invoice');
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setActiveTab('create_invoice');
  };

  const handleSaveInvoiceSuccess = (saved: Invoice) => {
    fetchAllData();
    setActiveTab('invoices');
  };

  // If user is not authenticated, gate access with LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Persistent Left Sidebar with Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'create_invoice') {
            setEditingInvoice(null);
          }
          setActiveTab(tab);
        }}
        invoiceCount={invoices.length}
        clientCount={clients.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header
          businessProfile={businessProfile}
          currentUser={currentUser}
          onQuickCreateInvoice={() => handleStartCreateInvoice()}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading GST Invoicing Console...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  stats={dashboardStats}
                  invoices={invoices}
                  clients={clients}
                  onCreateInvoice={() => handleStartCreateInvoice()}
                  onViewInvoice={(inv) => setViewingInvoice(inv)}
                  onRecordPayment={(inv) => setPaymentInvoice(inv)}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoiceList
                  invoices={invoices}
                  clients={clients}
                  onCreateNew={() => handleStartCreateInvoice()}
                  onEdit={handleEditInvoice}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'create_invoice' && (
                <InvoiceEditor
                  initialInvoice={editingInvoice}
                  onBack={() => setActiveTab('invoices')}
                  onSaveSuccess={handleSaveInvoiceSuccess}
                  onRecordPayment={(inv) => setPaymentInvoice(inv)}
                />
              )}

              {activeTab === 'clients' && (
                <ClientCRM
                  clients={clients}
                  invoices={invoices}
                  onCreateInvoiceForClient={(client) => handleStartCreateInvoice(client)}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'quotes' && (
                <QuoteManager
                  quotes={quotes}
                  clients={clients}
                  businessProfile={businessProfile}
                  onRefresh={fetchAllData}
                  onConvertToInvoice={(quote) => {
                    fetchAllData();
                    setActiveTab('invoices');
                  }}
                />
              )}

              {activeTab === 'credit_notes' && (
                <CreditNoteManager
                  creditNotes={creditNotes}
                  invoices={invoices}
                  clients={clients}
                  businessProfile={businessProfile}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'recurring' && (
                <RecurringManager
                  recurringInvoices={recurringInvoices}
                  clients={clients}
                  onRefresh={fetchAllData}
                  onInvoiceGenerated={() => {
                    fetchAllData();
                    setActiveTab('invoices');
                  }}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpenseManager
                  expenses={expenses}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsManager
                  invoices={invoices}
                  expenses={expenses}
                  clients={clients}
                />
              )}

              {activeTab === 'audit_logs' && (
                <AuditLogs
                  logs={auditLogs}
                  onRefresh={fetchAllData}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsManager
                  businessProfile={businessProfile}
                  onRefresh={fetchAllData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Invoice View Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-3.5 text-white flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Tax Invoice #{viewingInvoice.invoiceNumber}</h2>
                <p className="text-xs text-slate-400">{viewingInvoice.client.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const el = document.getElementById(`modal-global-pdf-${viewingInvoice.id}`);
                    if (el) {
                      setIsDownloadingPdf(true);
                      try {
                        await downloadElementAsPdf(el, getInvoicePdfFilename(viewingInvoice));
                      } catch (err) {
                        console.error('Download error:', err);
                        alert('Could not download PDF. You can also use Print.');
                      } finally {
                        setIsDownloadingPdf(false);
                      }
                    }
                  }}
                  disabled={isDownloadingPdf}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById(`modal-global-pdf-${viewingInvoice.id}`);
                    if (el) {
                      printInvoiceElement(el, getInvoicePdfFilename(viewingInvoice).replace('.pdf', ''));
                    } else {
                      triggerPrint();
                    }
                  }}
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
                id={`modal-global-pdf-${viewingInvoice.id}`}
                invoice={viewingInvoice}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          isOpen={!!paymentInvoice}
          onClose={async () => {
            setPaymentInvoice(null);
            await fetchAllData();
            // Refresh editing invoice if it's the same one
            if (editingInvoice?.id === paymentInvoice.id) {
              const updated = await api.getInvoice(editingInvoice.id);
              setEditingInvoice(updated);
            }
          }}
          onSubmit={async (pData) => {
            await api.recordPayment(paymentInvoice.id, pData);
            await fetchAllData();
            // Refresh editing invoice if it's the same one
            if (editingInvoice?.id === paymentInvoice.id) {
              const updated = await api.getInvoice(editingInvoice.id);
              setEditingInvoice(updated);
            }
            setPaymentInvoice(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
