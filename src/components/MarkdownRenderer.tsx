import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines and parse blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentTable: string[] = [];
  let inTable = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let keyIndex = 0;

  const flushTable = () => {
    if (currentTable.length > 0) {
      elements.push(renderTable(currentTable, `table-${keyIndex++}`));
      currentTable = [];
      inTable = false;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      elements.push(
        <div key={`code-${keyIndex++}`} className="my-4 p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-sm overflow-x-auto">
          <pre>{codeBlockContent.join('\n')}</pre>
        </div>
      );
      codeBlockContent = [];
      inCodeBlock = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Table detection: line starts and ends with |
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      currentTable.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${keyIndex++}`} className="h-3" />);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${keyIndex++}`} className="text-lg font-bold text-slate-900 mt-5 mb-2.5 flex items-center gap-2 border-l-3 border-blue-600 pl-2.5">
          {renderInlineFormatting(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${keyIndex++}`} className="text-xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-200">
          {renderInlineFormatting(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${keyIndex++}`} className="text-2xl font-bold text-slate-900 mt-7 mb-4">
          {renderInlineFormatting(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith('> ')) {
      // Blockquote / Callout
      elements.push(
        <div key={`quote-${keyIndex++}`} className="my-3.5 p-3.5 rounded-lg bg-blue-50/70 border-l-4 border-blue-500 text-slate-700 text-sm leading-relaxed">
          {renderInlineFormatting(line.slice(2))}
        </div>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      // Unordered list
      const indent = line.search(/\S/);
      const text = line.trim().slice(2);
      elements.push(
        <div
          key={`li-${keyIndex++}`}
          className={`flex items-start gap-2 text-slate-700 text-[15px] leading-relaxed my-1 ${
            indent > 2 ? 'ml-6' : 'ml-2'
          }`}
        >
          <span className="text-blue-500 font-bold mt-1 text-xs select-none">•</span>
          <span className="flex-1">{renderInlineFormatting(text)}</span>
        </div>
      );
    } else if (/^\s*\d+\.\s+/.test(line)) {
      // Ordered list
      const match = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if (match) {
        const num = match[1];
        const text = match[2];
        elements.push(
          <div key={`oli-${keyIndex++}`} className="flex items-start gap-2.5 text-slate-700 text-[15px] leading-relaxed my-1 ml-2">
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold select-none mt-0.5">
              {num}
            </span>
            <span className="flex-1">{renderInlineFormatting(text)}</span>
          </div>
        );
      }
    } else {
      // Standard paragraph
      elements.push(
        <p key={`p-${keyIndex++}`} className="text-slate-700 text-[15px] leading-relaxed my-2">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  }

  flushTable();
  flushCodeBlock();

  return <div className={`prose-professional ${className}`}>{elements}</div>;
};

// Render inline Markdown elements: bold, code, badges
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex to parse **bold** and `code`
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
        <strong key={`b-${partKey++}`} className="font-semibold text-slate-900">
          {nextMatch.content}
        </strong>
      );
    } else if (nextMatch.type === 'code') {
      parts.push(
        <code key={`c-${partKey++}`} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200">
          {nextMatch.content}
        </code>
      );
    }

    remaining = remaining.substring(nextMatch.index + nextMatch.length);
  }

  return <>{parts}</>;
}

// Render Markdown Tables cleanly
function renderTable(tableLines: string[], key: string): React.ReactNode {
  if (tableLines.length < 2) return null;

  const headerLine = tableLines[0];
  const headers = headerLine
    .split('|')
    .slice(1, -1)
    .map(h => h.trim());

  // Skip divider line (line index 1) if present
  const dataLines = tableLines.slice(2);

  return (
    <div key={key} className="my-5 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full text-left text-sm divide-y divide-slate-200">
        <thead className="bg-slate-50 text-slate-700 font-semibold">
          <tr>
            {headers.map((header, idx) => (
              <th key={`th-${idx}`} className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold">
                {renderInlineFormatting(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {dataLines.map((line, rowIdx) => {
            const cells = line
              .split('|')
              .slice(1, -1)
              .map(c => c.trim());
            return (
              <tr key={`tr-${rowIdx}`} className={rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                {cells.map((cell, cellIdx) => (
                  <td key={`td-${rowIdx}-${cellIdx}`} className="px-4 py-2 text-slate-700 text-sm">
                    {renderInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
