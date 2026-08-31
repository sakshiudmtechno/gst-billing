import React from 'react';
import { BusinessProfile } from '../../types';
import { Plus, Menu, Settings, LogOut, ShieldCheck, User } from 'lucide-react';
import { UdmLogo } from '../common/UdmLogo';

interface HeaderProps {
  businessProfile: BusinessProfile | null;
  currentUser?: { username?: string; name?: string; role?: string } | null;
  onQuickCreateInvoice: () => void;
  onOpenSettings: () => void;
  onOpenMobileMenu?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  businessProfile,
  currentUser,
  onQuickCreateInvoice,
  onOpenSettings,
  onOpenMobileMenu,
  onLogout
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand / Desktop Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="lg:hidden shrink-0">
            <UdmLogo variant="icon" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
              {businessProfile?.businessName || 'UDM Techno Solutions'}
            </h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              GST Invoicing & Business Operations Platform
            </p>
          </div>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
            FY 2026-27
          </span>
        </div>
      </div>

      {/* Action Buttons & Auth Info */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* User Info Badge */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser.name ? currentUser.name.charAt(0) : 'S'}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-slate-800">{currentUser.name || 'Sankalp'}</p>
              <p className="text-[10px] text-indigo-600 font-medium">@{currentUser.username || 'sankalp123'}</p>
            </div>
          </div>
        )}

        <button
          onClick={onQuickCreateInvoice}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Create Invoice</span>
          <span className="xs:hidden">Invoice</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
          title="Settings & Preferences"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs font-medium hidden md:inline">Settings</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
            title="Sign Out of Console"
          >
            <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-xs font-medium hidden lg:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
