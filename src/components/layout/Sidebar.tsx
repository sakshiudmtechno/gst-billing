import React from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  FileCheck,
  CreditCard,
  Repeat,
  Receipt,
  BarChart3,
  Settings,
  History,
  X,
  LogOut,
  UserCheck
} from 'lucide-react';
import { UdmLogo } from '../common/UdmLogo';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  invoiceCount: number;
  clientCount: number;
  currentUser?: { username?: string; name?: string; role?: string } | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  invoiceCount,
  clientCount,
  currentUser,
  isOpenMobile = false,
  onCloseMobile,
  onLogout
}) => {
  const coreMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText, badge: invoiceCount },
    { id: 'quotes', label: 'Quotes & Estimates', icon: FileCheck },
    { id: 'clients', label: 'Clients CRM', icon: Users, badge: clientCount },
    { id: 'credit_notes', label: 'Credit Notes', icon: CreditCard },
    { id: 'recurring', label: 'Recurring AMC', icon: Repeat },
    { id: 'expenses', label: 'Expense Tracker', icon: Receipt },
  ];

  const analysisMenuItems = [
    { id: 'reports', label: 'GST Reports & P&L', icon: BarChart3 },
    { id: 'audit_logs', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderContent = () => (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800 h-full select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-700 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-lg p-1 flex items-center justify-center border border-white/15">
            <UdmLogo variant="icon" className="w-7 h-7" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-sm text-white block">UDM TECHNO</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">GST Solutions</span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Create Invoice CTA */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => handleItemClick('create_invoice')}
          className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
            activeTab === 'create_invoice'
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create GST Invoice</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto space-y-4">
        <div>
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operations & Billing
          </div>

          <div className="space-y-0.5 mt-0.5">
            {coreMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-750 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Compliance & System
          </div>

          <div className="space-y-0.5 mt-0.5">
            {analysisMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Info & Active User */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 text-xs space-y-2.5">
        {currentUser && (
          <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name ? currentUser.name.charAt(0) : 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate leading-tight">{currentUser.name || 'Sankalp Nayak'}</p>
                <p className="text-[9px] text-indigo-400 font-mono truncate">@{currentUser.username || 'sankalp123'}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Organization</div>
          <div className="font-semibold text-slate-200 mt-0.5 truncate">UDM Techno Solutions</div>
          <div className="text-[10px] text-indigo-300 mt-0.5 font-mono">GSTIN: 23AHWPH3168H2Z2</div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block">
        {renderContent()}
      </div>

      {/* Mobile Drawer Backdrop + Content */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#1e293b] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
