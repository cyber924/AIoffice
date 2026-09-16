import React, { useState } from 'react';
import { BusinessFormDocument } from '../types/formStudio';
import { exportFormToDocx } from '../services/formWordExportService';
import {
  FileText,
  Trash2,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  AlertTriangle,
  Upload,
  Download,
} from 'lucide-react';

interface SavedFormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedForms: BusinessFormDocument[];
  onSelectForm: (formDoc: BusinessFormDocument) => void;
  onDeleteForm: (formId: string) => void;
  onPublishToMarket?: (formDoc: BusinessFormDocument) => void;
}

export const SavedFormsModal: React.FC<SavedFormsModalProps> = ({
  isOpen,
  onClose,
  savedForms,
  onSelectForm,
  onDeleteForm,
  onPublishToMarket,
}) => {
  const [itemToDelete, setItemToDelete] = useState<BusinessFormDocument | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteForm(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">저장된 업무 양식 / 공문서 보관함</h2>
              <p className="text-xs text-slate-500">총 {savedForms.length}개의 문서가 보관되어 있습니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {savedForms.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs">저장된 공문서 및 양식이 없습니다.</p>
            </div>
          ) : (
            savedForms.map((form) => (
              <div
                key={form.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                onClick={() => {
                  onSelectForm(form);
                  onClose();
                }}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                      {form.formType}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {form.docNumber || 'DOC-2026'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {form.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>기안자: {form.drafter?.name}</span>
                    <span>일자: {form.draftDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await exportFormToDocx(form);
                      } catch (err: any) {
                        alert('Word 문서 다운로드 실패: ' + (err.message || err));
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors"
                    title="Word (.docx) 다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {onPublishToMarket && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPublishToMarket(form);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-colors"
                      title="오픈 마켓플레이스에 발행"
                    >
                      <Upload className="w-3 h-3" />
                      <span>마켓 발행</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(form);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="문서 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
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
                    양식 / 공문서 삭제
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    이 작업은 취소할 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
                <p className="text-xs text-slate-500 font-medium mb-1">삭제할 양식:</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-2">
                  {itemToDelete.title}
                </p>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                정말로 이 업무 양식 문서를 삭제하시겠습니까? 결재선 및 본문 내용이 보관함에서 영구적으로 삭제됩니다.
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
