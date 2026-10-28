import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { OrderManagementView } from './components/OrderManagementView';
import { ScheduleManagementView } from './components/ScheduleManagementView';
import { MaterialManagementView } from './components/MaterialManagementView';
import { ExceptionManagementView } from './components/ExceptionManagementView';
import { AuditTrailView } from './components/AuditTrailView';
import { ReportsView } from './components/ReportsView';
import { AIPredictionView } from './components/AIPredictionView';
import { CreateOrderModal } from './components/CreateOrderModal';
import { CreateExceptionModal } from './components/CreateExceptionModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { NotificationModal } from './components/NotificationModal';
import { apiService } from './services/api';
import {
  Order,
  ProductionSchedule,
  MaterialItem,
  ExceptionLog,
  SystemAlert,
  AuditRecord,
  OrderStatus,
  Department,
  AIDelayPrediction,
  AIRecommendation,
} from './types';

export default function App() {
  // Navigation and Role state
  const [activeTab, setActiveTab] = useState<string>('kanban');
  const [currentRoleKey, setCurrentRoleKey] = useState<string>('全部');

  // Core Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionLog[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);

  // AI States (F09 & F10)
  const [predictionData, setPredictionData] = useState<AIDelayPrediction | null>(null);
  const [recommendationData, setRecommendationData] = useState<{
    recommendations: AIRecommendation[];
    executiveSummary?: string;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Modal States
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isCreateExceptionOpen, setIsCreateExceptionOpen] = useState(false);
  const [selectedExceptionOrderId, setSelectedExceptionOrderId] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load state from service
  const reloadData = () => {
    setOrders(apiService.getOrders());
    setSchedules(apiService.getSchedules());
    setMaterials(apiService.getMaterials());
    setExceptions(apiService.getExceptions());
    setAlerts(apiService.getAlerts());
    setAuditLogs(apiService.getAuditLogs());
  };

  useEffect(() => {
    reloadData();
    // Preload initial AI predictions
    fetchAIPredictions();
    fetchAIRecommendations();
  }, []);

  const fetchAIPredictions = async () => {
    setIsAiLoading(true);
    try {
      const data = await apiService.predictDelays(
        (currentRoleKey === '全部' ? '生管' : currentRoleKey) as Department
      );
      setPredictionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchAIRecommendations = async () => {
    setIsAiLoading(true);
    try {
      const data = await apiService.getAIRecommendations();
      setRecommendationData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Current user info helper
  const getOperatorAndDept = () => {
    const map: Record<string, { operator: string; dept: Department }> = {
      業務: { operator: '林怡君', dept: '業務' },
      生管: { operator: '陳建銘', dept: '生管' },
      採購: { operator: '黃雅琪', dept: '採購' },
      倉管: { operator: '張國榮', dept: '倉管' },
      生產主管: { operator: '王宏偉', dept: '生產主管' },
      全部: { operator: '系統管理者', dept: '生管' },
    };
    return map[currentRoleKey] || map['全部'];
  };

  // F01: Create Order
  const handleCreateOrder = (
    orderData: Omit<Order, 'id' | 'departmentStatus' | 'kittingRate'>
  ) => {
    const { operator, dept } = getOperatorAndDept();
    const newOrder = apiService.createOrder(orderData, operator, dept);
    reloadData();
    showToast(`✓ 已成功建立新訂單 ${newOrder.id} (${newOrder.customerName})`);
  };

  // F01: Update Order Status
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const { operator, dept } = getOperatorAndDept();
    apiService.updateOrderStatus(orderId, status, operator, dept);
    reloadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    showToast(`✓ 已變更訂單 ${orderId} 狀態為「${status}」`);
  };

  // F02: Update Schedule
  const handleUpdateSchedule = (
    scheduleId: string,
    updatedData: {
      lineName?: string;
      plannedStartDate: string;
      plannedEndDate: string;
      planner: string;
      progress?: number;
      reason: string;
    }
  ) => {
    const { operator, dept } = getOperatorAndDept();
    apiService.updateSchedule(scheduleId, updatedData, operator, dept);
    reloadData();
    showToast(`✓ 已成功異動生產排程 ${scheduleId} 並留存異動原因`);
  };

  // F03: Update Material item
  const handleUpdateMaterial = (
    materialId: string,
    updates: Partial<MaterialItem>,
    reason?: string
  ) => {
    const { operator, dept } = getOperatorAndDept();
    apiService.updateMaterialStatus(materialId, updates, operator, dept, reason);
    reloadData();
    showToast(`✓ 已更新物料狀態`);
  };

  // F03: Quick Issue Order Materials (倉管全數發料)
  const handleQuickIssue = (orderId: string) => {
    const { operator, dept } = getOperatorAndDept();
    apiService.issueMaterialsForOrder(orderId, operator, dept);
    reloadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, kittingRate: 100, status: '生產中' });
    }
    showToast(`✓ 倉管已全數完成工單 ${orderId} 物料撥發，齊套率 100%`);
  };

  // F03: Quick Sign Receipt (產線主管點收簽核)
  const handleQuickSignReceipt = (orderId: string) => {
    const { operator, dept } = getOperatorAndDept();
    apiService.signReceiptForOrder(orderId, operator, dept);
    reloadData();
    showToast(`✓ 生產主管已點收簽核工單 ${orderId} 現場物料`);
  };

  // F05: Create Exception
  const handleCreateException = (
    data: Omit<ExceptionLog, 'id' | 'reportedAt' | 'status'>
  ) => {
    const { operator, dept } = getOperatorAndDept();
    const newEx = apiService.createException(data, operator, dept);
    reloadData();
    showToast(`✓ 已登錄異常通報 ${newEx.id}，指派 ${newEx.assigneeDept} 限期處置`);
  };

  // F05: Update Exception
  const handleUpdateException = (
    exceptionId: string,
    updates: Partial<ExceptionLog>,
    operator: string,
    department: Department
  ) => {
    apiService.updateException(exceptionId, updates, operator, department);
    reloadData();
    showToast(`✓ 已更新異常通報處置進度`);
  };

  // F06: Alerts
  const handleMarkAlertAsRead = (alertId: string) => {
    apiService.markAlertAsRead(alertId);
    reloadData();
  };

  const handleMarkAllAlertsAsRead = () => {
    apiService.markAllAlertsAsRead();
    reloadData();
    showToast(`✓ 已將所有未讀通知標記為已讀`);
  };

  // Reset Data to defaults
  const handleResetData = () => {
    if (window.confirm('確定要將系統資料重設為初始範例狀態嗎？')) {
      apiService.resetToDefaults();
      reloadData();
      fetchAIPredictions();
      fetchAIRecommendations();
      showToast('✓ 已重設所有工廠訂單、排程與物料範例資料');
    }
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        currentRoleKey={currentRoleKey}
        onSelectRoleKey={(role) => {
          setCurrentRoleKey(role);
          showToast(`已切換至【${role}】部門工作視角`);
        }}
        unreadCount={unreadAlertsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
        onOpenCreateException={() => {
          setSelectedExceptionOrderId(undefined);
          setIsCreateExceptionOpen(true);
        }}
        onResetData={handleResetData}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'kanban' && (
          <DashboardView
            orders={orders}
            currentRoleKey={currentRoleKey}
            onSelectOrder={setSelectedOrder}
            onQuickIssue={handleQuickIssue}
            onQuickSignReceipt={handleQuickSignReceipt}
            onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
            onOpenCreateException={() => setIsCreateExceptionOpen(true)}
            onOpenAIPredict={() => setActiveTab('ai')}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManagementView
            orders={orders}
            onSelectOrder={setSelectedOrder}
            onOpenCreateModal={() => setIsCreateOrderOpen(true)}
            onUpdateStatus={handleUpdateOrderStatus}
            currentRoleKey={currentRoleKey}
          />
        )}

        {activeTab === 'schedules' && (
          <ScheduleManagementView
            schedules={schedules}
            orders={orders}
            onUpdateSchedule={handleUpdateSchedule}
            currentRoleKey={currentRoleKey}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialManagementView
            materials={materials}
            orders={orders}
            onUpdateMaterial={handleUpdateMaterial}
            onIssueOrderMaterials={handleQuickIssue}
            onSignReceipt={handleQuickSignReceipt}
            currentRoleKey={currentRoleKey}
          />
        )}

        {activeTab === 'exceptions' && (
          <ExceptionManagementView
            exceptions={exceptions}
            onOpenCreateModal={() => {
              setSelectedExceptionOrderId(undefined);
              setIsCreateExceptionOpen(true);
            }}
            onUpdateException={handleUpdateException}
            currentRoleKey={currentRoleKey}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView auditLogs={auditLogs} currentRoleKey={currentRoleKey} />
        )}

        {activeTab === 'reports' && (
          <ReportsView orders={orders} materials={materials} exceptions={exceptions} />
        )}

        {activeTab === 'ai' && (
          <AIPredictionView
            predictionData={predictionData}
            recommendationData={recommendationData}
            isLoading={isAiLoading}
            onRefreshPrediction={fetchAIPredictions}
            onRefreshRecommendations={fetchAIRecommendations}
            currentRoleKey={currentRoleKey}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onSubmit={handleCreateOrder}
        currentRoleKey={currentRoleKey}
      />

      <CreateExceptionModal
        isOpen={isCreateExceptionOpen}
        onClose={() => setIsCreateExceptionOpen(false)}
        onSubmit={handleCreateException}
        orders={orders}
        currentRoleKey={currentRoleKey}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        schedule={schedules.find((s) => s.orderId === selectedOrder?.id)}
        materials={materials}
        exceptions={exceptions}
        auditLogs={auditLogs}
        onUpdateStatus={handleUpdateOrderStatus}
        onQuickIssue={handleQuickIssue}
        onQuickSignReceipt={handleQuickSignReceipt}
        onOpenCreateExceptionForOrder={(orderId) => {
          setSelectedExceptionOrderId(orderId);
          setIsCreateExceptionOpen(true);
        }}
        currentRoleKey={currentRoleKey}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAlertAsRead}
        onMarkAllAsRead={handleMarkAllAlertsAsRead}
        onSelectOrderById={(orderId) => {
          const found = orders.find((o) => o.id === orderId);
          if (found) setSelectedOrder(found);
        }}
      />
    </div>
  );
}
