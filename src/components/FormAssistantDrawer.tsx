import React, { useState } from 'react';
import { Sparkles, Send, Bot, Lightbulb, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { BusinessFormDocument } from '../types/formStudio';

interface FormAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: BusinessFormDocument;
  onApplyAiUpdate: (instruction: string) => Promise<void>;
  isLoading: boolean;
}

export const FormAssistantDrawer: React.FC<FormAssistantDrawerProps> = ({
  isOpen,
  onClose,
  document,
  onApplyAiUpdate,
  isLoading,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = [
    '결재선에 "재무총괄이사(CFO)" 승인 칸을 추가하고 결재란을 갱신해줘',
    '예산 소요 항목에 "AI GPU 클라우드 비용 500만원"을 새로 추가하고 총금액을 재계산해줘',
    '공급가액을 1,500만 원으로 수정하고 부가세 10%와 한글 총합계 금액을 연동해줘',
    '추진 일정 섹션에 "사내 베타 테스트(2주간)" 항목을 불릿으로 추가해줘',
    '특약사항에 "하자보증기간은 최종 검수 완료일로부터 1년으로 한다" 조항을 추가해줘',
    '경력기술서 프로젝트 목록에 최근 "생성형 AI 문서자동화 구축" 프로젝트를 맨 위에 추가해줘',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;
    setError(null);
    try {
      await onApplyAiUpdate(promptInput.trim());
      setPromptInput('');
    } catch (err: any) {
      setError(err.message || 'AI 양식 수정 요청 처리 중 오류가 발생했습니다.');
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
      setError(err.message || 'AI 양식 수정 요청 처리 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-slate-900 font-bold shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black">AI 공문서 양식 어시스턴트</h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-400 text-slate-900">
                  SMART
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                {document.title} 양식 실시간 수정 연동
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
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>원하는 수정 내용을 자연어로 편하게 말씀해 주세요!</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              결재선 라인 변경, 금액 및 품목 추가/삭제, 특약사항 조항 추가, 서식 문구 수정까지 AI가 표준 공문서 규격에 맞춰 일괄 반영합니다.
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
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-xs font-medium text-slate-700 transition-all cursor-pointer flex items-start gap-2 group disabled:opacity-50"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-100 group-hover:bg-amber-200 text-slate-500 group-hover:text-amber-800 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="group-hover:text-amber-900">{qp}</span>
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
                placeholder="예: 결재선에 재무팀장 추가하고, 예산 항목에 AI 서버 증설비 800만원을 추가해줘"
                rows={3}
                disabled={isLoading}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs text-slate-900 placeholder:text-slate-400 resize-none bg-white shadow-2xs"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                A4 규격 레이아웃 및 워드 다운로드에 자동 반영됩니다.
              </span>
              <button
                type="submit"
                disabled={!promptInput.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI 양식 수정 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 양식 수정 적용</span>
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
