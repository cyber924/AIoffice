import React, { useState, useEffect } from 'react';
import {
  getHelpContents,
  saveHelpContent,
  deleteHelpContent,
} from '../../services/helpContentService';
import { HelpContent } from '../../types/help';
import {
  Megaphone,
  HelpCircle,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarkdownRenderer } from '../MarkdownRenderer';

export const AdminServiceManagement: React.FC = () => {
  const [items, setItems] = useState<HelpContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'announcement' | 'faq' | 'manual'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal & Edit States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<HelpContent | null>(null);

  // Generator State
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('ai');
  const [aiTopic, setAiTopic] = useState('');
  const [aiType, setAiType] = useState<'announcement' | 'faq' | 'manual'>('announcement');
  const [aiCategory, setAiCategory] = useState('신규 기능');
  const [aiDetail, setAiDetail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState('');

  // Manual Form States
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'announcement' | 'faq' | 'manual'>('announcement');
  const [formCategory, setFormCategory] = useState('일반');
  const [formContent, setFormContent] = useState('');

  // Preview tab state inside create/edit modal
  const [modalTab, setModalTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getHelpContents();
      setItems(data);
    } catch (err) {
      console.error('Failed to load help contents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (mode: 'manual' | 'ai' = 'ai') => {
    setCreationMode(mode);
    setEditingItem(null);
    setFormId('help-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
    setFormTitle('');
    setFormType('announcement');
    setFormCategory('일반');
    setFormContent('');
    setAiTopic('');
    setAiType('announcement');
    setAiCategory('신규 기능');
    setAiDetail('');
    setGeneratorError('');
    setModalTab(mode === 'ai' ? 'edit' : 'edit');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: HelpContent) => {
    setEditingItem(item);
    setCreationMode('manual');
    setFormId(item.id);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormCategory(item.category);
    setFormContent(item.content);
    setGeneratorError('');
    setModalTab('edit');
    setIsCreateModalOpen(true);
  };

  // Run server-side AI help content generation
  const handleGenerateAIHelp = async () => {
    if (!aiTopic.trim()) {
      setGeneratorError('작성하고자 하는 핵심 주제를 입력해 주십시오.');
      return;
    }

    setIsGenerating(true);
    setGeneratorError('');

    try {
      const res = await fetch('/api/generate-help-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: aiType,
          topic: aiTopic.trim(),
          category: aiCategory,
          detail: aiDetail.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'AI 도움말 생성 API 요청 실패');
      }

      const data = await res.json();
      if (data.success && data.item) {
        setFormTitle(data.item.title || '');
        setFormContent(data.item.content || '');
        setFormCategory(data.item.category || aiCategory);
        setFormType(aiType);
        setCreationMode('manual'); // Switch to manual editing/review
        setModalTab('preview'); // Open preview first so they see the result immediately
      } else {
        throw new Error('올바르지 않은 응답 데이터 구조입니다.');
      }
    } catch (err: any) {
      console.error(err);
      setGeneratorError(err?.message || '도움말 콘텐츠 생성 중 에러가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Item Confirmation Action
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('도움말 제목과 본문 내용을 모두 채워 주십시오.');
      return;
    }
    setIsSaveConfirmModalOpen(true);
  };

  // Execute actual database write
  const executeSave = async () => {
    setIsSaveConfirmModalOpen(false);
    setIsLoading(true);
    try {
      const payload: Omit<HelpContent, 'createdAt' | 'updatedAt'> & { createdAt?: number } = {
        id: formId,
        type: formType,
        title: formTitle.trim(),
        category: formCategory.trim(),
        content: formContent.trim(),
      };

      if (editingItem) {
        payload.createdAt = editingItem.createdAt;
      }

      await saveHelpContent(payload);
      setIsCreateModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error('Failed to save help content:', err);
      alert('데이터베이스 저장에 실패했습니다. 규칙 및 연결 설정을 확인하십시오.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Item Modal Trigger
  const handleOpenDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleteModalOpen(false);
    setIsLoading(true);
    try {
      await deleteHelpContent(itemToDelete);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete help content:', err);
      alert('오류가 발생하여 대상을 삭제하지 못했습니다.');
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  // Filtering Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Unique categories list for filters
  const uniqueCategories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="space-y-6">
      {/* Top Banner & Description */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">서비스 운영 및 도움말 관리</h2>
          </div>
          <p className="text-xs text-slate-400">
            앱 사용자들에게 노출되는 공지사항, 자주하는 질문(FAQ), 사용 가이드를 AI 원클릭 기능으로 자동 생산하고 관리합니다.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenCreateModal('ai')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-600/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 원클릭 도움말 생성</span>
          </button>
          <button
            onClick={() => handleOpenCreateModal('manual')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>수동 신규 등록</span>
          </button>
        </div>
      </div>

      {/* Control Area: Filters and Search */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              typeFilter === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800'
            }`}
          >
            전체 ({items.length})
          </button>
          <button
            onClick={() => setTypeFilter('announcement')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              typeFilter === 'announcement'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>공지사항 ({items.filter((i) => i.type === 'announcement').length})</span>
          </button>
          <button
            onClick={() => setTypeFilter('faq')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              typeFilter === 'faq'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ ({items.filter((i) => i.type === 'faq').length})</span>
          </button>
          <button
            onClick={() => setTypeFilter('manual')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              typeFilter === 'manual'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>사용 가이드 ({items.filter((i) => i.type === 'manual').length})</span>
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="all">모든 카테고리</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="도움말 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Database Listing Grid */}
      {isLoading ? (
        <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-xs text-slate-400">실시간 데이터베이스 동기화 동기화 중...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-950 p-16 rounded-2xl border border-slate-800 text-center">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">표시할 도움말 데이터가 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">우상단 생성기를 이용하여 새로운 서비스 안내를 생성해 보십시오.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {item.type === 'announcement' ? (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      공지사항
                    </span>
                  ) : item.type === 'faq' ? (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      자주하는 질문
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      사용 설명서
                    </span>
                  )}

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {item.id} | 등록일: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight leading-relaxed">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 max-w-4xl">
                  {item.content.replace(/[#*`>-]/g, '')}
                </p>
              </div>

              <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>수정</span>
                </button>
                <button
                  onClick={() => handleOpenDelete(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950 text-rose-300 hover:text-rose-200 rounded-lg text-xs transition-colors cursor-pointer border border-rose-900/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal with AI capabilities */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    {editingItem ? <Edit className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {editingItem ? '도움말 콘텐츠 수정' : 'AI 스마트 도움말 자동 생성'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingItem ? '등록된 콘텐츠 본문을 교정하고 즉시 노출합니다.' : '주제만 입력하면 AI가 격식 높은 마크다운 가이드라인을 집필합니다.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Toggler (for New creations) */}
              {!editingItem && (
                <div className="px-6 py-2 bg-slate-950/40 border-b border-slate-800 flex gap-2">
                  <button
                    onClick={() => setCreationMode('ai')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      creationMode === 'ai'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 자동 완성 초안</span>
                  </button>
                  <button
                    onClick={() => setCreationMode('manual')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      creationMode === 'manual'
                        ? 'bg-slate-800 text-slate-100 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>직접 수동 입력</span>
                  </button>
                </div>
              )}

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {creationMode === 'ai' ? (
                  /* AI Generation Panel */
                  <div className="space-y-4">
                    {generatorError && (
                      <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{generatorError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Document Type Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400">콘텐츠 구분</label>
                        <select
                          value={aiType}
                          onChange={(e) => setAiType(e.target.value as any)}
                          className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="announcement">📢 공지사항 (Notice)</option>
                          <option value="faq">❓ 자주하는 질문 (FAQ)</option>
                          <option value="manual">📕 사용 가이드라인 (Manual)</option>
                        </select>
                      </div>

                      {/* Category Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400">분류 카테고리</label>
                        <input
                          type="text"
                          placeholder="예: 신규 기능, 이용 방법, 요금/결제"
                          value={aiCategory}
                          onChange={(e) => setAiCategory(e.target.value)}
                          className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Predefined Topic Helper Quick Tags */}
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[11px] font-bold text-slate-400 font-mono">신속 프롬프트 힌트</label>
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => {
                              setAiTopic('대화 초기화 기능 및 질문 추천 카드 도입 안내');
                              setAiType('announcement');
                              setAiCategory('신규 기능');
                            }}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold transition-all"
                          >
                            #대화 초기화
                          </button>
                          <button
                            onClick={() => {
                              setAiTopic('비밀유지 계약서(NDA) 생성 절차 및 주의사항');
                              setAiType('manual');
                              setAiCategory('계약서 가이드');
                            }}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold transition-all"
                          >
                            #계약서 매뉴얼
                          </button>
                          <button
                            onClick={() => {
                              setAiTopic('결제 오류 및 카드 자동 결제 실패 해결 요령');
                              setAiType('faq');
                              setAiCategory('오류 해결');
                            }}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold transition-all"
                          >
                            #결제오류 FAQ
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Topic Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400">
                        작성하고자 하는 핵심 주제 (Topic) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="예: 실시간 지식 허브에 저장된 자산을 메인 문서 생성에 참조시키는 방법"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>

                    {/* AI extra instructions */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400">추가 상세 지침 (선택 사항)</label>
                      <textarea
                        rows={3}
                        placeholder="AI에게 추가로 전하고 싶은 구체적인 맥락이나 팁을 편하게 적으십시오. (예: 지식 허브에 카드를 추가한 뒤 메인 문서 기획 필드 하단 참조 체크박스를 활성화하라는 단계를 3개 단계로 나눠서 알려줘)"
                        value={aiDetail}
                        onChange={(e) => setAiDetail(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={handleGenerateAIHelp}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>AI 스마트 집필 중... 약 5초 소요</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>AI 도움말 자동 초안 생성 고고</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Manual Editing/Preview Panel */
                  <div className="space-y-4">
                    {/* View Switcher inside Manual edit */}
                    <div className="flex border-b border-slate-800 pb-2 mb-2 gap-2">
                      <button
                        onClick={() => setModalTab('edit')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          modalTab === 'edit'
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        본문 작성기
                      </button>
                      <button
                        onClick={() => setModalTab('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          modalTab === 'preview'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>마크다운 실시간 미리보기</span>
                      </button>
                    </div>

                    {modalTab === 'edit' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Type Select */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400">구분</label>
                            <select
                              value={formType}
                              onChange={(e) => setFormType(e.target.value as any)}
                              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="announcement">📢 공지사항</option>
                              <option value="faq">❓ 자주하는 질문</option>
                              <option value="manual">📕 사용 설명서</option>
                            </select>
                          </div>

                          {/* Category input */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400">카테고리</label>
                            <input
                              type="text"
                              placeholder="예: 신규 기능, 요금안내 등"
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value)}
                              className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Unique ID */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono">고유 식별자(ID)</label>
                            <input
                              type="text"
                              disabled
                              value={formId}
                              className="w-full bg-slate-950 text-slate-500 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Title input */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400">도움말 제목</label>
                          <input
                            type="text"
                            placeholder="도움말에 게시할 타이틀을 입력하세요."
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                          />
                        </div>

                        {/* Content Markdown textarea */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400">
                            도움말 본문 내용 (Markdown 작성 가능)
                          </label>
                          <textarea
                            rows={12}
                            placeholder="마크다운 양식을 사용하여 풍부하게 가이드를 작성하세요."
                            value={formContent}
                            onChange={(e) => setFormContent(e.target.value)}
                            className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Preview tab view */
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {formType === 'announcement' ? '📢 공지사항' : formType === 'faq' ? '❓ FAQ' : '📕 사용 설명서'}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
                              {formCategory}
                            </span>
                          </div>
                          <h2 className="text-base font-extrabold text-white tracking-tight leading-snug">
                            {formTitle || '제목이 입력되지 않았습니다.'}
                          </h2>
                          <hr className="border-slate-900" />
                          <div className="markdown-body max-w-none text-slate-300 text-xs leading-relaxed space-y-2">
                            {formContent ? (
                              <MarkdownRenderer content={formContent} />
                            ) : (
                              <p className="text-slate-500 italic">본문 내용이 작성되지 않았습니다.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] text-slate-500 font-mono">
                        최종 업데이트: 즉시 반영됨
                      </span>
                      <div className="flex gap-2">
                        {/* Go back to AI draft button if created now */}
                        {!editingItem && (
                          <button
                            type="button"
                            onClick={() => setCreationMode('ai')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            AI 기획 수정
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveItem}
                          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>서비스 즉시 퍼블리싱</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-white text-sm">도움말 영구 삭제</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                정말로 해당 도움말 데이터를 영구 삭제하시겠습니까? 삭제된 정보는 복구할 수 없으며, 사용자 스마트 도움말 메뉴에서도 즉각 제외됩니다.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  삭제 실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publish Save Confirmation Modal */}
      <AnimatePresence>
        {isSaveConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-indigo-400">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-white text-sm">서비스 데이터 즉시 출판</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                작성하신 공지/FAQ/사용 매뉴얼을 도움말 시스템에 즉시 출판하시겠습니까? 즉시 Firestore에 저장되며 모든 접속 사용자들에게 투명하게 표시됩니다.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsSaveConfirmModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  수정 계속하기
                </button>
                <button
                  onClick={executeSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  퍼블리싱 확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
