import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../../types';
import { INDIAN_STATES, getStateByCode } from '../../utils/gstUtils';
import { api } from '../../utils/api';
import { UdmLogo } from '../common/UdmLogo';
import {
  Building2,
  CreditCard,
  QrCode,
  FileCheck,
  Save,
  CheckCircle,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface SettingsManagerProps {
  businessProfile: BusinessProfile | null;
  onRefresh: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  businessProfile,
  onRefresh
}) => {
  const [profile, setProfile] = useState<BusinessProfile>(
    businessProfile || {
      businessName: 'UDM Techno Solutions',
      legalName: 'UDM Techno Solutions Pvt. Ltd.',
      address: 'Shagun Tower, Office No.508, Plot No. 7 PU4, AB Rd, above Apna Sweets, Vijay Nagar, Scheme No 54',
      city: 'Indore',
      state: 'Madhya Pradesh',
      stateCode: '23',
      country: 'India',
      pinCode: '452010',
      gstin: '23AHWPH3168H2Z2',
      pan: 'AHWPH3168H',
      phone: '+91 99936 63668',
      email: 'Contact@udmtechno.com',
      website: 'https://Udmtechno.com',
      logoUrl: '/udm-logo.svg',
      bankName: 'Bank of Baroda',
      accountNumber: '05740100011588',
      accountHolderName: 'UDM Techno Solutions (Sankalp Nayak)',
      ifscCode: 'BARB0MEGHNA',
      branch: 'Indore',
      upiId: 'sankalpnayakk-2@oksbi',
      defaultTerms: 'Payment is due within 15 days of invoice date. Please transfer to Bank of Baroda A/C 05740100011588 (IFSC: BARB0MEGHNA).',
      defaultCustomerNotes: 'Thank you for choosing UDM Techno Solutions.',
      invoicePrefix: 'A',
      invoiceStartingNumber: 345,
      invoiceTemplate: 'classic',
      authorizedSignatoryName: 'Mahendra Singh',
    }
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'invoice_prefs'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setProfile(businessProfile);
    }
  }, [businessProfile]);

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleStateChange = (code: string) => {
    const s = getStateByCode(code);
    if (s) {
      setProfile(prev => ({ ...prev, stateCode: code, state: s.name }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateBusinessProfile(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings & Business Profile</h1>
          <p className="text-xs text-slate-500">
            Configure your GST registration, company letterhead, banking, and invoice templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Changes Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Company Profile & GSTIN
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'bank'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Bank & UPI Details
        </button>

        <button
          onClick={() => setActiveTab('invoice_prefs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'invoice_prefs'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Invoice Prefs & Templates
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Tab 1: Business Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Official GST Registered Entity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business / Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN (15 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={profile.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-indigo-950 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Permanent Account Number (PAN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={profile.pan}
                  onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Website</label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State & State Code</label>
                <select
                  value={profile.stateCode}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-medium"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={profile.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={profile.authorizedSignatoryName}
                  onChange={(e) => handleChange('authorizedSignatoryName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              {/* Logo Branding Display */}
              <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block font-semibold text-slate-800 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-900" />
                    Default Invoice Logo (UDM Techno Solutions)
                  </span>
                  <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active on Invoices & PDFs
                  </span>
                </label>
                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="p-2 bg-white rounded border border-slate-100 flex items-center justify-center min-w-[160px] h-14">
                    <UdmLogo className="h-10 w-auto" />
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-900">Official Vector Logo Active</p>
                    <p className="text-[11px] text-slate-500">Automatically stamped on all Classic, Modern, and Minimalist Tax Invoices and PDF downloads.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bank Details */}
        {activeTab === 'bank' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Bank Account & UPI QR Code Setup
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={profile.accountHolderName}
                  onChange={(e) => handleChange('accountHolderName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={profile.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={profile.ifscCode}
                  onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={profile.branch}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI ID / VPA</label>
                <input
                  type="text"
                  value={profile.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-indigo-950 font-semibold text-xs"
                />
              </div>
            </div>

            {/* Custom QR Code Image Upload / Preview */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                Custom UPI QR Code Image (Optional override)
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Upload a cropped image of your UPI QR code (e.g. from Google Pay, PhonePe, or BHIM). If not provided, an auto-generated dynamic QR code will be generated for <strong className="font-mono text-indigo-900">{profile.upiId || 'sankalpnayakk-2@oksbi'}</strong>.
              </p>
              <div className="flex items-center gap-4">
                {profile.upiQrImageUrl ? (
                  <div className="relative group w-20 h-20 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-xs">
                    <img src={profile.upiQrImageUrl} alt="UPI QR" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => handleChange('upiQrImageUrl', '')}
                      className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                    <QrCode className="w-6 h-6 mb-1" />
                    <span className="text-[9px]">Auto QR</span>
                  </div>
                )}

                <label className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-xs transition-colors flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  {profile.upiQrImageUrl ? 'Change QR Image' : 'Upload QR Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          handleChange('upiQrImageUrl', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Invoicing Preferences */}
        {activeTab === 'invoice_prefs' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Default Invoicing Preferences & Sequential Numbering
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Template</label>
                <select
                  value={profile.invoiceTemplate || 'classic'}
                  onChange={(e) => handleChange('invoiceTemplate', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold"
                >
                  <option value="classic">Classic Navy Corporate</option>
                  <option value="modern">Modern Minimal Indigo</option>
                  <option value="minimal">Minimalist Monochrome</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={profile.invoicePrefix || 'A'}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sequential Starting Counter</label>
                <input
                  type="number"
                  value={profile.invoiceStartingNumber || 345}
                  onChange={(e) => handleChange('invoiceStartingNumber', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Default Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={profile.defaultTerms}
                  onChange={(e) => handleChange('defaultTerms', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Default Customer Facing Notes</label>
                <input
                  type="text"
                  value={profile.defaultCustomerNotes}
                  onChange={(e) => handleChange('defaultCustomerNotes', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Settings...' : 'Save & Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
