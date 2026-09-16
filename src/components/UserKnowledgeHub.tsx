import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Filter,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Award,
  FileText,
  MessageSquare,
  Send,
  Loader2,
  Maximize2,
  ChevronRight,
  ExternalLink,
  BookMarked,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getKnowledgeItems, KnowledgeHubItem } from '../services/knowledgeHubService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface UserKnowledgeHubProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  referencedDocs?: { title: string; type: string }[];
}

export const UserKnowledgeHub: React.FC<UserKnowledgeHubProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<KnowledgeHubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fact' | 'knowledge'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<KnowledgeHubItem | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, categoryFilter]);

  // Tab State: 'directory' | 'chat'
  const [activeTab, setActiveTab] = useState<'directory' | 'chat'>('directory');

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: '안녕하세요! 저는 지식허브 수석 AI 파트너 **마일로(Milo)**입니다.\n\n지식허브에 수집된 **최신 마켓 실시간 뉴스 팩트**와 **사내 표준 서식/규정** 자료를 바탕으로 귀하의 기업 문서를 완벽하게 기획하고 조력해 드립니다. 궁금한 업무 지식이나 규정을 기재해 보십시오!',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const CATEGORY_LABELS: Record<string, string> = {
    corporate: '기업 규정 / 정관',
    legal: '법률 / 계약서',
    trend: '시장 트렌드 / 분석',
    marketing: '마케팅 / 브랜드',
    other: '기타 비즈니스',
  };

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getKnowledgeItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load knowledge assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Basic search vector / RAG scoring
  const retrieveRelevantDocs = (query: string): { docs: KnowledgeHubItem[]; scoreList: any[] } => {
    if (!query.trim() || items.length === 0) return { docs: [], scoreList: [] };

    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);

    if (queryTokens.length === 0) return { docs: [], scoreList: [] };

    const scored = items.map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const contentLower = item.content.toLowerCase();
      const keywordsLower = (item.keywords || '').toLowerCase();

      queryTokens.forEach((token) => {
        // Higher weight on title and keywords matches
        if (titleLower.includes(token)) score += 10;
        if (keywordsLower.includes(token)) score += 8;
        if (contentLower.includes(token)) score += 2;
      });

      return { item, score };
    });

    // Sort descending and filter out zero scores, get top 3
    const matched = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      docs: matched.map((m) => m.item),
      scoreList: matched,
    };
  };

  // Milo Chat Submit
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userText,
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setIsChatSending(true);

    // Client-side RAG document matching
    const { docs: matchedDocs } = retrieveRelevantDocs(userText);

    try {
      const historyPayload = chatMessages
        .filter((msg) => msg.id !== 'welcome')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch('/api/chat-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          contextDocs: matchedDocs.map((d) => ({
            title: d.title,
            type: d.type,
            content: d.content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || '마일로 파트너 통신 중 오류가 발생했습니다.');
      }

      const miloMsgId = 'milo-' + Date.now();
      const newMiloMsg: ChatMessage = {
        id: miloMsgId,
        role: 'model',
        content: data.reply,
        referencedDocs: matchedDocs.map((d) => ({ title: d.title, type: d.type })),
      };

      setChatMessages((prev) => [...prev, newMiloMsg]);
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'model',
          content: `죄송합니다. 실시간 지식 추론을 실행하는 도중 네트워크 순오류가 발생했습니다.\n\n사유: *${err.message}*`,
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filter list
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.keywords && item.keywords.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs pointer-events-auto">
      {/* Sidebar Panel Backdrop clickable to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Header Panel */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>실시간 지식허브</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                  Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                최신 뉴스 팩트 및 업무 가이드/표준 양식을 조회하고 AI 지식 파트너와 RAG 협업을 진행하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Menu Dual Tab Bar */}
        <div className="flex border-b border-slate-150 px-6 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('directory');
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>지식 보관소 조회</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI 지식 파트너 '마일로' RAG 대화</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === 'directory' ? (
              <motion.div
                key="directory-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Expand Panel Layer */}
                {selectedItem ? (
                  <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    {/* Expand Navigation Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        ← 이전 목록으로 가기
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyText(selectedItem.content, 'expand-md')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold hover:border-slate-350 transition-all cursor-pointer shadow-3xs"
                        >
                          {copiedId === 'expand-md' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>마크다운 복사</span>
                        </button>
                      </div>
                    </div>

                    {/* Content Detail Rendering */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                      <div className="flex items-center gap-2">
                        {selectedItem.type === 'fact' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200 text-[10px] font-bold">
                            팩트 (Fact)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[10px] font-bold">
                            지식 (Knowledge)
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          {CATEGORY_LABELS[selectedItem.category] || selectedItem.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                        {selectedItem.title}
                      </h3>

                      <div className="border-t border-slate-100 pt-4 leading-relaxed text-sm text-slate-800 markdown-body">
                        <MarkdownRenderer content={selectedItem.content} />
                      </div>

                      {selectedItem.sourceUrl && (
                        <div className="pt-6 border-t border-slate-100">
                          <a
                            href={selectedItem.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            <span>공식 수집 출처 사이트 바로가기</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Search & Toolbar for Public Hub User Browse */}
                    <div className="p-4 border-b border-slate-150 bg-white flex flex-col gap-2.5">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="원하는 정보, 규정 서식, 시장 분석 팩트 검색..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-555 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type chips */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-150">
                          <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              typeFilter === 'all'
                                ? 'bg-white text-slate-800 shadow-3xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            전체
                          </button>
                          <button
                            onClick={() => setTypeFilter('fact')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              typeFilter === 'fact'
                                ? 'bg-cyan-500 text-white shadow-3xs'
                                : 'text-slate-500 hover:text-cyan-600'
                            }`}
                          >
                            팩트
                          </button>
                          <button
                            onClick={() => setTypeFilter('knowledge')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              typeFilter === 'knowledge'
                                ? 'bg-violet-600 text-white shadow-3xs'
                                : 'text-slate-500 hover:text-violet-600'
                            }`}
                          >
                            지식
                          </button>
                        </div>

                        {/* Category Dropdown */}
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] text-slate-650 font-bold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="all">모든 카테고리</option>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={loadItems}
                          className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 ml-auto"
                          title="새로고침"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable list of knowledge */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-3">
                          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          <span className="text-slate-500 text-[11px] font-bold">지식 동기화 중...</span>
                        </div>
                      ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-150 rounded-2xl text-center px-4">
                          <BookMarked className="w-10 h-10 text-slate-300 mb-2" />
                          <h4 className="text-slate-800 font-bold text-xs">보관된 지식이 없습니다</h4>
                          <p className="text-slate-400 text-[10px] mt-1 max-w-xs">
                            조사하고자 하는 신규 지식은 관리자 콘솔의 AI 지식 허브 수집 기능에서 확보할 수 있습니다.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {paginatedItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-xs transition-all group cursor-pointer flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  {item.type === 'fact' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200 text-[9px] font-bold">
                                      <span className="w-1 h-1 rounded-full bg-cyan-500" />
                                      팩트 (Fact)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-[9px] font-bold">
                                      <span className="w-1 h-1 rounded-full bg-violet-500" />
                                      지식 (Knowledge)
                                    </span>
                                  )}

                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {CATEGORY_LABELS[item.category] || item.category}
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
                                  {item.title}
                                </h4>

                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {item.content.replace(/[#*`>_\-]/g, '')}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/60">
                                <div className="flex gap-1">
                                  {item.keywords &&
                                    item.keywords.split(',').slice(0, 3).map((kw, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded"
                                      >
                                        #{kw.trim()}
                                      </span>
                                    ))}
                                </div>

                                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  <span>상세 보기</span>
                                  <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="px-6 py-3 bg-white border-t border-slate-150 flex items-center justify-between text-xs text-slate-500 shrink-0">
                        <div className="font-medium text-slate-600">
                          전체 <span className="font-extrabold text-slate-800">{filteredItems.length}</span>개 중{' '}
                          <span className="font-extrabold text-indigo-600">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>~
                          <span className="font-extrabold text-indigo-600">
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-3xs"
                          >
                            이전
                          </button>
                          <div className="flex items-center gap-1 font-mono text-[11px] px-1">
                            <span className="font-black text-indigo-600">{currentPage}</span>
                            <span className="text-slate-350">/</span>
                            <span className="text-slate-500 font-bold">{totalPages}</span>
                          </div>
                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-3xs"
                          >
                            다음
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                    key="chat-tab"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Active Milo Chat History */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[85%] ${
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                          }`}
                        >
                          {msg.role !== 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-md shrink-0">
                              M
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                                msg.role === 'user'
                                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-150 markdown-body'
                              }`}
                            >
                              {msg.role === 'user' ? (
                                msg.content
                              ) : (
                                <MarkdownRenderer content={msg.content} />
                              )}
                            </div>

                            {/* Referenced Document Citations */}
                            {msg.referencedDocs && msg.referencedDocs.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pl-1.5">
                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                  <Award className="w-2.5 h-2.5 text-amber-500" />
                                  참조 지식:
                                </span>
                                {msg.referencedDocs.map((doc, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                      doc.type === 'fact'
                                        ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                                        : 'bg-violet-50 text-violet-600 border-violet-200'
                                    }`}
                                  >
                                    {doc.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isChatSending && (
                        <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white text-[11px] font-black shrink-0 animate-pulse">
                            M
                          </div>
                          <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-150 shadow-3xs flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                            <span className="text-slate-500 text-[11px] font-bold">
                              마일로가 보관된 지식 소스를 검색 및 추론 중...
                            </span>
                          </div>
                        </div>
                      )}

                      <div ref={chatBottomRef} />
                    </div>

                    {/* Milo Chat Send Form */}
                    <form
                      onSubmit={handleSendChatMessage}
                      className="p-4 border-t border-slate-150 bg-white flex gap-2"
                    >
                      <input
                        type="text"
                        disabled={isChatSending}
                        placeholder={
                          loading
                            ? '지식 소스 초기화 중...'
                            : '마일로에게 질문하십시오... (예: 2026 해외 AI 수출 분석 알려줘)'
                        }
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-550 focus:bg-white transition-all disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isChatSending}
                        className="p-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
  );
};
