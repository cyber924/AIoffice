import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Filter,
  Copy,
  Check,
  ImageIcon,
  HardDrive,
  ExternalLink,
  Sparkles,
  Wand2,
  Image as ImageIcon2,
  AlertCircle,
  HelpCircle,
  FolderPlus,
} from 'lucide-react';
import { 
  PublicImageItem, 
  getPublicImages, 
  savePublicImage, 
  compressImageToDataUrl 
} from '../services/imageAssetService';

interface UserImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserImageGallery: React.FC<UserImageGalleryProps> = ({ isOpen, onClose }) => {
  const [images, setImages] = useState<PublicImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'gallery' | 'generate'>('gallery');

  // Generation States
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBase64, setGeneratedBase64] = useState<string | null>(null);
  
  // Save States
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedCategory, setGeneratedCategory] = useState<'cover' | 'chart' | 'related' | 'other'>('cover');
  const [generatedProduct, setGeneratedProduct] = useState<'doc' | 'presentation' | 'excel' | 'form' | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compression Preview Stats
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
    ratio: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await getPublicImages();
      setImages(data);
    } catch (err) {
      console.error('Failed to load user-facing image gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (img: PublicImageItem | { title: string, dataUrl: string, id: string }, type: 'markdown' | 'raw') => {
    const textToCopy = type === 'markdown' 
      ? `![${img.title}](${img.dataUrl})`
      : img.dataUrl;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(`${img.id}-${type}`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Preset chips for quick prompt creation
  const PRESET_PROMPTS = [
    { label: '🤖 AI 기획서 표지', text: 'A sleek, modern high-tech enterprise corporate headquarters at dusk, neon holographic artificial intelligence nodes floating, conceptual digital transformation illustration, 3D render' },
    { label: '📈 비즈니스 성장 차트', text: 'Abstract stylized 3D bar chart showing steep exponential growth trend, financial success concept, neon blue and emerald green hues, clean dark background, vector look' },
    { label: '🤝 글로벌 비즈니스 미팅', text: 'Professional business strategy meeting, executive team collaborating, holographic data visualization charts in the air, modern minimalist office, high contrast' },
    { label: '📋 결재선 프로세스 맵', text: 'Stylized 3D infographic workflow diagram illustrating a direct executive approval route, glowing path connecting steps, neon cyan and violet color palette' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg('프롬프트 내용을 입력해 주십시오.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedBase64(null);
    setCompressionStats(null);

    try {
      console.log('[AI Image Generator] Calling backend API...');
      const response = await fetch('/api/generate-image-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI 이미지 생성에 실패했습니다.');
      }

      const imageUrl = `data:image/png;base64,${data.base64}`;
      setGeneratedBase64(imageUrl);

      // Default title from prompt
      let cleanTitle = prompt.trim();
      if (cleanTitle.length > 25) {
        cleanTitle = cleanTitle.substring(0, 25) + '...';
      }
      setGeneratedTitle(`AI 생성: ${cleanTitle}`);

      // Auto-suggest category
      if (prompt.toLowerCase().includes('chart') || prompt.toLowerCase().includes('성장') || prompt.toLowerCase().includes('차트')) {
        setGeneratedCategory('chart');
      } else if (prompt.toLowerCase().includes('표지') || prompt.toLowerCase().includes('cover') || prompt.toLowerCase().includes('본사')) {
        setGeneratedCategory('cover');
      } else {
        setGeneratedCategory('related');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '서버 통신 실패 또는 타임아웃이 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedBase64) return;
    if (!generatedTitle.trim()) {
      setErrorMsg('에셋 타이틀명을 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Run our Canvas compression to strictly enforce < 200KB limits on Firestore individual docs!
      console.log('[AI Image Generator] Compressing generated image via Canvas pipeline...');
      const compressedUrl = await compressImageToDataUrl(generatedBase64);

      // Estimate compressed size
      const originalSizeKb = ((generatedBase64.length - 814) * 0.75 / 1024).toFixed(1);
      const compressedSizeKb = ((compressedUrl.length - 814) * 0.75 / 1024).toFixed(1);
      const ratio = (100 - (Number(compressedSizeKb) / Number(originalSizeKb)) * 100).toFixed(0);

      setCompressionStats({
        originalSize: `${originalSizeKb} KB`,
        compressedSize: `${compressedSizeKb} KB`,
        ratio: `${ratio}%`,
      });

      const assetId = 'ai-img-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

      // 2. Save public image
      await savePublicImage({
        id: assetId,
        title: generatedTitle.trim(),
        category: generatedCategory,
        productType: generatedProduct,
        dataUrl: compressedUrl,
      });

      setSuccessMsg(`공용 갤러리에 안전하게 등록 완료! (${compressedSizeKb}KB로 초고속 압축 가공됨)`);
      
      // Reset form states slightly
      setPrompt('');
      setGeneratedBase64(null);

      // Refresh public images
      await loadImages();

      // Go back to gallery tab
      setTimeout(() => {
        setActiveTab('gallery');
        setSuccessMsg(null);
        setCompressionStats(null);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('갤러리 보관 중 오류: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || img.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-white text-slate-800 shadow-2xl flex flex-col animate-slide-in border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <ImageIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <span>통합 비즈니스 이미지 에셋 센터</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  Firestore 200KB Safe
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">실무용 표지·차트·워킹 이미지 라이브러리 & 실시간 생성기</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <ImageIcon2 className="w-4 h-4" />
            <span>공용 에셋 갤러리</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span className="relative">
              AI 이미지 생성
              <span className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
            </span>
          </button>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'gallery' ? (
          <>
            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="필수 이미지 검색 (표지, 차트, 부서, 기안서 등)..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-semibold transition-colors"
                />
              </div>

              {/* Filters Row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {['all', 'cover', 'chart', 'related'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? '전체' : cat === 'cover' ? '표지' : cat === 'chart' ? '차트' : '본문'}
                    </button>
                  ))}
                </div>

                <span className="text-[10px] text-slate-400 font-bold">
                  검색결과: {filteredImages.length}개
                </span>
              </div>
            </div>

            {/* Body Image Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {loading ? (
                <div className="py-24 text-center text-slate-400 text-xs font-bold animate-pulse">
                  공용 이미지 저장소 쿼리 중...
                </div>
              ) : filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredImages.map((img) => {
                    const isMdCopied = copiedId === `${img.id}-markdown`;
                    const isRawCopied = copiedId === `${img.id}-raw`;
                    const sizeKb = ((img.dataUrl.length - 814) * 0.75 / 1024).toFixed(1);

                    return (
                      <div 
                        key={img.id}
                        className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          {/* Interactive Preview Container */}
                          <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-150 flex items-center justify-center">
                            <img 
                              src={img.dataUrl} 
                              alt={img.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                              <HardDrive className="w-2.5 h-2.5 text-indigo-400" />
                              <span>{sizeKb} KB</span>
                            </div>
                            {img.productType && (
                              <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                {img.productType === 'doc' ? '보고서' : img.productType === 'presentation' ? 'PPT' : img.productType === 'excel' ? '엑셀' : img.productType === 'form' ? '양식' : '공통'}
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                              {img.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-semibold">
                              <span>분류:</span>
                              <span className="text-indigo-600">{img.category === 'cover' ? '표지 일러스트' : img.category === 'chart' ? '데이터 차트' : '본문 삽화'}</span>
                              <span className="text-slate-300">|</span>
                              <span>등록일:</span>
                              <span className="text-slate-500">{new Date(img.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>

                        {/* Quick Copy Controls */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCopy(img, 'markdown')}
                            className={`py-2 px-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isMdCopied
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            }`}
                            title="보고서 본문 마크다운 코드 복사"
                          >
                            {isMdCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>복사 완료!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>마크다운 복사</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopy(img, 'raw')}
                            className={`py-2 px-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isRawCopied
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="순수 이미지 데이터 URL 복사"
                          >
                            {isRawCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Data URL 복사됨!</span>
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>데이터 URL 복사</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs font-medium">
                  선택한 카테고리에 등록된 이미지 에셋이 존재하지 않습니다.
                </div>
              )}
            </div>
          </>
        ) : (
          /* AI Image Generator Tab */
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
            {/* Explanatory Banner */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 space-y-1">
              <div className="font-extrabold flex items-center gap-1 text-indigo-800">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Gemini 초고화질 비즈니스 이미지 화공기</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                기안서와 프레젠테이션에 들어갈 맞춤형 이미지를 말 한마디로 생성해 보세요.
                생성 후 <strong className="text-indigo-700">공용 갤러리에 저장 시 200KB 용량 제한으로 실시간 초압축</strong>되어 Firestore 분산 보관함에 즉시 영구 영구 등재됩니다!
              </p>
            </div>

            {/* Prompt Form */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">생성할 이미지 상세 묘사 (한글/영문 가능)</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="예: 현대적인 오피스 회의실, 회의 중인 비즈니스맨, 배경에 홀로그램 차트, 일러스트 3D 스타일"
                  rows={3}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium resize-none leading-relaxed"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">이미지 화면 비율 (Aspect Ratio)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { value: '1:1', label: '1:1 (정방)' },
                    { value: '16:9', label: '16:9 (와이드)' },
                    { value: '4:3', label: '4:3 (표준)' },
                    { value: '3:4', label: '3:4 (세로)' },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        aspectRatio === ratio.value
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-extrabold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets Grid */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">추천 퀵 프롬프트 칩 (클릭 시 입력)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(preset.text)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-all cursor-pointer border border-slate-200/40"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 flex items-start gap-1.5 font-medium leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-600 flex items-start gap-1.5 font-medium leading-relaxed">
                  <Check className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI가 그림을 세밀하게 그리는 중 (약 5~10초)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>AI 맞춤형 이미지 직접 생성하기</span>
                  </>
                )}
              </button>
            </div>

            {/* Generation Preview & Save form */}
            {generatedBase64 && (
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-md space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-2.5">
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    NEW 생성된 이미지 프리뷰
                  </span>
                </div>

                {/* Live Preview Screen */}
                <div className="relative w-full border border-slate-150 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={generatedBase64}
                    alt="Generated Preview"
                    className="w-full h-auto object-contain max-h-64"
                  />
                </div>

                {/* Immediate Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopy({ title: 'AI 생성 이미지', dataUrl: generatedBase64, id: 'temp-ai' }, 'markdown')}
                    className={`py-2 px-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      copiedId === 'temp-ai-markdown'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                    }`}
                  >
                    {copiedId === 'temp-ai-markdown' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>코드 복사됨!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>임시 마크다운 바로복사</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy({ title: 'AI 생성 이미지', dataUrl: generatedBase64, id: 'temp-ai' }, 'raw')}
                    className={`py-2 px-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      copiedId === 'temp-ai-raw'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {copiedId === 'temp-ai-raw' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Data URL 복사됨!</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>임시 데이터 URL 복사</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Firestore Distribute Save Segment Form */}
                <div className="border-t border-slate-100 pt-3.5 space-y-3 bg-indigo-50/20 p-3 rounded-xl border border-indigo-100/40">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1">
                    <FolderPlus className="w-4 h-4 text-indigo-600" />
                    <span>공용 이미지 라이브러리에 영구 보관 & 등재하기</span>
                  </h4>
                  
                  <p className="text-[10px] text-slate-500 font-medium">
                    저장 버튼을 누르시면, 타 유저들과의 무제한 공유를 위해 용량을 200KB 이내로 자동 조절 후 Firestore에 안전 분산 보관됩니다.
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">에셋 타이틀</label>
                      <input
                        type="text"
                        value={generatedTitle}
                        onChange={(e) => setGeneratedTitle(e.target.value)}
                        placeholder="예: 2026 비즈니스 데이터 AI 일러스트"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">에셋 카테고리</label>
                        <select
                          value={generatedCategory}
                          onChange={(e) => setGeneratedCategory(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        >
                          <option value="cover">표지 일러스트</option>
                          <option value="chart">차트 & 시각 그래픽</option>
                          <option value="related">보고서 수록 이미지</option>
                          <option value="other">기타 비즈니스 이미지</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">적용 보고서 종류</label>
                        <select
                          value={generatedProduct}
                          onChange={(e) => setGeneratedProduct(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        >
                          <option value="all">전체 공통</option>
                          <option value="doc">전문 보고서</option>
                          <option value="presentation">PPT 슬라이드</option>
                          <option value="excel">전문 엑셀</option>
                          <option value="form">행정 양식</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {compressionStats && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-800 space-y-1 font-semibold">
                      <div className="flex justify-between">
                        <span>원본 용량:</span>
                        <span>{compressionStats.originalSize}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>200KB 압축 후 용량:</span>
                        <span>{compressionStats.compressedSize}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveToGallery}
                    disabled={isSaving}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>자동 200KB 고효율 압축 보관 처리 중...</span>
                      </>
                    ) : (
                      <span>공용 이미지 갤러리에 압축하여 정식 등재</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info banner */}
        <div className="p-3 bg-indigo-50/60 border-t border-slate-100 text-[10px] text-indigo-950 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
          <span>기안서나 슬라이드에 마크다운 복사 코드를 붙여넣기 하면 언제든지 고해상도로 자동 렌더링을 지원합니다.</span>
        </div>
      </div>
    </>
  );
};
