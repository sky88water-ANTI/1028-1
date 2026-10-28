import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Flame,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Order, Department, PriorityLevel } from '../types';

interface DashboardViewProps {
  orders: Order[];
  currentRoleKey: string;
  onSelectOrder: (order: Order) => void;
  onQuickIssue: (orderId: string) => void;
  onQuickSignReceipt: (orderId: string) => void;
  onOpenCreateOrder: () => void;
  onOpenCreateException: () => void;
  onOpenAIPredict: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  currentRoleKey,
  onSelectOrder,
  onQuickIssue,
  onQuickSignReceipt,
  onOpenCreateOrder,
  onOpenCreateException,
  onOpenAIPredict,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('全部');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPriority = priorityFilter === '全部' || order.priority === priorityFilter;

    return matchSearch && matchPriority;
  });

  // Calculate Metrics
  const totalOrders = orders.length;
  const inProduction = orders.filter((o) => o.status === '生產中').length;
  const delayedOrders = orders.filter((o) => o.status === '延誤警戒').length;
  const completedOrders = orders.filter((o) => o.status === '已完工' || o.status === '已出貨').length;
  const avgKitting =
    orders.length > 0
      ? Math.round(orders.reduce((acc, curr) => acc + curr.kittingRate, 0) / orders.length)
      : 100;
  const otdRate = totalOrders > 0 ? Math.round(((totalOrders - delayedOrders) / totalOrders) * 100) : 100;

  // Kanban Columns
  const columns = [
    {
      id: 'pending',
      title: '1. 待生管排程',
      sub: '業務接單待審核產能',
      color: 'border-slate-500/40 bg-slate-900/40',
      badge: 'bg-slate-700 text-slate-300',
      items: filteredOrders.filter((o) => o.status === '待排程'),
    },
    {
      id: 'scheduled_kitting',
      title: '2. 已排程 / 倉管備料',
      sub: '排定產線與採購備料中',
      color: 'border-blue-500/40 bg-blue-950/20',
      badge: 'bg-blue-600/30 text-blue-400',
      items: filteredOrders.filter((o) => o.status === '已排程' || o.status === '備料中'),
    },
    {
      id: 'production',
      title: '3. 產線生產中',
      sub: '物料就緒上線生產運轉',
      color: 'border-emerald-500/40 bg-emerald-950/20',
      badge: 'bg-emerald-600/30 text-emerald-400',
      items: filteredOrders.filter((o) => o.status === '生產中'),
    },
    {
      id: 'delayed',
      title: '4. 延誤警戒 (需跨部門協同)',
      sub: '缺料或機台異常警報',
      color: 'border-rose-500/50 bg-rose-950/20',
      badge: 'bg-rose-600/30 text-rose-400',
      items: filteredOrders.filter((o) => o.status === '延誤警戒'),
    },
    {
      id: 'completed',
      title: '5. 已完工 / 出貨',
      sub: '檢驗合格待放行出貨',
      color: 'border-purple-500/40 bg-purple-950/20',
      badge: 'bg-purple-600/30 text-purple-400',
      items: filteredOrders.filter((o) => o.status === '已完工' || o.status === '已出貨'),
    },
  ];

  // Helper for Department light color
  const getLightBg = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green':
        return 'bg-emerald-500';
      case 'yellow':
        return 'bg-amber-400 animate-pulse';
      case 'red':
        return 'bg-rose-500 animate-ping';
      default:
        return 'bg-slate-500';
    }
  };

  const getLightTitle = (dept: string, color: 'green' | 'yellow' | 'red') => {
    const map: Record<string, Record<string, string>> = {
      業務: { green: '業務：交期明確正常', yellow: '業務：客戶需微調交期', red: '業務：交期嚴重衝突' },
      生管: { green: '生管：產能排程正常', yellow: '生管：排程負載偏高', red: '生管：排程延誤卡死' },
      採購: { green: '採購：物料齊備在途', yellow: '採購：供應商待確認', red: '採購：原物料缺料延遲' },
      倉管: { green: '倉管：已發料至產線', yellow: '倉管：齊套檢核中', red: '倉管：缺料無法發料' },
      生產: { green: '生產：產線正常運作', yellow: '生產：工時微幅落後', red: '生產：停線等待料件' },
    };
    return map[dept]?.[color] || `${dept}: 狀態追蹤中`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>全廠在製訂單</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalOrders} <span className="text-xs text-slate-400 font-normal">筆</span></div>
          <p className="text-[11px] text-slate-400 mt-1">包含各部門進行中工單</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>產線生產運轉中</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{inProduction} <span className="text-xs text-slate-400 font-normal">批</span></div>
          <p className="text-[11px] text-slate-400 mt-1">SMT 與組裝測試線中</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>平均物料齊套率</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{avgKitting}%</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${avgKitting >= 90 ? 'bg-emerald-500' : avgKitting >= 75 ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${avgKitting}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>延誤警戒訂單</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{delayedOrders} <span className="text-xs text-slate-400 font-normal">筆</span></div>
          <p className="text-[11px] text-rose-300/80 mt-1">需採購/生管跨部門對策</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>本月訂單準交率 (OTD)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{otdRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">目標基準值: 95% 以上</p>
        </div>
      </div>

      {/* Control Bar & Filter */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋訂單編號、客戶名稱、產品品名或規格..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">急迫性：</span>
            {['全部', '特急插單', '急件', '一般'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-750 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* AI Prediction Fast Trigger Button */}
        <button
          onClick={onOpenAIPredict}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI 延誤預測 (F09)</span>
        </button>
      </div>

      {/* Role View Hint Banner */}
      {currentRoleKey !== '全部' && (
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-blue-600/40 px-2 py-0.5 rounded">
              當前視角：{currentRoleKey}
            </span>
            <span>
              {currentRoleKey === '倉管' && '💡 提示：點擊「發料」按鈕可將備齊料件撥交產線，齊套率將自動即時同步至全廠看板。'}
              {currentRoleKey === '生產主管' && '💡 提示：產線點收物料後，可點擊「簽收」完成現場權責閉環，確保工單準時開工。'}
              {currentRoleKey === '生管' && '💡 提示：檢視排程負荷與物料到貨落差，必要時異動開完工日並留存異動原因。'}
              {currentRoleKey === '業務' && '💡 提示：可即時追蹤客戶訂單的最新預計交期與五大部門綠黃紅狀態燈號。'}
              {currentRoleKey === '採購' && '💡 提示：關注物料缺料黃紅燈，確認供應商到貨日是否領先產線開工日。'}
            </span>
          </div>
        </div>
      )}

      {/* Cross-Department Kanban Board (F04) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`rounded-xl border ${col.color} p-3 flex flex-col min-h-[500px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200">{col.title}</h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                {col.items.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{col.sub}</p>

            {/* Orders Cards List */}
            <div className="space-y-3 flex-1">
              {col.items.length === 0 ? (
                <div className="h-32 border border-dashed border-slate-700/60 rounded-lg flex items-center justify-center text-xs text-slate-500">
                  暫無訂單
                </div>
              ) : (
                col.items.map((order) => {
                  const isLate = order.status === '延誤警戒';
                  const isUrgent = order.priority === '特急插單' || order.priority === '急件';

                  return (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className={`bg-slate-800/90 hover:bg-slate-750 border transition-all rounded-xl p-3.5 shadow-md cursor-pointer group relative ${
                        isLate
                          ? 'border-rose-500/60 hover:border-rose-400'
                          : isUrgent
                          ? 'border-amber-500/40 hover:border-amber-400'
                          : 'border-slate-700/80 hover:border-blue-500/60'
                      }`}
                    >
                      {/* Priority Tag & Order ID */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                          {order.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {order.priority === '特急插單' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                              特急插單
                            </span>
                          )}
                          {order.priority === '急件' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              急件
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {order.salesPerson}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Product */}
                      <div className="text-xs font-semibold text-slate-200 line-clamp-1 mb-0.5">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-slate-300 font-medium line-clamp-1 mb-2">
                        {order.productName}
                      </div>

                      {/* Quantity & Due Dates */}
                      <div className="bg-slate-900/60 rounded-lg p-2 text-[11px] space-y-1 mb-2 border border-slate-750">
                        <div className="flex justify-between text-slate-400">
                          <span>訂單數量：</span>
                          <span className="font-semibold text-slate-200">
                            {order.quantity.toLocaleString()} {order.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>客戶需求交期：</span>
                          <span className="font-medium text-slate-300">{order.customerDueDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>預計完工日：</span>
                          <span
                            className={`font-semibold ${
                              new Date(order.estimatedDueDate) > new Date(order.customerDueDate)
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {order.estimatedDueDate}
                          </span>
                        </div>
                      </div>

                      {/* Material Kitting Progress */}
                      <div className="mb-2.5">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">物料齊套率 (BOM)</span>
                          <span
                            className={`font-bold ${
                              order.kittingRate === 100
                                ? 'text-emerald-400'
                                : order.kittingRate >= 80
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {order.kittingRate}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              order.kittingRate === 100
                                ? 'bg-emerald-500'
                                : order.kittingRate >= 80
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${order.kittingRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Department Responsibility Lights (五大部門燈號) */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">部門燈號：</span>
                        <div className="flex items-center gap-1.5">
                          {(['業務', '生管', '採購', '倉管', '生產'] as const).map((dept) => {
                            const keyMap: Record<string, keyof typeof order.departmentStatus> = {
                              業務: 'sales',
                              生管: 'pmc',
                              採購: 'purchasing',
                              倉管: 'warehouse',
                              生產: 'production',
                            };
                            const statusColor = order.departmentStatus[keyMap[dept]];
                            return (
                              <div
                                key={dept}
                                className="flex items-center gap-0.5"
                                title={getLightTitle(dept, statusColor)}
                              >
                                <span className="text-slate-400 text-[10px]">{dept[0]}</span>
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    statusColor === 'green'
                                      ? 'bg-emerald-500'
                                      : statusColor === 'yellow'
                                      ? 'bg-amber-400 ring-2 ring-amber-400/30'
                                      : 'bg-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Contextual Action Button based on Role */}
                      {(currentRoleKey === '倉管' || currentRoleKey === '全部') &&
                        order.kittingRate < 100 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickIssue(order.id);
                              }}
                              className="w-full py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Package className="w-3 h-3" />
                              <span>倉管一鍵全數發料</span>
                            </button>
                          </div>
                        )}

                      {(currentRoleKey === '生產主管' || currentRoleKey === '全部') &&
                        order.status === '生產中' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickSignReceipt(order.id);
                              }}
                              className="w-full py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>產線主管點交簽收</span>
                            </button>
                          </div>
                        )}

                      {/* Click to inspect arrow */}
                      <div className="absolute right-2 top-2 text-slate-500 group-hover:text-blue-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
