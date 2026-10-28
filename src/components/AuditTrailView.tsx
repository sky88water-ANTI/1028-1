import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle,
  FileText,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AuditRecord, Department } from '../types';

interface AuditTrailViewProps {
  auditLogs: AuditRecord[];
  currentRoleKey: string;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs, currentRoleKey }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('全部');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = deptFilter === '全部' || log.department === deptFilter;

    return matchSearch && matchDept;
  });

  // RACI Matrix definition for manufacturing collaboration
  const raciData = [
    {
      process: '訂單建立與客戶需求交期 (F01)',
      sales: 'R (負責落實)',
      pmc: 'A (排程審核)',
      purchasing: 'I (知會備料)',
      warehouse: 'I (知會庫存)',
      production: 'I (知會產能)',
    },
    {
      process: '主生產排程與產線指派 (F02)',
      sales: 'C (確認交期)',
      pmc: 'R/A (主責排程)',
      purchasing: 'C (回報到貨)',
      warehouse: 'C (回報庫存)',
      production: 'C (現場調度)',
    },
    {
      process: '物料採購追蹤與供應商催料 (F03)',
      sales: 'I (知會進度)',
      pmc: 'C (調整排程)',
      purchasing: 'R/A (主責採購)',
      warehouse: 'C (收貨點收)',
      production: 'I (知會開工)',
    },
    {
      process: '倉管物料齊套備料 (Kitting) (F03)',
      sales: 'I (知會)',
      pmc: 'I (掌握率)',
      purchasing: 'C (補料支援)',
      warehouse: 'R/A (主責齊套)',
      production: 'C (準備領料)',
    },
    {
      process: '物料發料至產線 (F03)',
      sales: 'I (知會)',
      pmc: 'I (追蹤進度)',
      purchasing: 'I (知會)',
      warehouse: 'R (執行撥發)',
      production: 'A (點收放行)',
    },
    {
      process: '產線現場收料簽核 (F03)',
      sales: 'I (知會)',
      pmc: 'I (確認開工)',
      purchasing: 'I (知會)',
      warehouse: 'C (交接確認)',
      production: 'R/A (主責簽收)',
    },
    {
      process: '缺料與設備異常通報及 SLA 結案 (F05)',
      sales: 'I (協調客戶)',
      pmc: 'C (協同重排)',
      purchasing: 'R (採購對策)',
      warehouse: 'R (倉管對策)',
      production: 'R/A (現場對策)',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span>F07｜權責與紀錄管理 (Audit Trail & RACI Governance)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          完整記錄各項作業的負責人、狀態變更、確認時間及處置結果，落實跨部門權責透明化與追溯防呆機制。
        </p>
      </div>

      {/* RACI Matrix Section */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span>跨部門權責劃分矩陣 (RACI Matrix)</span>
            <span className="text-[11px] font-normal text-slate-400">
              R=負責(Responsible) · A=當責(Accountable) · C=諮詢(Consulted) · I=知會(Informed)
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-750">
                <th className="p-2.5 font-semibold">協同關鍵流程</th>
                <th className="p-2.5 font-semibold text-blue-400">業務 (Sales)</th>
                <th className="p-2.5 font-semibold text-emerald-400">生管 (PMC)</th>
                <th className="p-2.5 font-semibold text-amber-400">採購 (Purchasing)</th>
                <th className="p-2.5 font-semibold text-purple-400">倉管 (Warehouse)</th>
                <th className="p-2.5 font-semibold text-rose-400">生產主管 (Production)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750/70 text-slate-300">
              {raciData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-750/40 transition-colors">
                  <td className="p-2.5 font-medium text-slate-200">{row.process}</td>
                  <td className="p-2.5 font-mono">{row.sales}</td>
                  <td className="p-2.5 font-mono">{row.pmc}</td>
                  <td className="p-2.5 font-mono">{row.purchasing}</td>
                  <td className="p-2.5 font-mono">{row.warehouse}</td>
                  <td className="p-2.5 font-mono">{row.production}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>全廠作業稽核歷程日誌 (Audit Log)</span>
            <span className="text-xs font-normal text-slate-400">
              共 {auditLogs.length} 筆不可竄改紀錄
            </span>
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋操作人、動作、目標代碼..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="全部">全部部門</option>
              <option value="業務">業務</option>
              <option value="生管">生管</option>
              <option value="採購">採購</option>
              <option value="倉管">倉管</option>
              <option value="生產主管">生產主管</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-750">
                <th className="p-3 font-semibold">紀錄時間</th>
                <th className="p-3 font-semibold">操作人員 / 部門</th>
                <th className="p-3 font-semibold">作業動作名稱</th>
                <th className="p-3 font-semibold">目標對象</th>
                <th className="p-3 font-semibold">詳細變更內容</th>
                <th className="p-3 font-semibold">異動前 ➔ 異動後</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    暫無符合條件的稽核日誌
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-750/50 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* Operator and Department */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{log.operator}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 inline-block mt-0.5">
                        {log.department}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3 font-medium text-blue-400 whitespace-nowrap">
                      {log.action}
                    </td>

                    {/* Target */}
                    <td className="p-3 font-mono font-semibold text-slate-300">
                      <span className="text-[10px] text-slate-500 mr-1">[{log.targetType}]</span>
                      {log.targetId}
                    </td>

                    {/* Details */}
                    <td className="p-3 text-slate-300 max-w-xs">{log.details}</td>

                    {/* Changes (Old vs New) */}
                    <td className="p-3 font-mono text-[11px]">
                      {log.oldValue || log.newValue ? (
                        <div className="space-y-0.5">
                          {log.oldValue && (
                            <div className="text-slate-400 line-through truncate max-w-xs">
                              {log.oldValue}
                            </div>
                          )}
                          {log.newValue && (
                            <div className="text-emerald-400 font-semibold truncate max-w-xs">
                              {log.newValue}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
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
