import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Printer,
  FileCode,
  FileText,
  Check,
  Share2
} from 'lucide-react';
import { GeneratedDocument } from '../types/document';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  document: GeneratedDocument;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Generate full markdown document
  const generateMarkdownString = (): string => {
    let md = `# ${document.title}\n`;
    if (document.subtitle) {
      md += `### ${document.subtitle}\n\n`;
    }

    md += `---\n\n`;
    md += `**적용 분야:** ${document.customField || document.field}  \n`;
    md += `**문서 유형:** ${document.customDocumentType || document.documentType}  \n`;
    md += `**작성 목적:** ${document.purpose}  \n`;
    md += `**대상 독자:** ${document.targetAudience}  \n`;
    md += `**작성 일시:** ${new Date(document.metadata.createdAt).toLocaleString('ko-KR')}  \n\n`;

    md += `## [경영진 요약] Executive Summary\n\n`;
    md += `${document.executiveSummary}\n\n`;

    md += `## 목차 (Table of Contents)\n\n`;
    document.tableOfContents.forEach(toc => {
      md += `- **${toc.sectionNumber}** ${toc.title}\n`;
    });
    md += `\n---\n\n`;

    document.sections.forEach(sec => {
      md += `## ${sec.sectionNumber} ${sec.title}\n\n`;
      if (sec.summaryGuideline) {
        md += `> **핵심 요약:** ${sec.summaryGuideline}\n\n`;
      }
      md += `${sec.content}\n\n`;
    });

    if (document.conclusion) {
      md += `## 종합 결론 및 향후 추진 로드맵\n\n`;
      md += `${document.conclusion}\n\n`;
    }

    return md;
  };

  const handleCopy = (type: 'markdown' | 'text') => {
    const textToCopy = generateMarkdownString();
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch {}
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  const sanitizedTitle = document.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').substring(0, 30);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                전문 문서 내보내기 & 공유
              </h3>
              <p className="text-xs text-slate-500">
                원하는 형식으로 문서를 다운로드하거나 복사할 수 있습니다.
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

        {/* Options List */}
        <div className="p-5 space-y-3">
          {/* Markdown Download */}
          <button
            type="button"
            onClick={() =>
              handleDownloadFile(
                `${sanitizedTitle}.md`,
                generateMarkdownString(),
                'text/markdown;charset=utf-8'
              )
            }
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  Markdown (.md) 파일 다운로드
                </div>
                <div className="text-[11px] text-slate-500">
                  노션, 깃허브, 옵시디언 등 마크다운 지원 툴 완벽 호환
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* Plain Text Download */}
          <button
            type="button"
            onClick={() =>
              handleDownloadFile(
                `${sanitizedTitle}.txt`,
                generateMarkdownString(),
                'text/plain;charset=utf-8'
              )
            }
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  텍스트 (.txt) 파일 다운로드
                </div>
                <div className="text-[11px] text-slate-500">
                  어디서나 열람 가능한 순수 텍스트 포맷
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* JSON Export */}
          <button
            type="button"
            onClick={() =>
              handleDownloadFile(
                `${sanitizedTitle}.json`,
                JSON.stringify(document, null, 2),
                'application/json;charset=utf-8'
              )
            }
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  구조화 JSON (.json) 백업
                </div>
                <div className="text-[11px] text-slate-500">
                  섹션 및 메타데이터 원본 구조 데이터 보관
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* Print / PDF Preview */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  인쇄 및 PDF로 저장 (Print to PDF)
                </div>
                <div className="text-[11px] text-slate-500">
                  브라우저 인쇄 대화상자를 열어 깔끔한 PDF로 저장
                </div>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* Clipboard Copy */}
          <button
            type="button"
            onClick={() => handleCopy('markdown')}
            className="w-full p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                {copiedType ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-blue-900">
                  {copiedType ? '클립보드에 복사 완료!' : '전체 문서 클립보드 복사'}
                </div>
                <div className="text-[11px] text-blue-700">
                  워드, 한글(HWP), 슬랙, 노션에 바로 붙여넣기 가능
                </div>
              </div>
            </div>
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
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
      </div>
    </div>
  );
};
