import React, { useState } from 'react';
import { PresentationDocument } from '../types/presentation';
import { exportToPptx } from '../services/pptxExportService';
import {
  X,
  Presentation,
  Download,
  Trash2,
  Calendar,
  AlertTriangle,
  Upload,
} from 'lucide-react';

interface SavedPresentationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentations: PresentationDocument[];
  onSelectPresentation: (pres: PresentationDocument) => void;
  onDeletePresentation: (id: string) => void;
  onPublishToMarket?: (pres: PresentationDocument) => void;
}

export const SavedPresentationsModal: React.FC<SavedPresentationsModalProps> = ({
  isOpen,
  onClose,
  presentations,
  onSelectPresentation,
  onDeletePresentation,
  onPublishToMarket,
}) => {
  const [itemToDelete, setItemToDelete] = useState<PresentationDocument | null>(null);

  if (!isOpen) return null;

  const handleDownloadPptx = async (e: React.MouseEvent, pres: PresentationDocument) => {
    e.stopPropagation();
    try {
      await exportToPptx(pres);
    } catch (err: any) {
      alert('PPTX 내보내기 실패: ' + (err.message || err));
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeletePresentation(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                내 프레젠테이션 보관함
              </h3>
              <p className="text-xs text-slate-500">
                저장된 슬라이드 덱 {presentations.length}개
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presentation List */}
        <div className="p-6 overflow-y-auto flex-1">
          {presentations.length === 0 ? (
            <div className="text-center py-12">
              <Presentation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">
                저장된 프레젠테이션이 없습니다.
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                상단 [전문 PPT] 탭에서 원하는 주제로 슬라이드 덱을 생성해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {presentations.map((pres) => (
                <div
                  key={pres.id}
                  onClick={() => {
                    onSelectPresentation(pres);
                    onClose();
                  }}
                  className="group rounded-2xl border border-slate-200 p-4 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px]">
                        {pres.field} • {pres.presentationType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {pres.slides?.length || 0} Slides
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {pres.title}
                    </h4>
                    {pres.subtitle && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {pres.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(pres.metadata?.updatedAt || Date.now()).toLocaleDateString('ko-KR')}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onPublishToMarket && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublishToMarket(pres);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-colors"
                          title="오픈 마켓플레이스에 발행"
                        >
                          <Upload className="w-3 h-3" />
                          <span>마켓 발행</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDownloadPptx(e, pres)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title=".pptx 다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(pres);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    프레젠테이션 삭제
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    이 작업은 취소할 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
                <p className="text-xs text-slate-500 font-medium mb-1">삭제할 항목:</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-2">
                  {itemToDelete.title}
                </p>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                정말로 이 프레젠테이션을 삭제하시겠습니까? 저장된 슬라이드 덱 데이터가 보관함에서 영구적으로 삭제됩니다.
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
