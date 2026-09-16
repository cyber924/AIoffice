import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  Zap,
  Tag,
  BookOpen,
  Award,
  Flame,
  Star,
  Clock,
  Shield,
  Briefcase,
  TrendingUp,
  Target,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  KNOWLEDGE_TOPIC_PRESETS,
  KnowledgeTopicPreset,
} from '../../services/knowledgeTopicPresets';

interface KnowledgeTopicRecommenderProps {
  currentCategory: string;
  creationMode: 'ai-knowledge' | 'ai-fact' | 'manual';
  onSelectTopic: (topic: string, category: string, autoTriggerGenerate?: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeTopicRecommender: React.FC<KnowledgeTopicRecommenderProps> = ({
  currentCategory,
  creationMode,
  onSelectTopic,
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentCategory === 'all' ? 'corporate' : currentCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [dynamicTopics, setDynamicTopics] = useState<KnowledgeTopicPreset[]>([]);

  if (!isOpen) return null;

  const CATEGORY_TABS = [
    { id: 'all', label: '전체 추천', icon: Sparkles },
    { id: 'corporate', label: '기업 규정 / 정관', icon: Shield },
    { id: 'legal', label: '법률 / 계약서', icon: Briefcase },
    { id: 'trend', label: '시장 트렌드 / 분석', icon: TrendingUp },
    { id: 'marketing', label: '마케팅 / 브랜드', icon: Target },
    { id: 'other', label: '기타 비즈니스·HR', icon: BookOpen },
  ];

  // Fetch dynamic AI topics from Gemini endpoint
  const handleFetchAiTopics = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/recommend-knowledge-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          keywords: customKeyword,
          mode: creationMode === 'ai-fact' ? 'fact' : 'knowledge',
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.topics)) {
        const formatted: KnowledgeTopicPreset[] = data.topics.map((t: any, idx: number) => ({
          id: `dyn-${Date.now()}-${idx}`,
          topic: t.topic,
          category: (t.category as any) || selectedCategory,
          categoryName: t.categoryName || 'AI 추천',
          description: t.description || 'AI가 제안하는 고품질 실무 주제입니다.',
          tag: t.tag || '#AI추천',
          badge: (t.badge as any) || '최신',
          recommendedType: creationMode === 'ai-fact' ? 'fact' : 'knowledge',
        }));
        setDynamicTopics(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch AI topics:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Combine static presets and dynamic AI topics
  const allTopics = [...dynamicTopics, ...KNOWLEDGE_TOPIC_PRESETS];

  const filteredTopics = allTopics.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = item.topic.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tag.toLowerCase().includes(q);
      if (!matchTopic && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case '필수':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case '인기':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case '최신':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>AI 지식허브 전문 주제 추천 큐레이션</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  고속 축적 모드
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                기업 필수 규정, 표준 정관, 법률 계약서, 2026 시장 트렌드 팩트 주제를 원클릭으로 선택하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic AI Generator Toolbar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="추천 주제명, 설명, 태그 실시간 검색..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="맞춤 키워드 (예: 바이오, 핀테크)"
                className="w-40 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleFetchAiTopics}
            disabled={isAiGenerating}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
            <span>{isAiGenerating ? 'AI가 추천 주제 발굴 중...' : 'Gemini AI 실시간 주제 새로고침'}</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? allTopics.length
                : allTopics.filter((t) => t.category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Topics List Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredTopics.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">검색 조건에 맞는 주제가 없습니다.</p>
              <p className="text-xs text-slate-500 mt-1">
                상단의 'Gemini AI 실시간 주제 새로고침'을 눌러 새로운 아이디어를 생성해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTopics.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-950/90 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getBadgeStyle(
                            item.badge
                          )}`}
                        >
                          {item.badge}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.categoryName}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-400/80 font-mono">
                        {item.tag}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {item.topic}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-end gap-2">
                    {/* Select and Auto-Fill */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTopic(item.topic, item.category, false);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                      <span>주제 선택 입력</span>
                    </button>

                    {/* Instant AI Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTopic(item.topic, item.category, true);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>바로 AI 생성 가동</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            💡 선택한 주제는 AI 마크다운 표준 서식 또는 구글 뉴스 팩트 데이터로 자동 전환됩니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
