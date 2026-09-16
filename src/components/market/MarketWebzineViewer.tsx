import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  Download,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  BookOpen,
  Calendar,
  User,
  Eye,
  Layers,
  FileText,
  Presentation as PresentationIcon,
  Table as TableIcon,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  DollarSign,
  Gift,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketItem } from '../../types/market';
import {
  incrementMarketViewCount,
  incrementMarketDownloadCount,
  incrementMarketRemixCount
} from '../../services/marketService';
import { downloadMarketItemNativeFile } from '../../services/marketExportService';

interface MarketWebzineViewerProps {
  item: MarketItem;
  currentUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
  } | null;
  onBack: () => void;
  onRemixToStudio: (item: MarketItem) => void;
  onRequireAuth?: () => void;
}

export const MarketWebzineViewer: React.FC<MarketWebzineViewerProps> = ({
  item,
  currentUser,
  onBack,
  onRemixToStudio,
  onRequireAuth,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [isPurchased, setIsPurchased] = useState(item.isFree); // Free items are automatically accessible
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showGuestBonusModal, setShowGuestBonusModal] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeExcelSheetIndex, setActiveExcelSheetIndex] = useState(0);
  const [showAuditReport, setShowAuditReport] = useState(false);

  useEffect(() => {
    // Increment view count on mount
    incrementMarketViewCount(item.id);

    // Update URL with deep link
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('mode', 'market');
    currentUrl.searchParams.set('docId', item.id);
    window.history.pushState({}, '', currentUrl.toString());

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [item.id]);

  const handleCopyLink = () => {
    const directUrl = `${window.location.origin}/?mode=market&docId=${item.id}`;
    navigator.clipboard.writeText(directUrl);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2500);
  };

  const handleLike = () => {
    if (!isLiked) {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    } else {
      setLikeCount((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const getFormatExtensionLabel = () => {
    switch (item.productType) {
      case 'excel':
        return 'Excel (.xlsx)';
      case 'presentation':
        return 'PowerPoint (.pptx)';
      case 'form_studio':
      case 'doc':
      default:
        return 'Word (.docx)';
    }
  };

  const handleDownload = async () => {
    if (!item.isFree && !isPurchased) {
      setIsPurchaseModalOpen(true);
      return;
    }

    try {
      setIsDownloading(true);
      incrementMarketDownloadCount(item.id);

      const result = await downloadMarketItemNativeFile(item);
      if (!result.success) {
        alert(result.error || '다운로드 중 오류가 발생했습니다.');
        return;
      }

      // If guest downloaded free document, show welcome bonus funnel modal!
      if (!currentUser) {
        setShowGuestBonusModal(true);
      } else {
        alert(`🎉 ${getFormatExtensionLabel()} 파일 다운로드가 완료되었습니다!`);
      }
    } catch (err: any) {
      console.error('File export error:', err);
      alert('파일 생성 및 다운로드 중 문제가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExecutePurchase = async () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        alert('유료 문서를 결제/소장하려면 로그인이 필요합니다.');
      }
      setIsPurchaseModalOpen(false);
      return;
    }

    setIsPurchasing(true);
    // Simulate instantaneous standard 1,000 KRW micro-transaction
    setTimeout(() => {
      setIsPurchased(true);
      setIsPurchasing(false);
      setIsPurchaseModalOpen(false);
      alert('🎉 1,000원 결제 완료! 모든 본문 열람 및 원본 다운로드 권한이 즉시 잠금 해제되었습니다.');
    }, 800);
  };

  const handleRemix = () => {
    if (!item.isFree && !isPurchased) {
      setIsPurchaseModalOpen(true);
      return;
    }
    incrementMarketRemixCount(item.id);
    onRemixToStudio(item);
  };

  const getFormatBadge = () => {
    switch (item.productType) {
      case 'presentation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <PresentationIcon className="w-3.5 h-3.5" />
            16:9 프레젠테이션 슬라이드 덱
          </span>
        );
      case 'excel':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <TableIcon className="w-3.5 h-3.5" />
            스마트 재무/수식 엑셀 모델
          </span>
        );
      case 'form_studio':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <FileCheck2 className="w-3.5 h-3.5" />
            표준 결재/계약 행정 공문서
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <FileText className="w-3.5 h-3.5" />
            엔터프라이즈 비즈니스 전략 기획서
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Toast Notification for Link Copy */}
      <AnimatePresence>
        {showCopyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 border border-indigo-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>독립 웹진 주소가 클립보드에 복사되었습니다!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>마켓플레이스 목록으로</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-800 cursor-pointer"
              title="독립 URL 복사"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">독립 URL 공유</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isLiked
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={handleRemix}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>내 작업실로 복제 (AI 수정)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Magazine Cover Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Badges & Metadata */}
          <div className="flex flex-wrap items-center gap-2.5">
            {getFormatBadge()}

            {item.isFree ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                무료 열람/다운로드 (0원)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                표준 프리미엄 1,000원
              </span>
            )}

            {item.isStaffPick && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                <Award className="w-3 h-3" />
                에디터 추천 Pick
              </span>
            )}

            {item.isAudited && typeof item.auditScore === 'number' && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 text-amber-300 text-xs font-black border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI 품질 검수 {item.auditScore}점 {item.auditScore >= 95 ? '• 마스터 인증' : item.auditScore >= 90 ? '• 공식 인증' : ''}</span>
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            {item.title}
          </h1>

          {/* Subtitle */}
          {item.subtitle && (
            <p className="text-base sm:text-xl text-slate-300 font-medium leading-relaxed">
              {item.subtitle}
            </p>
          )}

          {/* Author & Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                {item.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  <span>{item.authorName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  발행
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                조회 {item.viewCount + 1}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                다운로드 {item.downloadCount}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Remix {item.remixCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Webzine Reader Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Executive Summary Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/20 shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            웹진 에디토리얼 개요 (Executive Summary)
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {item.summary}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/80">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Quality Audit Verdict Card */}
        {item.isAudited && typeof item.auditScore === 'number' && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20 shrink-0">
                  {item.auditScore}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span>AI 실무 품질 검수 완료</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      {item.auditScore >= 95 ? '마스터 인증' : '공식 품질 인증'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {item.auditReport?.summary || '오피스 실무 표준 및 형식 규격 자동화 검증을 통과한 신뢰 문서입니다.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAuditReport(!showAuditReport)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>{showAuditReport ? '검수 세부항목 접기' : '검수 세부 리포트 확인'}</span>
                {showAuditReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Collapsible Detailed Report */}
            {showAuditReport && (
              <div className="pt-4 border-t border-indigo-500/20 space-y-4">
                {/* 4 Category Score Bars */}
                {item.auditReport?.categoryScores && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: '구조적 완성도', score: item.auditReport.categoryScores.structure },
                      { label: '실무 활용성', score: item.auditReport.categoryScores.usability },
                      { label: '법적/규정 준수', score: item.auditReport.categoryScores.compliance },
                      { label: '데이터 정합성', score: item.auditReport.categoryScores.accuracy },
                    ].map((cat, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">{cat.label}</span>
                          <span className="text-amber-300 font-black font-mono">{cat.score}점</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full"
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strengths & Improvements */}
                {item.auditReport && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {item.auditReport.strengths && item.auditReport.strengths.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>AI가 분석한 문서의 핵심 강점</span>
                        </h4>
                        <ul className="space-y-1 text-slate-300">
                          {item.auditReport.strengths.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.auditReport.improvements && item.auditReport.improvements.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
                        <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>품질 개선 권장 팁</span>
                        </h4>
                        <ul className="space-y-1 text-slate-300">
                          {item.auditReport.improvements.map((r, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-400">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Content View depending on Product Type */}
        <div className="space-y-8">
          {item.productType === 'presentation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PresentationIcon className="w-5 h-5 text-purple-400" />
                  프레젠테이션 슬라이드 갤러리
                </h3>
                <span className="text-xs text-slate-400">
                  총 {item.contentData?.slides?.length || 0}장 구성
                </span>
              </div>

              {/* Presentation Slide Carousel / Preview */}
              {item.contentData?.slides && item.contentData.slides.length > 0 && (
                <div className="space-y-4">
                  {/* Active Slide Full Preview */}
                  <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-3">
                      <span className="font-bold text-indigo-400">
                        {item.contentData.slides[activeSlideIndex]?.category || 'SLIDE'}
                      </span>
                      <span>
                        Slide {activeSlideIndex + 1} / {item.contentData.slides.length}
                      </span>
                    </div>

                    <div className="my-auto space-y-4">
                      <h4 className="text-lg sm:text-2xl font-black text-white">
                        {item.contentData.slides[activeSlideIndex]?.title}
                      </h4>
                      {item.contentData.slides[activeSlideIndex]?.subtitle && (
                        <p className="text-sm text-slate-300">
                          {item.contentData.slides[activeSlideIndex]?.subtitle}
                        </p>
                      )}
                      {item.contentData.slides[activeSlideIndex]?.keyTakeaway && (
                        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
                          💡 <strong>핵심 가치:</strong>{' '}
                          {item.contentData.slides[activeSlideIndex]?.keyTakeaway}
                        </div>
                      )}
                    </div>

                    {/* Speaker Notes */}
                    {item.contentData.slides[activeSlideIndex]?.speakerNotes && (
                      <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        🎤 <strong>발표 대본:</strong>{' '}
                        {item.contentData.slides[activeSlideIndex]?.speakerNotes}
                      </div>
                    )}
                  </div>

                  {/* Slide Thumbnails Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {item.contentData.slides.map((slide: any, idx: number) => {
                      const isLocked = !item.isFree && !isPurchased && idx >= 2;
                      return (
                        <button
                          key={idx}
                          disabled={isLocked}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                            activeSlideIndex === idx
                              ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="text-[10px] font-bold text-slate-400 mb-1">
                            Page {idx + 1}
                          </div>
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {slide.title}
                          </div>
                          {isLocked && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-amber-400">
                              <Lock className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {item.productType === 'excel' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-emerald-400" />
                  재무 & 엑셀 스프레드시트 모델 미리보기
                </h3>
                <span className="text-xs text-slate-400">
                  {item.contentData?.currency || 'KRW'} 기준 연동
                </span>
              </div>

              {/* KPI Cards */}
              {item.contentData?.kpis && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {item.contentData.kpis.map((kpi: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                    >
                      <div className="text-xs text-slate-400">{kpi.label}</div>
                      <div className="text-xl font-black text-emerald-400">{kpi.value}</div>
                      <div className="text-[11px] text-slate-500">{kpi.change || kpi.subValue}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sheet Table Preview */}
              {item.contentData?.sheets && item.contentData.sheets.length > 0 && (
                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                  {/* Sheet Tabs */}
                  <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
                    {item.contentData.sheets.map((sheet: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveExcelSheetIndex(idx)}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                          activeExcelSheetIndex === idx
                            ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sheet.name}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto p-4">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          {item.contentData.sheets[activeExcelSheetIndex]?.columns?.map(
                            (col: any, idx: number) => (
                              <th key={idx} className="py-2.5 px-3 font-semibold">
                                {col.header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {item.contentData.sheets[activeExcelSheetIndex]?.rows?.map(
                          (row: any, rIdx: number) => (
                            <tr
                              key={rIdx}
                              className={row.isTotal ? 'bg-slate-800/40 font-bold' : ''}
                            >
                              {row.cells?.map((cell: any, cIdx: number) => (
                                <td key={cIdx} className="py-2 px-3 text-slate-300">
                                  {typeof cell.value === 'number'
                                    ? cell.value.toLocaleString()
                                    : String(cell.value || '')}
                                </td>
                              ))}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {item.productType === 'form_studio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  표준 행정 및 계약 양식 뷰어
                </h3>
                <span className="text-xs text-slate-400">
                  공문서 관리번호: {item.contentData?.docNumber || 'HR-2026-STANDARD'}
                </span>
              </div>

              {/* Form Layout Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div className="text-center border-b border-slate-800 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {item.contentData?.title || item.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    시행일자: {item.contentData?.draftDate || '2026년 01월 01일'}
                  </p>
                </div>

                {/* Approval Line Simulation */}
                {item.contentData?.approvalLine && (
                  <div className="flex justify-end">
                    <div className="inline-flex border border-slate-700 rounded-lg overflow-hidden text-center text-xs">
                      {item.contentData.approvalLine.map((line: any, idx: number) => (
                        <div key={idx} className="border-r border-slate-700 last:border-r-0">
                          <div className="bg-slate-800 px-3 py-1 font-bold text-slate-400">
                            {line.role}
                          </div>
                          <div className="px-3 py-2 text-indigo-400 font-semibold">
                            {line.name} (승인)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Sections */}
                <div className="space-y-4">
                  {item.contentData?.sections?.map((sec: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <h4 className="text-sm font-bold text-indigo-300 mb-2">{sec.title}</h4>
                      {sec.type === 'text' && (
                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                          {sec.content}
                        </p>
                      )}
                      {sec.type === 'bullet_list' && sec.items && (
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                          {sec.items.map((it: string, iIdx: number) => (
                            <li key={iIdx}>{it}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {item.productType === 'doc' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  문서 본문 상세 열람
                </h3>
              </div>

              <div className="space-y-4">
                {item.contentData?.sections?.map((sec: any, idx: number) => {
                  const isLocked = !item.isFree && !isPurchased && idx >= 1;
                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden ${
                        isLocked ? 'blur-xs select-none' : ''
                      }`}
                    >
                      <h4 className="text-base font-bold text-white">{sec.title}</h4>
                      <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {sec.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Premium Blur Masking Banner (if item is Paid and Not Yet Purchased) */}
        {!item.isFree && !isPurchased && (
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-indigo-950/90 border-2 border-indigo-500/50 shadow-2xl text-center space-y-6 overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-2xl font-black text-white">
                🔒 프리미엄 전체 내용 및 원본 소장
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                현재 <strong>1페이지 맛보기 공개</strong> 상태입니다. 단 <strong>1,000원</strong>에 전체 슬라이드/수식 엑셀 원본 파일 및 AI 수정 권한을 즉시 잠금 해제하세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>1,000원에 즉시 소장하기</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom CTA Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm">마음에 드는 문서인가요?</h4>
            <p className="text-xs text-slate-400">
              내 작업실로 가져와 회사명과 세부 파라미터를 AI로 즉시 커스텀할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>
                {isDownloading
                  ? '파일 생성 중...'
                  : `${getFormatExtensionLabel()} ${item.isFree ? '무료 다운로드' : isPurchased ? '원본 다운로드' : '소장 다운로드'}`}
              </span>
            </button>

            <button
              onClick={handleRemix}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>내 작업실로 Remix</span>
            </button>
          </div>
        </div>
      </main>

      {/* Simulated Purchase Modal */}
      <AnimatePresence>
        {isPurchaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  프리미엄 문서 결제 및 소장
                </h3>
                <button
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400">선택 문서:</div>
                <div className="font-bold text-white text-sm">{item.title}</div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">결제 금액 (표준 단일가):</span>
                  <span className="text-lg font-black text-indigo-400">₩ 1,000 원</span>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>결제 즉시 영구 열람 및 원본 파일 무제한 다운로드 가능</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>내 작업실로 복제하여 AI 프롬프트 재작성 지원</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleExecutePurchase}
                  disabled={isPurchasing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPurchasing ? '결제 처리 중...' : '1,000원 결제 완료'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guest Welcome Bonus Modal (Conversion Funnel) */}
      <AnimatePresence>
        {showGuestBonusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-8 text-center text-slate-100 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
                <Gift className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  다운로드가 완료되었습니다! 🎉
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  지금 무료 회원가입하시면 마켓 내 모든 유료 프리미엄 문서를 결제할 수 있는 <strong className="text-amber-400 font-bold">3,000P 웰컴 보너스</strong>를 즉시 지급해 드립니다!
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowGuestBonusModal(false);
                    if (onRequireAuth) onRequireAuth();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  <span>3,000P 받고 3초 만에 무료 가입하기</span>
                </button>

                <button
                  onClick={() => setShowGuestBonusModal(false)}
                  className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  나중에 하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
