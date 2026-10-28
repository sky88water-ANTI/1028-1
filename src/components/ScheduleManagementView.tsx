import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Layers,
  Edit3,
  History,
  AlertTriangle,
  CheckCircle2,
  Filter,
  User,
  ArrowRight,
} from 'lucide-react';
import { ProductionSchedule, Order, Department } from '../types';

interface ScheduleManagementViewProps {
  schedules: ProductionSchedule[];
  orders: Order[];
  onUpdateSchedule: (
    scheduleId: string,
    updatedData: {
      lineName?: string;
      plannedStartDate: string;
      plannedEndDate: string;
      planner: string;
      progress?: number;
      reason: string;
    }
  ) => void;
  currentRoleKey: string;
}

export const ScheduleManagementView: React.FC<ScheduleManagementViewProps> = ({
  schedules,
  orders,
  onUpdateSchedule,
  currentRoleKey,
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState<ProductionSchedule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states for editing
  const [editLineName, setEditLineName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editPlanner, setEditPlanner] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editReason, setEditReason] = useState('');
  const [formError, setFormError] = useState('');

  const openEditModal = (sch: ProductionSchedule) => {
    setSelectedSchedule(sch);
    setEditLineName(sch.lineName);
    setEditStartDate(sch.plannedStartDate);
    setEditEndDate(sch.plannedEndDate);
    setEditPlanner(sch.planner);
    setEditProgress(sch.progress);
    setEditReason('');
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReason.trim()) {
      setFormError('排程異動原因為強制必填項目，以符合 F02 規格要求留存紀錄。');
      return;
    }
    if (new Date(editEndDate) < new Date(editStartDate)) {
      setFormError('預計完工日不能早於預計開工日。');
      return;
    }

    if (selectedSchedule) {
      onUpdateSchedule(selectedSchedule.id, {
        lineName: editLineName,
        plannedStartDate: editStartDate,
        plannedEndDate: editEndDate,
        planner: editPlanner,
        progress: editProgress,
        reason: editReason,
      });
      setIsEditModalOpen(false);
    }
  };

  // Helper to find related order
  const getOrder = (orderId: string) => orders.find((o) => o.id === orderId);

  // Lines available
  const productionLines = [
    'SMT-A產線 + 組裝測試2線',
    'SMT-B高速線',
    '精密驅動組裝1線',
    '生醫無塵組裝線',
    '軍工專用測試檢驗線',
    '待生管指派產線',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>F02｜生產排程管理 (Production Scheduling)</span>
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-700">
              共 {schedules.length} 條產線排程
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            建立及修改生產排程，記錄預計開工日、完工日及排程異動原因與完整修訂履歷 (生管與主管專責)。
          </p>
        </div>
      </div>

      {/* Schedule List & Timeline Cards */}
      <div className="space-y-4">
        {schedules.map((sch) => {
          const order = getOrder(sch.orderId);
          const isOverdue =
            order && new Date(sch.plannedEndDate) > new Date(order.customerDueDate);

          return (
            <div
              key={sch.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-750">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-blue-400">{sch.id}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-200 bg-slate-700/60 px-2 py-0.5 rounded">
                        {sch.lineName}
                      </span>
                      {order && (
                        <span className="text-xs text-slate-400">
                          關聯訂單：<span className="font-mono text-slate-200">{order.id}</span> ({order.customerName})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-1">
                      產品：{order?.productName || '未指定產品'} ({order?.quantity} {order?.unit})
                    </div>
                  </div>
                </div>

                {/* Dates & Edit button */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-750 text-xs flex items-center gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">預計開工日</span>
                      <span className="font-mono text-slate-200 font-semibold">{sch.plannedStartDate}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">預計完工日</span>
                      <span
                        className={`font-mono font-semibold ${
                          isOverdue ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {sch.plannedEndDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(sch)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-colors text-xs font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>異動排程 (F02)</span>
                  </button>
                </div>
              </div>

              {/* Progress and Reason */}
              <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>生產進度</span>
                    <span className="font-bold text-slate-200 font-mono">{sch.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sch.progress === 100
                          ? 'bg-purple-500'
                          : sch.progress > 50
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${sch.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>負責生管員：{sch.planner}</span>
                  </div>
                </div>

                {/* Latest Reason */}
                <div className="md:col-span-2 bg-slate-900/60 rounded-lg p-2.5 border border-slate-750">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      最新異動原因
                    </span>
                    <span className="text-slate-500">{sch.changeHistory[0]?.date || '初版建立'}</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    {sch.changeReason || '暫無異動原因說明'}
                  </p>

                  {/* History Toggle */}
                  {sch.changeHistory.length > 1 && (
                    <details className="mt-2 text-[11px] text-slate-400">
                      <summary className="cursor-pointer hover:text-blue-400 transition-colors font-medium">
                        查看歷史異動紀錄 ({sch.changeHistory.length} 次)
                      </summary>
                      <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-750">
                        {sch.changeHistory.map((h, i) => (
                          <div key={i} className="text-[11px] text-slate-300">
                            <span className="text-slate-500">{h.date}</span> | {h.operator} : {h.reason} ({h.newDates})
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Schedule Modal */}
      {isEditModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>異動生產排程與產線指派 (F02)</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-750 space-y-1">
                <div className="text-slate-400">排程編號：<span className="font-mono text-white font-bold">{selectedSchedule.id}</span></div>
                <div className="text-slate-400">關聯訂單：<span className="font-mono text-white">{selectedSchedule.orderId}</span></div>
              </div>

              {/* Line selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">指派製造產線</label>
                <select
                  value={editLineName}
                  onChange={(e) => setEditLineName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {productionLines.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">預計開工日</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">預計完工日</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Progress & Planner */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">負責生管員</label>
                  <input
                    type="text"
                    value={editPlanner}
                    onChange={(e) => setEditPlanner(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">目前進度 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>排程異動原因 <span className="text-rose-400">* (強制留存紀錄)</span></span>
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="例如：主晶片供貨延後4天順延排程、因應客戶急件插單調度產線..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  required
                />
              </div>

              {formError && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-sm"
                >
                  確認儲存異動
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
