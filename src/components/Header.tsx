import React from 'react';
import {
  Bell,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar,
  Package,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { Department } from '../types';
import { USER_ROLES } from '../data/mockData';

interface HeaderProps {
  currentRoleKey: string;
  onSelectRoleKey: (key: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenCreateOrder: () => void;
  onOpenCreateException: () => void;
  onResetData: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoleKey,
  onSelectRoleKey,
  unreadCount,
  onOpenNotifications,
  onOpenCreateOrder,
  onOpenCreateException,
  onResetData,
  activeTab,
  onSelectTab,
}) => {
  const currentRoleInfo = USER_ROLES[currentRoleKey] || USER_ROLES['全部'];

  const tabs = [
    { id: 'kanban', label: '進度共用看板 (F04)', icon: Layers },
    { id: 'orders', label: '訂單管理 (F01)', icon: ClipboardList },
    { id: 'schedules', label: '生產排程 (F02)', icon: Calendar },
    { id: 'materials', label: '物料與發料 (F03)', icon: Package },
    { id: 'exceptions', label: '異常通報 (F05)', icon: AlertTriangle },
    { id: 'audit', label: '權責與稽核 (F07)', icon: ShieldCheck },
    { id: 'reports', label: '統計報表 (F08)', icon: BarChart3 },
    { id: 'ai', label: 'AI預測與改善 (F09/10)', icon: Sparkles },
  ];

  const roleKeys = ['全部', '業務', '生管', '採購', '倉管', '生產主管'];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top Banner & Title Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  生產排程與物料供應跨部門協作系統
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  即時協同 v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                業務 · 生管 · 採購 · 倉管 · 生產主管 單一真實數據來源 (SSOT)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
              title="業務/生管建立新訂單 (F01)"
            >
              <PlusCircle className="w-4 h-4" />
              <span>建立訂單</span>
            </button>

            <button
              onClick={onOpenCreateException}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm transition-colors cursor-pointer"
              title="登記缺料、排程延誤或設備異常 (F05)"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>通報異常</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
              title="系統警報與通知中心 (F06)"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={onResetData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-slate-700"
              title="重設範例資料"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role Switcher Toolbar */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">切換部門視角：</span>
            <div className="inline-flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
              {roleKeys.map((key) => {
                const isSelected = currentRoleKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => onSelectRoleKey(key)}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-800">
            <span className="text-base">{currentRoleInfo.avatar}</span>
            <span className="font-semibold text-slate-200">{currentRoleInfo.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 truncate max-w-xs">{currentRoleInfo.focusDesc}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-slate-950/70 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 py-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
