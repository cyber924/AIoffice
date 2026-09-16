import React, { useState, useEffect } from 'react';
import {
  getKnowledgeItems,
  saveKnowledgeItem,
  deleteKnowledgeItem,
  KnowledgeHubItem,
} from '../../services/knowledgeHubService';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Link as LinkIcon,
  Filter,
  CheckCircle,
  FileText,
  TrendingUp,
  AlertCircle,
  X,
  RefreshCw,
  Award,
  Lightbulb,
  Zap,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KnowledgeTopicRecommender } from './KnowledgeTopicRecommender';
import { KNOWLEDGE_TOPIC_PRESETS } from '../../services/knowledgeTopicPresets';

export const AdminKnowledgeHub: React.FC = () => {
  const [items, setItems] = useState<KnowledgeHubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fact' | 'knowledge'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal & Edit States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<KnowledgeHubItem | null>(null);

  // Generator & Manual States
  const [creationMode, setCreationMode] = useState<'manual' | 'ai-fact' | 'ai-knowledge'>('manual');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('corporate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState('');

  // Manual Form States
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'fact' | 'knowledge'>('knowledge');
  const [formCategory, setFormCategory] = useState('corporate');
  const [formKeywords, setFormKeywords] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formContent, setFormContent] = useState('');

  const CATEGORY_LABELS: Record<string, string> = {
    corporate: '기업 규정 / 정관',
    legal: '법률 / 계약서',
    trend: '시장 트렌드 / 분석',
    marketing: '마케팅 / 브랜드',
    other: '기타 비즈니스',
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getKnowledgeItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load knowledge assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (mode: 'manual' | 'ai-fact' | 'ai-knowledge' = 'manual') => {
    setCreationMode(mode);
    setEditingItem(null);
    setFormId('kb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
    setFormTitle('');
    setFormType(mode === 'ai-fact' ? 'fact' : 'knowledge');
    setFormCategory('corporate');
    setFormKeywords('');
    setFormSourceUrl('');
    setFormContent('');
    setAiTopic('');
    setAiCategory('corporate');
    setGeneratorError('');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: KnowledgeHubItem) => {
    setEditingItem(item);
    setCreationMode('manual');
    setFormId(item.id);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormCategory(item.category);
    setFormKeywords(item.keywords || '');
    setFormSourceUrl(item.sourceUrl || '');
    setFormContent(item.content);
    setGeneratorError('');
    setIsCreateModalOpen(true);
  };

  // Submit Manual Save
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('제목과 내용을 모두 입력해 주십시오.');
      return;
    }
    setIsSaveConfirmModalOpen(true);
  };

  // Actual Save Execution
  const executeSave = async () => {
    setIsSaveConfirmModalOpen(false);
    setIsLoading(true);
    try {
      const payload: Omit<KnowledgeHubItem, 'createdAt'> & { createdAt?: number } = {
        id: formId,
        title: formTitle.trim(),
        type: formType,
        category: formCategory,
        content: formContent.trim(),
        keywords: formKeywords.trim() || '',
        sourceUrl: formSourceUrl.trim() || '',
      };

      if (editingItem) {
        payload.createdAt = editingItem.createdAt;
      }

      await saveKnowledgeItem(payload);
      setIsCreateModalOpen(false);
      fetchItems();
    } catch (err: any) {
      console.error('Error saving knowledge item:', err);
      alert('저장 실패: ' + (err?.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // AI Fact Collector
  const handleGenerateAIFact = async () => {
    if (!aiTopic.trim()) {
      setGeneratorError('조사하고자 하는 트렌드/뉴스 주제를 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    setGeneratorError('');
    try {
      const res = await fetch('/api/generate-news-fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI 팩트 수집 및 요약 중 오류가 발생했습니다.');
      }

      // Convert generated output directly into form fields for admin check
      setFormTitle(data.item.title);
      setFormContent(data.item.content);
      setFormSourceUrl(data.item.sourceUrl || 'https://news.google.com');
      setFormType('fact');
      setFormCategory(aiCategory);
      setFormKeywords(aiTopic);
      setCreationMode('manual'); // Transition to manual review state
    } catch (err: any) {
      setGeneratorError(err.message || 'AI 연동 중 네트워크 에러가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Knowledge Template Generator
  const handleGenerateAIKnowledge = async () => {
    if (!aiTopic.trim()) {
      setGeneratorError('생성하려는 표준 서식 또는 규정 주제를 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    setGeneratorError('');
    try {
      const res = await fetch('/api/generate-ai-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI 표준 서식 생성 중 오류가 발생했습니다.');
      }

      setFormTitle(data.item.title);
      setFormContent(data.item.content);
      setFormType('knowledge');
      setFormCategory(aiCategory);
      setFormKeywords(aiTopic);
      setFormSourceUrl('');
      setCreationMode('manual'); // Transition to manual review state
    } catch (err: any) {
      setGeneratorError(err.message || 'AI 연동 중 네트워크 에러가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Select recommended topic and optionally trigger generation immediately
  const handleSelectTopicPreset = async (
    topic: string,
    category: string,
    autoTrigger: boolean = false
  ) => {
    setAiTopic(topic);
    setAiCategory(category);
    setFormCategory(category);

    if (autoTrigger) {
      setIsGenerating(true);
      setGeneratorError('');
      try {
        const endpoint =
          creationMode === 'ai-fact' ? '/api/generate-news-fact' : '/api/generate-ai-knowledge';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, category }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'AI 지식/서식 생성 중 오류가 발생했습니다.');
        }

        setFormTitle(data.item.title);
        setFormContent(data.item.content);
        setFormType(creationMode === 'ai-fact' ? 'fact' : 'knowledge');
        setFormCategory(category);
        setFormKeywords(topic);
        setFormSourceUrl(data.item.sourceUrl || '');
        setCreationMode('manual');
      } catch (err: any) {
        setGeneratorError(err.message || 'AI 연동 중 에러가 발생했습니다.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Trigger custom delete modal

  const handleTriggerDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteKnowledgeItem(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      console.error('Error deleting knowledge asset:', err);
    }
  };

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keywords && item.keywords.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Board */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>지식허브 어드민 콘솔 (Knowledge Hub)</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            에이전트 RAG 데이터 수집 및 비즈니스 표준 서식, 실시간 최신 뉴스 팩트 관리 엔진
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsRecommenderOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 추천 주제 큐레이션</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('ai-fact')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>구글 뉴스 AI 팩트 수집</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('ai-knowledge')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-bold hover:bg-violet-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 표준 정관/계약서 생성</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('manual')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>수동 신규 자료 추가</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">전체 보관 자료</p>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{items.length}개</h3>
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">실시간 검색 팩트 (Fact)</p>
            <h3 className="text-xl font-extrabold text-cyan-400 mt-0.5">
              {items.filter((i) => i.type === 'fact').length}개
            </h3>
          </div>
        </div>

        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">업무 지식 템플릿 (Knowledge)</p>
            <h3 className="text-xl font-extrabold text-violet-400 mt-0.5">
              {items.filter((i) => i.type === 'knowledge').length}개
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="제목, 본문 내용, 키워드로 지식 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Type Filter */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              전체형태
            </button>
            <button
              onClick={() => setTypeFilter('fact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                typeFilter === 'fact' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              팩트 (Fact)
            </button>
            <button
              onClick={() => setTypeFilter('knowledge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                typeFilter === 'knowledge' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-violet-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              지식 (Knowledge)
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">모든 카테고리</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / Grid View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-slate-950 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-xs">지식 데이터베이스 동기화 중...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-950 rounded-2xl border border-slate-800 text-center px-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
          <h4 className="text-white font-bold text-sm">일치하는 지식이 없습니다</h4>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            검색어를 변경하거나 우측 상단 AI 도구를 이용하여 새 팩트나 템플릿 지식을 추가해 보십시오.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-400 font-bold">
                  <th className="px-6 py-4">형태 / 카테고리</th>
                  <th className="px-6 py-4">지식 및 템플릿 요약</th>
                  <th className="px-6 py-4">키워드</th>
                  <th className="px-6 py-4 text-right">관리 조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/35 transition-colors">
                    {/* Badge Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        {item.type === 'fact' ? (
                          <span className="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                            <span className="w-1 h-1 rounded-full bg-cyan-400" />
                            팩트 (Fact)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold">
                            <span className="w-1 h-1 rounded-full bg-violet-400" />
                            지식 (Knowledge)
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </div>
                    </td>

                    {/* Title & Preview Content */}
                    <td className="px-6 py-4 max-w-lg">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-white text-sm line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                          {item.content.replace(/[#*`>_\-]/g, '')}
                        </p>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 w-max mt-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>출처 링크 보기</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Keywords Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {item.keywords
                          ? item.keywords.split(',').map((word, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] border border-slate-800"
                              >
                                #{word.trim()}
                              </span>
                            ))
                          : <span className="text-slate-600">-</span>}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-450 hover:text-white transition-colors cursor-pointer border border-slate-800"
                          title="지식 편집"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTriggerDelete(item.id)}
                          className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-red-950/30"
                          title="지식 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation / AI Generator Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  {creationMode === 'ai-fact' || creationMode === 'ai-knowledge' ? (
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-indigo-400" />
                  )}
                  <span>
                    {editingItem
                      ? '지식 편집 검토'
                      : creationMode === 'ai-fact'
                      ? 'AI 최신 뉴스 팩트 수집'
                      : creationMode === 'ai-knowledge'
                      ? 'AI 표준 지식 및 서식 생성'
                      : '새 지식 수동 등록'}
                  </span>
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* AI Generator UI */}
                {(creationMode === 'ai-fact' || creationMode === 'ai-knowledge') && (
                  <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-xl space-y-4">
                    <p className="text-slate-350 text-xs leading-relaxed">
                      {creationMode === 'ai-fact'
                        ? '구글 뉴스 실시간 그라운딩 검색 기능을 활용하여, 작성하고 싶은 트렌드나 시장 조사 키워드를 분석하고 정량적인 팩트 자료를 자동으로 수집합니다.'
                        : '업무 가이드라인, 회사 정관, 비밀유지계약서(NDA), 기안 규정 등 사내 업무 프로세스 지표를 AI가 전문적이고 고도화된 마크다운 양식으로 직접 제작합니다.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-bold text-slate-400">조사/생성 주제 키워드</label>
                          <button
                            type="button"
                            onClick={() => setIsRecommenderOpen(true)}
                            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Lightbulb className="w-3 h-3" />
                            <span>추천 주제 더보기</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={
                            creationMode === 'ai-fact'
                              ? '예: 2026 국내 AI 반도체 수출 동향'
                              : '예: 회사 상벌 및 징계 위원회 표준 규정안'
                          }
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                        />

                        {/* Quick category topic suggestion pills */}
                        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">추천:</span>
                          {KNOWLEDGE_TOPIC_PRESETS.filter(
                            (p) => p.category === aiCategory || (aiCategory === 'all' && p.badge === '필수')
                          )
                            .slice(0, 3)
                            .map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelectTopicPreset(preset.topic, preset.category, false)}
                                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors whitespace-nowrap cursor-pointer"
                              >
                                {preset.topic.length > 22 ? preset.topic.slice(0, 22) + '...' : preset.topic}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">대표 카테고리</label>
                        <select
                          value={aiCategory}
                          onChange={(e) => setAiCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {generatorError && (
                      <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/20 p-3 rounded-lg border border-red-900/30">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{generatorError}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCreationMode('manual')}
                        className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 hover:text-white transition-colors cursor-pointer"
                        disabled={isGenerating}
                      >
                        수동 입력으로 전환
                      </button>

                      {/* AI Topic Recommendation Button */}
                      <button
                        type="button"
                        onClick={() => setIsRecommenderOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                        disabled={isGenerating}
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ai 추천</span>
                      </button>

                      {/* Main Generation Trigger */}
                      <button
                        type="button"
                        onClick={creationMode === 'ai-fact' ? handleGenerateAIFact : handleGenerateAIKnowledge}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>AI가 전문 분석 및 마크다운 구성 중... (약 10초 소요)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{creationMode === 'ai-fact' ? '뉴스 팩트 수집 가동' : '고품질 양식 생성 가동'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Review / Form UI */}
                {!isGenerating && (
                  <form onSubmit={handleSaveItem} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">제목 (Title)</label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-550"
                          placeholder="수집 자료 또는 지식의 제목을 입력하세요."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">지식 형태 (Type)</label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as 'fact' | 'knowledge')}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-550"
                        >
                          <option value="fact">팩트 (Fact - 수집/검색 데이터)</option>
                          <option value="knowledge">지식 (Knowledge - 규정/매뉴얼/서식)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">카테고리</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-550"
                        >
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">참조 출처 URL (선택)</label>
                        <input
                          type="url"
                          value={formSourceUrl}
                          onChange={(e) => setFormSourceUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-550"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">검색 키워드 (쉼표 구분)</label>
                        <input
                          type="text"
                          value={formKeywords}
                          onChange={(e) => setFormKeywords(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-550"
                          placeholder="정관, 계약, 마케팅"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">본문 상세 지식 내용 (Markdown 지원)</label>
                      <textarea
                        required
                        rows={10}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-550 font-mono leading-relaxed"
                        placeholder="이 조항이나 뉴스 분석 요약을 기재하십시오. 마크다운 문법(###, 1., - [ ])이 완벽히 지원됩니다."
                      />
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        {editingItem ? '수정 사항 저장하기' : '지식허브 데이터베이스 등록'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-extrabold text-white text-sm">지식 자료 삭제 확인</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                해당 자료를 지식허브에서 영구 삭제하시겠습니까? 삭제된 정보는 에이전트 질의응답 및 문서 생성 시 RAG
                소스로 사용되지 않습니다.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  영구 삭제
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Save Confirmation Modal */}
      <AnimatePresence>
        {isSaveConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-indigo-400">
                <CheckCircle className="w-6 h-6" />
                <h3 className="font-extrabold text-white text-sm">지식 자료 저장 확인</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                작성하신 지식 정보를 지식허브 데이터베이스에 저장하시겠습니까? 저장 완료 시 에이전트 및 문서 생성 과정에 RAG 소스로 사용됩니다.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveConfirmModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={executeSave}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Topic Recommendation Modal */}
      <KnowledgeTopicRecommender
        isOpen={isRecommenderOpen}
        onClose={() => setIsRecommenderOpen(false)}
        currentCategory={aiCategory}
        creationMode={creationMode}
        onSelectTopic={(topic, category, autoTrigger) => {
          if (!isCreateModalOpen) {
            // If main modal wasn't open yet, open it
            setIsCreateModalOpen(true);
            setCreationMode(creationMode === 'manual' ? 'ai-knowledge' : creationMode);
          }
          handleSelectTopicPreset(topic, category, autoTrigger);
        }}
      />
    </div>
  );
};

