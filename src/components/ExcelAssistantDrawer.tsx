import React, { useState } from 'react';
import { Sparkles, Send, Bot, Lightbulb, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ExcelDocument } from '../types/excel';

interface ExcelAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: ExcelDocument;
  onApplyAiUpdate: (instruction: string) => Promise<void>;
  isLoading: boolean;
}

export const ExcelAssistantDrawer: React.FC<ExcelAssistantDrawerProps> = ({
  isOpen,
  onClose,
  document,
  onApplyAiUpdate,
  isLoading,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = [
    '하반기(7월~12월) 매출 목표를 10%씩 일괄 상향하고 달성율과 합계를 다시 계산해줘',
    '제품군에 "AI 솔루션 라인업" 행을 새로 추가하고 연간 매출 15억 원을 분기별로 배분해줘',
    '영업이익(매출의 25%)과 영업이익률 열을 시트에 추가하고 수식 연동해줘',
    '1분기 실적 호조를 반영해 1~3월 실제 매출을 15% 상향 조정해줘',
    '3번째 시트로 "월별 마케팅 집행비용 및 광고 ROI 분석표"를 추가로 만들어줘',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;
    setError(null);
    try {
      await onApplyAiUpdate(promptInput.trim());
      setPromptInput('');
    } catch (err: any) {
      setError(err.message || 'AI 수정 요청 처리 중 오류가 발생했습니다.');
    }
  };

  const handleQuickPromptClick = async (text: string) => {
    if (isLoading) return;
    setPromptInput(text);
    setError(null);
    try {
      await onApplyAiUpdate(text);
      setPromptInput('');
    } catch (err: any) {
      setError(err.message || 'AI 수정 요청 처리 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-900 font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black">AI 자연어 엑셀 어시스턴트</h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-400 text-slate-900">
                  SMART
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                {document.title} 엑셀 모델 실시간 연동
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Intro Box */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>원하는 수정 내용을 편하게 자연어로 말씀해 주세요!</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              수치 상향/하향, 신규 항목(행/열) 추가, 시트 추가, 수식 재계산, 차트 및 KPI 지표 업데이트까지 AI가 엑셀 구조를 파악하여 일괄 적용합니다.
            </p>
          </div>

          {/* Quick Prompt Recommendation Chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>실무 추천 원클릭 수정 프롬프트:</span>
            </div>
            <div className="space-y-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPromptClick(qp)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs font-medium text-slate-700 transition-all cursor-pointer flex items-start gap-2 group disabled:opacity-50"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-100 group-hover:bg-emerald-200 text-slate-500 group-hover:text-emerald-800 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="group-hover:text-emerald-900">{qp}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="예: 2분기(4~6월) 마케팅비 집중 투입으로 매출을 20% 늘리고, 비고란에 프로모션 반영 사유를 적어줘"
                rows={3}
                disabled={isLoading}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs text-slate-900 placeholder:text-slate-400 resize-none bg-white shadow-2xs"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                수식 및 대시보드 차트가 함께 자동 갱신됩니다.
              </span>
              <button
                type="submit"
                disabled={!promptInput.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI 시트 수정 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 수정 적용</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
