import React, { useState } from 'react';
import { PlusCircle, AlertCircle, Calendar, User, Package, Layers } from 'lucide-react';
import { Order, PriorityLevel, Department } from '../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<Order, 'id' | 'departmentStatus' | 'kittingRate'>) => void;
  currentRoleKey: string;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentRoleKey,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [spec, setSpec] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('台');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerDueDate, setCustomerDueDate] = useState('');
  const [estimatedDueDate, setEstimatedDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('一般');
  const [salesPerson, setSalesPerson] = useState(
    currentRoleKey === '業務' ? '林怡君' : '業務專員'
  );
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !productName || !customerDueDate) {
      setFormError('請填寫所有必要欄位（客戶名稱、產品品名、需求交期）。');
      return;
    }

    const estDue = estimatedDueDate || customerDueDate;

    onSubmit({
      customerName,
      productCode: productCode || `PRD-${Date.now().toString().slice(-4)}`,
      productName,
      spec,
      quantity,
      unit,
      orderDate,
      customerDueDate,
      estimatedDueDate: estDue,
      status: '待排程',
      priority,
      salesPerson,
      remarks,
      bomId: `BOM-${productCode.slice(0, 5) || 'STD'}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl my-8 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <span>建立新訂單資料 (F01 訂單管理)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer text-base">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Customer & Sales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                客戶名稱 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="例如：台達綠能工業 (股)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">負責業務人員</label>
              <input
                type="text"
                value={salesPerson}
                onChange={(e) => setSalesPerson(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Product Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">產品品名 <span className="text-rose-400">*</span></label>
              <input
                type="text"
                placeholder="例如：智慧型電力監測微網閘道器"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">產品料號 / 代碼</label>
              <input
                type="text"
                placeholder="例如：GW-9000-IOT"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Spec */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">規格說明</label>
            <input
              type="text"
              placeholder="例如：工規寬溫 -40~85°C / 支援 Modbus TCP & RTU"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quantity & Unit & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">訂單數量 <span className="text-rose-400">*</span></label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">單位</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="台">台</option>
                <option value="組">組</option>
                <option value="片">片 (PCBA)</option>
                <option value="套">套</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">訂單優先等級</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="一般">一般</option>
                <option value="急件">急件</option>
                <option value="特急插單">特急插單</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">接單日期</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">客戶需求交期 <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={customerDueDate}
                onChange={(e) => setCustomerDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">預計完工日</label>
              <input
                type="date"
                value={estimatedDueDate}
                onChange={(e) => setEstimatedDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">備註說明</label>
            <textarea
              placeholder="填寫客戶特殊要求、出貨驗收規範等..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {formError && (
            <div className="p-2.5 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-sm"
            >
              確認建立訂單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
