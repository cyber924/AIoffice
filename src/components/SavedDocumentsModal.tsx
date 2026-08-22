import React, { useState } from 'react';
import {
  X,
  Search,
  Star,
  Trash2,
  FileText,
  Clock,
  ChevronRight,
  FolderArchive,
  AlertTriangle,
} from 'lucide-react';
import { GeneratedDocument, IndustryField } from '../types/document';
import { INDUSTRY_FIELDS } from '../data/presets';

interface SavedDocumentsModalProps {
  documents: GeneratedDocument[];
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (doc: GeneratedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onToggleStar: (docId: string) => void;
}

export const SavedDocumentsModal: React.FC<SavedDocumentsModalProps> = ({
  documents,
  isOpen,
  onClose,
  onSelectDocument,
  onDeleteDocument,
  onToggleStar,
}) => {
  const [itemToDelete, setItemToDelete] = useState<GeneratedDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<IndustryField | 'all'>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteDocument(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (onlyStarred && !doc.metadata?.isStarred) return false;
    if (selectedFieldFilter !== 'all' && doc.field !== selectedFieldFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchTopic = doc.purpose?.toLowerCase().includes(q);
      const matchKeywords = doc.keywords?.some(k => k.toLowerCase().includes(q));
      if (!matchTitle && !matchTopic && !matchKeywords) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                저장된 전문 문서함
              </h3>
              <p className="text-xs text-slate-500">
                총 {documents.length}개의 생성된 전문 문서 보관 중
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="문서 제목, 목적, 키워드로 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                onlyStarred
                  ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3 h-3 ${onlyStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
              즐겨찾기만
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            <button
              type="button"
              onClick={() => setSelectedFieldFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer ${
                selectedFieldFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              전체 분야
            </button>

            {INDUSTRY_FIELDS.slice(0, 6).map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setSelectedFieldFilter(f.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer ${
                  selectedFieldFilter === f.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label.split('/')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Document List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">저장된 문서가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">
                메인 화면에서 새로운 전문 문서를 생성해 보세요.
              </p>
            </div>
          ) : (
            filteredDocs.map(doc => {
              const dateStr = new Date(doc.metadata?.updatedAt || Date.now()).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
                  onClick={() => {
                    onSelectDocument(doc);
                    onClose();
                  }}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {doc.customField || doc.field}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {doc.customDocumentType || doc.documentType}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-2">
                        <Clock className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doc.title}
                    </h4>
                    {doc.subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {doc.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>약 {doc.metadata?.wordCount?.toLocaleString() || 0} 단어</span>
                      <span>•</span>
                      <span>목차 {doc.sections?.length || 0}개 섹션</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleStar(doc.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 cursor-pointer"
                      title="즐겨찾기 토글"
                    >
                      <Star
                        className={`w-4 h-4 ${doc.metadata?.isStarred ? 'fill-amber-400 text-amber-500' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(doc)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="문서 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDocument(doc);
                        onClose();
                      }}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer ml-1"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            닫기
          </button>
        </div>

        {/* In-App Delete Confirmation Modal Overlay */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    문서 삭제
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    이 작업은 취소할 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
                <p className="text-xs text-slate-500 font-medium mb-1">삭제할 문서:</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-2">
                  {itemToDelete.title}
                </p>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                정말로 이 전문 문서를 삭제하시겠습니까? 저장된 모든 섹션 및 분석 내용이 보관함에서 영구적으로 삭제됩니다.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제하기</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
