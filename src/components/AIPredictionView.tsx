import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  FileText,
  User,
  Package,
} from 'lucide-react';
import { AIDelayPrediction, AIRecommendation, Department } from '../types';

interface AIPredictionViewProps {
  predictionData: AIDelayPrediction | null;
  recommendationData: {
    recommendations: AIRecommendation[];
    executiveSummary?: string;
  } | null;
  isLoading: boolean;
  onRefreshPrediction: () => void;
  onRefreshRecommendations: () => void;
  currentRoleKey: string;
}

export const AIPredictionView: React.FC<AIPredictionViewProps> = ({
  predictionData,
  recommendationData,
  isLoading,
  onRefreshPrediction,
  onRefreshRecommendations,
  currentRoleKey,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'predict' | 'recommend'>('predict');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI 延誤預測 (F09) 與 流程改善建議 (F10)
              </h2>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1.5 max-w-2xl leading-relaxed">
              整合全廠訂單排程、BOM 物料到貨延誤、產線產能負荷與歷史異常日誌，透過 Google Gemini 3.8 Flash
              進行製造供應鏈多維度因果推論與精實生產 (Lean Manufacturing) 處方規劃。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={activeSubTab === 'predict' ? onRefreshPrediction : onRefreshRecommendations}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI 運算推理中...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-white" />
                  <span>
                    {activeSubTab === 'predict' ? '重新分析延誤風險 (F09)' : '重新分析改善建議 (F10)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="mt-4 pt-3 border-t border-indigo-500/20 flex gap-2">
          <button
            onClick={() => setActiveSubTab('predict')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'predict'
                ? 'bg-blue-600 text-white shadow'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-900/40'
            }`}
          >
            F09｜AI 訂單延誤風險預測
          </button>
          <button
            onClick={() => setActiveSubTab('recommend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'recommend'
                ? 'bg-blue-600 text-white shadow'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-900/40'
            }`}
          >
            F10｜AI 智慧排程與流程改善建議
          </button>
        </div>
      </div>

      {/* Subtab 1: F09 Delay Prediction */}
      {activeSubTab === 'predict' && (
        <div className="space-y-4">
          {predictionData ? (
            <>
              {/* Overall Risk Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border ${
                      predictionData.overallRisk === '高'
                        ? 'bg-rose-950/80 text-rose-400 border-rose-500/60 animate-pulse'
                        : predictionData.overallRisk === '中'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                    }`}
                  >
                    {predictionData.overallRisk}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">工廠當前綜合延誤風險等級</div>
                    <div className="text-lg font-bold text-white">
                      風險評分：<span className="font-mono text-amber-400">{predictionData.overallRiskScore} / 100</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      引擎：<span className="font-mono text-indigo-400">{predictionData.source || 'gemini-3.8-flash'}</span>
                    </div>
                  </div>
                </div>

                <div className="max-w-xl text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-750">
                  <strong className="text-blue-400 block mb-1">AI 總體情勢剖析：</strong>
                  {predictionData.summary}
                </div>
              </div>

              {/* Risk Orders Detailed Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>重點預測潛在延誤訂單清單</span>
                </h3>

                {predictionData.riskOrders?.map((ro, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-750">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-blue-400">
                          {ro.orderId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            ro.riskLevel === '高'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/60'
                          }`}
                        >
                          風險等級: {ro.riskLevel}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          (風險指數: {ro.riskScore}%)
                        </span>
                      </div>

                      <div className="text-xs bg-rose-950/40 text-rose-300 px-2.5 py-1 rounded border border-rose-800/60 font-semibold font-mono">
                        預估延誤天數：+{ro.predictedDelayDays} 天
                      </div>
                    </div>

                    {/* Bottlenecks Identified */}
                    <div className="text-xs space-y-1">
                      <div className="text-slate-400 font-medium">關鍵瓶頸成因推斷：</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ro.bottlenecks?.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-750 text-[11px]"
                          >
                            ⚠️ {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Action */}
                    <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-2.5 text-xs">
                      <div className="flex items-center justify-between text-blue-300 font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                          <span>生管 / 採購處方建議：</span>
                        </span>
                        <span className="text-[11px] text-blue-400 font-normal">
                          責任部門：{ro.responsibleDept}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{ro.suggestedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-800/40 border border-slate-750 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-2" />
              <p className="text-xs">正在載入 AI 延誤預測分析模型...</p>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: F10 Process Recommendations */}
      {activeSubTab === 'recommend' && (
        <div className="space-y-4">
          {recommendationData ? (
            <>
              {recommendationData.executiveSummary && (
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-400 block mb-1">廠長主管級精簡摘要：</strong>
                  {recommendationData.executiveSummary}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendationData.recommendations?.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-750">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-500/40">
                          {rec.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.priority === '緊急'
                              ? 'bg-rose-500 text-white'
                              : rec.priority === '高度'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        對策部門：{rec.targetDepartment}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{rec.title}</h4>

                    <div className="text-xs text-slate-300">
                      <div className="text-slate-400 font-semibold mb-0.5">根本成因 (Root Cause)：</div>
                      <p className="bg-slate-900/60 p-2 rounded border border-slate-750 text-slate-300">
                        {rec.rootCause}
                      </p>
                    </div>

                    {/* Action plan */}
                    <div className="text-xs space-y-1">
                      <div className="text-slate-400 font-semibold">實施行動方案：</div>
                      <ul className="space-y-1 pl-4 list-disc text-slate-300">
                        {rec.actionPlan?.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Expected Benefit */}
                    <div className="pt-2 border-t border-slate-750 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-semibold">預期效益：</span>
                      <span className="text-slate-200">{rec.expectedBenefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-800/40 border border-slate-750 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-2" />
              <p className="text-xs">正在分析常發異常日誌與精實改善方案...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
