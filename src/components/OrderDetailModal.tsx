import React from 'react';
import {
  Layers,
  Calendar,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  ArrowRight,
  ShieldCheck,
  Send,
  Check,
  Building,
} from 'lucide-react';
import {
  Order,
  ProductionSchedule,
  MaterialItem,
  ExceptionLog,
  AuditRecord,
  OrderStatus,
  Department,
} from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  schedule?: ProductionSchedule;
  materials: MaterialItem[];
  exceptions: ExceptionLog[];
  auditLogs: AuditRecord[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onQuickIssue: (orderId: string) => void;
  onQuickSignReceipt: (orderId: string) => void;
  onOpenCreateExceptionForOrder: (orderId: string) => void;
  currentRoleKey: string;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  schedule,
  materials,
  exceptions,
  auditLogs,
  onUpdateStatus,
  onQuickIssue,
  onQuickSignReceipt,
  onOpenCreateExceptionForOrder,
  currentRoleKey,
}) => {
  if (!order) return null;

  const orderMaterials = materials.filter((m) => m.associatedOrderId === order.id);
  const orderExceptions = exceptions.filter((e) => e.orderId === order.id);
  const orderLogs = auditLogs.filter(
    (l) => l.targetId === order.id || l.targetId === schedule?.id
  );

  const isOverdue =
    new Date(order.estimatedDueDate) > new Date(order.customerDueDate) ||
    order.status === '延誤警戒';

  const allStatuses: OrderStatus[] = [
    '待排程',
    '已排程',
    '備料中',
    '生產中',
    '已完工',
    '已出貨',
    '延誤警戒',
  ];

  const getLightBg = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green':
        return 'bg-emerald-500';
      case 'yellow':
        return 'bg-amber-400';
      case 'red':
        return 'bg-rose-500 animate-pulse';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8 text-xs space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-blue-400">{order.id}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.priority === '特急插單'
                    ? 'bg-rose-500 text-white'
                    : order.priority === '急件'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {order.priority}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-200 font-semibold">{order.customerName}</span>
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              {order.productName} ({order.productCode})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer text-lg p-1 self-start sm:self-auto"
          >
            ✕
          </button>
        </div>

        {/* 5-Department Alignment Bar (五大部門協同狀態) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
          <div className="text-slate-300 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>跨部門協同確認狀態 (Department Collaboration Sync)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">綠=正常 · 黃=警戒 · 紅=阻滯</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {(
              [
                { dept: '業務', key: 'sales', desc: '客戶需求交期確認' },
                { dept: '生管', key: 'pmc', desc: '產能負荷與排程' },
                { dept: '採購', key: 'purchasing', desc: '原物料到貨追蹤' },
                { dept: '倉管', key: 'warehouse', desc: 'BOM齊套備料撥發' },
                { dept: '生產主管', key: 'production', desc: '產線點交簽收生產' },
              ] as const
            ).map((item) => {
              const statusColor = order.departmentStatus[item.key];
              return (
                <div
                  key={item.dept}
                  className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-750 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{item.dept}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${getLightBg(statusColor)}`} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Info & Due Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-750 space-y-1">
            <span className="text-slate-400 text-[11px]">訂購數量與單位</span>
            <div className="text-base font-bold font-mono text-white">
              {order.quantity.toLocaleString()} {order.unit}
            </div>
            <div className="text-[11px] text-slate-400">規格：{order.spec || '標準規格'}</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-750 space-y-1">
            <span className="text-slate-400 text-[11px]">客戶需求交期 (Customer Due Date)</span>
            <div className="text-base font-bold font-mono text-slate-200">
              {order.customerDueDate}
            </div>
            <div className="text-[11px] text-slate-400">接單日：{order.orderDate}</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-750 space-y-1">
            <span className="text-slate-400 text-[11px]">系統預計完工日 (Estimated Due Date)</span>
            <div
              className={`text-base font-bold font-mono ${
                isOverdue ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {order.estimatedDueDate}
            </div>
            <div className="text-[11px] text-slate-400">
              負責業務：{order.salesPerson}
            </div>
          </div>
        </div>

        {/* Status Transition Toolbar */}
        <div className="bg-slate-800/40 border border-slate-750 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-300 font-semibold">快速變更訂單狀態：</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {allStatuses.map((st) => (
              <button
                key={st}
                onClick={() => onUpdateStatus(order.id, st)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  order.status === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Section (F02) */}
        {schedule && (
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>生產排程進度 (F02)</span>
              </h3>
              <span className="font-mono text-slate-400">{schedule.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-400">指派產線：</span>
                <span className="text-slate-200 font-medium ml-1">{schedule.lineName}</span>
              </div>
              <div>
                <span className="text-slate-400">排程區間：</span>
                <span className="text-slate-200 font-mono ml-1">
                  {schedule.plannedStartDate} ~ {schedule.plannedEndDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400">負責生管：</span>
                <span className="text-slate-200 font-medium ml-1">{schedule.planner}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="pt-2">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>產線進度</span>
                <span className="font-mono font-bold text-white">{schedule.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${schedule.progress}%` }}
                />
              </div>
            </div>

            {schedule.changeReason && (
              <div className="mt-2 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-750">
                <strong className="text-slate-400">最新異動原因：</strong>
                {schedule.changeReason}
              </div>
            )}
          </div>
        )}

        {/* BOM Materials Section (F03) */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-750">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-slate-200">
                關聯物料齊套與發料清單 (BOM Readiness - F03)
              </h3>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                齊套率: {order.kittingRate}%
              </span>
            </div>

            {/* Actions for warehouse and supervisor */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuickIssue(order.id)}
                className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium cursor-pointer transition-colors flex items-center gap-1"
              >
                <Package className="w-3.5 h-3.5" />
                <span>倉管全數發料</span>
              </button>

              <button
                onClick={() => onQuickSignReceipt(order.id)}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>產線主管簽收</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-750">
                  <th className="p-2 font-semibold">料號 / 品名</th>
                  <th className="p-2 font-semibold text-right">需求量</th>
                  <th className="p-2 font-semibold text-right">在庫可用</th>
                  <th className="p-2 font-semibold">預計到貨日 / 供應商</th>
                  <th className="p-2 font-semibold">倉管備料狀態</th>
                  <th className="p-2 font-semibold">發料狀態</th>
                  <th className="p-2 font-semibold">產線收料簽收</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-750/70 text-slate-300">
                {orderMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-500">
                      尚未建立關聯 BOM 物料，或正由採購庫存初核中
                    </td>
                  </tr>
                ) : (
                  orderMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-750/40">
                      <td className="p-2">
                        <div className="font-mono font-bold text-slate-200">{mat.code}</div>
                        <div className="text-slate-300">{mat.name}</div>
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-200">
                        {mat.requiredQty.toLocaleString()} {mat.unit}
                      </td>
                      <td className="p-2 text-right font-mono">
                        <span
                          className={
                            mat.stockQty < mat.requiredQty
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400'
                          }
                        >
                          {mat.stockQty.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="font-mono text-slate-300">{mat.expectedArrivalDate}</div>
                        <div className="text-[10px] text-slate-400">{mat.supplier}</div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            mat.kittingStatus === '已備齊'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {mat.kittingStatus}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-[11px] text-slate-300">{mat.issuanceStatus}</span>
                      </td>
                      <td className="p-2">
                        <span className="text-[11px] text-slate-300">
                          {mat.receiptStatus === '產線已簽收' ? (
                            <span className="text-emerald-400 font-medium">✓ 已簽收</span>
                          ) : (
                            '未收料'
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exceptions & Alerts related to this Order */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-750">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>本工單異常通報紀錄 (F05)</span>
            </h3>
            <button
              onClick={() => onOpenCreateExceptionForOrder(order.id)}
              className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-medium"
            >
              + 登記工單異常
            </button>
          </div>

          {orderExceptions.length === 0 ? (
            <p className="text-slate-500 py-2">本工單目前無未處置之重大異常。</p>
          ) : (
            <div className="space-y-2 pt-1">
              {orderExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-2.5 rounded bg-slate-900 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-300">{ex.id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                        {ex.type} ({ex.severity}級)
                      </span>
                      <span className="font-semibold text-white">{ex.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      承辦：{ex.assigneeDept} {ex.assigneeName} | SLA期限: {ex.deadline}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
                    {ex.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log for this order */}
        {orderLogs.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-750 rounded-xl p-3">
            <h4 className="text-slate-400 font-semibold mb-2">作業異動日誌 (F07)</h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
              {orderLogs.map((log) => (
                <div key={log.id} className="text-[11px] text-slate-400 flex items-start gap-2">
                  <span className="font-mono text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className="text-slate-300 shrink-0">
                    {log.operator} ({log.department}):
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
