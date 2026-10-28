import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Order, OrderStatus, PriorityLevel, Department } from '../types';

interface OrderManagementViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onOpenCreateModal: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  currentRoleKey: string;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({
  orders,
  onSelectOrder,
  onOpenCreateModal,
  onUpdateStatus,
  currentRoleKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [priorityFilter, setPriorityFilter] = useState<string>('全部');

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.salesPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === '全部' || order.status === statusFilter;
    const matchPriority = priorityFilter === '全部' || order.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const exportCSV = () => {
    const headers = ['訂單編號', '客戶名稱', '產品料號', '產品品名', '數量', '單位', '需求交期', '預計完工日', '狀態', '優先度', '負責業務', '齊套率'];
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      o.productCode,
      `"${o.productName}"`,
      o.quantity,
      o.unit,
      o.customerDueDate,
      o.estimatedDueDate,
      o.status,
      o.priority,
      o.salesPerson,
      `${o.kittingRate}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `訂單管理清單_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case '待排程':
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
      case '已排程':
        return 'bg-blue-900/40 text-blue-300 border-blue-500/40';
      case '備料中':
        return 'bg-amber-900/40 text-amber-300 border-amber-500/40';
      case '生產中':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40';
      case '已完工':
        return 'bg-purple-900/40 text-purple-300 border-purple-500/40';
      case '已出貨':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case '延誤警戒':
        return 'bg-rose-900/50 text-rose-300 border-rose-500/50 animate-pulse';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const allStatuses: OrderStatus[] = ['待排程', '已排程', '備料中', '生產中', '已完工', '已出貨', '延誤警戒'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>F01｜訂單管理中心 (Order Management)</span>
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-700">
              共 {orders.length} 筆資料
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            記錄品項、數量、規格、客戶需求交期與跨部門狀態流轉，業務與生管同步對齊之起點。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>建立新訂單 (F01)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋訂單編號、客戶名稱、產品品名、料號或負責業務員..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>優先等級：</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="全部">全部優先度</option>
                <option value="特急插單">特急插單</option>
                <option value="急件">急件</option>
                <option value="一般">一般</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-750 text-xs">
          <span className="text-slate-400 mr-1">狀態篩選：</span>
          <button
            onClick={() => setStatusFilter('全部')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
              statusFilter === '全部'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            全部 ({orders.length})
          </button>
          {allStatuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700">
                <th className="p-3.5 font-semibold">訂單編號 / 優先度</th>
                <th className="p-3.5 font-semibold">客戶名稱</th>
                <th className="p-3.5 font-semibold">產品品名 / 料號</th>
                <th className="p-3.5 font-semibold text-right">數量</th>
                <th className="p-3.5 font-semibold">客戶需求交期</th>
                <th className="p-3.5 font-semibold">預計完工日</th>
                <th className="p-3.5 font-semibold">物料齊套率</th>
                <th className="p-3.5 font-semibold">訂單狀態</th>
                <th className="p-3.5 font-semibold">五部門燈號</th>
                <th className="p-3.5 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    無符合篩選條件的訂單資料
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isLate =
                    new Date(order.estimatedDueDate) > new Date(order.customerDueDate) ||
                    order.status === '延誤警戒';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-slate-750/70 transition-colors cursor-pointer group"
                    >
                      {/* ID and Priority */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-blue-400 group-hover:underline">
                          {order.id}
                        </div>
                        <div className="mt-1">
                          {order.priority === '特急插單' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500 text-white font-bold">
                              特急插單
                            </span>
                          ) : order.priority === '急件' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                              急件
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-400">
                              一般
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>業務：{order.salesPerson}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-medium text-slate-200 truncate">{order.productName}</div>
                        <div className="font-mono text-[11px] text-slate-400 truncate">{order.productCode}</div>
                      </td>

                      {/* Quantity */}
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-100">
                        {order.quantity.toLocaleString()} <span className="text-slate-400 font-normal">{order.unit}</span>
                      </td>

                      {/* Due Date */}
                      <td className="p-3.5 font-mono text-slate-300">{order.customerDueDate}</td>

                      {/* Estimated Due Date */}
                      <td className="p-3.5 font-mono">
                        <span
                          className={`font-semibold ${
                            isLate ? 'text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800' : 'text-emerald-400'
                          }`}
                        >
                          {order.estimatedDueDate}
                        </span>
                      </td>

                      {/* Kitting Rate */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold font-mono ${
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
                        <div className="w-20 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              order.kittingRate === 100
                                ? 'bg-emerald-500'
                                : order.kittingRate >= 80
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${order.kittingRate}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Department 5 Lights */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
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
                              <div key={dept} className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-500">{dept[0]}</span>
                                <span
                                  className={`w-2 h-2 rounded-full mt-0.5 ${
                                    statusColor === 'green'
                                      ? 'bg-emerald-500'
                                      : statusColor === 'yellow'
                                      ? 'bg-amber-400'
                                      : 'bg-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors cursor-pointer text-xs"
                        >
                          檢視詳情
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
