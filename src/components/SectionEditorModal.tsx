import React, { useState } from 'react';
import { Sparkles, Wand2, X, Check, RefreshCw, Edit3 } from 'lucide-react';
import { DocumentSection, GeneratedDocument } from '../types/document';
import { requestSectionRegeneration } from '../services/aiService';

interface SectionEditorModalProps {
  document: GeneratedDocument;
  section: DocumentSection | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSection: (sectionId: string, newContent: string) => void;
}

const QUICK_PROMPTS = [
  { label: '정량 지표 & 데이터 표 추가', prompt: '구체적인 정량적 지표, 수치, 그리고 상세한 Markdown 데이터 표(Table)를 추가하여 전문성을 극대화해 주세요.' },
  { label: '실행 로드맵 & 체크리스트 보강', prompt: '실제 실무에서 즉시 실행 가능한 단계별 타임라인(Timeline)과 핵심 체크리스트(Checklist)를 구체적으로 보강해 주세요.' },
  { label: '임원 보고용 어조로 격식화', prompt: 'C-Level 경영진 및 투자자 보고에 적합하도록 전략적 시사점과 결론 중심의 격식 있는 비즈니스 어조로 문장을 정제해 주세요.' },
  { label: '핵심 요약 및 리스크 대응 추가', prompt: '해당 섹션의 핵심 시사점 요약과 예상 리스크 요인 및 완화 방안을 추가해 주세요.' },
  { label: '더 알기 쉽게 명료화', prompt: '복잡한 설명을 명확하고 이해하기 쉬운 개조식 불릿 포인트와 핵심 위주로 정리해 주세요.' },
];

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  document,
  section,
  isOpen,
  onClose,
  onUpdateSection,
}) => {
  if (!isOpen || !section) return null;

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [manualText, setManualText] = useState(section.content);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedQuickPrompt, setSelectedQuickPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyQuickPrompt = (promptText: string) => {
    setCustomPrompt(promptText);
    setSelectedQuickPrompt(promptText);
  };

  const handleRunAi = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const generated = await requestSectionRegeneration({
        docTitle: document.title,
        field: document.customField || document.field,
        documentType: document.customDocumentType || document.documentType,
        sectionNumber: section.sectionNumber,
        sectionTitle: section.title,
        existingContent: previewContent || section.content,
        instruction: customPrompt || '더 상세하고 구체적인 실무 콘텐츠로 보강해 주세요.',
        tone: '전문 비즈니스 어조',
      });

      setPreviewContent(generated);
      setManualText(generated);
    } catch (err: any) {
      setErrorMessage(err.message || '섹션 재작성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const finalContent = activeTab === 'manual' ? manualText : (previewContent || section.content);
    onUpdateSection(section.id, finalContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>섹션 AI 재작성 및 편집</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {section.sectionNumber} {section.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 border-b border-slate-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`pb-2.5 text-sm font-bold flex items-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            AI 스마트 보강 / 재생성
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 text-sm font-bold flex items-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            직접 텍스트 편집
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm">
          {activeTab === 'ai' ? (
            <>
              {/* Quick action chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  원클릭 AI 개선 옵션
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyQuickPrompt(qp.prompt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        selectedQuickPrompt === qp.prompt
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  AI 수정 지시 사항
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="예: 3개년 매출 추정치 표를 추가하고, 도입 효과를 3단계로 나누어 설명해 줘"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Run AI button */}
              <button
                type="button"
                onClick={handleRunAi}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:bg-slate-300"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI가 섹션을 재작성 중입니다...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>섹션 AI 재작성 실행</span>
                  </>
                )}
              </button>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Preview Content Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{previewContent ? 'AI 재작성 결과 미리보기' : '현재 섹션 내용'}</span>
                  {previewContent && (
                    <span className="text-[11px] font-semibold text-emerald-600">
                      ✓ 새 내용이 생성되었습니다
                    </span>
                  )}
                </label>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs max-h-56 overflow-y-auto whitespace-pre-wrap text-slate-800">
                  {previewContent || section.content}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Markdown 내용 직접 수정
              </label>
              <textarea
                rows={14}
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                className="w-full p-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs text-slate-800 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            문서에 반영하기
          </button>
        </div>
      </div>
    </div>
  );
};
