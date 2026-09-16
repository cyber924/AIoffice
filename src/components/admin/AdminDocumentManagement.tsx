import React, { useState } from 'react';
import { GeneratedDocument } from '../../types/document';
import { PresentationDocument } from '../../types/presentation';
import { ExcelDocument } from '../../types/excel';
import { BusinessFormDocument } from '../../types/formStudio';
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Search,
  ExternalLink,
  User,
  Calendar,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

interface AdminDocumentManagementProps {
  documents: GeneratedDocument[];
  presentations: PresentationDocument[];
  excels: ExcelDocument[];
  forms: BusinessFormDocument[];
  onEditDocument: (doc: GeneratedDocument) => void;
  onDeleteDocument: (id: string) => Promise<void>;
  onEditPresentation: (pres: PresentationDocument) => void;
  onDeletePresentation: (id: string) => Promise<void>;
  onEditExcel: (excel: ExcelDocument) => void;
  onDeleteExcel: (id: string) => Promise<void>;
  onEditForm: (form: BusinessFormDocument) => void;
  onDeleteForm: (userId: string, id: string) => Promise<void>;
}

type DocTypeFilter = 'all' | 'doc' | 'ppt' | 'excel' | 'form';

export const AdminDocumentManagement: React.FC<AdminDocumentManagementProps> = ({
  documents,
  presentations,
  excels,
  forms,
  onEditDocument,
  onDeleteDocument,
  onEditPresentation,
  onDeletePresentation,
  onEditExcel,
  onDeleteExcel,
  onEditForm,
  onDeleteForm,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DocTypeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Normalize all documents into a unified list for simplified filtering and display
  const unifiedDocs = [
    ...documents.map((d: any) => ({
      id: d.id,
      userId: d.userId || '',
      userEmail: d.userEmail || 'guest@system.com',
      title: d.title,
      type: 'doc' as const,
      typeName: '전문 보고서',
      updatedAt: d.metadata?.updatedAt || Date.now(),
      details: d.documentType || d.field || '기획서',
      original: d,
    })),
    ...presentations.map((p: any) => ({
      id: p.id,
      userId: p.userId || '',
      userEmail: p.userEmail || 'guest@system.com',
      title: p.title,
      type: 'ppt' as const,
      typeName: '전문 PPT 슬라이드',
      updatedAt: p.metadata?.updatedAt || Date.now(),
      details: p.theme || 'dark_navy',
      original: p,
    })),
    ...excels.map((e: any) => ({
      id: e.id,
      userId: e.userId || '',
      userEmail: e.userEmail || 'guest@system.com',
      title: e.title,
      type: 'excel' as const,
      typeName: '전문 엑셀',
      updatedAt: e.metadata?.updatedAt || Date.now(),
      details: `${e.sheets?.length || 0}개 시트`,
      original: e,
    })),
    ...forms.map((f: any) => ({
      id: f.id,
      userId: f.userId || '',
      userEmail: f.userEmail || 'guest@system.com',
      title: f.title,
      type: 'form' as const,
      typeName: '전문 행정 양식',
      updatedAt: f.metadata?.updatedAt || Date.now(),
      details: f.category || f.field || '양식',
      original: f,
    })),
  ].sort((a, b) => b.updatedAt - a.updatedAt);

  // Filter lists based on type tab & search string
  const filteredDocs = unifiedDocs.filter((item) => {
    if (activeSubTab !== 'all' && item.type !== activeSubTab) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.userEmail.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDeleteTrigger = (item: typeof unifiedDocs[0]) => {
    setIsDeleting(JSON.stringify(item));
    setDeleteConfirmText('');
  };

  const executeDelete = async () => {
    if (!isDeleting) return;
    try {
      const item = JSON.parse(isDeleting);
      if (item.type === 'doc') {
        await onDeleteDocument(item.id);
      } else if (item.type === 'ppt') {
        await onDeletePresentation(item.id);
      } else if (item.type === 'excel') {
        await onDeleteExcel(item.id);
      } else if (item.type === 'form') {
        await onDeleteForm(item.userId, item.id);
      }
    } catch (err) {
      console.error('Delete document failed:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditTrigger = (item: typeof unifiedDocs[0]) => {
    if (item.type === 'doc') {
      onEditDocument(item.original as GeneratedDocument);
    } else if (item.type === 'ppt') {
      onEditPresentation(item.original as PresentationDocument);
    } else if (item.type === 'excel') {
      onEditExcel(item.original as ExcelDocument);
    } else if (item.type === 'form') {
      onEditForm(item.original as BusinessFormDocument);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Header / Tool Bar */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <span>전체 사용자 통합 문서 제어 센터</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            플랫폼의 모든 사용자가 제작한 보고서, 슬라이드, 엑셀, 양식 문서를 모니터링하고 원클릭으로 수정 또는 삭제합니다.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="문서명, 이메일, ID 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-max max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          전체 문서 ({unifiedDocs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('doc')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'doc' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-indigo-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>전문 보고서 ({documents.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ppt')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ppt' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-indigo-400'
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>전문 PPT ({presentations.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('excel')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'excel' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>전문 엑셀 ({excels.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('form')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'form' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>행정 양식 ({forms.length})</span>
        </button>
      </div>

      {/* Integrated Document Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">종류 / 카테고리</th>
                <th className="py-3.5 px-4">문서 제목</th>
                <th className="py-3.5 px-4">제작자 (이메일)</th>
                <th className="py-3.5 px-4">세부 설명/포맷</th>
                <th className="py-3.5 px-4">마지막 수정일</th>
                <th className="py-3.5 px-4 text-right">관리 조치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    등록되었거나 일치하는 문서가 한 건도 없습니다.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                    {/* Badge type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          item.type === 'doc'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : item.type === 'ppt'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : item.type === 'excel'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {item.type === 'doc' ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : item.type === 'ppt' ? (
                          <Presentation className="w-3.5 h-3.5" />
                        ) : item.type === 'excel' ? (
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{item.typeName}</span>
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-4 max-w-[280px] font-bold text-slate-100 group-hover:text-white transition-colors">
                      <div className="truncate" title={item.title}>
                        {item.title}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5 select-all">
                        ID: {item.id}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium text-slate-300">{item.userEmail}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5 select-all">
                        UID: {item.userId}
                      </span>
                    </td>

                    {/* Format/Details */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700/50">
                        {item.details}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(item.updatedAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </td>

                    {/* Admin Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditTrigger(item)}
                          className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all cursor-pointer"
                          title="에디터에서 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(item)}
                          className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                          title="영구 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">경고: 문서 영구 삭제</h4>
                <p className="text-xs text-slate-400">이 작업은 취소할 수 없습니다.</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                해당 문서(<strong className="text-rose-400">{JSON.parse(isDeleting).title}</strong>)를 삭제하면,
                사용자 보관함과 클라우드 데이터베이스에서 영구히 삭제됩니다.
              </p>
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">종류:</span>
                  <span className="text-slate-300">{JSON.parse(isDeleting).typeName}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">제작자:</span>
                  <span className="text-slate-300">{JSON.parse(isDeleting).userEmail}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">
                  승인하려면 상단 문서의 제목을 입력하세요:
                </label>
                <input
                  type="text"
                  placeholder="문서 제목 입력"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsDeleting(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                disabled={deleteConfirmText !== JSON.parse(isDeleting).title}
                onClick={executeDelete}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900/40 disabled:text-rose-400/50 text-white text-xs font-extrabold transition-all cursor-pointer"
              >
                삭제 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
