/**
 * 生產排程與物料供應跨部門協作管理系統 - 核心資料型態定義
 */

// 部門與角色
export type Department = '業務' | '生管' | '採購' | '倉管' | '生產主管';

export interface UserRoleInfo {
  role: Department;
  name: string;
  avatar: string;
  badgeColor: string;
  focusDesc: string;
}

// 訂單狀態
export type OrderStatus =
  | '待排程'    // 業務剛建單，生管待確認
  | '已排程'    // 生管已安排產線與開完工日
  | '備料中'    // 倉管/採購備料準備中
  | '生產中'    // 產線已領料開工
  | '已完工'    // 產線完工，品檢待入庫
  | '已出貨'    // 業務已確認交貨出貨
  | '延誤警戒';  // 因缺料或設備異常延誤

// 訂單急迫度
export type PriorityLevel = '一般' | '急件' | '特急插單';

// 訂單資料結構 (F01)
export interface Order {
  id: string;              // 訂單編號 (e.g., ORD-2026-001)
  customerName: string;    // 客戶名稱
  productCode: string;     // 產品料號
  productName: string;     // 產品品名
  spec: string;            // 規格說明
  quantity: number;        // 訂購數量
  unit: string;            // 單位 (PCS, 組, 套)
  orderDate: string;       // 接單日期 (YYYY-MM-DD)
  customerDueDate: string; // 客戶需求交期
  estimatedDueDate: string;// 預計完工出貨日
  status: OrderStatus;     // 訂單狀態
  priority: PriorityLevel; // 優先等級
  salesPerson: string;     // 負責業務
  remarks?: string;        // 訂單備註
  
  // 關聯各部門權責與狀態燈號
  departmentStatus: {
    sales: 'green' | 'yellow' | 'red';       // 業務：交期明確 / 待協調 / 客戶延期
    pmc: 'green' | 'yellow' | 'red';         // 生管：產能已排 / 產能緊縮 / 排程延誤
    purchasing: 'green' | 'yellow' | 'red';  // 採購：料件齊備 / 在途預警 / 缺料斷鏈
    warehouse: 'green' | 'yellow' | 'red';   // 倉管：已發料 / 備料中 / 缺料待補
    production: 'green' | 'yellow' | 'red';  // 生產：正常生產 / 微幅落後 / 停線卡件
  };
  
  scheduleId?: string;     // 關聯排程
  bomId: string;           // 關聯物料清單 (BOM)
  kittingRate: number;     // 物料齊套率百分比 (0-100)
}

// 生產排程結構 (F02)
export interface ProductionSchedule {
  id: string;              // 排程編號 (SCH-2026-001)
  orderId: string;         // 關聯訂單
  lineName: string;        // 產線名稱 (e.g. SMT-A線、精密組裝1線、包裝檢測線)
  plannedStartDate: string;// 預計開工日
  plannedEndDate: string;  // 預計完工日
  actualStartDate?: string;// 實際開工日
  actualEndDate?: string;  // 實際完工日
  progress: number;        // 生產進度 (0-100%)
  planner: string;         // 負責生管員
  changeReason?: string;   // 排程異動原因
  changeHistory: {
    date: string;
    operator: string;
    prevDates: string;
    newDates: string;
    reason: string;
  }[];
}

// 物料與庫存狀態結構 (F03)
export type MaterialReadiness = '已備齊' | '備料中' | '缺料警戒' | '待採購';
export type IssuanceStatus = '未發料' | '部分發料' | '已全數發料';
export type ReceiptStatus = '未收料' | '產線已簽收';

export interface MaterialItem {
  id: string;              // 物料代碼 (MAT-101)
  code: string;            // 料號
  name: string;            // 品名
  spec: string;            // 規格
  unit: string;            // 單位
  requiredQty: number;     // 本工單需求量
  stockQty: number;        // 當前在庫可用量
  safetyStock: number;     // 安全庫存量
  incomingQty: number;     // 在途採購量
  expectedArrivalDate: string; // 預計到貨日
  supplier: string;        // 供應商
  purchasingStatus: '正常在途' | '交期確認' | '延遲到貨' | '急催中';
  kittingStatus: MaterialReadiness; // 備料狀態 (倉管)
  issuanceStatus: IssuanceStatus;   // 發料狀態 (倉管)
  receiptStatus: ReceiptStatus;     // 產線收料狀態 (生產主管)
  receivedBy?: string;     // 收料簽收人
  receivedAt?: string;     // 簽收時間
  associatedOrderId: string; // 關聯訂單
}

// 異常通報結構 (F05)
export type ExceptionType = '缺料警報' | '排程延誤' | '設備停機' | '品質異常' | '急單插單';
export type ExceptionSeverity = '高' | '中' | '低';
export type ExceptionStatus = '待處理' | '處理中' | '對策審核' | '已結案';

export interface ExceptionLog {
  id: string;              // 異常代號 (EX-2026-001)
  orderId?: string;        // 關聯訂單
  type: ExceptionType;     // 異常類型
  severity: ExceptionSeverity; // 嚴重度
  title: string;           // 異常主旨
  description: string;     // 詳細情況說明
  reportedBy: string;      // 通報人員
  reportedDept: Department;// 通報部門
  reportedAt: string;      // 通報時間
  assigneeDept: Department;// 負責處理部門
  assigneeName: string;    // 負責處理人
  deadline: string;        // 處理期限 (SLA)
  status: ExceptionStatus; // 狀態
  solution?: string;       // 處理解決方案
  resolvedAt?: string;     // 結案時間
  resolvedBy?: string;     // 結案審核人
}

// 系統通知與提醒結構 (F06)
export interface SystemAlert {
  id: string;
  orderId?: string;
  exceptionId?: string;
  type: 'delay_risk' | 'material_late' | 'sla_overdue' | 'schedule_change' | 'general';
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  targetDepts: Department[];
  isRead: boolean;
}

// 權責與稽核歷程結構 (F07)
export interface AuditRecord {
  id: string;
  timestamp: string;
  operator: string;
  department: Department;
  action: string;          // 操作名稱 (如: 調整生產排程、確認發料、通報缺料)
  targetType: '訂單' | '排程' | '物料' | '異常';
  targetId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

// AI 延誤預測回傳結構 (F09)
export interface AIDelayPrediction {
  overallRisk: '高' | '中' | '低';
  overallRiskScore: number;
  summary: string;
  source: string;
  riskOrders: {
    orderId: string;
    riskScore: number;
    riskLevel: '高' | '中' | '低';
    predictedDelayDays: number;
    bottlenecks: string[];
    suggestedAction: string;
    responsibleDept: Department;
  }[];
  keyMaterialAlerts?: {
    materialCode: string;
    impact: string;
    mitigation: string;
  }[];
}

// AI 改善建議回傳結構 (F10)
export interface AIRecommendation {
  category: '排程調度' | '物料採購' | '倉管備料' | '跨部門協同';
  title: string;
  priority: '緊急' | '高度' | '一般';
  targetDepartment: Department;
  rootCause: string;
  actionPlan: string[];
  expectedBenefit: string;
}
