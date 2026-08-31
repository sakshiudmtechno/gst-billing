import React from 'react';
import { AuditLog } from '../../types';
import { Shield, Clock, FileText, CheckCircle, CreditCard, Send, Ban, RefreshCw } from 'lucide-react';

interface AuditLogsProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs, onRefresh }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INVOICE_CREATED':
      case 'INVOICE_UPDATED':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'PAYMENT_RECORDED':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'EMAIL_SENT':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'INVOICE_CANCELLED':
        return <Ban className="w-4 h-4 text-rose-600" />;
      default:
        return <Shield className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Trail & Activity Log</h1>
          <p className="text-xs text-slate-500">Immutable chronological history of all invoice creations, payments, and actions</p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Logs
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">No audit logs recorded yet.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start gap-3 text-xs transition-colors">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                    <span className="text-[11px] text-slate-500">• {log.performedBy}</span>
                  </div>
                  <p className="text-slate-700 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
