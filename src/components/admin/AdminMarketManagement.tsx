import React, { useState, useEffect } from 'react';
import { MarketItem, MarketProductType } from '../../types/market';
import {
  getMarketItems,
  updateMarketItem,
  toggleMarketStaffPick,
  deleteMarketItem,
  seedDefaultMarketPresets,
  auditMarketItemWithAi,
  batchAuditMarketItems,
  MARKET_CATEGORIES,
} from '../../services/marketService';
import { downloadMarketItemNativeFile } from '../../services/marketExportService';
import { MarketAuditReportModal } from './MarketAuditReportModal';
import {
  ShoppingBag,
  Search,
  Award,
  Sparkles,
  Download,
  Eye,
  Heart,
  Edit2,
  Trash2,
  ExternalLink,
  Flame,
  CheckCircle2,
  X,
  AlertTriangle,
  RefreshCw,
  Tag,
  DollarSign,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Presentation,
  ShieldCheck,
  Palette,
  Save,
  RotateCcw,
  Check,
  Layers,
  Activity,
  FileCheck,
  Zap,
} from 'lucide-react';

interface AdminMarketManagementProps {
  onPreviewItem?: (item: MarketItem) => void;
}

export const AdminMarketManagement: React.FC<AdminMarketManagementProps> = ({
  onPreviewItem,
}) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | MarketProductType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyStaffPick, setOnlyStaffPick] = useState<boolean>(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [auditFilter, setAuditFilter] = useState<'all' | 'verified_only' | 'unverified_only'>('all');

  // AI Audit states
  const [auditModalItem, setAuditModalItem] = useState<MarketItem | null>(null);
  const [isAuditingId, setIsAuditingId] = useState<string | null>(null);
  const [isBatchAuditing, setIsBatchAuditing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentTitle: string;
  } | null>(null);

  // Modal states
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MarketItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<{
    title: string;
    subtitle: string;
    summary: string;
    category: string;
    isFree: boolean;
    price: number;
    isStaffPick: boolean;
    tags: string;
    coverGradient: string;
    viewCount: number;
    downloadCount: number;
    likeCount: number;
    authorName: string;
    isAudited: boolean;
    auditScore: number;
    auditStatus: 'master_verified' | 'verified' | 'needs_review';
  }>({
    title: '',
    subtitle: '',
    summary: '',
    category: 'management',
    isFree: true,
    price: 0,
    isStaffPick: false,
    tags: '',
    coverGradient: 'from-indigo-600 to-purple-700',
    viewCount: 0,
    downloadCount: 0,
    likeCount: 0,
    authorName: '',
    isAudited: false,
    auditScore: 90,
    auditStatus: 'verified',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await getMarketItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load market items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadItems();
    setTimeout(() => setIsRefreshing(false), 500);
    showToast('마켓 문서 목록을 새로고침했습니다.');
  };

  // Toggle Staff Pick / Realtime Popular
  const handleToggleStaffPick = async (item: MarketItem) => {
    const nextState = !item.isStaffPick;
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isStaffPick: nextState } : it))
      );
      await toggleMarketStaffPick(item.id, nextState);
      showToast(
        nextState
          ? `⭐ [${item.title}] 실시간 인기/추천 문서로 등록되었습니다.`
          : `[${item.title}] 추천 상태가 해제되었습니다.`
      );
    } catch (err) {
      console.error('Failed to toggle staff pick:', err);
      showToast('추천 상태 변경 중 오류가 발생했습니다.');
      loadItems();
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MarketItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      subtitle: item.subtitle || '',
      summary: item.summary || '',
      category: item.category || 'management',
      isFree: item.isFree,
      price: item.price || 0,
      isStaffPick: Boolean(item.isStaffPick),
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      coverGradient: item.coverGradient || 'from-indigo-600 to-purple-700',
      viewCount: item.viewCount || 0,
      downloadCount: item.downloadCount || 0,
      likeCount: item.likeCount || 0,
      authorName: item.authorName || '',
      isAudited: Boolean(item.isAudited),
      auditScore: item.auditScore || 92,
      auditStatus: item.auditStatus || 'verified',
    });
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setIsSaving(true);
      const updatedFields: Partial<MarketItem> = {
        title: editForm.title.trim() || editingItem.title,
        subtitle: editForm.subtitle.trim(),
        summary: editForm.summary.trim(),
        category: editForm.category,
        isFree: editForm.isFree,
        price: editForm.isFree ? 0 : 1000,
        isStaffPick: editForm.isStaffPick,
        tags: editForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        coverGradient: editForm.coverGradient,
        viewCount: Number(editForm.viewCount) || 0,
        downloadCount: Number(editForm.downloadCount) || 0,
        likeCount: Number(editForm.likeCount) || 0,
        authorName: editForm.authorName.trim() || editingItem.authorName,
        isAudited: editForm.isAudited,
        auditScore: editForm.auditScore,
        auditStatus: editForm.auditStatus,
        auditedAt: editForm.isAudited ? (editingItem.auditedAt || Date.now()) : undefined,
      };

      await updateMarketItem(editingItem.id, updatedFields);

      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, ...updatedFields } : it))
      );

      setEditingItem(null);
      showToast('✅ 마켓 문서 정보가 성공적으로 수정되었습니다.');
    } catch (err: any) {
      console.error('Failed to update market item:', err);
      alert('문서 수정 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Run AI Quality Audit on single item
  const handleRunAudit = async (item: MarketItem) => {
    try {
      setIsAuditingId(item.id);
      showToast(`🤖 [${item.title}] AI 품질 정밀 검수를 진행 중입니다...`);
      const auditedItem = await auditMarketItemWithAi(item);

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? auditedItem : it))
      );

      if (auditModalItem && auditModalItem.id === item.id) {
        setAuditModalItem(auditedItem);
      }

      showToast(`✨ [${item.title}] 검수 완료! AI 품질 점수: ${auditedItem.auditScore}점`);
    } catch (err: any) {
      console.error('Audit failed:', err);
      showToast('AI 검수 중 오류가 발생했습니다.');
    } finally {
      setIsAuditingId(null);
    }
  };

  // Run AI Batch Audit on all items
  const handleBatchAudit = async () => {
    if (items.length === 0) {
      alert('검수할 마켓 문서가 없습니다.');
      return;
    }

    const unverifiedCount = items.filter((i) => !i.isAudited).length;
    const confirmMsg = unverifiedCount > 0
      ? `전체 ${items.length}개 문서 중 미검수 ${unverifiedCount}개 문서를 포함하여 전체 문서를 AI 일괄 검수하시겠습니까?`
      : `전체 ${items.length}개 문서에 대해 AI 일괄 재검수를 실행하시겠습니까?`;

    if (!confirm(confirmMsg)) return;

    try {
      setIsBatchAuditing(true);
      setBatchProgress({
        current: 0,
        total: items.length,
        currentTitle: '일괄 검수 준비 중...',
      });

      const results = await batchAuditMarketItems(items, (current, total, currentItem) => {
        setBatchProgress({
          current,
          total,
          currentTitle: currentItem.title,
        });
      });

      setItems(results);
      showToast(`🎉 전체 ${results.length}개 문서의 AI 일괄 품질 검수가 완료되었습니다!`);
    } catch (err: any) {
      console.error('Batch audit error:', err);
      alert('일괄 검수 중 일부 오류가 발생했습니다.');
      await loadItems();
    } finally {
      setIsBatchAuditing(false);
      setBatchProgress(null);
    }
  };

  // Manual Score Adjustment from Audit Modal
  const handleManualScoreUpdate = async (item: MarketItem, newScore: number) => {
    try {
      const status =
        newScore >= 95 ? 'master_verified' : newScore >= 90 ? 'verified' : 'needs_review';
      const updatedFields: Partial<MarketItem> = {
        isAudited: true,
        auditScore: newScore,
        auditStatus: status,
        auditedAt: Date.now(),
      };

      await updateMarketItem(item.id, updatedFields);

      const updatedItem: MarketItem = {
        ...item,
        ...updatedFields,
      };

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? updatedItem : it))
      );
      setAuditModalItem(updatedItem);
      showToast(`✅ [${item.title}] 점수가 ${newScore}점으로 보정되었습니다.`);
    } catch (err) {
      console.error('Failed to update score:', err);
      showToast('점수 보정 중 오류가 발생했습니다.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMarketItem(deletingItem.id);
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      setDeletingItem(null);
      showToast(`🗑️ [${deletingItem.title}] 마켓에서 삭제되었습니다.`);
    } catch (err: any) {
      console.error('Failed to delete market item:', err);
      alert('마켓 문서 삭제 실패: ' + err.message);
    }
  };

  // Restore / Seed Presets
  const handleSeedPresets = async () => {
    if (
      !confirm(
        '초기 표준 프리셋(투자유치 IR, 근로계약서, 재무모델, TIPS R&D 과제 등)을 데이터베이스에 복구/동기화하시겠습니까?'
      )
    ) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await seedDefaultMarketPresets();
      setItems(res);
      showToast('🎉 마켓플레이스 기본 표준 프리셋이 동기화되었습니다.');
    } catch (err) {
      console.error('Seed error:', err);
      alert('프리셋 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download Test
  const handleDownloadTest = async (item: MarketItem) => {
    try {
      const result = await downloadMarketItemNativeFile(item);
      if (result.success) {
        showToast(`📥 ${result.filename} 파일 다운로드가 시작되었습니다.`);
      } else {
        alert(result.error || '다운로드 실패');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('파일 다운로드 중 오류 발생');
    }
  };

  // Filtered List
  const filteredItems = items.filter((item) => {
    if (productTypeFilter !== 'all' && item.productType !== productTypeFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (onlyStaffPick && !item.isStaffPick) return false;
    if (priceFilter === 'free' && !item.isFree) return false;
    if (priceFilter === 'paid' && item.isFree) return false;
    if (auditFilter === 'verified_only' && !item.isAudited) return false;
    if (auditFilter === 'unverified_only' && item.isAudited) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = (item.subtitle || '').toLowerCase().includes(q);
      const matchSummary = (item.summary || '').toLowerCase().includes(q);
      const matchAuthor = (item.authorName || '').toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchSummary && !matchAuthor && !matchTags) {
        return false;
      }
    }
    return true;
  });

  // Aggregate Metrics
  const totalItemsCount = items.length;
  const staffPicksCount = items.filter((i) => i.isStaffPick).length;
  const totalDownloads = items.reduce((acc, cur) => acc + (cur.downloadCount || 0), 0);
  const totalViews = items.reduce((acc, cur) => acc + (cur.viewCount || 0), 0);
  const totalLikes = items.reduce((acc, cur) => acc + (cur.likeCount || 0), 0);

  // Audit Metrics
  const auditedItems = items.filter((i) => i.isAudited && typeof i.auditScore === 'number');
  const auditedCount = auditedItems.length;
  const auditCoverageRate = totalItemsCount > 0 ? Math.round((auditedCount / totalItemsCount) * 100) : 0;
  const avgAuditScore =
    auditedCount > 0
      ? (auditedItems.reduce((acc, cur) => acc + (cur.auditScore || 0), 0) / auditedCount).toFixed(1)
      : '0.0';

  const GRADIENT_PRESETS = [
    { label: '인디고 퓨처', value: 'from-indigo-600 via-purple-600 to-pink-600' },
    { label: '에메랄드 포레스트', value: 'from-emerald-600 to-teal-700' },
    { label: '오션 블루', value: 'from-blue-600 via-cyan-600 to-teal-500' },
    { label: '엠버 선셋', value: 'from-amber-600 via-orange-600 to-red-600' },
    { label: '다크 바이올렛', value: 'from-purple-800 via-indigo-900 to-slate-900' },
    { label: '로즈 모던', value: 'from-rose-600 via-pink-600 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-indigo-400/40">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Items & AI Audit Coverage */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">총 마켓 발행 문서</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalItemsCount}</span>
            <span className="text-xs text-slate-400">개 등록됨</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
            <FileCheck className="w-3.5 h-3.5" />
            <span>검수율 {auditCoverageRate}% ({auditedCount}/{totalItemsCount}건 완료)</span>
          </div>
        </div>

        {/* AI Quality Average Score (NEW) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950/80 to-purple-950/30 border border-indigo-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI 평균 품질 점수
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{avgAuditScore}</span>
            <span className="text-xs text-slate-400">/ 100점 만점</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-300/80 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>4대 실무 지표 정밀 심사 기준</span>
          </div>
        </div>

        {/* Realtime Popular / Staff Picks */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              실시간 인기 / 추천 PICK
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{staffPicksCount}</span>
            <span className="text-xs text-slate-400">개 선정 중</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/80 flex items-center gap-1">
            <span>메인 상단 하이라이트 노출</span>
          </div>
        </div>

        {/* Total Downloads */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">총 누적 다운로드</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              {totalDownloads.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">회 (.docx/.xlsx/.pptx)</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80 flex items-center gap-1">
            <span>정식 오피스 포맷 100% 변환</span>
          </div>
        </div>
      </div>

      {/* Batch Audit Active Progress Banner */}
      {isBatchAuditing && batchProgress && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-slate-900 border border-indigo-500/50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">AI 마켓 문서 일괄 품질 검수 진행 중...</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {batchProgress.current} / {batchProgress.total} 완료
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5 truncate max-w-xl">
                  현재 심사 중: <span className="font-bold text-white">[{batchProgress.currentTitle}]</span>
                </p>
              </div>
            </div>
            <span className="text-xl font-black text-amber-300">
              {Math.round((batchProgress.current / batchProgress.total) * 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-950/80 overflow-hidden border border-indigo-500/30">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300 rounded-full"
              style={{
                width: `${Math.max(5, (batchProgress.current / batchProgress.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="마켓 문서명, 부제목, 작성자, 태그 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Audit Status Filter */}
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">검수 상태: 전체</option>
              <option value="verified_only">✓ AI 검수완료만</option>
              <option value="unverified_only">⏳ 미검수 문서만</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">모든 카테고리</option>
              {MARKET_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">가격 전체</option>
              <option value="free">무료 문서 (0원)</option>
              <option value="paid">유료 문서 (1,000원)</option>
            </select>

            {/* Only Staff Pick Toggle */}
            <button
              onClick={() => setOnlyStaffPick(!onlyStaffPick)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                onlyStaffPick
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-xs'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>인기 PICK만</span>
            </button>

            {/* AI BATCH AUDIT TRIGGER BUTTON */}
            <button
              onClick={handleBatchAudit}
              disabled={isBatchAuditing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              title="전체 문서 AI 일괄 품질 검수 실행"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-300 ${isBatchAuditing ? 'animate-bounce' : ''}`} />
              <span>{isBatchAuditing ? '일괄 검수 중...' : '⚡ 일괄 AI 검수'}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Seed / Restore Presets */}
            <button
              onClick={handleSeedPresets}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title="기본 템플릿 복구"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">프리셋 복구</span>
            </button>
          </div>
        </div>

        {/* Format Sub-tab Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 mr-1">포맷 필터:</span>
          {(
            [
              { id: 'all', label: '전체 문서', icon: ShoppingBag },
              { id: 'doc', label: 'Word 기획서/보고서 (.docx)', icon: FileText },
              { id: 'excel', label: 'Excel 스프레드시트 (.xlsx)', icon: FileSpreadsheet },
              { id: 'presentation', label: 'PowerPoint 슬라이드 (.pptx)', icon: Presentation },
              { id: 'form_studio', label: '공문서/행정양식 (.docx)', icon: ShieldCheck },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? items.length
                : items.filter((i) => i.productType === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setProductTypeFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productTypeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Items Table */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-white">마켓플레이스 등록 문서 목록</h3>
            <span className="text-xs text-slate-400">({filteredItems.length}개)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            문서별 AI 품질 점수 및 상세 검수 리포트를 확인하고 실시간 배포 상태를 관리할 수 있습니다.
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-xs font-medium">마켓플레이스 데이터를 불러오는 중...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">조건에 부합하는 마켓 문서가 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">검색어를 변경하거나 필터를 초기화해 보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">문서 / 포맷</th>
                  <th className="px-4 py-3.5">카테고리 / 작성자</th>
                  <th className="px-4 py-3.5 text-center">AI 품질 검수</th>
                  <th className="px-4 py-3.5 text-center">가격</th>
                  <th className="px-4 py-3.5 text-center">실시간 인기(PICK)</th>
                  <th className="px-4 py-3.5 text-center">조회 / 다운로드 / 반응</th>
                  <th className="px-4 py-3.5 text-right">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => {
                  const formatBadge =
                    item.productType === 'presentation'
                      ? { label: 'PPTX', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
                      : item.productType === 'excel'
                      ? { label: 'XLSX', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
                      : item.productType === 'form_studio'
                      ? { label: '공문서', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
                      : { label: 'DOCX', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };

                  const isItemAuditing = isAuditingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/50 transition-colors group"
                    >
                      {/* Title & Format */}
                      <td className="px-4 py-4 max-w-sm">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider shrink-0 mt-0.5 ${formatBadge.color}`}
                          >
                            {formatBadge.label}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Author */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium inline-block">
                            {MARKET_CATEGORIES.find((c) => c.id === item.category)?.name ||
                              '비즈니스'}
                          </span>
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                            {item.authorName}
                          </div>
                        </div>
                      </td>

                      {/* AI Quality Audit Score & Badge */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {isItemAuditing ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse text-xs font-bold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>AI 검수 중...</span>
                          </div>
                        ) : item.isAudited && typeof item.auditScore === 'number' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setAuditModalItem(item)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-xs transition-transform hover:scale-105 cursor-pointer ${
                                item.auditScore >= 95
                                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-amber-400/10'
                                  : item.auditScore >= 90
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/10'
                                  : item.auditScore >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}
                              title="클릭하여 AI 상세 검수 리포트 확인"
                            >
                              {item.auditScore >= 95 ? (
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                              )}
                              <span>{item.auditScore}점</span>
                              <span className="text-[10px] opacity-80 font-normal">
                                {item.auditScore >= 95
                                  ? '최우수'
                                  : item.auditScore >= 90
                                  ? '인증완료'
                                  : item.auditScore >= 80
                                  ? '표준규격'
                                  : '보완권고'}
                              </span>
                            </button>

                            {/* Quick Re-audit Button */}
                            <button
                              onClick={() => handleRunAudit(item)}
                              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-indigo-300 border border-slate-800 transition-colors cursor-pointer"
                              title="AI 재검수 실행"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRunAudit(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-200 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs hover:border-indigo-400"
                            title="AI 정밀 품질 검수 실행"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>AI 검수</span>
                          </button>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            item.isFree
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {item.isFree ? '무료 (0원)' : '1,000원'}
                        </span>
                      </td>

                      {/* Staff Pick Toggle */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStaffPick(item)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 mx-auto transition-all cursor-pointer border ${
                            item.isStaffPick
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-400/20 scale-105'
                              : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                          }`}
                          title="실시간 인기/추천 문서 토글"
                        >
                          <Flame
                            className={`w-3.5 h-3.5 ${
                              item.isStaffPick ? 'fill-slate-950 text-slate-950' : 'text-slate-500'
                            }`}
                          />
                          <span>{item.isStaffPick ? '인기 PICK' : '일반'}</span>
                        </button>
                      </td>

                      {/* Metrics */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1" title="조회수">
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            {item.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1" title="다운로드수">
                            <Download className="w-3.5 h-3.5 text-emerald-500" />
                            {item.downloadCount || 0}
                          </span>
                          <span className="flex items-center gap-1" title="좋아요수">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            {item.likeCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Native Download */}
                          <button
                            onClick={() => handleDownloadTest(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700/80 transition-colors cursor-pointer"
                            title="정품 오피스 파일 다운로드 테스트"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-700/80 transition-colors cursor-pointer"
                            title="마켓 문서 정보 수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors cursor-pointer"
                            title="마켓에서 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">마켓플레이스 문서 정보 수정</h3>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-slate-300">{editingItem.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  문서 제목 (Title) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  부제목 / 핵심 요약 한 줄
                </label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  상세 설명 및 소개 (Summary)
                </label>
                <textarea
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">카테고리</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {MARKET_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    작성자/창작자 표기
                  </label>
                  <input
                    type="text"
                    value={editForm.authorName}
                    onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* AI Quality Audit Settings (Admin Override) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-black text-white">AI 품질 검수 상태 & 점수 관리자 설정</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isAudited}
                      onChange={(e) => setEditForm({ ...editForm, isAudited: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 text-[11px] font-bold text-slate-300">
                      {editForm.isAudited ? '검수 완료' : '미검수'}
                    </span>
                  </label>
                </div>

                {editForm.isAudited && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-500/20">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        AI 품질 점수 (0 ~ 100점)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editForm.auditScore}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          const st = val >= 95 ? 'master_verified' : val >= 90 ? 'verified' : 'needs_review';
                          setEditForm({ ...editForm, auditScore: val, auditStatus: st });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        검수 인증 등급
                      </label>
                      <select
                        value={editForm.auditStatus}
                        onChange={(e) => setEditForm({ ...editForm, auditStatus: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                      >
                        <option value="master_verified">최우수 마스터 인증 (95점 이상)</option>
                        <option value="verified">공식 품질 인증 (90점 이상)</option>
                        <option value="needs_review">보완 권고 / 표준 규격</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Staff Pick Settings */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    가격 정책 설정
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, isFree: true, price: 0 })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        editForm.isFree
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      무료 (0원)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, isFree: false, price: 1000 })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        !editForm.isFree
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      유료 (1,000원)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    실시간 인기 / 추천 (Staff Pick)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, isStaffPick: !editForm.isStaffPick })
                    }
                    className={`w-full py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      editForm.isStaffPick
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Flame
                      className={`w-4 h-4 ${
                        editForm.isStaffPick ? 'fill-slate-950 text-slate-950' : 'text-slate-500'
                      }`}
                    />
                    <span>{editForm.isStaffPick ? '실시간 추천 활성화됨' : '일반 노출'}</span>
                  </button>
                </div>
              </div>

              {/* Metrics Adjustment (Admin Override) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  노출 지표 관리자 조정 (조회수, 다운로드수, 좋아요수)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">조회수</span>
                    <input
                      type="number"
                      value={editForm.viewCount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, viewCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">다운로드수</span>
                    <input
                      type="number"
                      value={editForm.downloadCount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          downloadCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">좋아요수</span>
                    <input
                      type="number"
                      value={editForm.likeCount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, likeCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  검색 태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="IR피치덱, 투자유치, 2026사업계획"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Cover Gradient */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  커버 카드 그라디언트 테마
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((grad) => (
                    <button
                      key={grad.value}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, coverGradient: grad.value })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        editForm.coverGradient === grad.value
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${grad.value}`} />
                      <span className="text-[11px] font-medium text-slate-300 truncate">
                        {grad.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? '저장 중...' : '변경사항 저장하기'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">마켓 문서 삭제</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  마켓플레이스에서 해당 문서를 영구 제거합니다.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-5">
              <p className="text-xs text-slate-400 font-medium mb-1">삭제 대상 문서:</p>
              <p className="text-sm font-bold text-white line-clamp-2">{deletingItem.title}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span>작성자: {deletingItem.authorName}</span>
                <span>•</span>
                <span>누적 다운로드: {deletingItem.downloadCount}회</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>마켓에서 삭제하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Audit Report Modal */}
      {auditModalItem && (
        <MarketAuditReportModal
          isOpen={!!auditModalItem}
          item={auditModalItem}
          onClose={() => setAuditModalItem(null)}
          onReaudit={handleRunAudit}
          onUpdateScoreManually={handleManualScoreUpdate}
        />
      )}
    </div>
  );
};
