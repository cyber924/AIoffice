import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Filter,
  TrendingUp,
  Award,
  BookOpen,
  DollarSign,
  Tag,
  FileText,
  Presentation as PresentationIcon,
  Table as TableIcon,
  FileCheck2,
  Eye,
  Download,
  Heart,
  Upload,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketItem, MarketProductType, MarketFilterState, MarketSortOption, MarketPriceFilter } from '../../types/market';
import {
  getMarketItems,
  MARKET_CATEGORIES,
  PRESET_MARKET_ITEMS,
  getMarketItemById
} from '../../services/marketService';
import { MarketWebzineViewer } from './MarketWebzineViewer';

interface MarketHubProps {
  currentUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
  } | null;
  onOpenMyDocuments: () => void;
  onRemixToStudio: (item: MarketItem) => void;
  onRequireAuth?: () => void;
  initialDocId?: string | null;
}

export const MarketHub: React.FC<MarketHubProps> = ({
  currentUser,
  onOpenMyDocuments,
  onRemixToStudio,
  onRequireAuth,
  initialDocId,
}) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | MarketProductType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState<MarketPriceFilter>('all');
  const [sortBy, setSortBy] = useState<MarketSortOption | 'audit_score'>('latest');
  const [auditOnlyFilter, setAuditOnlyFilter] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getMarketItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load market items:', err);
      setItems(PRESET_MARKET_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle deep-link direct opening on mount
  useEffect(() => {
    if (initialDocId) {
      const target = items.find((i) => i.id === initialDocId);
      if (target) {
        setSelectedItem(target);
      } else {
        getMarketItemById(initialDocId).then((item) => {
          if (item) setSelectedItem(item);
        });
      }
    }
  }, [initialDocId, items]);

  const handleSelectDoc = (item: MarketItem) => {
    setSelectedItem(item);
  };

  const handleBackFromViewer = () => {
    setSelectedItem(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('docId');
    window.history.pushState({}, '', url.toString());
  };

  // Filter and Sort Items
  const filteredItems = items
    .filter((item) => {
      // Product Type
      if (productTypeFilter !== 'all' && item.productType !== productTypeFilter) {
        return false;
      }
      // Category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      // Price
      if (priceFilter === 'free' && !item.isFree) return false;
      if (priceFilter === 'paid' && item.isFree) return false;
      // AI Audit Filter
      if (auditOnlyFilter && !item.isAudited) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesAuthor = item.authorName.toLowerCase().includes(q);
        return matchesTitle || matchesSubtitle || matchesSummary || matchesTags || matchesAuthor;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'audit_score') return (b.auditScore || 0) - (a.auditScore || 0);
      if (sortBy === 'popular') return (b.viewCount || 0) - (a.viewCount || 0);
      if (sortBy === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sortBy === 'staff_pick') return (b.isStaffPick ? 1 : 0) - (a.isStaffPick ? 1 : 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  // Top 3 popular items for Realtime Ranking
  const topRankingItems = [...items]
    .sort((a, b) => (b.downloadCount || 0) + (b.viewCount || 0) - ((a.downloadCount || 0) + (a.viewCount || 0)))
    .slice(0, 3);

  if (selectedItem) {
    return (
      <MarketWebzineViewer
        item={selectedItem}
        currentUser={currentUser}
        onBack={handleBackFromViewer}
        onRemixToStudio={onRemixToStudio}
        onRequireAuth={onRequireAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          {/* Header Title & CTA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>오픈 마켓플레이스 (Open Marketplace)</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white text-[10px] font-black">
                  HOT
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                검증된 비즈니스 문서를 <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  자유롭게 발행하고 소장하세요
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                탑티어 전문가와 사용자들이 직접 발행한 사업계획서, IR 피치덱, 재무 엑셀 모델, 계약서를 웹진 스타일로 감상하고 즉시 활용할 수 있습니다.
              </p>
            </div>

            <button
              onClick={onOpenMyDocuments}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>내 문서 마켓에 발행하기</span>
            </button>
          </div>

          {/* Search Bar & Trending Tags */}
          <div className="space-y-3">
            <div className="relative max-w-3xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="찾으시는 문서 제목, 태그, 저자명 또는 키워드를 검색해 보세요 (예: IR피치덱, 근로계약서, 재무모델)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  지우기
                </button>
              )}
            </div>

            {/* Trending Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                인기 태그:
              </span>
              {['IR피치덱', '연봉계약서', '재무모델', 'TIPS', '스타트업', '손익계산서'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 transition-all cursor-pointer"
                  >
                    #{tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Realtime TOP 3 Ranking Carousel / Bento */}
        {!searchQuery && categoryFilter === 'all' && productTypeFilter === 'all' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                실시간 인기 TOP 랭킹 발행 문서
              </h2>
              <span className="text-xs text-slate-400">조회 & 다운로드 급상승</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topRankingItems.map((topItem, idx) => (
                <div
                  key={topItem.id}
                  onClick={() => handleSelectDoc(topItem)}
                  className="group p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/60 transition-all shadow-xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 text-3xl font-black text-slate-800/60 italic group-hover:text-indigo-500/20 transition-colors">
                    0{idx + 1}
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                        TOP 0{idx + 1}
                      </span>
                      {topItem.isAudited && typeof topItem.auditScore === 'number' && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-amber-300 text-[10px] font-extrabold border border-indigo-400/40 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>AI {topItem.auditScore}점</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          topItem.isFree
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {topItem.isFree ? '무료 0원' : '유료 1,000원'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {topItem.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {topItem.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 relative z-10">
                    <span className="font-medium text-slate-300">{topItem.authorName}</span>
                    <span className="flex items-center gap-1 text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>웹진 보기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="space-y-4 pt-2">
          {/* Format / Product Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
            {[
              { id: 'all', label: '전체 포맷', icon: Layers },
              { id: 'doc', label: '📄 비즈니스 문서', icon: FileText },
              { id: 'presentation', label: '📊 PPT 덱', icon: PresentationIcon },
              { id: 'excel', label: '📈 엑셀 모델', icon: TableIcon },
              { id: 'form_studio', label: '📝 표준 행정서식', icon: FileCheck2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = productTypeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProductTypeFilter(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub Filters: Category, Price, Sort Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium outline-none focus:border-indigo-500 cursor-pointer"
              >
                {MARKET_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Price Filter Pill Toggle */}
              <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                {[
                  { id: 'all', label: '전체 가격' },
                  { id: 'free', label: '🆓 무료 (0원)' },
                  { id: 'paid', label: '💎 유료 (1,000원)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriceFilter(p.id as MarketPriceFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      priceFilter === p.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* AI Verified Only Toggle */}
              <button
                onClick={() => setAuditOnlyFilter(!auditOnlyFilter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  auditOnlyFilter
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title="AI 품질 검수를 통과한 인증 문서만 모아보기"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${auditOnlyFilter ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>AI 검수완료만</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="latest">최신 등록순</option>
                <option value="audit_score">✨ AI 품질점수 높은순</option>
                <option value="popular">조회수 높은순</option>
                <option value="downloads">다운로드 많은순</option>
                <option value="staff_pick">에디터 추천순</option>
              </select>
            </div>
          </div>
        </div>

        {/* Market Document Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">
              오픈 마켓플레이스 문서를 실시간 불러오는 중입니다...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">
              선택한 조건에 일치하는 마켓 문서가 없습니다.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              필터 조건을 변경하거나 검색어를 재설정해 보세요.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setProductTypeFilter('all');
                setCategoryFilter('all');
                setPriceFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const formatLabel =
                item.productType === 'presentation'
                  ? 'PPT (.pptx)'
                  : item.productType === 'excel'
                  ? '엑셀 (.xlsx)'
                  : item.productType === 'form_studio'
                  ? '공문서 (.docx)'
                  : 'Word (.docx)';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectDoc(item)}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/80 transition-all shadow-lg hover:shadow-indigo-600/10 cursor-pointer flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Card Visual Header / Gradient */}
                  <div
                    className={`h-28 bg-gradient-to-r ${
                      item.coverGradient || 'from-indigo-600 to-purple-700'
                    } p-4 flex flex-col justify-between relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {formatLabel}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {item.isStaffPick && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-sm">
                            <Award className="w-3 h-3" />
                            PICK
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-black shadow-sm ${
                            item.isFree
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-indigo-400 text-slate-950'
                          }`}
                        >
                          {item.isFree ? '0원 (무료)' : '1,000원'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="text-[11px] text-white/90 font-medium truncate">
                        {MARKET_CATEGORIES.find((c) => c.id === item.category)?.name || '비즈니스'}
                      </div>
                      {item.isAudited && typeof item.auditScore === 'number' && (
                        <div
                          className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-amber-300 text-[10px] font-black flex items-center gap-1 border border-amber-400/30 shadow-xs"
                          title="AI 4대 실무품질 검수 완료"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>AI {item.auditScore}점</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer: Author & Counts */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-600/80 flex items-center justify-center font-bold text-[10px] text-white">
                          {item.authorName.charAt(0)}
                        </div>
                        <span className="truncate max-w-[100px] font-medium text-slate-300">
                          {item.authorName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3 text-slate-500" />
                          {item.viewCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Download className="w-3 h-3 text-slate-500" />
                          {item.downloadCount}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3 text-rose-400" />
                          {item.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
