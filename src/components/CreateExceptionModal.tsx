import React, { useState } from 'react';
import { AlertTriangle, Clock, User, ShieldAlert, Layers } from 'lucide-react';
import { ExceptionLog, Department, ExceptionType, ExceptionSeverity, Order } from '../types';

interface CreateExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ExceptionLog, 'id' | 'reportedAt' | 'status'>) => void;
  orders: Order[];
  currentRoleKey: string;
}

export const CreateExceptionModal: React.FC<CreateExceptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orders,
  currentRoleKey,
}) => {
  const [type, setType] = useState<ExceptionType>('缺料警報');
  const [severity, setSeverity] = useState<ExceptionSeverity>('高');
  const [orderId, setOrderId] = useState<string>(orders[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportedDept, setReportedDept] = useState<Department>(
    (currentRoleKey === '全部' ? '生管' : currentRoleKey) as Department
  );
  const [reportedBy, setReportedBy] = useState(
    currentRoleKey === '業務'
      ? '林怡君'
      : currentRoleKey === '採購'
      ? '黃雅琪'
      : currentRoleKey === '倉管'
      ? '張國榮'
      : currentRoleKey === '生產主管'
      ? '王宏偉'
      : '陳建銘'
  );
  const [assigneeDept, setAssigneeDept] = useState<Department>('採購');
  const [assigneeName, setAssigneeName] = useState('黃雅琪 (採購專員)');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ')
  );
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('請完整填寫異常主旨與詳細狀況說明。');
      return;
    }

    onSubmit({
      type,
      severity,
      orderId: orderId || undefined,
      title,
      description,
      reportedBy,
      reportedDept,
      assigneeDept,
      assigneeName,
      deadline,
    });

    onClose();
  };

  const handleDeptChange = (dept: Department) => {
    setAssigneeDept(dept);
    const defaultAssignees: Record<Department, string> = {
      業務: '林怡君 (業務代表)',
      生管: '陳建銘 (PMC主管)',
      採購: '黃雅琪 (採購專員)',
      倉管: '張國榮 (資深倉管)',
      生產主管: '王宏偉 (製造副理)',
    };
    setAssigneeName(defaultAssignees[dept]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl my-8 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>登記現場異常通報 (F05 異常通報管理)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer text-base">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">異常類型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExceptionType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="缺料警報">缺料警報 (物料交期延遲/斷鏈)</option>
                <option value="排程延誤">排程延誤 (產能不足/排擠插單)</option>
                <option value="設備停機">設備停機 (機台故障/檢修中斷)</option>
                <option value="品質異常">品質異常 (良率過低/抽檢不合格)</option>
                <option value="急單插單">急單插單 (客戶突發急單重排)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">嚴重等級</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as ExceptionSeverity)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="高">高 (直接停工/嚴重影響出貨交期)</option>
                <option value="中">中 (局部阻滯/可協調彈性應變)</option>
                <option value="低">低 (一般微幅瑕疵/無立即延誤)</option>
              </select>
            </div>
          </div>

          {/* Associated Order */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">關聯工單</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="">無關聯特定工單 (全廠共同異常)</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.customerName} ({o.productName})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              異常主旨 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="例如：主控晶片海外原廠停工，到廠日順延5天"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              狀況描述 <span className="text-rose-400">*</span>
            </label>
            <textarea
              placeholder="請詳細敘述發生背景、影響機台/料號及目前現場應急狀態..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Assignee Department and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">指派處理部門</label>
              <select
                value={assigneeDept}
                onChange={(e) => handleDeptChange(e.target.value as Department)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="採購">採購部 (原物料供料對策)</option>
                <option value="生管">生管部 (產能排程重配)</option>
                <option value="倉管">倉管部 (庫存調配/重驗)</option>
                <option value="生產主管">生產主管 (產線調度/機台維修)</option>
                <option value="業務">業務部 (客戶交期協商)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">負責處理人</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Deadline SLA */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              要求處置期限 (SLA) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="YYYY-MM-DD HH:MM (例如 2026-10-28 17:00)"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          {formError && (
            <div className="p-2.5 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer shadow-sm"
            >
              確認登記通報
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
