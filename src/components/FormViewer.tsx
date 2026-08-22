import React, { useState, useEffect, useRef } from 'react';
import {
  BusinessFormDocument,
  FormSection,
  FormApprovalStep,
  FormTableRow,
} from '../types/formStudio';
import { exportFormToDocx } from '../services/formWordExportService';
import { requestAiEditBusinessForm } from '../services/aiService';
import { FormAssistantDrawer } from './FormAssistantDrawer';
import {
  FileText,
  Download,
  Printer,
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  Stamp,
  Building2,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  FileCheck,
} from 'lucide-react';

interface FormViewerProps {
  document: BusinessFormDocument;
  onUpdateDocument?: (doc: BusinessFormDocument) => void;
  onBackToForm?: () => void;
}

export const FormViewer: React.FC<FormViewerProps> = ({
  document: initialDoc,
  onUpdateDocument,
  onBackToForm,
}) => {
  const [doc, setDoc] = useState<BusinessFormDocument>(initialDoc);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setDoc(initialDoc);
  }, [initialDoc]);

  const triggerUpdate = (updated: BusinessFormDocument) => {
    setDoc(updated);
    if (onUpdateDocument) {
      onUpdateDocument(updated);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // 1. Export to DOCX
  const handleExportWord = async () => {
    try {
      setIsExportingWord(true);
      await exportFormToDocx(doc);
    } catch (err) {
      console.error('Word export failed:', err);
    } finally {
      setIsExportingWord(false);
    }
  };

  // 2. Print (A4)
  const handlePrint = () => {
    window.print();
  };

  // 3. AI Natural Language Update
  const handleApplyAiUpdate = async (instruction: string) => {
    setIsAiLoading(true);
    try {
      const updated = await requestAiEditBusinessForm(doc, instruction);
      triggerUpdate(updated);
    } catch (err) {
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  // 4. Interactive Approval Stamp click
  const toggleApprovalStep = (stepIdx: number) => {
    if (!doc.approvalLine) return;
    const updatedLine = [...doc.approvalLine];
    const current = updatedLine[stepIdx];

    if (current.status === 'approved') {
      current.status = 'pending';
      current.signature = undefined;
      current.date = undefined;
    } else {
      current.status = 'approved';
      current.signature = '승인(인)';
      current.date = new Date().toISOString().slice(0, 10);
    }

    triggerUpdate({
      ...doc,
      approvalLine: updatedLine,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>양식 변경사항이 실시간 저장되었습니다.</span>
        </div>
      )}

      {/* Top Action Bar (Hidden in Print) */}
      <div className="print:hidden bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                표준 A4 공문서 뷰어
              </span>
              <span className="text-xs text-slate-500 font-semibold">{doc.docNumber}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
              {doc.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* AI natural language edit button */}
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-amber-200" />
            <span>AI 자연어 양식 수정</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-300 text-slate-950 font-black">
              AI
            </span>
          </button>

          {onBackToForm && (
            <button
              onClick={onBackToForm}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              새 양식 작성
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            title="브라우저 인쇄 또는 PDF 저장"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>인쇄 / PDF</span>
          </button>

          <button
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExportingWord ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>워드 변환 중...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>.DOCX (워드) 다운로드</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide Banner (Hidden in Print) */}
      <div className="print:hidden p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            💡 <strong>실무 팁:</strong> 우측 상단 결재란의 도장 칸을 클릭하면 <strong>승인(인) 도장 날인</strong>이 토글됩니다.
          </span>
        </div>
        <span className="text-[11px] text-amber-700 hidden sm:inline">A4 1페이지 규격 자동 최적화</span>
      </div>

      {/* A4 Paper Document Preview Container */}
      <div className="bg-slate-200/60 p-4 sm:p-8 rounded-3xl flex justify-center print:bg-white print:p-0 print:m-0">
        <div className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1100px] shadow-2xl p-8 sm:p-12 border border-slate-300/80 print:shadow-none print:border-none print:p-0 font-sans space-y-6 relative select-text">
          
          {/* Top Document Header & Approval Line Table */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-2 border-b-2 border-slate-900">
            {/* Title */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                OFFICIAL BUSINESS FORM
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {doc.title}
              </h1>
            </div>

            {/* Approval Line (결재선 도장 박스) */}
            {doc.approvalLine && doc.approvalLine.length > 0 && (
              <div className="shrink-0">
                <table className="border-collapse border border-slate-400 text-center text-xs">
                  <tbody>
                    <tr>
                      <th
                        rowSpan={2}
                        className="w-6 px-1.5 py-1 bg-slate-100 border-r border-b border-slate-400 font-black text-slate-700 writing-mode-vertical"
                      >
                        결재
                      </th>
                      {doc.approvalLine.map((step, sIdx) => (
                        <th
                          key={sIdx}
                          className="w-16 px-1.5 py-1 bg-slate-50 border-r border-b border-slate-400 font-bold text-slate-800 text-[11px] last:border-r-0"
                        >
                          {step.role}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {doc.approvalLine.map((step, sIdx) => {
                        const isApproved = step.status === 'approved';
                        return (
                          <td
                            key={sIdx}
                            onClick={() => toggleApprovalStep(sIdx)}
                            className="h-14 border-r border-slate-400 last:border-r-0 relative cursor-pointer hover:bg-amber-50/50 transition-colors p-1"
                            title="클릭하여 승인 도장 날인"
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              {isApproved ? (
                                <div className="border-2 border-rose-600 text-rose-600 rounded-full w-9 h-9 flex flex-col items-center justify-center text-[9px] font-black leading-none transform -rotate-12 shadow-2xs">
                                  <span>승인</span>
                                  <span className="text-[7px] font-normal">{step.name?.slice(0, 3)}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-300 font-medium">미결</span>
                              )}
                              <span className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">
                                {step.name || ''}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Meta Info Grid (기안자, 문서번호, 일자) */}
          <div className="border border-slate-300 text-xs divide-y divide-slate-300">
            <div className="grid grid-cols-4 divide-x divide-slate-300 bg-slate-50">
              <div className="p-2 font-bold text-slate-700 bg-slate-100 flex items-center justify-center">
                문서 번호
              </div>
              <div className="p-2 font-medium text-slate-800 flex items-center">{doc.docNumber || '일반-2026'}</div>
              <div className="p-2 font-bold text-slate-700 bg-slate-100 flex items-center justify-center">
                기안 일자
              </div>
              <div className="p-2 font-medium text-slate-800 flex items-center">{doc.draftDate}</div>
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-300">
              <div className="p-2 font-bold text-slate-700 bg-slate-100 flex items-center justify-center">
                기 안 자
              </div>
              <div className="p-2 font-medium text-slate-800 flex items-center">
                {`${doc.drafter.department || ''} ${doc.drafter.name} ${doc.drafter.position || ''}`}
              </div>
              <div className="p-2 font-bold text-slate-700 bg-slate-100 flex items-center justify-center">
                시행 일자
              </div>
              <div className="p-2 font-medium text-slate-800 flex items-center">
                {doc.effectiveDate || doc.draftDate}
              </div>
            </div>
            {doc.recipient?.company && (
              <div className="grid grid-cols-4 divide-x divide-slate-300">
                <div className="p-2 font-bold text-slate-700 bg-slate-100 flex items-center justify-center">
                  수 신 처
                </div>
                <div className="p-2 font-medium text-slate-800 col-span-3">
                  {`${doc.recipient.company} ${doc.recipient.name ? `(${doc.recipient.name})` : ''}`}
                </div>
              </div>
            )}
          </div>

          {/* Total Amount Box (If applicable) */}
          {(doc.totalAmountText || doc.totalAmountNumber) && (
            <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">합계 금액 (VAT 포함)</span>
              <span className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                {doc.totalAmountText || `₩${(doc.totalAmountNumber || 0).toLocaleString()}원정`}
              </span>
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-6 pt-2">
            {doc.sections.map((section, idx) => (
              <div key={section.id || idx} className="space-y-2">
                {/* Section Title */}
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-300">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{section.title}</span>
                </h3>

                {/* Section Content */}
                {section.type === 'text' && section.content && (
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap pl-1">
                    {section.content}
                  </p>
                )}

                {section.type === 'bullet_list' && section.items && (
                  <ul className="space-y-1 pl-1 text-xs text-slate-700 list-disc list-inside">
                    {section.items.map((item, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.type === 'key_value' && section.keyValues && (
                  <div className="border border-slate-300 rounded divide-y divide-slate-200 text-xs">
                    {section.keyValues.map((kv, kIdx) => (
                      <div key={kIdx} className="grid grid-cols-3 divide-x divide-slate-200">
                        <div className="p-2 font-bold bg-slate-50 text-slate-700">{kv.label}</div>
                        <div className="p-2 text-slate-800 col-span-2">{kv.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {section.type === 'table' && section.columns && section.rows && (
                  <div className="overflow-x-auto border border-slate-300 rounded">
                    <table className="w-full border-collapse text-xs">
                      <thead className="bg-slate-800 text-white">
                        <tr>
                          {section.columns.map((col, cIdx) => (
                            <th
                              key={col.key || cIdx}
                              className={`p-2 font-bold border-r border-slate-700 last:border-r-0 ${
                                col.align === 'right'
                                  ? 'text-right'
                                  : col.align === 'center'
                                  ? 'text-center'
                                  : 'text-left'
                              }`}
                            >
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {section.rows.map((row, rIdx) => (
                          <tr
                            key={row.id || rIdx}
                            className={row.isTotal ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50/50'}
                          >
                            {section.columns!.map((col, cIdx) => {
                              const cellVal = row.cells[col.key];
                              let formatted = cellVal !== undefined && cellVal !== null ? String(cellVal) : '-';
                              if (col.format === 'currency' && typeof cellVal === 'number') {
                                formatted = `${cellVal.toLocaleString()}원`;
                              }
                              return (
                                <td
                                  key={cIdx}
                                  className={`p-2 border-r border-slate-200 last:border-r-0 ${
                                    col.align === 'right'
                                      ? 'text-right font-mono'
                                      : col.align === 'center'
                                      ? 'text-center'
                                      : 'text-left'
                                  }`}
                                >
                                  {formatted}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Special Terms Box */}
          {doc.specialTerms && doc.specialTerms.length > 0 && (
            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800">[특약사항 및 비고]</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {doc.specialTerms.map((term, tIdx) => (
                  <li key={tIdx}>{term}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Document Footer Signature Statement */}
          <div className="pt-8 text-center space-y-3">
            <p className="text-xs font-bold text-slate-600">
              위와 같이 정히 보고/제출하오니 재가하여 주시기 바랍니다.
            </p>
            <p className="text-xs text-slate-400 font-medium">{doc.draftDate}</p>
            <div className="text-sm font-black text-slate-900 tracking-wider">
              {doc.supplier?.company || doc.recipient?.company || (doc.drafter ? `${doc.drafter.department || ''} ${doc.drafter.name}` : '')} (인)
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Drawer */}
      <FormAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        document={doc}
        onApplyAiUpdate={handleApplyAiUpdate}
        isLoading={isAiLoading}
      />
    </div>
  );
};
