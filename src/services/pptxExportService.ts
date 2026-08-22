import PptxGenJS from 'pptxgenjs';
import { PresentationDocument, SlideItem } from '../types/presentation';
import { PRESENTATION_THEMES } from '../constants/presentationThemes';

export async function exportToPptx(presentation: PresentationDocument): Promise<void> {
  const pptx = new PptxGenJS();
  
  // Define 16:9 widescreen layout (13.333" x 7.5")
  pptx.defineLayout({ name: 'WIDE_16_9', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDE_16_9';

  pptx.author = presentation.company || presentation.author || '분야별 전문 PPT 스튜디오';
  pptx.company = presentation.company || 'AI Presentation Studio';
  pptx.title = presentation.title;
  pptx.subject = presentation.subtitle || presentation.title;

  const themeConfig = PRESENTATION_THEMES[presentation.theme] || PRESENTATION_THEMES.dark_navy;
  const colors = themeConfig.pptxColors;

  for (let i = 0; i < presentation.slides.length; i++) {
    const slideItem = presentation.slides[i];
    const slide = pptx.addSlide();

    // 1. Set background color
    slide.background = { color: colors.bg };

    // 2. Embed native PowerPoint speaker notes
    if (slideItem.speakerNotes) {
      slide.addNotes(slideItem.speakerNotes);
    }

    // 3. Render slide layout
    switch (slideItem.layout) {
      case 'title':
        renderTitleSlide(slide, slideItem, presentation, colors);
        break;
      case 'section_header':
        renderSectionHeaderSlide(slide, slideItem, colors);
        break;
      case 'cards_grid_3':
        renderCardsGrid3Slide(slide, slideItem, colors);
        break;
      case 'cards_grid_4':
        renderCardsGrid4Slide(slide, slideItem, colors);
        break;
      case 'swot_matrix':
        renderSwotMatrixSlide(slide, slideItem, colors);
        break;
      case 'comparison_table':
        renderComparisonTableSlide(slide, slideItem, colors);
        break;
      case 'timeline_roadmap':
        renderTimelineSlide(slide, slideItem, colors);
        break;
      case 'market_tam_sam_som':
        renderMarketSizeSlide(slide, slideItem, colors);
        break;
      case 'financial_kpi':
        renderFinancialKpiSlide(slide, slideItem, colors);
        break;
      case 'conclusion_call_to_action':
        renderConclusionSlide(slide, slideItem, colors);
        break;
      case 'bullets_split':
      default:
        renderBulletsSplitSlide(slide, slideItem, colors);
        break;
    }

    // 4. Slide Number & Footer (for non-title slides)
    if (slideItem.layout !== 'title') {
      slide.addText(`${i + 1} / ${presentation.slides.length}`, {
        x: 11.8,
        y: 7.0,
        w: 1.0,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Malgun Gothic',
        color: colors.border,
        align: 'right',
      });

      if (presentation.company) {
        slide.addText(presentation.company, {
          x: 0.8,
          y: 7.0,
          w: 6.0,
          h: 0.3,
          fontSize: 10,
          fontFace: 'Malgun Gothic',
          color: colors.border,
          align: 'left',
        });
      }
    }
  }

  const safeTitle = (presentation.title || 'Presentation')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim();
  const fileName = `${safeTitle}.pptx`;
  
  await pptx.writeFile({ fileName });
}

// ---------------- Helper: Header on standard slides ----------------
function addSlideHeader(slide: any, item: SlideItem, colors: any) {
  // Category / Section badge
  if (item.category) {
    slide.addText(item.category.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 11.5,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
      letterSpacing: 1.5,
    });
  }

  // Slide Title
  slide.addText(item.title || '슬라이드 제목', {
    x: 0.8,
    y: 0.8,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Malgun Gothic',
    color: colors.titleColor,
    bold: true,
  });

  // Key Takeaway / Subtitle
  const sub = item.keyTakeaway || item.subtitle;
  if (sub) {
    slide.addText(sub, {
      x: 0.8,
      y: 1.42,
      w: 11.5,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Malgun Gothic',
      color: colors.bodyColor,
    });
  }

  // Divider line under header
  slide.addShape('rect', {
    x: 0.8,
    y: 1.88,
    w: 11.733,
    h: 0.02,
    fill: { color: colors.border },
    line: { color: colors.border, width: 0.5 },
  });
}

// ---------------- 1. Title Slide ----------------
function renderTitleSlide(slide: any, item: SlideItem, pres: PresentationDocument, colors: any) {
  // Decorative Accent Box
  slide.addShape('rect', {
    x: 0.8,
    y: 1.2,
    w: 0.15,
    h: 4.8,
    fill: { color: colors.accentColor },
    line: { color: colors.accentColor, width: 0 },
  });

  // Category Tag
  if (item.category || pres.presentationType) {
    slide.addText((item.category || pres.presentationType || 'BUSINESS DECK').toUpperCase(), {
      x: 1.2,
      y: 1.3,
      w: 10.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
      letterSpacing: 2,
    });
  }

  // Main Title
  slide.addText(item.title || pres.title, {
    x: 1.2,
    y: 1.8,
    w: 10.8,
    h: 1.8,
    fontSize: 34,
    fontFace: 'Malgun Gothic',
    color: colors.titleColor,
    bold: true,
    valign: 'middle',
  });

  // Subtitle / Key Takeaway
  const sub = item.subtitle || pres.subtitle || item.keyTakeaway;
  if (sub) {
    slide.addText(sub, {
      x: 1.2,
      y: 3.8,
      w: 10.8,
      h: 0.9,
      fontSize: 16,
      fontFace: 'Malgun Gothic',
      color: colors.bodyColor,
      valign: 'top',
    });
  }

  // Footer Metadata Box
  slide.addShape('rect', {
    x: 1.2,
    y: 5.6,
    w: 10.8,
    h: 0.7,
    fill: { color: colors.cardBg },
    line: { color: colors.border, width: 1 },
  });

  const infoParts = [
    pres.company ? `회사: ${pres.company}` : '',
    pres.targetAudience ? `발표 대상: ${pres.targetAudience}` : '',
    `일자: ${new Date(pres.metadata?.createdAt || Date.now()).toLocaleDateString('ko-KR')}`,
  ].filter(Boolean);

  slide.addText(infoParts.join('    |    '), {
    x: 1.4,
    y: 5.75,
    w: 10.4,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Malgun Gothic',
    color: colors.bodyColor,
    valign: 'middle',
  });
}

// ---------------- 2. Section Header Slide ----------------
function renderSectionHeaderSlide(slide: any, item: SlideItem, colors: any) {
  // Center Card
  slide.addShape('rect', {
    x: 1.5,
    y: 1.5,
    w: 10.333,
    h: 4.5,
    fill: { color: colors.cardBg },
    line: { color: colors.border, width: 1 },
  });

  if (item.category) {
    slide.addText(item.category.toUpperCase(), {
      x: 2.0,
      y: 2.2,
      w: 9.333,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
      align: 'center',
    });
  }

  slide.addText(item.title, {
    x: 2.0,
    y: 2.8,
    w: 9.333,
    h: 1.4,
    fontSize: 32,
    fontFace: 'Malgun Gothic',
    color: colors.titleColor,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  if (item.subtitle || item.keyTakeaway) {
    slide.addText(item.subtitle || item.keyTakeaway || '', {
      x: 2.0,
      y: 4.3,
      w: 9.333,
      h: 0.9,
      fontSize: 15,
      fontFace: 'Malgun Gothic',
      color: colors.bodyColor,
      align: 'center',
      valign: 'top',
    });
  }
}

// ---------------- 3. Bullets Split Layout ----------------
function renderBulletsSplitSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  // Left card: Key Insight & Takeaway
  slide.addShape('rect', {
    x: 0.8,
    y: 2.1,
    w: 3.8,
    h: 4.6,
    fill: { color: colors.cardBg },
    line: { color: colors.border, width: 1 },
  });

  slide.addText('핵심 요약 (Key Insight)', {
    x: 1.0,
    y: 2.35,
    w: 3.4,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Malgun Gothic',
    color: colors.accentColor,
    bold: true,
  });

  slide.addText(item.keyTakeaway || item.subtitle || '주요 핵심 의사결정 사항 및 실행 전략 요약입니다.', {
    x: 1.0,
    y: 2.85,
    w: 3.4,
    h: 3.6,
    fontSize: 13,
    fontFace: 'Malgun Gothic',
    color: colors.bodyColor,
    valign: 'top',
    lineSpacing: 20,
  });

  // Right Card: Detailed Points
  slide.addShape('rect', {
    x: 4.9,
    y: 2.1,
    w: 7.633,
    h: 4.6,
    fill: { color: colors.cardBg },
    line: { color: colors.border, width: 1 },
  });

  const bullets = item.content.bulletPoints || [];
  const bulletItems = bullets.map((b) => ({
    text: b,
    options: {
      bullet: { code: '25AA' },
      color: colors.titleColor,
      fontSize: 13,
      breakLine: true,
    },
  }));

  if (bulletItems.length > 0) {
    slide.addText(bulletItems, {
      x: 5.2,
      y: 2.35,
      w: 7.033,
      h: 4.1,
      fontFace: 'Malgun Gothic',
      valign: 'top',
      lineSpacing: 28,
    });
  }
}

// ---------------- 4. Cards Grid 3 Layout ----------------
function renderCardsGrid3Slide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const cards = item.content.cards || [];
  const cardW = 3.65;
  const startX = 0.8;
  const gap = 0.39;
  const startY = 2.1;
  const cardH = 4.6;

  for (let i = 0; i < Math.min(cards.length, 3); i++) {
    const c = cards[i];
    const x = startX + i * (cardW + gap);

    // Card background
    slide.addShape('rect', {
      x,
      y: startY,
      w: cardW,
      h: cardH,
      fill: { color: colors.cardBg },
      line: { color: colors.border, width: 1 },
    });

    // Tag / Number
    slide.addText(c.tag || `0${i + 1}`, {
      x: x + 0.25,
      y: startY + 0.25,
      w: cardW - 0.5,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
    });

    // Card Title
    slide.addText(c.title, {
      x: x + 0.25,
      y: startY + 0.65,
      w: cardW - 0.5,
      h: 0.6,
      fontSize: 15,
      fontFace: 'Malgun Gothic',
      color: colors.titleColor,
      bold: true,
      valign: 'middle',
    });

    // Card Subtitle if any
    if (c.subtitle) {
      slide.addText(c.subtitle, {
        x: x + 0.25,
        y: startY + 1.3,
        w: cardW - 0.5,
        h: 0.4,
        fontSize: 11,
        fontFace: 'Malgun Gothic',
        color: colors.secondaryAccent || colors.accentColor,
      });
    }

    // Card Description
    slide.addText(c.description, {
      x: x + 0.25,
      y: startY + (c.subtitle ? 1.75 : 1.35),
      w: cardW - 0.5,
      h: 2.8,
      fontSize: 12,
      fontFace: 'Malgun Gothic',
      color: colors.bodyColor,
      valign: 'top',
      lineSpacing: 19,
    });
  }
}

// ---------------- 5. Cards Grid 4 Layout ----------------
function renderCardsGrid4Slide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const cards = item.content.cards || [];
  const cardW = 2.7;
  const startX = 0.8;
  const gap = 0.31;
  const startY = 2.1;
  const cardH = 4.6;

  for (let i = 0; i < Math.min(cards.length, 4); i++) {
    const c = cards[i];
    const x = startX + i * (cardW + gap);

    slide.addShape('rect', {
      x,
      y: startY,
      w: cardW,
      h: cardH,
      fill: { color: colors.cardBg },
      line: { color: colors.border, width: 1 },
    });

    slide.addText(c.tag || `STEP 0${i + 1}`, {
      x: x + 0.2,
      y: startY + 0.25,
      w: cardW - 0.4,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
    });

    slide.addText(c.title, {
      x: x + 0.2,
      y: startY + 0.6,
      w: cardW - 0.4,
      h: 0.55,
      fontSize: 14,
      fontFace: 'Malgun Gothic',
      color: colors.titleColor,
      bold: true,
      valign: 'middle',
    });

    slide.addText(c.description, {
      x: x + 0.2,
      y: startY + 1.25,
      w: cardW - 0.4,
      h: 3.0,
      fontSize: 11,
      fontFace: 'Malgun Gothic',
      color: colors.bodyColor,
      valign: 'top',
      lineSpacing: 18,
    });
  }
}

// ---------------- 6. SWOT Matrix Layout ----------------
function renderSwotMatrixSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const swot = item.content.swot || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  const boxW = 5.7;
  const boxH = 2.2;
  const leftX = 0.8;
  const rightX = 6.833;
  const topY = 2.1;
  const bottomY = 4.5;

  const quadrants = [
    { title: '강점 (Strengths)', items: swot.strengths, x: leftX, y: topY, tagColor: '10B981' },
    { title: '약점 (Weaknesses)', items: swot.weaknesses, x: rightX, y: topY, tagColor: 'F59E0B' },
    { title: '기회 (Opportunities)', items: swot.opportunities, x: leftX, y: bottomY, tagColor: '38BDF8' },
    { title: '위협 (Threats)', items: swot.threats, x: rightX, y: bottomY, tagColor: 'F43F5E' },
  ];

  quadrants.forEach((q) => {
    slide.addShape('rect', {
      x: q.x,
      y: q.y,
      w: boxW,
      h: boxH,
      fill: { color: colors.cardBg },
      line: { color: colors.border, width: 1 },
    });

    slide.addText(q.title, {
      x: q.x + 0.25,
      y: q.y + 0.15,
      w: boxW - 0.5,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Malgun Gothic',
      color: q.tagColor,
      bold: true,
    });

    const bullets = (q.items || []).map((t) => ({
      text: t,
      options: {
        bullet: { code: '2022' },
        color: colors.bodyColor,
        fontSize: 11,
        breakLine: true,
      },
    }));

    if (bullets.length > 0) {
      slide.addText(bullets, {
        x: q.x + 0.25,
        y: q.y + 0.55,
        w: boxW - 0.5,
        h: boxH - 0.65,
        fontFace: 'Malgun Gothic',
        valign: 'top',
        lineSpacing: 18,
      });
    }
  });
}

// ---------------- 7. Comparison Table Layout ----------------
function renderComparisonTableSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const tableData = item.content.table;
  if (!tableData || !tableData.headers || tableData.headers.length === 0) {
    renderBulletsSplitSlide(slide, item, colors);
    return;
  }

  const rows: any[] = [];

  // Header Row
  const headerRow = tableData.headers.map((h) => ({
    text: h,
    options: {
      bold: true,
      color: colors.titleColor,
      fill: { color: colors.border },
      fontSize: 12,
      fontFace: 'Malgun Gothic',
      align: 'center',
    },
  }));
  rows.push(headerRow);

  // Data Rows
  tableData.rows.forEach((r, idx) => {
    const rowCells = r.map((cell) => ({
      text: cell,
      options: {
        color: colors.bodyColor,
        fill: { color: idx % 2 === 0 ? colors.cardBg : colors.bg },
        fontSize: 11,
        fontFace: 'Malgun Gothic',
        align: 'left',
      },
    }));
    rows.push(rowCells);
  });

  slide.addTable(rows, {
    x: 0.8,
    y: 2.1,
    w: 11.733,
    colW: Array(tableData.headers.length).fill(11.733 / tableData.headers.length),
    border: { pt: 1, color: colors.border },
  });
}

// ---------------- 8. Timeline Roadmap Layout ----------------
function renderTimelineSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const timeline = item.content.timeline || [];
  const cardW = 2.7;
  const startX = 0.8;
  const gap = 0.31;
  const startY = 2.1;
  const cardH = 4.6;

  for (let i = 0; i < Math.min(timeline.length, 4); i++) {
    const t = timeline[i];
    const x = startX + i * (cardW + gap);

    slide.addShape('rect', {
      x,
      y: startY,
      w: cardW,
      h: cardH,
      fill: { color: colors.cardBg },
      line: { color: colors.border, width: 1 },
    });

    slide.addText(t.period || `PHASE 0${i + 1}`, {
      x: x + 0.2,
      y: startY + 0.25,
      w: cardW - 0.4,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
    });

    slide.addText(t.title, {
      x: x + 0.2,
      y: startY + 0.6,
      w: cardW - 0.4,
      h: 0.6,
      fontSize: 14,
      fontFace: 'Malgun Gothic',
      color: colors.titleColor,
      bold: true,
      valign: 'middle',
    });

    const bullets = (t.details || []).map((d) => ({
      text: d,
      options: {
        bullet: { code: '2022' },
        color: colors.bodyColor,
        fontSize: 11,
        breakLine: true,
      },
    }));

    if (bullets.length > 0) {
      slide.addText(bullets, {
        x: x + 0.2,
        y: startY + 1.3,
        w: cardW - 0.4,
        h: 3.0,
        fontFace: 'Malgun Gothic',
        valign: 'top',
        lineSpacing: 18,
      });
    }
  }
}

// ---------------- 9. Market TAM-SAM-SOM Layout ----------------
function renderMarketSizeSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const market = item.content.marketSize || {
    tam: { title: 'TAM (전체 시장)', value: '10조 원', desc: '국내외 전체 잠재 시장 규모' },
    sam: { title: 'SAM (유효 시장)', value: '2.5조 원', desc: '당사 비즈니스 모델로 도달 가능한 시장' },
    som: { title: 'SOM (수익 시장)', value: '3,000억 원', desc: '초기 3개년 내 점유 목표 시장' },
  };

  const tiers = [
    { key: 'TAM', ...market.tam, color: '38BDF8', w: 3.65, x: 0.8 },
    { key: 'SAM', ...market.sam, color: '818CF8', w: 3.65, x: 4.84 },
    { key: 'SOM', ...market.som, color: 'F59E0B', w: 3.65, x: 8.88 },
  ];

  tiers.forEach((t) => {
    slide.addShape('rect', {
      x: t.x,
      y: 2.1,
      w: t.w,
      h: 4.6,
      fill: { color: colors.cardBg },
      line: { color: colors.border, width: 1 },
    });

    slide.addText(t.key, {
      x: t.x + 0.25,
      y: 2.35,
      w: t.w - 0.5,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Malgun Gothic',
      color: t.color,
      bold: true,
    });

    slide.addText(t.title, {
      x: t.x + 0.25,
      y: 2.75,
      w: t.w - 0.5,
      h: 0.45,
      fontSize: 13,
      fontFace: 'Malgun Gothic',
      color: colors.titleColor,
      bold: true,
    });

    // Big Value
    slide.addText(t.value, {
      x: t.x + 0.25,
      y: 3.3,
      w: t.w - 0.5,
      h: 0.8,
      fontSize: 26,
      fontFace: 'Malgun Gothic',
      color: colors.titleColor,
      bold: true,
    });

    // Description
    slide.addText(t.desc, {
      x: t.x + 0.25,
      y: 4.25,
      w: t.w - 0.5,
      h: 2.2,
      fontSize: 12,
      fontFace: 'Malgun Gothic',
      color: colors.bodyColor,
      valign: 'top',
      lineSpacing: 18,
    });
  });
}

// ---------------- 10. Financial KPI Layout ----------------
function renderFinancialKpiSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  const metrics = item.content.metrics || [];
  const cardW = 3.65;
  const startX = 0.8;
  const gap = 0.39;
  const startY = 2.1;
  const cardH = 4.6;

  for (let i = 0; i < Math.min(metrics.length, 3); i++) {
    const m = metrics[i];
    const x = startX + i * (cardW + gap);

    slide.addShape('rect', {
      x,
      y: startY,
      w: cardW,
      h: cardH,
      fill: { color: colors.cardBg },
      line: { color: colors.border, width: 1 },
    });

    slide.addText(m.label, {
      x: x + 0.25,
      y: startY + 0.3,
      w: cardW - 0.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Malgun Gothic',
      color: colors.accentColor,
      bold: true,
    });

    slide.addText(m.value, {
      x: x + 0.25,
      y: startY + 0.8,
      w: cardW - 0.5,
      h: 0.9,
      fontSize: 28,
      fontFace: 'Malgun Gothic',
      color: colors.titleColor,
      bold: true,
    });

    if (m.change) {
      slide.addText(m.change, {
        x: x + 0.25,
        y: startY + 1.8,
        w: cardW - 0.5,
        h: 0.35,
        fontSize: 12,
        fontFace: 'Malgun Gothic',
        color: '10B981',
        bold: true,
      });
    }

    if (m.note) {
      slide.addText(m.note, {
        x: x + 0.25,
        y: startY + (m.change ? 2.25 : 1.9),
        w: cardW - 0.5,
        h: 2.3,
        fontSize: 12,
        fontFace: 'Malgun Gothic',
        color: colors.bodyColor,
        valign: 'top',
        lineSpacing: 18,
      });
    }
  }
}

// ---------------- 11. Conclusion Slide ----------------
function renderConclusionSlide(slide: any, item: SlideItem, colors: any) {
  addSlideHeader(slide, item, colors);

  // Big Highlight Card
  slide.addShape('rect', {
    x: 0.8,
    y: 2.1,
    w: 11.733,
    h: 4.6,
    fill: { color: colors.cardBg },
    line: { color: colors.accentColor, width: 2 },
  });

  slide.addText('결론 및 제언 (Conclusion & The Ask)', {
    x: 1.2,
    y: 2.4,
    w: 10.933,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Malgun Gothic',
    color: colors.accentColor,
    bold: true,
  });

  slide.addText(item.keyTakeaway || item.title, {
    x: 1.2,
    y: 2.9,
    w: 10.933,
    h: 0.7,
    fontSize: 20,
    fontFace: 'Malgun Gothic',
    color: colors.titleColor,
    bold: true,
  });

  const bullets = item.content.bulletPoints || [];
  const bulletItems = bullets.map((b) => ({
    text: b,
    options: {
      bullet: { code: '2713' },
      color: colors.bodyColor,
      fontSize: 13,
      breakLine: true,
    },
  }));

  if (bulletItems.length > 0) {
    slide.addText(bulletItems, {
      x: 1.2,
      y: 3.7,
      w: 10.933,
      h: 2.6,
      fontFace: 'Malgun Gothic',
      valign: 'top',
      lineSpacing: 24,
    });
  }
}
