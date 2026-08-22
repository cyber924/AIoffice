import React, { useState } from 'react';
import { SlideItem, SlideLayoutType } from '../types/presentation';
import { X, Sparkles, RefreshCw, Layout, Check } from 'lucide-react';

interface SlideRegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: SlideItem | null;
  presentationTitle: string;
  onRegenerate: (params: {
    requestedLayout?: SlideLayoutType;
    customPrompt?: string;
  }) => Promise<void>;
}

const AVAILABLE_LAYOUTS: { id: SlideLayoutType; label: string; desc: string }[] = [
  { id: 'cards_grid_3', label: '3단 카드 그리드', desc: '3대 핵심 전략, 주요 기능, 가치 제안' },
  { id: 'bullets_split', label: '스플릿 2열 요약', desc: '좌측 핵심 인사이트 + 우측 상세 불릿 목록' },
  { id: 'cards_grid_4', label: '4단 프로세스 카드', desc: '단계별 실행 계획, 프로세스 4단계' },
  { id: 'swot_matrix', label: 'SWOT 분석 매트릭스', desc: '강점, 약점, 기회, 위협 4분면 분석' },
  { id: 'timeline_roadmap', label: '타임라인 로드맵', desc: '분기별/단계별 마일스톤 및 일정' },
  { id: 'market_tam_sam_som', label: '시장 규모 (TAM/SAM/SOM)', desc: '3단계 시장 규모 수치 및 점유 목표' },
  { id: 'financial_kpi', label: '핵심 지표 (KPI / 재무)', desc: '3대 대형 수치 및 전년 대비 성장률' },
  { id: 'comparison_table', label: '비교 분석 표 (Table)', desc: '경쟁사 대비 비교 또는 항목별 상세 스펙' },
  { id: 'conclusion_call_to_action', label: '결론 및 요청 (The Ask)', desc: '투자 유치, 승인 요청 및 최종 실행 계획' },
];

export const SlideRegenerateModal: React.FC<SlideRegenerateModalProps> = ({
  isOpen,
  onClose,
  slide,
  onRegenerate,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<SlideLayoutType>(slide?.layout || 'cards_grid_3');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !slide) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onRegenerate({
        requestedLayout: selectedLayout,
        customPrompt: customPrompt.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || '슬라이드 재작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                슬라이드 {slide.slideNumber}번 AI 재작성 및 레이아웃 변경
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-md">현재: {slide.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Layout Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-600" />
              <span>원하는 슬라이드 비주얼 레이아웃 선택</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {AVAILABLE_LAYOUTS.map((lay) => {
                const isSelected = selectedLayout === lay.id;
                return (
                  <button
                    key={lay.id}
                    type="button"
                    onClick={() => setSelectedLayout(lay.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{lay.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{lay.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              AI 수정 요청 지침 (선택 사항)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="예: 수치를 더 구체적인 금액과 퍼센트로 보강해줘, 경쟁사 3곳과의 차별점을 강조해줘, 발표자 스피커 노트를 더 설득력 있게 다듬어줘"
              className="w-full h-20 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI 슬라이드 재작성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>지금 재작성하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
