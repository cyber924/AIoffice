import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Megaphone,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHelpContents } from '../services/helpContentService';
import { HelpContent } from '../types/help';
import { MarkdownRenderer } from './MarkdownRenderer';

interface UserHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'announcement' | 'faq' | 'manual';

export const UserHelpDrawer: React.FC<UserHelpDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<HelpContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getHelpContents();
      setItems(data);
    } catch (err) {
      console.error('Failed to load help contents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter the help items based on selected tab and search query
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>워크젠 스마트 도움말</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Help Center
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                공지사항, 자주하는 질문 및 기능 가이드라인을 한곳에서 편리하게 확인하세요.
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

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-150 px-6 bg-slate-50">
          {(
            [
              { id: 'all', label: '전체', icon: null },
              { id: 'announcement', label: '공지사항', icon: Megaphone },
              { id: 'faq', label: '자주하는 질문', icon: HelpCircle },
              { id: 'manual', label: '사용 가이드', icon: BookOpen },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setExpandedId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar Block */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="도움말 제목, 분류, 키워드로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedId(null);
              }}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">실시간 정보 조회 중...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">일치하는 도움말 항목이 없습니다.</p>
              <p className="text-[10px] text-slate-400">다른 검색어 혹은 탭을 활용해 보십시오.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-sm transition-all"
                  >
                    {/* Collapsed view header trigger */}
                    <button
                      onClick={() => handleToggleExpand(item.id)}
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.type === 'announcement' ? (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              📢 공지사항
                            </span>
                          ) : item.type === 'faq' ? (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-amber-50 text-amber-700 border border-amber-200">
                              ❓ FAQ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                              📕 가이드
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug tracking-tight pr-4">
                          {item.title}
                        </h3>
                      </div>
                      <span className="text-slate-400 mt-1 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {/* Expanded view detailed markdown container */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-100"
                        >
                          <div className="px-5 py-4 bg-slate-50/40 text-slate-700 text-xs leading-relaxed space-y-3">
                            <MarkdownRenderer content={item.content} />
                            
                            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                              <span>워크젠 운영지원실</span>
                              <span>업데이트: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer help desk notice */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-semibold font-mono">
            WorkGen AI Customer Help Desk
          </span>
          <span className="text-[10px] text-indigo-600 font-bold">
            실시간 질의 가능
          </span>
        </div>
      </motion.div>
    </div>
  );
};
