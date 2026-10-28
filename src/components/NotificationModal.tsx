import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  X,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';
import { SystemAlert, Department } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onSelectOrderById?: (orderId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectOrderById,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'critical'>('all');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'unread') return !a.isRead;
    if (filterType === 'critical') return a.level === 'critical';
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 shadow-2xl my-8 text-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>通知與預警提醒中心 (F06)</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {unreadCount} 未讀
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                物料延遲、訂單逾期紅燈及異常處置 SLA 監控通報
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer text-lg p-1">
            ✕
          </button>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              全部 ({alerts.length})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterType === 'unread'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              未讀 ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterType === 'critical'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              重大警報
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>全部標記已讀</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              目前無符合條件的通知提醒
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  if (!alert.isRead) onMarkAsRead(alert.id);
                  if (alert.orderId && onSelectOrderById) {
                    onSelectOrderById(alert.orderId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  !alert.isRead
                    ? alert.level === 'critical'
                      ? 'bg-rose-950/20 border-rose-500/60 shadow-sm'
                      : 'bg-slate-800/90 border-blue-500/50 shadow-sm'
                    : 'bg-slate-800/40 border-slate-750 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.level === 'critical'
                          ? 'bg-rose-500/20 text-rose-400'
                          : alert.level === 'warning'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-xs ${
                            !alert.isRead ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {alert.title}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="font-mono">{alert.timestamp}</span>
                        {alert.targetDepts?.length > 0 && (
                          <span>
                            通知部門：{alert.targetDepts.join(', ')}
                          </span>
                        )}
                        {alert.orderId && (
                          <span className="text-blue-400 underline font-mono">
                            查看工單 {alert.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!alert.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(alert.id);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-700/60 cursor-pointer shrink-0"
                    >
                      已讀
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
