import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb,
  FileCheck,
  Bookmark,
  Copy,
  Check,
  Square,
  CheckSquare,
  Table as TableIcon
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Preprocesses raw markdown string to:
 * 1. Split table rows that were generated on a single line (e.g. `| col1 | col2 | | :--- | :--- | | val1 | val2 |`)
 * 2. Ensure newlines before and after headings, tables, blockquotes, and lists
 */
function normalizeMarkdown(raw: string): string {
  if (!raw) return '';

  // Fix tables concatenated on a single line with `| |` or `||`
  const prep = raw.replace(/\|\s*\|\s*/g, '|\n|');

  // Apply the targeted single line table splitter (Solution 1)
  return prep.split('\n').map(fixSingleLineTable).join('\n');
}

// 구분선 패턴이 줄 "중간"에 있고, 앞뒤에 실제 내용이 남아있을 때만
// (= 한 줄에 다 뭉쳐서 생성된 표일 때만) 쪼갠다.
// 이미 구분선만 단독으로 있는 정상 표 줄은 건드리지 않는다.
function fixSingleLineTable(line: string): string {
  const trimmed = line.trim();
  const sepPattern = /\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|/;
  const match = trimmed.match(sepPattern);
  if (!match || match.index === undefined) return line;

  const before = trimmed.slice(0, match.index).trim();
  const sepRow = match[0].trim();
  const after = trimmed.slice(match.index + match[0].length).trim();

  if (!before || !after) return line; // 이미 정상 줄이면 그대로 반환

  return `${before}\n${sepRow}\n${after}`;
}

/**
 * Normalizes Markdown tables so that every line of a table starts and ends with '|'
 * This prevents table splitting, duplication, and misalignment of headers.
 */
function normalizeTableFormatting(lines: string[]): string[] {
  return lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // 만약 이미 파이프로 시작하는 줄인 경우 안전하게 정규화
    if (trimmed.startsWith('|')) {
      let result = trimmed;
      if (!result.endsWith('|')) {
        result = result + ' |';
      }
      return result;
    }

    // 구분선 처리 (예: `---|---` 처럼 앞뒤 파이프가 탈락한 경우 보정)
    if (/^[|\s-:]+$/.test(trimmed) && trimmed.includes('-') && trimmed.includes('|')) {
      let result = trimmed;
      if (!result.startsWith('|')) result = '| ' + result;
      if (!result.endsWith('|')) result = result + ' |';
      return result;
    }

    return line;
  });
}

/**
 * Helper to convert table data into a beautiful list of items for callout box fallback
 */
function convertTableToCalloutText(lines: string[]): string {
  const cleanRows = lines
    .map(l => l.trim())
    .filter(l => l.length > 0 && l.includes('|'));

  if (cleanRows.length === 0) return '';

  const splitCells = (rowStr: string): string[] => {
    let s = rowStr;
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map(c => c.trim());
  };

  const headers = splitCells(cleanRows[0]);
  let dataStartIndex = 1;
  if (cleanRows.length > 1) {
    const secondRowCells = splitCells(cleanRows[1]);
    const isSep = secondRowCells.every(c => /^:?-+:?$/.test(c.replace(/\s+/g, '')));
    if (isSep) dataStartIndex = 2;
  }

  const dataRows = cleanRows.slice(dataStartIndex).map(r => splitCells(r));

  let result = '';
  dataRows.forEach(row => {
    const items: string[] = [];
    row.forEach((cell, idx) => {
      const headerLabel = headers[idx] ? `**${headers[idx]}:** ` : '';
      if (cell) {
        items.push(`${headerLabel}${cell}`);
      }
    });
    if (items.length > 0) {
      result += `• ${items.join('  |  ')}\n`;
    }
  });

  return result.trim();
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const normalized = normalizeMarkdown(content);
  const rawLines = normalized.split('\n');
  const lines = normalizeTableFormatting(rawLines);
  const elements: React.ReactNode[] = [];

  let currentTable: string[] = [];
  let inTable = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let currentQuote: string[] = [];
  let inQuote = false;
  let keyIndex = 0;
  let tableCount = 0;

  const flushTable = () => {
    if (currentTable.length > 0) {
      // Check column count
      const cleanRows = currentTable
        .map(l => l.trim())
        .filter(l => l.length > 0 && l.includes('|'));

      let colCount = 0;
      if (cleanRows.length > 0) {
        let firstRow = cleanRows[0];
        if (firstRow.startsWith('|')) firstRow = firstRow.slice(1);
        if (firstRow.endsWith('|')) firstRow = firstRow.slice(0, -1);
        colCount = firstRow.split('|').length;
      }

      // 첫 번째 테이블이면서 열(Column) 개수가 3개 이상인 경우에만 정식 표로 표시
      // 그 외(두 번째 표이거나, 2열 이하의 좁은 데이터)에는 아주 우아한 요약 카드로 대체하여 렌더링
      if (tableCount === 0 && colCount > 2) {
        elements.push(<EnterpriseTable key={`table-${keyIndex++}`} lines={currentTable} />);
        tableCount++;
      } else {
        const calloutText = convertTableToCalloutText(currentTable);
        if (calloutText) {
          elements.push(
            <CalloutCard
              key={`table-callout-${keyIndex++}`}
              text={`핵심 정보 요약:\n${calloutText}`}
            />
          );
        }
      }
      currentTable = [];
      inTable = false;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      elements.push(<CodeBlockView key={`code-${keyIndex++}`} code={codeBlockContent.join('\n')} />);
      codeBlockContent = [];
      inCodeBlock = false;
    }
  };

  const flushQuote = () => {
    if (currentQuote.length > 0) {
      elements.push(<CalloutCard key={`quote-${keyIndex++}`} text={currentQuote.join('\n')} />);
      currentQuote = [];
      inQuote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code block handling
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushTable();
        flushQuote();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // 2. Table row detection
    const isTableRow = trimmed.startsWith('|') && (trimmed.endsWith('|') || trimmed.includes('|'));
    if (isTableRow) {
      flushQuote();
      inTable = true;
      currentTable.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 3. Blockquote / Callout handling
    if (trimmed.startsWith('>')) {
      inQuote = true;
      currentQuote.push(trimmed.replace(/^>\s?/, ''));
      continue;
    } else if (inQuote) {
      flushQuote();
    }

    // 4. Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${keyIndex++}`} className="h-2.5" />);
      continue;
    }

    // 5. Horizontal Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(
        <div key={`hr-${keyIndex++}`} className="my-6 border-b border-slate-200" />
      );
      continue;
    }

    // 6. Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h5
          key={`h4-${keyIndex++}`}
          className="text-base font-bold text-slate-900 mt-5 mb-2 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          <span>{renderInlineFormatting(trimmed.slice(5))}</span>
        </h5>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h3-${keyIndex++}`}
          className="text-lg font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2.5 border-l-4 border-blue-600 pl-3 py-0.5 bg-blue-50/40 rounded-r-lg"
        >
          <span>{renderInlineFormatting(trimmed.slice(4))}</span>
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h2-${keyIndex++}`}
          className="text-xl font-extrabold text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-slate-200 flex items-center justify-between"
        >
          <span>{renderInlineFormatting(trimmed.slice(3))}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${keyIndex++}`}
          className="text-2xl sm:text-3xl font-black text-slate-900 mt-9 mb-5 pb-3 border-b-2 border-slate-300"
        >
          {renderInlineFormatting(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // 7. Checklists: `- [ ]`, `- [x]`, `[ ]`, `[x]`
    const checkMatch = trimmed.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (checkMatch) {
      const isChecked = checkMatch[1].toLowerCase() === 'x';
      const text = checkMatch[2];
      elements.push(
        <div
          key={`chk-${keyIndex++}`}
          className="flex items-start gap-3 my-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
        >
          <div className="mt-0.5 shrink-0 text-blue-600">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <span className={`text-sm ${isChecked ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}`}>
            {renderInlineFormatting(text)}
          </span>
        </div>
      );
      continue;
    }

    // 8. Numbered badges like `①`, `②`, `③` or `1.`, `2.`
    const circledNumberMatch = trimmed.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)$/);
    if (circledNumberMatch) {
      const symbol = circledNumberMatch[1];
      const text = circledNumberMatch[2];
      elements.push(
        <div
          key={`circ-${keyIndex++}`}
          className="flex items-start gap-3 my-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all"
        >
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
            {symbol}
          </span>
          <div className="text-slate-800 text-sm leading-relaxed flex-1">
            {renderInlineFormatting(text)}
          </div>
        </div>
      );
      continue;
    }

    // 9. Standard Ordered list: `1. `, `2. `
    const numListMatch = rawLine.match(/^(\s*)(\d+)[\.\)]\s+(.*)$/);
    if (numListMatch) {
      const indent = numListMatch[1].length;
      const num = numListMatch[2];
      const text = numListMatch[3];
      elements.push(
        <div
          key={`oli-${keyIndex++}`}
          className={`flex items-start gap-2.5 text-slate-800 text-sm leading-relaxed my-1.5 ${
            indent > 2 ? 'ml-6' : 'ml-1'
          }`}
        >
          <span className="inline-flex items-center justify-center min-w-[22px] h-5.5 px-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5 border border-slate-200">
            {num}
          </span>
          <span className="flex-1">{renderInlineFormatting(text)}</span>
        </div>
      );
      continue;
    }

    // 10. Unordered list: `- `, `* `, `• `
    const bulletMatch = rawLine.match(/^(\s*)([-*•])\s+(.*)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const text = bulletMatch[3];
      elements.push(
        <div
          key={`li-${keyIndex++}`}
          className={`flex items-start gap-2.5 text-slate-800 text-sm leading-relaxed my-1.5 ${
            indent > 2 ? 'ml-6' : 'ml-1'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 font-bold mt-2 select-none shrink-0" />
          <span className="flex-1">{renderInlineFormatting(text)}</span>
        </div>
      );
      continue;
    }

    // 11. Key-Value Banner (e.g. `공공 기여도: ...` or `**핵심 지표:** ...`)
    if (trimmed.startsWith('**') && trimmed.includes(':') && trimmed.indexOf(':') < 30) {
      elements.push(
        <div
          key={`kv-${keyIndex++}`}
          className="my-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 text-sm leading-relaxed"
        >
          {renderInlineFormatting(trimmed)}
        </div>
      );
      continue;
    }

    // 12. Standard paragraph
    elements.push(
      <p key={`p-${keyIndex++}`} className="text-slate-800 text-sm sm:text-[15px] leading-relaxed my-2">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushTable();
  flushCodeBlock();
  flushQuote();

  return <div className={`prose-professional space-y-1 ${className}`}>{elements}</div>;
};

// ==========================================
// Sub-components: Tables, Callouts, Code
// ==========================================

function EnterpriseTable({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;

  // Clean lines and filter out empty ones
  const rawRows = lines
    .map(l => l.trim())
    .filter(l => l.length > 0 && l.includes('|'));

  if (rawRows.length === 0) return null;

  // Helper to split a table row by pipe
  const splitCells = (rowStr: string): string[] => {
    // Remove leading/trailing pipes if present
    let s = rowStr;
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map(c => c.trim());
  };

  const firstRowCells = splitCells(rawRows[0]);
  
  // Check if second row is a separator (e.g., `:---`, `---`)
  let hasSeparator = false;
  let dataStartIndex = 1;

  if (rawRows.length > 1) {
    const secondRowCells = splitCells(rawRows[1]);
    const isSep = secondRowCells.every(c => /^:?-+:?$/.test(c.replace(/\s+/g, '')));
    if (isSep) {
      hasSeparator = true;
      dataStartIndex = 2;
    }
  }

  const headers = firstRowCells;
  const dataRows = rawRows.slice(dataStartIndex).map(r => splitCells(r));

  return (
    <div className="my-6 rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
      {/* Table Header Bar */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white text-xs font-bold tracking-wide">
          <TableIcon className="w-4 h-4 text-blue-400" />
          <span>전략 데이터 및 구조화 비교표</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          총 {dataRows.length}개 항목
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800">
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap"
                >
                  {renderInlineFormatting(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`transition-colors hover:bg-blue-50/40 ${
                  rIdx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                }`}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-4 py-3 text-slate-800 text-xs sm:text-sm leading-relaxed align-top"
                  >
                    {renderInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalloutCard({ text }: { text: string }) {
  // Determine callout style from content
  const lower = text.toLowerCase();
  let icon = <Info className="w-4 h-4 text-blue-600" />;
  let borderClass = 'border-blue-300 bg-blue-50/50 text-blue-950';
  let badgeTitle = '안내 / 참고';

  if (lower.includes('주의') || lower.includes('리스크') || lower.includes('경고') || lower.includes('warning')) {
    icon = <AlertCircle className="w-4 h-4 text-amber-600" />;
    borderClass = 'border-amber-300 bg-amber-50/60 text-amber-950';
    badgeTitle = '주의 / 리스크 관리';
  } else if (lower.includes('핵심') || lower.includes('요약') || lower.includes('공공') || lower.includes('key')) {
    icon = <Sparkles className="w-4 h-4 text-indigo-600" />;
    borderClass = 'border-indigo-300 bg-indigo-50/60 text-indigo-950';
    badgeTitle = '핵심 요약 및 가치';
  } else if (lower.includes('성공') || lower.includes('확인') || lower.includes('체크')) {
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    borderClass = 'border-emerald-300 bg-emerald-50/60 text-emerald-950';
    badgeTitle = '실행 체크포인트';
  }

  return (
    <div className={`my-4 p-4 rounded-2xl border ${borderClass} shadow-2xs space-y-2`}>
      <div className="flex items-center gap-2 font-bold text-xs">
        {icon}
        <span>{badgeTitle}</span>
      </div>
      <div className="text-sm leading-relaxed font-normal whitespace-pre-wrap">
        {renderInlineFormatting(text)}
      </div>
    </div>
  );
}

function CodeBlockView({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Code / Data Block</span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '복사됨' : '복사'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-slate-100 font-mono text-xs sm:text-sm leading-relaxed">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

// Render inline formatting: **bold**, `code`, and highlighting
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`(.*?)`/);

    let nextMatch: { type: 'bold' | 'code'; index: number; length: number; content: string } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      nextMatch = {
        type: 'bold',
        index: boldMatch.index,
        length: boldMatch[0].length,
        content: boldMatch[1],
      };
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (!nextMatch || codeMatch.index < nextMatch.index) {
        nextMatch = {
          type: 'code',
          index: codeMatch.index,
          length: codeMatch[0].length,
          content: codeMatch[1],
        };
      }
    }

    if (!nextMatch) {
      parts.push(remaining);
      break;
    }

    if (nextMatch.index > 0) {
      parts.push(remaining.substring(0, nextMatch.index));
    }

    if (nextMatch.type === 'bold') {
      parts.push(
        <strong key={`b-${partKey++}`} className="font-bold text-slate-950">
          {nextMatch.content}
        </strong>
      );
    } else if (nextMatch.type === 'code') {
      parts.push(
        <code
          key={`c-${partKey++}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-blue-700 font-mono text-xs border border-slate-200"
        >
          {nextMatch.content}
        </code>
      );
    }

    remaining = remaining.substring(nextMatch.index + nextMatch.length);
  }

  return <>{parts}</>;
}
