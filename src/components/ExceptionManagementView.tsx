import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  User,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import { ExceptionLog, Department, ExceptionSeverity, ExceptionStatus } from '../types';

interface ExceptionManagementViewProps {
  exceptions: ExceptionLog[];
  onOpenCreateModal: () => void;
  onUpdateException: (
    exceptionId: string,
    updates: Partial<ExceptionLog>,
    operator: string,
    department: Department
  ) => void;
  currentRoleKey: string;
}

export const ExceptionManagementView: React.FC<ExceptionManagementViewProps> = ({
  exceptions,
  onOpenCreateModal,
  onUpdateException,
  currentRoleKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [severityFilter, setSeverityFilter] = useState<string>('全部');

  // Solution editing state
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [solutionInput, setSolutionInput] = useState('');

  const filteredExceptions = exceptions.filter((ex) => {
    const matchSearch =
      ex.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.orderId && ex.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ex.assigneeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === '全部' || ex.status === statusFilter;
    const matchSeverity = severityFilter === '全部' || ex.severity === severityFilter;

    return matchSearch && matchStatus && matchSeverity;
  });

  const handleOpenSolutionEdit = (ex: ExceptionLog) => {
    setActiveEditingId(ex.id);
    setSolutionInput(ex.solution || '');
  };

  const handleSaveSolution = (ex: ExceptionLog) => {
    onUpdateException(
      ex.id,
      {
        solution: solutionInput,
        status: ex.status === '待處理' ? '處理中' : ex.status,
      },
      currentRoleKey === '全部' ? '系統管理者' : currentRoleKey,
      (currentRoleKey === '全部' ? '生管' : currentRoleKey) as Department
    );
    setActiveEditingId(null);
  };

  const handleCloseException = (ex: ExceptionLog) => {
    onUpdateException(
      ex.id,
      {
        status: '已結案',
      },
      currentRoleKey === '全部' ? '生產主管' : currentRoleKey,
      (currentRoleKey === '全部' ? '生產主管' : currentRoleKey) as Department
    );
  };

  const getSeverityBadge = (sev: ExceptionSeverity) => {
    switch (sev) {
      case '高':
        return 'bg-rose-950 text-rose-300 border-rose-500/80 font-bold animate-pulse';
      case '中':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-semibold';
      case '低':
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (st: ExceptionStatus) => {
    switch (st) {
      case '待處理':
        return 'bg-rose-900/60 text-rose-300 border-rose-500/50';
      case '處理中':
        return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
      case '對策審核':
        return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
      case '已結案':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
    }
  };

  // Check SLA overdue
  const isOverdue = (deadline: string, status: ExceptionStatus) => {
    if (status === '已結案') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>F05｜異常通報與協同處置管理 (Issue Management)</span>
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-700">
              共 {exceptions.length} 件通報
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            登記缺料、排程延誤、設備停機或品質異常，指派跨部門負責人與處理期限 (SLA)，追蹤應變對策與結案放行。
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>登記新異常 (F05)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋異常主旨、說明、關聯訂單編號或負責人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">嚴重等級：</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="全部">全部嚴重度</option>
              <option value="高">高 (緊急中斷)</option>
              <option value="中">中 (潛在延誤)</option>
              <option value="低">低 (一般微幅)</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-750 text-xs">
          <span className="text-slate-400 mr-1">處置狀態：</span>
          {['全部', '待處理', '處理中', '對策審核', '已結案'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {filteredExceptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-800/40 border border-slate-750 rounded-xl">
            暫無符合篩選條件的異常通報記錄
          </div>
        ) : (
          filteredExceptions.map((ex) => {
            const overdue = isOverdue(ex.deadline, ex.status);

            return (
              <div
                key={ex.id}
                className={`bg-slate-800/90 border rounded-xl p-4 shadow-sm transition-all ${
                  ex.severity === '高' && ex.status !== '已結案'
                    ? 'border-rose-500/60 bg-rose-950/10'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-750">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        ex.severity === '高'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-200">{ex.id}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${getSeverityBadge(
                            ex.severity
                          )}`}
                        >
                          {ex.severity}級嚴重度
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {ex.type}
                        </span>
                        {ex.orderId && (
                          <span className="text-xs text-blue-400 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                            關聯工單: {ex.orderId}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{ex.title}</h3>
                    </div>
                  </div>

                  {/* Status & Deadline */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-750 text-xs">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>處置期限 (SLA)</span>
                      </div>
                      <div
                        className={`font-mono font-semibold ${
                          overdue ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'
                        }`}
                      >
                        {ex.deadline} {overdue && '(已逾期!)'}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        ex.status
                      )}`}
                    >
                      {ex.status}
                    </span>
                  </div>
                </div>

                {/* Description & Personnel */}
                <div className="py-3 text-xs text-slate-300 leading-relaxed border-b border-slate-750/70">
                  <p>{ex.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span>
                      通報：<strong className="text-slate-300">{ex.reportedDept} · {ex.reportedBy}</strong> ({ex.reportedAt})
                    </span>
                    <span>•</span>
                    <span>
                      指派承辦：<strong className="text-blue-400">{ex.assigneeDept} · {ex.assigneeName}</strong>
                    </span>
                    {ex.resolvedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">
                          結案時間：{ex.resolvedAt} (審核人: {ex.resolvedBy})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Solution Section */}
                <div className="pt-3">
                  {activeEditingId === ex.id ? (
                    <div className="space-y-2 bg-slate-900/90 p-3 rounded-lg border border-blue-500/40">
                      <label className="block text-xs font-semibold text-blue-300">
                        登記應變對策與處理解決方案
                      </label>
                      <textarea
                        value={solutionInput}
                        onChange={(e) => setSolutionInput(e.target.value)}
                        placeholder="請輸入跨部門協同處置措施 (例如：供應商改走空運應急、調整產線班別、更換備品零件...)"
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveEditingId(null)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSaveSolution(ex)}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
                        >
                          儲存處置方案
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-slate-400 font-semibold mr-1">處置對策：</span>
                        <span className="text-slate-300">
                          {ex.solution ? ex.solution : <em className="text-slate-500">尚待負責人提出處置對策</em>}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ex.status !== '已結案' && (
                          <>
                            <button
                              onClick={() => handleOpenSolutionEdit(ex)}
                              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs cursor-pointer transition-colors"
                            >
                              {ex.solution ? '更新對策' : '填寫對策'}
                            </button>

                            <button
                              onClick={() => handleCloseException(ex)}
                              className="px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>審核結案</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
