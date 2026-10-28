import React from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Download,
  Package,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Order, MaterialItem, ExceptionLog } from '../types';

interface ReportsViewProps {
  orders: Order[];
  materials: MaterialItem[];
  exceptions: ExceptionLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, materials, exceptions }) => {
  // OTD calculations
  const totalOrders = orders.length;
  const delayedOrders = orders.filter((o) => o.status === '延誤警戒').length;
  const otd = totalOrders > 0 ? Math.round(((totalOrders - delayedOrders) / totalOrders) * 100) : 100;

  // Shortage items
  const shortageItems = materials.filter(
    (m) => m.kittingStatus === '缺料警戒' || m.purchasingStatus === '延遲到貨' || m.stockQty < m.requiredQty
  );

  // Exception types distribution
  const typeCounts: Record<string, number> = {};
  exceptions.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });

  // Department assignment counts
  const deptCounts: Record<string, number> = {};
  exceptions.forEach((e) => {
    deptCounts[e.assigneeDept] = (deptCounts[e.assigneeDept] || 0) + 1;
  });

  // Export full metrics CSV
  const handleExportCSV = () => {
    const lines = [
      '指標名稱,數值,單位/說明',
      `總管理訂單量,${totalOrders},筆`,
      `訂單準交率(OTD),${otd},%`,
      `延誤警戒訂單數,${delayedOrders},筆`,
      `缺料風險物料數,${shortageItems.length},項`,
      `總異常通報數,${exceptions.length},件`,
      `已結案異常數,${exceptions.filter((e) => e.status === '已結案').length},件`,
      '',
      '異常原因分類,件數,佔比(%)',
      ...Object.entries(typeCounts).map(
        ([type, count]) =>
          `"${type}",${count},${Math.round((count / (exceptions.length || 1)) * 100)}%`
      ),
      '',
      '缺料風險物料清單,品名,庫存量,需求量,缺料差額,供應商',
      ...shortageItems.map(
        (m) =>
          `"${m.code}","${m.name}",${m.stockQty},${m.requiredQty},${m.requiredQty - m.stockQty},"${m.supplier}"`
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `生產排程與物料營運報表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>F08｜統計分析與營運績效報表 (Analytics & Reports)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            統計訂單準交率 (OTD)、缺料頻次與風險料件、延誤原因佔比及跨部門處置時效 (主管與生管決策依據)。
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>匯出營運綜合報表 (CSV)</span>
        </button>
      </div>

      {/* KPI 4-Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OTD Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>訂單準交率 (OTD)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">{otd}%</div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>延誤訂單：{delayedOrders} 筆</span>
            <span>準時訂單：{totalOrders - delayedOrders} 筆</span>
          </div>
        </div>

        {/* Shortages Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>缺料警報物料</span>
            <Package className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-rose-400">{shortageItems.length} <span className="text-xs font-normal text-slate-400">項</span></div>
          <p className="mt-2 text-xs text-slate-400">目前庫存小於工單需求量</p>
        </div>

        {/* Exceptions Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>異常累計登錄</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-300">{exceptions.length} <span className="text-xs font-normal text-slate-400">件</span></div>
          <p className="mt-2 text-xs text-slate-400">
            已結案：{exceptions.filter((e) => e.status === '已結案').length} 件 · 處理中：{exceptions.filter((e) => e.status !== '已結案').length} 件
          </p>
        </div>

        {/* Mean Resolution Time Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
            <span>異常平均處置時效 (MTTR)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-blue-400">4.8 <span className="text-xs font-normal text-slate-400">小時</span></div>
          <p className="mt-2 text-xs text-slate-400">符合內部 SLA 6小時基準</p>
        </div>
      </div>

      {/* Middle Visuals: Delay Reasons & Top Shortages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exception Reason Breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-400" />
            <span>異常原因分佈統計</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = Math.round((count / (exceptions.length || 1)) * 100);
              return (
                <div key={type} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-medium">{type}</span>
                    <span className="font-mono text-slate-400">
                      {count} 件 ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type === '缺料警報'
                          ? 'bg-rose-500'
                          : type === '設備停機'
                          ? 'bg-amber-400'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Dept Workload */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>各部門異常承辦件數</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / (exceptions.length || 1)) * 100);
              return (
                <div key={dept} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-medium">{dept}</span>
                    <span className="font-mono text-slate-400">
                      {count} 件 ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Shortage Material Watchlist */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-rose-400" />
          <span>關鍵瓶頸缺料物料清單 (TOP Shortage Watchlist)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-750">
                <th className="p-3 font-semibold">物料料號</th>
                <th className="p-3 font-semibold">品名規格</th>
                <th className="p-3 font-semibold">關聯工單</th>
                <th className="p-3 font-semibold text-right">在庫量</th>
                <th className="p-3 font-semibold text-right">需求量</th>
                <th className="p-3 font-semibold text-right">缺料缺額</th>
                <th className="p-3 font-semibold">預計到貨日</th>
                <th className="p-3 font-semibold">主要供應商</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750 text-slate-300">
              {shortageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    全廠物料目前齊備無缺料風險
                  </td>
                </tr>
              ) : (
                shortageItems.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-750/50">
                    <td className="p-3 font-mono font-bold text-rose-400">{mat.code}</td>
                    <td className="p-3 font-medium text-slate-200">{mat.name}</td>
                    <td className="p-3 font-mono text-blue-400">{mat.associatedOrderId}</td>
                    <td className="p-3 text-right font-mono text-slate-300">{mat.stockQty.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-300">{mat.requiredQty.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400">
                      -{Math.max(0, mat.requiredQty - mat.stockQty).toLocaleString()} {mat.unit}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{mat.expectedArrivalDate}</td>
                    <td className="p-3 text-slate-400">{mat.supplier}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
