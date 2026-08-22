import React, { useState } from 'react';
import { ExcelDocument } from '../types/excel';
import {
  FileSpreadsheet,
  Trash2,
  Calendar,
  Layers,
  Building2,
  X,
  TrendingUp,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { exportToXlsx } from '../services/excelExportService';

interface SavedExcelModalProps {
  documents: ExcelDocument[];
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (doc: ExcelDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const SavedExcelModal: React.FC<SavedExcelModalProps> = ({
  documents,
  isOpen,
  onClose,
  onSelectDocument,
  onDeleteDocument,
}) => {
  const [itemToDelete, setItemToDelete] = useState<ExcelDocument | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteDocument(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">전문 엑셀 문서 보관함</h2>
              <p className="text-xs text-slate-500">저장된 {documents.length}개의 엑셀 스프레드시트</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">저장된 엑셀 문서가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">새로운 엑셀 문서를 생성해 보세요.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    onSelectDocument(doc);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                      .XLSX
                    </span>
                    {doc.company && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Building2 className="w-3 h-3" />
                        {doc.company}
                      </span>
                    )}
                    {doc.period && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {doc.period}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {doc.title}
                  </h3>
                  {doc.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{doc.subtitle}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-600" />
                      시트 {doc.sheets?.length || 1}개
                    </span>
                    <span>생성일: {new Date(doc.metadata.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => exportToXlsx(doc)}
                    title="즉시 다운로드"
                    className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(doc);
                    }}
                    title="삭제"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectDocument(doc);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    열기
                  </button>
                </div>
              </div>
            ))
          )}
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
                    엑셀 문서 삭제
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    이 작업은 취소할 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
                <p className="text-xs text-slate-500 font-medium mb-1">삭제할 엑셀 문서:</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-2">
                  {itemToDelete.title}
                </p>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                정말로 이 엑셀 문서를 삭제하시겠습니까? 저장된 시트 및 수식 데이터가 보관함에서 영구적으로 삭제됩니다.
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
