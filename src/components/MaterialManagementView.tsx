import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Layers,
  Search,
  Filter,
  Check,
  Send,
  Building,
} from 'lucide-react';
import { MaterialItem, Order, Department, IssuanceStatus, ReceiptStatus } from '../types';

interface MaterialManagementViewProps {
  materials: MaterialItem[];
  orders: Order[];
  onUpdateMaterial: (materialId: string, updates: Partial<MaterialItem>, reason?: string) => void;
  onIssueOrderMaterials: (orderId: string) => void;
  onSignReceipt: (orderId: string) => void;
  currentRoleKey: string;
}

export const MaterialManagementView: React.FC<MaterialManagementViewProps> = ({
  materials,
  orders,
  onUpdateMaterial,
  onIssueOrderMaterials,
  onSignReceipt,
  currentRoleKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('全部');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('全部');

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.associatedOrderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchOrder = selectedOrderId === '全部' || m.associatedOrderId === selectedOrderId;

    let matchType = true;
    if (filterType === '缺料警戒') {
      matchType = m.kittingStatus === '缺料警戒' || m.purchasingStatus === '延遲到貨';
    } else if (filterType === '待發料') {
      matchType = m.issuanceStatus !== '已全數發料';
    } else if (filterType === '待產線簽收') {
      matchType = m.receiptStatus === '未收料' && m.issuanceStatus === '已全數發料';
    }

    return matchSearch && matchOrder && matchType;
  });

  // Calculate high-level material metrics
  const totalItems = materials.length;
  const shortageItems = materials.filter(
    (m) => m.kittingStatus === '缺料警戒' || m.stockQty < m.requiredQty
  ).length;
  const readyItems = materials.filter((m) => m.kittingStatus === '已備齊').length;
  const issuedItems = materials.filter((m) => m.issuanceStatus === '已全數發料').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>F03｜物料狀態與齊套發料管理 (Material & Supply)</span>
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-700">
              共 {materials.length} 項工單物料
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            記錄物料需求、現有庫存、採購在途、倉管備料 (Kitting)、發料及產線收料簽收狀態 (採購、倉管、生管協同)。
          </p>
        </div>

        {/* High-level status counters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-750">
            <span className="text-slate-400">缺料風險：</span>
            <span className="font-bold text-rose-400 ml-1 font-mono">{shortageItems} 件</span>
          </div>
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-750">
            <span className="text-slate-400">已備齊：</span>
            <span className="font-bold text-emerald-400 ml-1 font-mono">{readyItems} 件</span>
          </div>
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-750">
            <span className="text-slate-400">已全發料：</span>
            <span className="font-bold text-purple-400 ml-1 font-mono">{issuedItems} 件</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋料號、品名、供應商或關聯訂單編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400">關聯工單：</span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="全部">全部工單</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.customerName} ({o.productCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-750 text-xs">
          <span className="text-slate-400 mr-1">狀態快篩：</span>
          {['全部', '缺料警戒', '待發料', '待產線簽收'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterType === f
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700">
                <th className="p-3.5 font-semibold">料號 / 品名</th>
                <th className="p-3.5 font-semibold">關聯工單</th>
                <th className="p-3.5 font-semibold text-right">需求量</th>
                <th className="p-3.5 font-semibold text-right">在庫量</th>
                <th className="p-3.5 font-semibold text-right">在途量</th>
                <th className="p-3.5 font-semibold">預計到貨日 / 供應商</th>
                <th className="p-3.5 font-semibold">採購到貨狀態</th>
                <th className="p-3.5 font-semibold">倉管備料狀態</th>
                <th className="p-3.5 font-semibold">倉管發料</th>
                <th className="p-3.5 font-semibold">產線收料簽收</th>
                <th className="p-3.5 font-semibold text-center">快捷操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750 text-slate-300">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    暫無符合條件的物料資料
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isStockShortage = mat.stockQty < mat.requiredQty;
                  const isLateArrival = mat.purchasingStatus === '延遲到貨';

                  return (
                    <tr
                      key={mat.id}
                      className="hover:bg-slate-750/70 transition-colors"
                    >
                      {/* Code and Name */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-200">{mat.code}</div>
                        <div className="text-slate-300 font-medium">{mat.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{mat.spec}</div>
                      </td>

                      {/* Associated Order */}
                      <td className="p-3.5 font-mono text-blue-400 font-semibold">
                        {mat.associatedOrderId}
                      </td>

                      {/* Required Qty */}
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-200">
                        {mat.requiredQty.toLocaleString()} <span className="text-slate-400 font-normal">{mat.unit}</span>
                      </td>

                      {/* Stock Qty */}
                      <td className="p-3.5 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            isStockShortage ? 'text-rose-400 font-bold' : 'text-emerald-400'
                          }`}
                        >
                          {mat.stockQty.toLocaleString()}
                        </span>
                        {isStockShortage && (
                          <div className="text-[10px] text-rose-400">缺 {mat.requiredQty - mat.stockQty}</div>
                        )}
                      </td>

                      {/* Incoming Qty */}
                      <td className="p-3.5 text-right font-mono text-slate-300">
                        {mat.incomingQty.toLocaleString()}
                      </td>

                      {/* Expected Arrival & Supplier */}
                      <td className="p-3.5">
                        <div
                          className={`font-mono text-xs ${
                            isLateArrival ? 'text-rose-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {mat.expectedArrivalDate}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{mat.supplier}</span>
                        </div>
                      </td>

                      {/* Purchasing Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            mat.purchasingStatus === '延遲到貨'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse'
                              : mat.purchasingStatus === '急催中'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          {mat.purchasingStatus}
                        </span>
                      </td>

                      {/* Kitting Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            mat.kittingStatus === '已備齊'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : mat.kittingStatus === '缺料警戒'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {mat.kittingStatus}
                        </span>
                      </td>

                      {/* Issuance Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            mat.issuanceStatus === '已全數發料'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {mat.issuanceStatus}
                        </span>
                      </td>

                      {/* Receipt Status */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {mat.receiptStatus === '產線已簽收' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                已簽收
                              </span>
                              {mat.receivedBy && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {mat.receivedBy}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">未收料</span>
                          )}
                        </div>
                      </td>

                      {/* Fast Action Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {mat.issuanceStatus !== '已全數發料' ? (
                            <button
                              onClick={() =>
                                onUpdateMaterial(
                                  mat.id,
                                  { issuanceStatus: '已全數發料', kittingStatus: '已備齊' },
                                  '倉管手動發料撥付'
                                )
                              }
                              className="px-2 py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-medium transition-colors cursor-pointer"
                              title="倉管撥發料件至產線"
                            >
                              發料
                            </button>
                          ) : mat.receiptStatus !== '產線已簽收' ? (
                            <button
                              onClick={() =>
                                onUpdateMaterial(
                                  mat.id,
                                  {
                                    receiptStatus: '產線已簽收',
                                    receivedBy: '製造主管現場簽收',
                                    receivedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                                  },
                                  '產線現場確認點交物料'
                                )
                              }
                              className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium transition-colors cursor-pointer"
                              title="生產主管點收確認"
                            >
                              簽收
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">已就緒</span>
                          )}
                        </div>
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
