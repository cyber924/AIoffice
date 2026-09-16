import React, { useState, useEffect } from 'react';
import {
  PresentationDocument,
  SlideItem,
  PresentationThemeId,
  SlideLayoutType,
} from '../types/presentation';
import { SlideCanvas } from './SlideCanvas';
import { SlideRegenerateModal } from './SlideRegenerateModal';
import { FullscreenPresentationModal } from './FullscreenPresentationModal';
import { exportToPptx } from '../services/pptxExportService';
import { PRESENTATION_THEMES } from '../constants/presentationThemes';
import {
  Download,
  Play,
  Sparkles,
  Palette,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Printer,
  Save,
  Mic,
  ArrowLeft,
  Share2,
  Check,
  Edit3,
  Upload,
} from 'lucide-react';

import confetti from 'canvas-confetti';

interface PresentationViewerProps {
  presentation: PresentationDocument;
  onUpdatePresentation: (updated: PresentationDocument) => void;
  onBackToForm: () => void;
  onRegenerateSlide: (params: {
    presentationTitle: string;
    slide: SlideItem;
    requestedLayout?: SlideLayoutType;
    customPrompt?: string;
  }) => Promise<SlideItem>;
  onPublishToMarket?: () => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  presentation,
  onUpdatePresentation,
  onBackToForm,
  onRegenerateSlide,
  onPublishToMarket,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const rawSlides = Array.isArray(presentation?.slides) && presentation.slides.length > 0
    ? presentation.slides
    : [
        {
          id: 'slide_default_1',
          slideNumber: 1,
          layout: 'title' as SlideLayoutType,
          category: 'EXECUTIVE PRESENTATION',
          title: presentation?.title || '비즈니스 프레젠테이션',
          subtitle: presentation?.subtitle || 'AI 기반 스마트 비즈니스 덱',
          keyTakeaway: '핵심 전략과 비전을 명확하게 제시합니다.',
          showImage: true,
          content: {},
          speakerNotes: '슬라이드 발표 대본입니다.',
        }
      ];

  const currentSlide = rawSlides[activeSlideIndex] || rawSlides[0];

  useEffect(() => {
    if (currentSlide) {
      setEditedNotes(currentSlide.speakerNotes || '');
      setIsEditingNotes(false);
    }
  }, [activeSlideIndex, currentSlide]);

  // Handle Theme Change
  const handleThemeChange = (newTheme: PresentationThemeId) => {
    onUpdatePresentation({
      ...presentation,
      theme: newTheme,
      slides: rawSlides,
      metadata: {
        ...presentation.metadata,
        updatedAt: Date.now(),
      },
    });
  };

  // Handle PPTX Download
  const handleExportPptx = async () => {
    try {
      setIsExporting(true);
      await exportToPptx({
        ...presentation,
        slides: rawSlides,
      });
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      alert('PPTX 파일 내보내기 중 오류가 발생했습니다: ' + (err.message || err));
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Print (Browser Print to PDF)
  const handlePrint = () => {
    window.print();
  };

  // Handle Slide AI Regeneration
  const handleRegenerateCurrentSlide = async (params: {
    requestedLayout?: SlideLayoutType;
    customPrompt?: string;
  }) => {
    const updatedSlide = await onRegenerateSlide({
      presentationTitle: presentation?.title || '비즈니스 프레젠테이션',
      slide: currentSlide,
      requestedLayout: params.requestedLayout,
      customPrompt: params.customPrompt,
    });

    const newSlides = [...rawSlides];
    newSlides[activeSlideIndex] = updatedSlide;

    onUpdatePresentation({
      ...presentation,
      slides: newSlides,
      metadata: {
        ...presentation.metadata,
        updatedAt: Date.now(),
      },
    });
  };

  // Handle Duplicate Slide
  const handleDuplicateSlide = () => {
    if (!currentSlide) return;
    const newSlide: SlideItem = {
      ...currentSlide,
      id: 'slide_' + Date.now(),
      slideNumber: activeSlideIndex + 2,
      title: `${currentSlide.title} (복사본)`,
    };

    const newSlides = [...rawSlides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);

    // Re-number slides
    const renumbered = newSlides.map((s, idx) => ({
      ...s,
      slideNumber: idx + 1,
    }));

    onUpdatePresentation({
      ...presentation,
      slides: renumbered,
    });
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  // Handle Delete Slide
  const handleDeleteSlide = (index: number) => {
    if (rawSlides.length <= 1) {
      alert('최소 1장의 슬라이드는 유지되어야 합니다.');
      return;
    }

    const newSlides = rawSlides.filter((_, idx) => idx !== index);
    const renumbered = newSlides.map((s, idx) => ({
      ...s,
      slideNumber: idx + 1,
    }));

    onUpdatePresentation({
      ...presentation,
      slides: renumbered,
    });

    if (activeSlideIndex >= renumbered.length) {
      setActiveSlideIndex(renumbered.length - 1);
    }
  };

  // Handle Save Notes
  const handleSaveNotes = () => {
    const newSlides = [...rawSlides];
    newSlides[activeSlideIndex] = {
      ...currentSlide,
      speakerNotes: editedNotes,
    };
    onUpdatePresentation({
      ...presentation,
      slides: newSlides,
    });
    setIsEditingNotes(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden select-none">
      {/* Top Action Header */}
      <div className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToForm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>새 프레젠테이션</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 max-w-md">
            <span className="text-xs font-bold text-slate-900 truncate">
              {presentation.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
              {presentation.slides.length} Slides
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={presentation.theme}
              onChange={(e) => handleThemeChange(e.target.value as PresentationThemeId)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {(Object.keys(PRESENTATION_THEMES) as PresentationThemeId[]).map((tKey) => (
                <option key={tKey} value={tKey}>
                  {PRESENTATION_THEMES[tKey].name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Slide Regenerate Button */}
          <button
            onClick={() => setIsRegenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">AI 슬라이드 수정</span>
          </button>

          {/* Fullscreen Presentation Play Button */}
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
            title="전체화면 발표 모드 (F5)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>슬라이드 쇼</span>
          </button>

          {/* Market Publish */}
          {onPublishToMarket && (
            <button
              onClick={onPublishToMarket}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="오픈 마켓플레이스에 PPT 발행하기"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>마켓 발행</span>
            </button>
          )}

          {/* Export to PPTX */}
          <button
            onClick={handleExportPptx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'PPTX 생성 중...' : '.PPTX 다운로드'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Thumbnails Sidebar */}
        <div className="w-48 sm:w-60 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              슬라이드 목록 ({rawSlides.length})
            </span>
          </div>

          {rawSlides.map((slide, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <div
                key={slide.id || idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`group relative rounded-xl p-2 cursor-pointer transition-all border ${
                  isActive
                    ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1 px-0.5">
                  <span className={isActive ? 'text-indigo-600' : ''}>#{idx + 1}</span>
                  <span className="truncate max-w-[100px] text-slate-400 font-normal">
                    {slide.category || slide.layout}
                  </span>
                </div>

                {/* Mini Canvas Thumbnail */}
                <div className="w-full aspect-video rounded-lg overflow-hidden pointer-events-none transform origin-top-left">
                  <SlideCanvas
                    slide={slide}
                    theme={presentation?.theme || 'dark_navy'}
                    totalSlides={rawSlides.length}
                    companyName={presentation?.company}
                    isThumbnail={true}
                  />
                </div>

                {/* Hover Delete Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(idx);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-md bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 hover:bg-rose-100 transition-opacity"
                  title="슬라이드 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Center & Right Presentation Display Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-200/60 p-4 sm:p-6 lg:p-8">
          {/* Main Slide Viewer Frame */}
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
            <div className="w-full max-w-5xl aspect-video max-h-full drop-shadow-2xl transition-all">
              {currentSlide && (
                <SlideCanvas
                  slide={currentSlide}
                  theme={presentation?.theme || 'dark_navy'}
                  totalSlides={rawSlides.length}
                  companyName={presentation?.company}
                  presentationTitle={presentation?.title}
                />
              )}
            </div>
          </div>

          {/* Slide Navigation & Tool Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Left Page Stepper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
                disabled={activeSlideIndex === 0}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                title="이전 슬라이드 (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-700 font-mono px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                {activeSlideIndex + 1} / {rawSlides.length}
              </span>

              <button
                onClick={() =>
                  setActiveSlideIndex((prev) =>
                    Math.min(prev + 1, rawSlides.length - 1)
                  )
                }
                disabled={activeSlideIndex === rawSlides.length - 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                title="다음 슬라이드 (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleDuplicateSlide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>슬라이드 복제</span>
              </button>
            </div>

            {/* Middle Quick Visual & Image Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh / Change Image */}
              <button
                onClick={() => {
                  const randomSeed = Math.random().toString(36).substring(2, 7);
                  const isCover = activeSlideIndex === 0;
                  const newImageUrl = isCover
                    ? `https://picsum.photos/seed/biz_cov_${randomSeed}/1200/800`
                    : `https://picsum.photos/seed/biz_sld_${activeSlideIndex + 1}_${randomSeed}/600/400`;

                  const newSlides = [...rawSlides];
                  newSlides[activeSlideIndex] = {
                    ...currentSlide,
                    imageUrl: newImageUrl,
                    showImage: true,
                  };
                  onUpdatePresentation({
                    ...presentation,
                    slides: newSlides,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                title="이 슬라이드의 비주얼 이미지 새로고침"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>이미지 교체</span>
              </button>

              {/* Quick AI Refine Modal */}
              <button
                onClick={() => setIsRegenerateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-100 shadow-2xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>레이아웃/내용 재작성</span>
              </button>
            </div>

            {/* Right Notes Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNotesOpen(!isNotesOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs cursor-pointer ${
                  isNotesOpen
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>발표자 스피커 노트 {isNotesOpen ? '접기' : '열기'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Speaker Notes Drawer */}
          {isNotesOpen && currentSlide && (
            <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    슬라이드 #{activeSlideIndex + 1} 실전 발표 대본 (Speaker Script & Notes)
                  </span>
                </div>

                <div>
                  {isEditingNotes ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        <Check className="w-3 h-3" />
                        <span>대본 저장</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>대본 수정</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditingNotes ? (
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed max-h-24 overflow-y-auto">
                  {currentSlide.speakerNotes || '작성된 발표자 노트가 없습니다.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Slide Regenerate Modal */}
      <SlideRegenerateModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        slide={currentSlide}
        presentationTitle={presentation.title}
        onRegenerate={handleRegenerateCurrentSlide}
      />

      {/* Fullscreen Presentation Modal */}
      <FullscreenPresentationModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        presentation={presentation}
        initialSlideIndex={activeSlideIndex}
      />
    </div>
  );
};
