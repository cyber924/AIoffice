import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Tag,
  FileText,
  Presentation as PresentationIcon,
  Table as TableIcon,
  FileCheck2,
  Layers,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketProductType, MarketItem } from '../../types/market';
import { MARKET_CATEGORIES, publishToMarket } from '../../services/marketService';

interface MarketPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: {
    id: string;
    productType: MarketProductType;
    title: string;
    subtitle?: string;
    summary?: string;
    category?: string;
    content: any;
  };
  currentUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
  } | null;
  onPublishedSuccess?: (publishedItem: MarketItem) => void;
}

export const MarketPublishModal: React.FC<MarketPublishModalProps> = ({
  isOpen,
  onClose,
  documentData,
  currentUser,
  onPublishedSuccess,
}) => {
  const [title, setTitle] = useState(documentData?.title || '');
  const [subtitle, setSubtitle] = useState(documentData?.subtitle || '');
  const [summary, setSummary] = useState(
    documentData?.summary ||
      (documentData?.content?.executiveSummary ||
        documentData?.content?.businessDescription ||
        documentData?.content?.purpose ||
        '실무에 즉시 적용 가능한 최고 수준의 비즈니스 전문 템플릿입니다.')
  );
  const [category, setCategory] = useState(documentData?.category || 'management');
  const [isFree, setIsFree] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([
    '비즈니스',
    documentData?.productType === 'presentation'
      ? 'PPT덱'
      : documentData?.productType === 'excel'
      ? '엑셀모델'
      : documentData?.productType === 'form_studio'
      ? '공문서식'
      : '사업계획서',
  ]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedItemResult, setPublishedItemResult] = useState<MarketItem | null>(null);

  useEffect(() => {
    if (isOpen && documentData) {
      setTitle(documentData.title || '');
      setSubtitle(documentData.subtitle || '');
      setSummary(
        documentData.summary ||
          (documentData.content?.executiveSummary ||
            documentData.content?.businessDescription ||
            documentData.content?.purpose ||
            '실무에 즉시 적용 가능한 최고 수준의 비즈니스 전문 템플릿입니다.')
      );
      setCategory(documentData.category || 'management');
      setIsFree(true);
      setPublishSuccess(false);
      setPublishedItemResult(null);
      setTags([
        '비즈니스',
        documentData.productType === 'presentation'
          ? 'PPT덱'
          : documentData.productType === 'excel'
          ? '엑셀모델'
          : documentData.productType === 'form_studio'
          ? '공문서식'
          : '사업계획서',
      ]);
    }
  }, [isOpen, documentData]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!title.trim() || !summary.trim()) {
      alert('문서 제목과 요약 설명을 입력해 주세요.');
      return;
    }

    setIsPublishing(true);
    try {
      const marketItemId = `market-${documentData.productType}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
      
      const gradients = [
        'from-indigo-600 via-purple-600 to-pink-600',
        'from-blue-600 via-cyan-600 to-teal-500',
        'from-emerald-600 to-teal-700',
        'from-amber-600 via-orange-600 to-red-600',
        'from-violet-600 via-purple-600 to-indigo-700',
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const itemToPublish = await publishToMarket({
        id: marketItemId,
        originalDocId: documentData.id,
        productType: documentData.productType,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        summary: summary.trim(),
        category,
        authorId: currentUser?.uid || 'anonymous_user',
        authorName: currentUser?.displayName || currentUser?.email?.split('@')[0] || '공식 크리에이터',
        authorEmail: currentUser?.email || '',
        isFree,
        price: isFree ? 0 : 1000,
        tags,
        contentData: documentData.content,
        coverGradient: randomGradient,
      });

      setPublishedItemResult(itemToPublish);
      setPublishSuccess(true);
      if (onPublishedSuccess) {
        onPublishedSuccess(itemToPublish);
      }
    } catch (err: any) {
      console.error('Failed to publish to market:', err);
      alert('마켓 발행에 실패했습니다: ' + (err?.message || '네트워크 오류'));
    } finally {
      setIsPublishing(false);
    }
  };

  const getProductIcon = () => {
    switch (documentData.productType) {
      case 'presentation':
        return <PresentationIcon className="w-5 h-5 text-purple-400" />;
      case 'excel':
        return <TableIcon className="w-5 h-5 text-emerald-400" />;
      case 'form_studio':
        return <FileCheck2 className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getProductTypeLabel = () => {
    switch (documentData.productType) {
      case 'presentation':
        return '프레젠테이션 PPT';
      case 'excel':
        return '엑셀 스프레드시트';
      case 'form_studio':
        return '표준 비즈니스 공문서';
      default:
        return '전문 비즈니스 문서';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                오픈 마켓플레이스에 문서 발행
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30">
                  Marketplace
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                작성하신 문서를 마켓에 공개하고 다른 유저들과 공유해보세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {publishSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black text-white">마켓플레이스 발행 완료! 🎉</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                문서가 <strong className="text-indigo-400 font-bold">오픈 마켓플레이스</strong>에 성공적으로 등록되었습니다. 모든 사용자가 웹진 뷰어로 열람하고 다운로드할 수 있습니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left max-w-md mx-auto text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>발행 문서:</span>
                <span className="font-semibold text-slate-200">{title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>가격 정책:</span>
                <span className={`font-bold ${isFree ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isFree ? '무료 (0원)' : '유료 (1,000원)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>발행 작성자:</span>
                <span className="text-indigo-300 font-medium">
                  {currentUser?.displayName || currentUser?.email || '나의 계정'}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Target Document Info Pill */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="p-2 rounded-lg bg-slate-800">{getProductIcon()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  {getProductTypeLabel()}
                </div>
                <div className="text-sm font-semibold text-slate-200 truncate">
                  {documentData.title}
                </div>
              </div>
            </div>

            {/* Price Selection (0원 무료 vs 1,000원 유료) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>가격 정책 설정 (표준화 모델)</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  현재 서비스 표준화를 위해 유료 문서는 1,000원으로 고정됩니다.
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Free Option */}
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isFree
                      ? 'bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      무료 발행
                    </span>
                    {isFree && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <div className="text-xl font-black text-emerald-400">0 원</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      비로그인 사용자도 자유롭게 다운로드 가능 (바이럴 및 유입 극대화)
                    </div>
                  </div>
                </button>

                {/* Paid Option (1,000 KRW) */}
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    !isFree
                      ? 'bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      유료 프리미엄
                    </span>
                    {!isFree && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div>
                    <div className="text-xl font-black text-indigo-300">1,000 원</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      1장 무료 미리보기 + 블러 마스킹 제공 (고품질 전문 템플릿 추천)
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Document Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                마켓 노출 제목 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026 Series A 투자유치용 글로벌 스탠다드 IR 피치덱"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Document Subtitle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                부제목 또는 핵심 슬로건
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="예: 실리콘밸리 & 국내 탑티어 VC 통과 기준 10개 핵심 슬라이드"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                문서 카테고리 분야 <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 outline-none transition-all cursor-pointer"
              >
                {MARKET_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                마켓 요약 설명 (웹진 인트로 소개문) <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="이 문서가 제공하는 핵심 가치와 활용 용도를 간략히 설명해 주세요."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                검색 태그 키워드
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="태그 입력 후 추가 (예: 스타트업, IR, 계약서)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-indigo-200"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isPublishing}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>마켓 발행 중...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>즉시 마켓에 발행하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
