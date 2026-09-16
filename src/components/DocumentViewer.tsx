import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Star,
  Copy,
  Check,
  Edit,
  Trash2,
  ArrowLeft,
  ListOrdered,
  Clock,
  FileText,
  BookmarkCheck,
  RotateCcw,
  Plus,
  Upload,
} from 'lucide-react';
import { GeneratedDocument, DocumentSection } from '../types/document';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SectionEditorModal } from './SectionEditorModal';
import { ExportModal } from './ExportModal';
import confetti from 'canvas-confetti';

interface DocumentViewerProps {
  document: GeneratedDocument;
  onBackToForm: () => void;
  onUpdateDocument: (updatedDoc: GeneratedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onRegenerateAll: () => void;
  onNewDocument: () => void;
  onPublishToMarket?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onBackToForm,
  onUpdateDocument,
  onDeleteDocument,
  onRegenerateAll,
  onNewDocument,
  onPublishToMarket,
}) => {
  const [editingSection, setEditingSection] = useState<DocumentSection | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [activeTocId, setActiveTocId] = useState<string>('sec-exec-summary');

  const scrollToSection = (id: string) => {
    setActiveTocId(id);
    const element = window.document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleUpdateSectionContent = (sectionId: string, newContent: string) => {
    const updatedSections = document.sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, content: newContent };
      }
      return sec;
    });

    const fullContent = [
      document.title,
      document.subtitle,
      document.executiveSummary,
      ...updatedSections.map(s => s.title + ' ' + s.content),
      document.conclusion,
    ].filter(Boolean).join('\n\n');

    const charCount = fullContent.length;
    const wordCount = fullContent.split(/\s+/).filter(Boolean).length;
    const estimatedReadTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const updatedDoc: GeneratedDocument = {
      ...document,
      sections: updatedSections,
      metadata: {
        ...document.metadata,
        updatedAt: Date.now(),
        charCount,
        wordCount,
        estimatedReadTimeMinutes,
        version: (document.metadata.version || 1) + 1,
      },
    };

    onUpdateDocument(updatedDoc);
  };

  const handleToggleStar = () => {
    const isCurrentlyStarred = document.metadata.isStarred;
    const updatedDoc: GeneratedDocument = {
      ...document,
      metadata: {
        ...document.metadata,
        isStarred: !isCurrentlyStarred,
      },
    };
    onUpdateDocument(updatedDoc);
    if (!isCurrentlyStarred) {
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      } catch {}
    }
  };

  const handleCopySection = (section: DocumentSection) => {
    const text = `### ${section.sectionNumber} ${section.title}\n\n${section.content}`;
    navigator.clipboard.writeText(text);
    setCopiedSectionId(section.id);
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation & Action Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToForm}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="입력 폼으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {document.customField || document.field}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {document.customDocumentType || document.documentType}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                약 {document.metadata.estimatedReadTimeMinutes}분 소요 ({document.metadata.wordCount.toLocaleString()} 단어)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 line-clamp-1">
              {document.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleStar}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              document.metadata.isStarred
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="즐겨찾기 보관"
          >
            <Star
              className={`w-4 h-4 ${document.metadata.isStarred ? 'fill-amber-400 text-amber-500' : ''}`}
            />
            <span className="hidden sm:inline">
              {document.metadata.isStarred ? '보관됨' : '즐겨찾기'}
            </span>
          </button>

          <button
            type="button"
            onClick={onRegenerateAll}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="전체 문서 다시 생성"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">전체 재생성</span>
          </button>

          {onPublishToMarket && (
            <button
              type="button"
              onClick={onPublishToMarket}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="오픈 마켓플레이스에 문서 발행하기"
            >
              <Upload className="w-4 h-4" />
              <span>마켓 발행</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>내보내기 / 다운로드</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('이 문서를 삭제하시겠습니까?')) {
                onDeleteDocument(document.id);
              }
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="문서 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar TOC + Document Paper) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Sidebar: Table of Contents */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                <span>목차 바로가기 (TOC)</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {document.sections.length}개 섹션
              </span>
            </div>

            <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {/* Executive summary link */}
              <button
                type="button"
                onClick={() => scrollToSection('sec-exec-summary')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTocId === 'sec-exec-summary'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">[요약] Executive Summary</span>
              </button>

              {/* Sections list */}
              {document.tableOfContents.map((toc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToSection(toc.id || `section-${idx}`)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start gap-2 cursor-pointer ${
                    activeTocId === (toc.id || `section-${idx}`)
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono text-[11px] text-slate-400 shrink-0 mt-0.5">
                    {toc.sectionNumber}
                  </span>
                  <span className="truncate">{toc.title}</span>
                </button>
              ))}

              {/* Conclusion link */}
              {document.conclusion && (
                <button
                  type="button"
                  onClick={() => scrollToSection('sec-conclusion')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    activeTocId === 'sec-conclusion'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span className="truncate">종합 결론 및 로드맵</span>
                </button>
              )}
            </nav>
          </div>

          {/* Document Info Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3 text-slate-600">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              문서 정보
            </h4>
            <div className="space-y-1.5">
              <div>
                <span className="font-semibold text-slate-700">작성 목적: </span>
                <span className="text-slate-600">{document.purpose}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">대상 독자: </span>
                <span className="text-slate-600">{document.targetAudience}</span>
              </div>
              {document.keywords?.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700">핵심 키워드: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.keywords.map(k => (
                      <span key={k} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Document Paper View */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900 text-white">
                {document.customField || document.field}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                {document.customDocumentType || document.documentType}
              </span>
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(document.metadata.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {document.title}
            </h1>
            {document.subtitle && (
              <p className="mt-2 text-base text-slate-600 font-medium leading-relaxed">
                {document.subtitle}
              </p>
            )}
          </div>

          {/* Executive Summary (경영진 요약) */}
          <div id="sec-exec-summary" className="p-5 sm:p-6 rounded-2xl bg-blue-50/50 border border-blue-200 scroll-mt-28">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-3">
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
              <span>[경영진 요약] Executive Summary</span>
            </div>
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {document.executiveSummary}
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-10">
            {document.sections.map((section, idx) => (
              <article
                key={section.id || idx}
                id={section.id || `section-${idx}`}
                className="scroll-mt-28 group relative rounded-xl p-2 -mx-2 hover:bg-slate-50/50 transition-colors"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold shrink-0">
                      {section.sectionNumber}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Controls */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopySection(section)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                      title="섹션 복사"
                    >
                      {copiedSectionId === section.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copiedSectionId === section.id ? '복사됨' : '복사'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSection(section)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                      title="AI로 섹션 재작성/보강 또는 직접 수정"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px]">AI 수정 / 보강</span>
                    </button>
                  </div>
                </div>

                {/* Summary Guideline Badge */}
                {section.summaryGuideline && (
                  <div className="mb-4 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{section.summaryGuideline}</span>
                  </div>
                )}

                {/* Section Content */}
                <div className="text-slate-800 text-[15px] leading-relaxed">
                  <MarkdownRenderer content={section.content} />
                </div>
              </article>
            ))}
          </div>

          {/* Conclusion / Roadmap */}
          {document.conclusion && (
            <div id="sec-conclusion" className="p-6 rounded-2xl bg-slate-900 text-slate-100 scroll-mt-28 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                종합 결론 및 향후 추진 로드맵
              </h3>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {document.conclusion}
              </div>
            </div>
          )}

          {/* Bottom Actions Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onNewDocument}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              새로운 전문 문서 작성
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                문서 다운로드 / 내보내기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Editor & AI Polish Modal */}
      <SectionEditorModal
        document={document}
        section={editingSection}
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        onUpdateSection={handleUpdateSectionContent}
      />

      {/* Export Modal */}
      <ExportModal
        document={document}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
