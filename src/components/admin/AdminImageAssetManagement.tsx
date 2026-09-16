import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Search,
  Sparkles,
  UploadCloud,
  Check,
  AlertCircle,
  Filter,
  HardDrive,
  Info,
  Wand2,
} from 'lucide-react';
import {
  PublicImageItem,
  getPublicImages,
  savePublicImage,
  deletePublicImage,
  compressImageToDataUrl,
} from '../../services/imageAssetService';

export const AdminImageAssetManagement: React.FC = () => {
  const [images, setImages] = useState<PublicImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');

  // Form states for custom image uploading/generation
  const [uploadMode, setUploadMode] = useState<'file' | 'ai'>('file');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'cover' | 'chart' | 'related' | 'other'>('cover');
  const [uploadProduct, setUploadProduct] = useState<'doc' | 'presentation' | 'excel' | 'form' | 'all'>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // AI Generator specific states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAspectRatio, setAiAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);

  // Progress & compression stats
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
    ratio: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Custom modal delete confirm states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await getPublicImages();
      setImages(data);
    } catch (err) {
      console.error('Failed to load public images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const originalSizeKb = (file.size / 1024).toFixed(1);

    setIsProcessing(true);
    setErrorMsg(null);
    setCompressionStats(null);

    try {
      // 1. Run our Canvas-based recursive compressor
      const compressedBase64 = await compressImageToDataUrl(file);
      setPreviewUrl(compressedBase64);

      // 2. Calculate savings
      const compressedSizeKb = ((compressedBase64.length - 814) * 0.75 / 1024).toFixed(1);
      const ratio = (100 - (Number(compressedSizeKb) / Number(originalSizeKb)) * 100).toFixed(0);

      setCompressionStats({
        originalSize: `${originalSizeKb} KB`,
        compressedSize: `${compressedSizeKb} KB`,
        ratio: `${ratio}%`,
      });

      // Default the title from file name if blank
      if (!uploadTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
        setUploadTitle(cleanName);
      }
    } catch (err: any) {
      setErrorMsg('이미지 압축 가공 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      
      const event = {
        target: { files: dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  // Trigger Gemini Image Generation endpoint
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setErrorMsg('생성할 이미지 묘사(프롬프트)를 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewUrl(null);
    setCompressionStats(null);

    try {
      console.log('[AI Image Generator] Calling backend from admin console...');
      const response = await fetch('/api/generate-image-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim(), aspectRatio: aiAspectRatio }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI 이미지 생성 실패');
      }

      const imageUrl = `data:image/png;base64,${data.base64}`;
      
      // Auto-compress the returned base64 image immediately
      console.log('[AI Image Generator] Auto-compressing generated base64...');
      const compressedUrl = await compressImageToDataUrl(imageUrl);
      setPreviewUrl(compressedUrl);

      // Calc stats
      const originalKb = ((imageUrl.length - 814) * 0.75 / 1024).toFixed(1);
      const compressedKb = ((compressedUrl.length - 814) * 0.75 / 1024).toFixed(1);
      const ratio = (100 - (Number(compressedKb) / Number(originalKb)) * 100).toFixed(0);

      setCompressionStats({
        originalSize: `${originalKb} KB`,
        compressedSize: `${compressedKb} KB`,
        ratio: `${ratio}%`,
      });

      // Autofill metadata
      let cleanTitle = aiPrompt.trim();
      if (cleanTitle.length > 25) {
        cleanTitle = cleanTitle.substring(0, 25) + '...';
      }
      setUploadTitle(`AI 생성: ${cleanTitle}`);

      // Auto category
      if (aiPrompt.toLowerCase().includes('chart') || aiPrompt.toLowerCase().includes('성장') || aiPrompt.toLowerCase().includes('차트')) {
        setUploadCategory('chart');
      } else if (aiPrompt.toLowerCase().includes('표지') || aiPrompt.toLowerCase().includes('cover')) {
        setUploadCategory('cover');
      } else {
        setUploadCategory('related');
      }

      setSuccessMsg('AI 이미지가 생성 완료 후 200KB 이내로 자동 조절되었습니다!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'AI 이미지 생성에 실패했습니다. 프롬프트를 다르게 시도해 보세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !uploadTitle.trim()) {
      setErrorMsg('에셋 이미지 결과물과 에셋 타이틀을 반드시 입력해 주세요.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const assetId = 'img-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    try {
      await savePublicImage({
        id: assetId,
        title: uploadTitle.trim(),
        category: uploadCategory,
        productType: uploadProduct,
        dataUrl: previewUrl,
      });

      setSuccessMsg('이미지 에셋이 압축되어 공용 저장소(Firestore)에 안전하게 배포되었습니다!');
      
      // Reset form states
      setUploadTitle('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCompressionStats(null);
      setAiPrompt('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh gallery
      await loadImages();
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Firestore 전송 중 실패: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteTargetId(id);
    setDeleteTargetTitle(title);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deletePublicImage(deleteTargetId);
      setImages(prev => prev.filter(img => img.id !== deleteTargetId));
      setDeleteTargetId(null);
      setDeleteTargetTitle('');
      setSuccessMsg('이미지 에셋이 성공적으로 삭제되었습니다.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('삭제 실패: ' + err.message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Filters logic
  const filteredImages = images.filter((img) => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || img.category === filterCategory;
    const matchesProduct = filterProduct === 'all' || img.productType === filterProduct;
    return matchesSearch && matchesCategory && matchesProduct;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'cover': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'chart': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'related': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getProductBadge = (type: string) => {
    switch (type) {
      case 'doc': return 'bg-blue-600 text-white';
      case 'presentation': return 'bg-purple-600 text-white';
      case 'excel': return 'bg-emerald-600 text-white';
      case 'form': return 'bg-pink-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const getProductLabel = (type: string) => {
    switch (type) {
      case 'doc': return '전문 보고서';
      case 'presentation': return 'PPT 슬라이드';
      case 'excel': return '전문 엑셀';
      case 'form': return '행정 양식';
      default: return '공통 에셋';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Introduction Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI 가공 기안서용 분산형 공용 이미지 에셋 저장소 (관리자)</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            모든 표지 디자인, 차트 시뮬레이션, 업무 워크플로우 맵을 중앙 집중식 갤러리에서 관리합니다.
            <strong className="text-amber-400"> 한 줄 용량 1MB Firestore 제한</strong>을 완벽히 우회하기 위해 각각의 이미지 에셋을 분산 컬렉션 세그먼트에 보관하고, 저장 시 실시간 Canvas 파이프라인으로 크기를 <strong className="text-indigo-300">200KB 이하로 강제 압축</strong>하여 리액티브 반응 속도와 쿼리 성능을 동시에 확보합니다.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
          <HardDrive className="w-5 h-5 text-indigo-400" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400">총 에셋 가공 갯수</div>
            <div className="text-base font-black text-indigo-300">{images.length} 개</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Upload OR Generate */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg h-fit space-y-5">
          {/* Header & Modes Selector */}
          <div className="border-b border-slate-800 pb-3.5 space-y-3">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>신규 이미지 에셋 가공</span>
            </h3>

            {/* Mode selection subtabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  setErrorMsg(null);
                  setPreviewUrl(null);
                  setCompressionStats(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMode === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                로컬 파일 업로드
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('ai');
                  setErrorMsg(null);
                  setPreviewUrl(null);
                  setCompressionStats(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMode === 'ai'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AI 직접 생성하기
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            
            {uploadMode === 'file' ? (
              /* FILE UPLOADER */
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  previewUrl 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[11px] text-indigo-400 font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>가공 및 압축 완료</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-400">클릭하여 이미지 파일 선택</span>
                      <span className="text-[10px] text-slate-500 block mt-1">또는 여기로 드래그 앤 드롭</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* AI GENERATOR */
              <div className="space-y-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400">AI 이미지 프롬프트 (한글/영문)</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="예: 미래지향적인 AI 반도체 칩 회로 디자인, 일러스트 3D 그래픽"
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">화면 비율 (Aspect Ratio)</label>
                  <select
                    value={aiAspectRatio}
                    onChange={(e) => setAiAspectRatio(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="1:1">1:1 (정사각형)</option>
                    <option value="16:9">16:9 (와이드)</option>
                    <option value="4:3">4:3 (표준)</option>
                    <option value="3:4">3:4 (세로형)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gemini 화공 중...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>AI 실시간 이미지 생성</span>
                    </>
                  )}
                </button>

                {previewUrl && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="relative mx-auto w-32 h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                      <img src={previewUrl} alt="AI Generated Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-center text-indigo-400 font-bold flex items-center justify-center gap-0.5">
                      <Check className="w-3 h-3" />
                      <span>생성 및 200KB 압축 가공완료</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Compression Stats Info */}
            {compressionStats && (
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-1.5 text-indigo-200 animate-fade-in">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">원본 생성 크기:</span>
                  <span>{compressionStats.originalSize}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">최적화 가공 크기 (Base64):</span>
                  <span className="text-emerald-400">{compressionStats.compressedSize}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">압축 효율:</span>
                  <span className="text-indigo-400">{compressionStats.ratio} 감소</span>
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">에셋 고유 타이틀</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="예: 클라우드 분산 아키텍처 WBS 차트"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">에셋 대분류</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="cover">표지 일러스트</option>
                    <option value="chart">차트 & 시각 그래픽</option>
                    <option value="related">보고서 수록 이미지</option>
                    <option value="other">기타 비즈니스 이미지</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">매칭 산출물 유형</label>
                  <select
                    value={uploadProduct}
                    onChange={(e) => setUploadProduct(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="all">전체 (공통 에셋)</option>
                    <option value="doc">전문 보고서</option>
                    <option value="presentation">PPT 슬라이드</option>
                    <option value="excel">전문 엑셀</option>
                    <option value="form">행정 양식</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error / Success Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-1.5 animate-bounce">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !previewUrl}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isProcessing ? '가공 분석 중...' : '에셋 저장 및 배포'}
            </button>
          </form>
        </div>

        {/* Right: Live Gallery list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-md">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="에셋 타이틀 검색..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              {/* Category selector */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                <Filter className="w-3 h-3 text-slate-500" />
                <span>대분류:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none font-medium"
                >
                  <option value="all">전체</option>
                  <option value="cover">표지 일러스트</option>
                  <option value="chart">차트 & 그래픽</option>
                  <option value="related">보고서 수록</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* Product selector */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                <span>유형:</span>
                <select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none font-medium"
                >
                  <option value="all">전체</option>
                  <option value="all_assets">공통 에셋</option>
                  <option value="doc">보고서</option>
                  <option value="presentation">PPT</option>
                  <option value="excel">엑셀</option>
                  <option value="form">양식</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 text-xs font-bold animate-pulse">
              분산 저장소 데이터 쿼리 중... 잠시만 기다려주세요.
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredImages.map((img) => {
                const payloadSize = ((img.dataUrl.length - 814) * 0.75 / 1024).toFixed(1);
                return (
                  <div
                    key={img.id}
                    className="group bg-slate-950 border border-slate-850 hover:border-indigo-500/60 rounded-2xl p-4 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Viewer */}
                      <div className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-850 flex items-center justify-center bg-radial-gradient">
                        <img
                          src={img.dataUrl}
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(img.id, img.title);
                          }}
                          className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-slate-950/75 border border-slate-800 text-rose-500 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          title="에셋 영구 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadge(img.category)}`}>
                            {img.category === 'cover' ? '표지' : img.category === 'chart' ? '차트' : '본문'}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getProductBadge(img.productType)}`}>
                            {getProductLabel(img.productType)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {img.title}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="font-mono flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-indigo-400" />
                        <span>데이터 용량:</span>
                        <span className="font-bold text-emerald-400">{payloadSize} KB</span>
                      </div>
                      <span>
                        {new Date(img.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border border-slate-800 bg-slate-950/40 rounded-2xl text-slate-500 text-xs">
              검색 조건에 맞는 공용 이미지 에셋이 존재하지 않습니다.
            </div>
          )}
        </div>
      </div>

      {/* Custom Modern Deletion Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setDeleteTargetId(null);
              setDeleteTargetTitle('');
            }}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in text-slate-100">
            <div className="space-y-4">
              {/* Icon & Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">공용 이미지 에셋 삭제</h3>
                  <p className="text-[10px] text-slate-400 font-medium">선택하신 리소스가 저장소에서 영구 삭제됩니다.</p>
                </div>
              </div>

              {/* Asset Box */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <div className="text-[10px] text-slate-500 font-bold">삭제 대상 타이틀</div>
                <div className="text-xs font-bold text-indigo-400 break-all">{deleteTargetTitle}</div>
              </div>

              {/* Warning Copy */}
              <p className="text-[11px] leading-relaxed text-slate-400">
                정말로 이 이미지 에셋을 삭제하시겠습니까? 삭제 시 해당 이미지를 활용하고 있는 회원들의 기안서나 보고서에서 원본 리소스가 유실될 수 있습니다. 이 작업은 되돌릴 수 없습니다.
              </p>

              {/* Action Rows */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetId(null);
                    setDeleteTargetTitle('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors border border-slate-750"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors shadow-lg shadow-rose-600/10"
                >
                  영구 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
