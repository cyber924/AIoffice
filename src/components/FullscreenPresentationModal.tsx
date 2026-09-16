import React, { useState, useEffect } from 'react';
import { PresentationDocument } from '../types/presentation';
import { SlideCanvas } from './SlideCanvas';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Mic,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface FullscreenPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: PresentationDocument;
  initialSlideIndex?: number;
}

export const FullscreenPresentationModal: React.FC<FullscreenPresentationModalProps> = ({
  isOpen,
  onClose,
  presentation,
  initialSlideIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [showNotes, setShowNotes] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const rawSlides = Array.isArray(presentation?.slides) && presentation.slides.length > 0
    ? presentation.slides
    : [];

  useEffect(() => {
    setCurrentIndex(initialSlideIndex);
  }, [initialSlideIndex, isOpen]);

  // Presentation Timer
  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || rawSlides.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, rawSlides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, rawSlides.length, onClose]);

  if (!isOpen || rawSlides.length === 0) return null;

  const currentSlide = rawSlides[currentIndex] || rawSlides[0];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none overflow-hidden">
      {/* Top Floating Control Bar (Auto subtle on hover) */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-mono backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          <span className="text-xs font-medium text-white/70 hidden sm:inline truncate max-w-sm">
            {presentation.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all ${
              showNotes ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>발표자 노트 (N)</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-md"
            title="발표 종료 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-0">
        <div className="w-full max-w-6xl max-h-full aspect-video">
          {currentSlide && (
            <SlideCanvas
              slide={currentSlide}
              theme={presentation.theme}
              totalSlides={rawSlides.length}
              companyName={presentation.company}
              presentationTitle={presentation.title}
            />
          )}
        </div>
      </div>

      {/* Speaker Notes Overlay Panel */}
      {showNotes && currentSlide && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs text-slate-200 z-30 animate-in slide-in-from-bottom-4 duration-150">
          <div className="flex items-center justify-between mb-1.5 text-indigo-400 font-bold">
            <div className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              <span>슬라이드 {currentSlide.slideNumber}번 발표 대본 (Speaker Script)</span>
            </div>
            <span className="text-[10px] text-slate-400">키보드 'N'으로 토글</span>
          </div>
          <p className="leading-relaxed text-slate-100 max-h-32 overflow-y-auto pr-1">
            {currentSlide.speakerNotes || '해당 슬라이드에 등록된 스피커 노트가 없습니다.'}
          </p>
        </div>
      )}

      {/* Bottom Navigation Toolbar */}
      <div className="h-16 px-6 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent z-20">
        <div className="text-xs text-white/60 font-mono">
          방향키 ← → 또는 Space 키로 슬라이드 이동
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-bold font-mono px-3 py-1 rounded-full bg-white/10">
            {currentIndex + 1} / {rawSlides.length}
          </span>

          <button
            onClick={() =>
              setCurrentIndex((prev) => Math.min(prev + 1, rawSlides.length - 1))
            }
            disabled={currentIndex === rawSlides.length - 1}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-white/60 font-mono hidden sm:block">
          Esc : 나가기
        </div>
      </div>
    </div>
  );
};
