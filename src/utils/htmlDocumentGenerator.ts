import { GeneratedDocument } from '../types/document';

/**
 * Converts markdown text into structured, elegant HTML with enterprise tables, callout cards, lists, and typography.
 */
function markdownToHtml(md: string): string {
  if (!md) return '';

  // Fix table rows concatenated with `| |`
  let text = md.replace(/\|\s*\|\s*/g, '|\n|');
  text = text.replace(/([^\n])\s*(\|\s*:?-+:?\s*\|)/g, '$1\n$2');
  text = text.replace(/(\|\s*:?-+:?\s*\|)\s*([^\n|])/g, '$1\n$2');

  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const rawRows = tableLines.map(l => l.trim()).filter(l => l.includes('|'));
    if (rawRows.length > 0) {
      const splitCells = (r: string) => {
        let s = r;
        if (s.startsWith('|')) s = s.slice(1);
        if (s.endsWith('|')) s = s.slice(0, -1);
        return s.split('|').map(c => c.trim());
      };

      const headers = splitCells(rawRows[0]);
      let dataStartIndex = 1;
      if (rawRows.length > 1) {
        const second = splitCells(rawRows[1]);
        if (second.every(c => /^:?-+:?$/.test(c.replace(/\s+/g, '')))) {
          dataStartIndex = 2;
        }
      }
      const dataRows = rawRows.slice(dataStartIndex).map(r => splitCells(r));

      let tbl = `
      <div class="table-container">
        <div class="table-header-bar">
          <span class="table-title">전략 데이터 및 구조화 비교표</span>
          <span class="table-count">총 ${dataRows.length}개 항목</span>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${formatInline(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${dataRows
              .map(
                (row, rIdx) => `
              <tr class="${rIdx % 2 === 1 ? 'even-row' : 'odd-row'}">
                ${row.map(cell => `<td>${formatInline(cell)}</td>`).join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
      htmlParts.push(tbl);
    }
    tableLines = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Table line
    if (line.startsWith('|') && (line.endsWith('|') || line.includes('|'))) {
      inTable = true;
      tableLines.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!line) {
      htmlParts.push('<div class="spacer"></div>');
      continue;
    }

    if (line === '---' || line === '***') {
      htmlParts.push('<hr class="divider" />');
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      htmlParts.push(`<h5 class="heading-4">${formatInline(line.slice(5))}</h5>`);
      continue;
    }
    if (line.startsWith('### ')) {
      htmlParts.push(`<h4 class="heading-3">${formatInline(line.slice(4))}</h4>`);
      continue;
    }
    if (line.startsWith('## ')) {
      htmlParts.push(`<h3 class="heading-2">${formatInline(line.slice(3))}</h3>`);
      continue;
    }
    if (line.startsWith('# ')) {
      htmlParts.push(`<h2 class="heading-1">${formatInline(line.slice(2))}</h2>`);
      continue;
    }

    // Callout
    if (line.startsWith('>')) {
      const qText = line.replace(/^>\s?/, '');
      htmlParts.push(`<div class="callout-card"><div class="callout-body">${formatInline(qText)}</div></div>`);
      continue;
    }

    // Circled numbers
    const circleMatch = line.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)$/);
    if (circleMatch) {
      htmlParts.push(`
        <div class="circle-item">
          <span class="circle-badge">${circleMatch[1]}</span>
          <span class="circle-text">${formatInline(circleMatch[2])}</span>
        </div>
      `);
      continue;
    }

    // Checkbox
    const chkMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (chkMatch) {
      const checked = chkMatch[1].toLowerCase() === 'x';
      htmlParts.push(`
        <div class="checklist-item ${checked ? 'checked' : ''}">
          <span class="check-box">${checked ? '☑' : '☐'}</span>
          <span class="check-text">${formatInline(chkMatch[2])}</span>
        </div>
      `);
      continue;
    }

    // Numbered list
    const numMatch = raw.match(/^(\s*)(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      htmlParts.push(`
        <div class="ordered-item">
          <span class="num-badge">${numMatch[2]}</span>
          <span class="item-text">${formatInline(numMatch[3])}</span>
        </div>
      `);
      continue;
    }

    // Bullet list
    const bulletMatch = raw.match(/^(\s*)([-*•])\s+(.*)$/);
    if (bulletMatch) {
      htmlParts.push(`
        <div class="bullet-item">
          <span class="bullet-dot">•</span>
          <span class="item-text">${formatInline(bulletMatch[3])}</span>
        </div>
      `);
      continue;
    }

    // Paragraph
    htmlParts.push(`<p class="paragraph">${formatInline(line)}</p>`);
  }

  flushTable();
  return htmlParts.join('\n');
}

function formatInline(str: string): string {
  if (!str) return '';
  let escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Code `text`
  escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');

  return escaped;
}

/**
 * Generates a full, standalone, high-res executive HTML document ready for viewing, archiving, or printing.
 */
export function generateExecutiveHtmlDocument(doc: GeneratedDocument): string {
  const sectionsHtml = doc.sections
    .map(
      sec => `
    <article class="doc-section" id="${sec.id}">
      <div class="section-header">
        <span class="section-number">${sec.sectionNumber}</span>
        <h2 class="section-title">${sec.title}</h2>
      </div>
      ${
        sec.summaryGuideline
          ? `<div class="section-guideline"><span class="guideline-dot"></span><span>${sec.summaryGuideline}</span></div>`
          : ''
      }
      <div class="section-body">
        ${markdownToHtml(sec.content)}
      </div>
    </article>
  `
    )
    .join('\n');

  const tocHtml = doc.tableOfContents
    .map(
      toc => `
    <div class="toc-row">
      <span class="toc-num">${toc.sectionNumber}</span>
      <span class="toc-title">${toc.title}</span>
    </div>
  `
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} - 전문 보고서</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e40af;
      --primary-light: #eff6ff;
      --slate-900: #0f172a;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-500: #64748b;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50: #f8fafc;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', sans-serif;
      background-color: #f8fafc;
      color: var(--slate-800);
      line-height: 1.65;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid var(--slate-200);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      padding: 48px;
    }

    /* Header */
    .header-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .badge-primary {
      background: var(--slate-900);
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .badge-secondary {
      background: var(--slate-100);
      color: var(--slate-700);
      border: 1px solid var(--slate-200);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .meta-date {
      margin-left: auto;
      font-size: 12px;
      color: var(--slate-500);
    }
    .doc-title {
      font-size: 30px;
      font-weight: 900;
      color: var(--slate-900);
      line-height: 1.3;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .doc-subtitle {
      font-size: 16px;
      font-weight: 500;
      color: var(--slate-600);
      margin-bottom: 24px;
    }

    /* Executive Summary */
    .exec-summary-box {
      background: var(--primary-light);
      border: 1px solid #bfdbfe;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 36px;
    }
    .exec-summary-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .exec-summary-text {
      font-size: 14px;
      color: var(--slate-800);
      white-space: pre-wrap;
      line-height: 1.7;
    }

    /* TOC */
    .toc-box {
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 40px;
    }
    .toc-header {
      font-size: 13px;
      font-weight: 800;
      color: var(--slate-900);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .toc-row {
      display: flex;
      gap: 12px;
      font-size: 13px;
      padding: 6px 0;
      border-bottom: 1px dashed var(--slate-200);
    }
    .toc-row:last-child {
      border-bottom: none;
    }
    .toc-num {
      font-weight: 700;
      color: var(--primary);
      min-width: 32px;
    }
    .toc-title {
      color: var(--slate-700);
    }

    /* Sections */
    .doc-section {
      margin-bottom: 48px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--slate-200);
      margin-bottom: 16px;
    }
    .section-number {
      background: var(--primary);
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      font-family: monospace;
    }
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.01em;
    }
    .section-guideline {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--slate-100);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-700);
      margin-bottom: 16px;
    }
    .guideline-dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
    }

    /* Markdown Elements */
    .paragraph {
      font-size: 15px;
      color: var(--slate-800);
      margin: 12px 0;
      line-height: 1.7;
    }
    .heading-1 { font-size: 22px; font-weight: 800; color: var(--slate-900); margin: 24px 0 12px; }
    .heading-2 { font-size: 18px; font-weight: 800; color: var(--slate-900); margin: 20px 0 10px; }
    .heading-3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--slate-900);
      margin: 16px 0 8px;
      padding-left: 10px;
      border-left: 3px solid var(--primary);
      background: #f8fafc;
      padding: 6px 12px;
      border-radius: 0 6px 6px 0;
    }
    .heading-4 { font-size: 14px; font-weight: 700; color: var(--slate-900); margin: 12px 0 6px; }

    .callout-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      font-size: 14px;
      color: #14532d;
    }

    .circle-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #ffffff;
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 12px 16px;
      margin: 10px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .circle-badge {
      background: var(--primary);
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .circle-text {
      font-size: 14px;
      color: var(--slate-800);
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 10px;
      padding: 10px 14px;
      margin: 8px 0;
      font-size: 14px;
    }
    .checklist-item.checked {
      color: var(--slate-500);
      text-decoration: line-through;
    }
    .check-box {
      font-size: 16px;
      color: var(--primary);
    }

    .ordered-item, .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: 6px 0;
      font-size: 14px;
      color: var(--slate-800);
    }
    .num-badge {
      background: var(--slate-100);
      border: 1px solid var(--slate-200);
      color: var(--slate-700);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-top: 2px;
    }
    .bullet-dot {
      color: var(--primary);
      font-weight: 800;
      font-size: 18px;
      line-height: 1;
      margin-top: -2px;
    }

    /* Enterprise Table */
    .table-container {
      margin: 24px 0;
      border-radius: 14px;
      border: 1px solid var(--slate-200);
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
      background: #ffffff;
    }
    .table-header-bar {
      background: var(--slate-900);
      color: #ffffff;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 700;
    }
    .table-count {
      color: var(--slate-400);
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    thead th {
      background: #f8fafc;
      color: var(--slate-700);
      font-weight: 700;
      padding: 12px 16px;
      border-bottom: 2px solid var(--slate-200);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    tbody td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--slate-100);
      color: var(--slate-800);
      vertical-align: top;
      line-height: 1.6;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    .even-row {
      background: #fcfdfe;
    }
    tbody tr:hover {
      background: #eff6ff;
    }

    .spacer {
      height: 12px;
    }
    .divider {
      border: none;
      border-top: 1px solid var(--slate-200);
      margin: 24px 0;
    }

    /* Conclusion */
    .conclusion-box {
      background: var(--slate-900);
      color: #ffffff;
      border-radius: 16px;
      padding: 28px;
      margin-top: 40px;
    }
    .conclusion-title {
      font-size: 16px;
      font-weight: 800;
      color: #93c5fd;
      margin-bottom: 12px;
    }
    .conclusion-text {
      font-size: 14px;
      color: #e2e8f0;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    /* Print Button */
    .print-bar {
      position: sticky;
      top: 20px;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .btn-print {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
      transition: background 0.2s;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .print-bar {
        display: none;
      }
      .doc-section {
        page-break-inside: avoid;
      }
      .table-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="btn-print" onclick="window.print()">🖨️ PDF로 저장 / 인쇄</button>
  </div>
  <div class="container">
    <div class="header-tags">
      <span class="badge-primary">${doc.customField || doc.field}</span>
      <span class="badge-secondary">${doc.customDocumentType || doc.documentType}</span>
      <span class="meta-date">${new Date(doc.metadata.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</span>
    </div>

    <h1 class="doc-title">${doc.title}</h1>
    ${doc.subtitle ? `<p class="doc-subtitle">${doc.subtitle}</p>` : ''}

    <div class="exec-summary-box">
      <div class="exec-summary-title">
        <span>📌 [경영진 요약] Executive Summary</span>
      </div>
      <div class="exec-summary-text">${doc.executiveSummary}</div>
    </div>

    <div class="toc-box">
      <div class="toc-header">목차 (Table of Contents)</div>
      ${tocHtml}
    </div>

    <div class="sections-container">
      ${sectionsHtml}
    </div>

    ${
      doc.conclusion
        ? `
    <div class="conclusion-box">
      <div class="conclusion-title">✨ 종합 결론 및 향후 추진 로드맵</div>
      <div class="conclusion-text">${doc.conclusion}</div>
    </div>
    `
        : ''
    }
  </div>
</body>
</html>`;
}
