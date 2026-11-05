import type { IncomingMessage, ServerResponse } from 'http';
import { Type } from '@google/genai';
import {
  generateWithFallback,
  extractJsonFromResponse,
  chatWithDocumentAgent,
  generatePresentationDeck,
  regenerateSingleSlide,
  convertDocToPresentation,
  generateExcelSpreadsheet,
  aiEditExcelSpreadsheet,
  generateBusinessForm,
  aiEditBusinessForm,
  generateRecommendedPresets,
  generateImageAsset,
  generateNewsFact,
  generateAiKnowledge,
  recommendKnowledgeTopics,
  chatKnowledge,
  auditMarketItem,
  generateHelpContent,
} from './geminiGenerator';

const FIELD_LABELS: Record<string, string> = {
  management: '경영 / 전략',
  marketing: '마케팅 / 브랜드',
  advertising: '광고 / 홍보 (PR)',
  sales: '영업 / B2B',
  planning: '기획 / 신사업',
  it_tech: 'IT / 소프트웨어',
  ai_data: '인공지능 / 데이터',
  finance: '금융 / 투자',
  real_estate: '부동산 / 공간',
  education_hr: '교육 / 인사 (HR)',
  legal: '법률 / 규제',
  policy: '정책 / 공공',
  research: '연구 / 학술',
  manufacturing: '제조 / 품질',
  logistics: '유통 / 물류',
  custom: '맞춤 분야',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  business_plan: '사업계획서 (Business Plan)',
  proposal: '제안서 / RFP 응답서 (Proposal)',
  prd_planning: '프로덕트 기획서 (PRD)',
  market_research: '시장조사 및 분석 보고서',
  competitor_analysis: '기업 및 경쟁사 분석서',
  marketing_strategy: '마케팅 / 광고 전략서',
  tech_spec: '기술 사양서 / 아키텍처 문서',
  executive_report: '경영 보고서 / 업무 분석서',
  curriculum_guide: '교육 자료 / 가이드라인',
  policy_proposal: '정책 및 제도 제안서',
  ir_pitch: '투자 유치 IR 문서',
  custom: '맞춤 전문 문서',
};

const LEVEL_LABELS: Record<string, string> = {
  entry: '기초 / 입문자 수준 (친절하고 알기 쉬운 설명 중심)',
  practitioner: '실무자 / 담당자 수준 (구체적 실행 프로세스와 기술적 세부사항 중심)',
  manager: '팀장 / 관리자 수준 (일정, 리소스, 성과지표, 의사결정 프레임워크 중심)',
  executive: '임원 / C-Level 수준 (전략적 가치, ROI, 핵심 리스크, 의사결정 권고안 중심)',
  academic: '학술 / 심층 연구자 수준 (이론적 타당성, 정밀 데이터 분석, 참고 문헌 체계)',
};

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  concise: '핵심 요약형 (3~4개 주요 핵심 섹션으로 압축하여 명료하게 구성)',
  standard: '표준 비즈니스형 (5~6개 섹션으로 실무 보고서에 가장 적합한 완성도)',
  comprehensive: '상세 심층형 (7~9개 이상의 섹션으로 철저한 분석, 표, 지표, 실행 로드맵까지 총망라)',
};

function sanitizeSeed(str: string): string {
  return (str || 'business_growth')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30);
}

function normalizeSlideItem(rawSlide: any, idx: number, mainTopic: string) {
  const layout = rawSlide.layout || (idx === 0 ? 'title' : (idx === 1 ? 'cards_grid_3' : (idx === 2 ? 'bullets_split' : 'cards_grid_3')));
  const slideNum = idx + 1;
  const rawContent = rawSlide.content || {};

  const cleanSeed = sanitizeSeed(rawSlide.imageKeywords || `${mainTopic}_${idx}`);
  const imageUrl =
    rawSlide.imageUrl ||
    (idx === 0
      ? `https://picsum.photos/seed/biz_cover_${cleanSeed}/1200/800`
      : `https://picsum.photos/seed/biz_slide_${slideNum}_${cleanSeed}/600/400`);

  const content: any = { ...rawContent };

  if (layout === 'cards_grid_3') {
    const cards = Array.isArray(content.cards) && content.cards.length >= 2 ? content.cards : [
      { tag: '핵심 과제 01', title: '데이터 통합 및 실시간 가시성 확보', description: '파편화된 사일로 시스템을 연계하여 전사 의사결정 속도를 40% 이상 가속화합니다.' },
      { tag: '핵심 과제 02', title: '지능형 자동화 워크플로우 도입', description: '반복적인 수작업 공정을 85% 자동화하여 운영 비용을 절감하고 휴먼 에러를 방지합니다.' },
      { tag: '핵심 과제 03', title: '고객 맞춤형 가치 제안 고도화', description: '정밀 데이터 분석을 통해 고객 유지율을 극대화하고 생애가치(LTV)를 증대시킵니다.' },
    ];
    content.cards = cards.slice(0, 3);
  } else if (layout === 'bullets_split') {
    const bullets = Array.isArray(content.bulletPoints) && content.bulletPoints.length >= 2 ? content.bulletPoints : [
      '엔드투엔드 AI 예측 엔진을 통한 실시간 지표 모니터링 및 선제적 대응 체계 구축',
      '기존 레거시 인프라와의 무중단 연동을 지원하는 표준 API 인터페이스 제공',
      '업무 자동화 및 최적화를 통한 운영 비용 30% 이상 절감 및 생산성 제고',
      '글로벌 보안 표준 준수와 다중 암호화를 통한 엔터프라이즈급 신뢰성 확보',
    ];
    content.bulletPoints = bullets;
  }

  return {
    id: rawSlide.id || `slide_${idx}_${Math.random().toString(36).substr(2, 6)}`,
    slideNumber: slideNum,
    layout,
    category: rawSlide.category || (idx === 0 ? 'COVER' : `SECTION 0${slideNum}`),
    title: rawSlide.title || `${mainTopic} - 실행 전략 ${slideNum}`,
    subtitle: rawSlide.subtitle || '',
    keyTakeaway: rawSlide.keyTakeaway || (idx === 0 ? '' : '차별화된 전략과 실행력을 바탕으로 목표를 완벽히 달성합니다.'),
    imageUrl,
    imageKeywords: rawSlide.imageKeywords || mainTopic,
    showImage: true,
    content,
    speakerNotes: rawSlide.speakerNotes || `슬라이드 ${slideNum}번에서는 ${rawSlide.title || mainTopic}의 핵심 내용을 전달합니다.`,
  };
}

export type RequestLike = IncomingMessage & { body?: any; query?: Record<string, any> };
export type ResponseLike = ServerResponse & {
  status?: (code: number) => ResponseLike;
  json?: (data: any) => void;
};

/**
 * Universal API Request Handler used both in Express (server.ts) and Vercel Serverless Function (api/[...path])
 */
export async function handleApiRequest(req: RequestLike, res: ResponseLike): Promise<void> {
  // CORS & Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Response polyfill
  const sendStatus = (code: number) => {
    res.statusCode = code;
    return res;
  };
  const sendJson = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse Body if not yet parsed (IncomingMessage stream)
  if (!req.body && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const rawText = Buffer.concat(buffers).toString('utf-8');
      req.body = rawText ? JSON.parse(rawText) : {};
    } catch {
      req.body = {};
    }
  }

  // Path resolution: Handles /api/health, /api/agent/chat, and Vercel ?path=agent&path=chat
  let rawUrlPath = (req.url || '').split('?')[0];
  if (rawUrlPath.startsWith('/api/')) {
    rawUrlPath = rawUrlPath.substring(5); // strip '/api/'
  } else if (rawUrlPath.startsWith('/api')) {
    rawUrlPath = rawUrlPath.substring(4);
  }
  if (rawUrlPath.startsWith('/')) {
    rawUrlPath = rawUrlPath.substring(1);
  }

  // Query parameter fallback (Vercel catch-all route [...path])
  let endpoint = rawUrlPath;
  if (!endpoint && req.query?.path) {
    if (Array.isArray(req.query.path)) {
      endpoint = req.query.path.join('/');
    } else {
      endpoint = String(req.query.path);
    }
  }
  if (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1);
  }

  // 1. Health check (GET /api/health or /health)
  // Per requirements: Must return 200 JSON even if API key is not present, without exposing key value.
  if (endpoint === 'health' || req.url?.includes('/health')) {
    sendStatus(200);
    sendJson({
      status: 'ok',
      service: 'Domain-Specific Professional Document Generator',
      version: '2.0.0',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Verify GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    sendStatus(500);
    sendJson({
      error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다. Vercel Project Settings > Environment Variables를 확인해 주세요.',
    });
    return;
  }

  try {
    // 2. Full Document Generation
    if (endpoint === 'generate-document') {
      const {
        field,
        customField,
        documentType,
        customDocumentType,
        topic,
        purpose,
        targetAudience,
        professionalLevel,
        length,
        keywords = [],
        additionalRequirements,
      } = req.body || {};

      const fieldName = customField || FIELD_LABELS[field] || field;
      const docTypeName = customDocumentType || DOC_TYPE_LABELS[documentType] || documentType;
      const levelDesc = LEVEL_LABELS[professionalLevel] || professionalLevel;
      const lengthDesc = LENGTH_INSTRUCTIONS[length] || length;
      const keywordsStr = keywords.length > 0 ? keywords.join(', ') : '주제 관련 핵심 키워드';

      const systemInstruction = `당신은 최고 전문 비즈니스 컨설턴트입니다.
사용자가 요청한 분야(${fieldName})와 유형(${docTypeName})에 특화된 최고 수준의 전문 문서를 작성해야 합니다.
반드시 각 섹션에 표(Markdown Table: | 열1 | 열2 |\\n|---|---|\\n| 값1 | 값2 |), 소제목(###), 불릿 포인트를 충실히 포함하십시오.`;

      const prompt = `[문서 생성 요청 사항]
- 적용 분야: ${fieldName}
- 문서 유형: ${docTypeName}
- 문서 주제: ${topic}
- 문서 작성 목적: ${purpose || '체계적인 전략 및 실행 방안 수립'}
- 대상 독자: ${targetAudience || '실무진 및 의사결정권자'}
- 전문성 수준: ${levelDesc}
- 문서 분량: ${lengthDesc}
- 핵심 강조 키워드: ${keywordsStr}
- 추가 요구사항: ${additionalRequirements || '전문적이고 실질적인 비즈니스 포맷 준수'}`;

      const generatedJsonText = await generateWithFallback(apiKey, {
        systemInstruction,
        prompt,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            tableOfContents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionNumber: { type: Type.STRING },
                  title: { type: Type.STRING },
                },
                required: ['sectionNumber', 'title'],
              },
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionNumber: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summaryGuideline: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['sectionNumber', 'title', 'content'],
              },
            },
            conclusion: { type: Type.STRING },
          },
          required: ['title', 'executiveSummary', 'tableOfContents', 'sections'],
        },
      });

      const parsed = extractJsonFromResponse(generatedJsonText) || JSON.parse(generatedJsonText || '{}');
      const now = Date.now();
      const sectionsWithIds = (parsed.sections || []).map((sec: any, idx: number) => ({
        id: `sec-${idx + 1}-${Math.random().toString(36).substr(2, 6)}`,
        sectionNumber: sec.sectionNumber || `${idx + 1}.0`,
        title: sec.title || `섹션 ${idx + 1}`,
        summaryGuideline: sec.summaryGuideline || '',
        content: sec.content || '',
      }));

      const tocWithIds = (parsed.tableOfContents || sectionsWithIds).map((toc: any, idx: number) => {
        const matchedSec = sectionsWithIds[idx];
        return {
          id: matchedSec ? matchedSec.id : `toc-${idx + 1}`,
          sectionNumber: toc.sectionNumber || `${idx + 1}.0`,
          title: toc.title || `섹션 ${idx + 1}`,
        };
      });

      const fullContent = [
        parsed.title,
        parsed.subtitle,
        parsed.executiveSummary,
        ...sectionsWithIds.map((s: any) => s.title + ' ' + s.content),
        parsed.conclusion,
      ].filter(Boolean).join('\n\n');

      const wordCount = fullContent.split(/\s+/).filter(Boolean).length;
      const finalDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        title: parsed.title || topic,
        subtitle: parsed.subtitle || '',
        executiveSummary: parsed.executiveSummary || '',
        field,
        customField,
        documentType,
        customDocumentType,
        purpose,
        targetAudience,
        professionalLevel,
        length,
        keywords,
        tableOfContents: tocWithIds,
        sections: sectionsWithIds,
        conclusion: parsed.conclusion || '',
        metadata: {
          createdAt: now,
          updatedAt: now,
          wordCount,
          charCount: fullContent.length,
          estimatedReadTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
          version: 1,
          isStarred: false,
          tags: [fieldName, docTypeName, ...(keywords || [])].slice(0, 5),
        },
      };

      sendStatus(200);
      sendJson({ success: true, document: finalDoc });
      return;
    }

    // 3. Single Section Regeneration
    if (endpoint === 'generate-section') {
      const { docTitle, field, documentType, sectionNumber, sectionTitle, existingContent, instruction, tone } = req.body || {};
      const prompt = `[전문 문서 개별 섹션 재작성/보강 요청]
- 전체 문서 제목: ${docTitle}
- 문서 분야 및 유형: ${field} / ${documentType}
- 섹션 번호 및 제목: ${sectionNumber} ${sectionTitle}
- 기존 내용: ${existingContent || '(신규 작성)'}
- 개선 요구사항: ${instruction || '상세 실무 데이터, 표, 체크리스트 포함하여 보강'}
- 요청 톤앤매너: ${tone || '전문적 비즈니스 문체'}`;

      const newContent = await generateWithFallback(apiKey, { prompt, temperature: 0.7 });
      sendStatus(200);
      sendJson({ success: true, content: newContent });
      return;
    }

    // 4. Consultant Agent Chat (Handles both /api/agent/chat and /api/chat)
    if (endpoint === 'agent/chat' || endpoint === 'chat') {
      const { messages = [], currentContext } = req.body || {};
      const reply = await chatWithDocumentAgent(apiKey, messages, currentContext);
      sendStatus(200);
      sendJson({ success: true, reply });
      return;
    }

    // 5. Generate Presentation
    if (endpoint === 'generate-presentation') {
      const { field = 'management', presentationType = 'ir_pitch', topic = '', purpose = '', targetAudience = '', companyName = '', theme = 'dark_navy', slideCountPreference = 10, keyPoints = '' } = req.body || {};
      const count = Number(slideCountPreference) || 10;
      const deckData = await generatePresentationDeck(apiKey, {
        field: FIELD_LABELS[field] || field,
        presentationType,
        topic,
        purpose,
        targetAudience,
        companyName,
        theme,
        slideCountPreference: count,
        keyPoints,
      });

      const rawSlides = deckData.slides || [];
      const normalizedSlides = rawSlides.map((s: any, idx: number) => normalizeSlideItem(s, idx, topic));
      const presentationDoc = {
        id: 'pres_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: deckData.title || topic,
        subtitle: deckData.subtitle || purpose,
        company: companyName || deckData.company || '전략 컨설팅 그룹',
        field,
        presentationType,
        targetAudience,
        theme,
        slides: normalizedSlides,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), slideCount: normalizedSlides.length },
      };
      sendStatus(200);
      sendJson({ success: true, presentation: presentationDoc });
      return;
    }

    // 6. Regenerate Single Slide
    if (endpoint === 'regenerate-slide') {
      const { presentationTitle, slide, requestedLayout, customPrompt } = req.body || {};
      const updatedSlideData = await regenerateSingleSlide(apiKey, {
        presentationTitle: presentationTitle || '',
        slide,
        requestedLayout,
        customPrompt,
      });
      const normalized = normalizeSlideItem({ ...slide, ...updatedSlideData }, (slide.slideNumber || 1) - 1, presentationTitle || '비즈니스 전략');
      sendStatus(200);
      sendJson({ success: true, slide: normalized });
      return;
    }

    // 7. Convert Document to Presentation
    if (endpoint === 'document-to-presentation') {
      const { document, theme = 'dark_navy' } = req.body || {};
      const sectionsSummary = (document.sections || [])
        .map((sec: any) => `[${sec.sectionNumber}. ${sec.title}]\n${sec.content?.substring(0, 400)}...`)
        .join('\n\n');
      const deckData = await convertDocToPresentation(apiKey, {
        documentTitle: document.title,
        executiveSummary: document.executiveSummary || document.title,
        sectionsSummary,
        field: document.field || 'management',
        theme,
      });
      const rawSlides = deckData.slides || [];
      const normalizedSlides = rawSlides.map((s: any, idx: number) => normalizeSlideItem(s, idx, document.title));
      const presentationDoc = {
        id: 'pres_conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: deckData.title || document.title,
        subtitle: deckData.subtitle || document.executiveSummary?.substring(0, 80) || '',
        company: document.company || '전략 기획실',
        field: document.field || 'management',
        presentationType: 'business_plan',
        targetAudience: document.targetAudience || '경영진 및 투자자',
        theme,
        slides: normalizedSlides,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), slideCount: normalizedSlides.length },
      };
      sendStatus(200);
      sendJson({ success: true, presentation: presentationDoc });
      return;
    }

    // 8. Generate Excel Spreadsheet
    if (endpoint === 'generate-excel') {
      const { templateType = 'monthly_sales_report', title = '', companyName = '', period = '2026년 1월 ~ 12월', currency = 'KRW', businessDescription = '', keyMetricsToInclude = '' } = req.body || {};
      const rawExcelData = await generateExcelSpreadsheet(apiKey, { templateType, title, companyName, period, currency, businessDescription, keyMetricsToInclude });
      const excelDoc = {
        id: 'excel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: rawExcelData.title || title,
        subtitle: rawExcelData.subtitle || `${period} 실무 스프레드시트 모델`,
        company: companyName || rawExcelData.company || '전략 기획 총괄팀',
        templateType,
        currency,
        period,
        executiveSummary: rawExcelData.executiveSummary || '',
        kpis: Array.isArray(rawExcelData.kpis) ? rawExcelData.kpis : [],
        sheets: Array.isArray(rawExcelData.sheets) ? rawExcelData.sheets : [],
        chartData: Array.isArray(rawExcelData.chartData) ? rawExcelData.chartData : undefined,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), sheetCount: rawExcelData.sheets?.length || 1 },
      };
      sendStatus(200);
      sendJson({ success: true, document: excelDoc });
      return;
    }

    // 9. AI Edit Excel
    if (endpoint === 'ai-edit-excel') {
      const { currentDocument, instructionPrompt } = req.body || {};
      const updatedRaw = await aiEditExcelSpreadsheet(apiKey, currentDocument, instructionPrompt);
      const updatedExcelDoc = {
        ...currentDocument,
        title: updatedRaw.title || currentDocument.title,
        subtitle: updatedRaw.subtitle || currentDocument.subtitle,
        company: updatedRaw.company || currentDocument.company,
        executiveSummary: updatedRaw.executiveSummary || currentDocument.executiveSummary,
        kpis: Array.isArray(updatedRaw.kpis) ? updatedRaw.kpis : currentDocument.kpis,
        sheets: Array.isArray(updatedRaw.sheets) ? updatedRaw.sheets : currentDocument.sheets,
        chartData: Array.isArray(updatedRaw.chartData) ? updatedRaw.chartData : currentDocument.chartData,
        chartSuggestion: updatedRaw.chartSuggestion || currentDocument.chartSuggestion,
        metadata: { ...currentDocument.metadata, updatedAt: Date.now(), sheetCount: updatedRaw.sheets?.length || currentDocument.sheets?.length || 1 },
      };
      sendStatus(200);
      sendJson({ success: true, document: updatedExcelDoc });
      return;
    }

    // 10. Generate Business Form
    if (endpoint === 'generate-form') {
      const { formType, title, drafterName, drafterDepartment, drafterPosition, companyName, recipientName, recipientCompany, keyDetails, totalBudget, targetDate } = req.body || {};
      const generatedRaw = await generateBusinessForm(apiKey, {
        formType: formType || 'proposal_approval',
        title: title || '공문서',
        drafterName: drafterName || '홍길동',
        drafterDepartment,
        drafterPosition,
        companyName,
        recipientName,
        recipientCompany,
        keyDetails: keyDetails || '',
        totalBudget,
        targetDate,
      });
      const formDocument = {
        id: 'form_' + Date.now(),
        formType: formType || 'proposal_approval',
        title: generatedRaw.title || title,
        docNumber: generatedRaw.docNumber || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        draftDate: generatedRaw.draftDate || `${new Date().getFullYear()}년 ${String(new Date().getMonth() + 1).padStart(2, '0')}월 ${String(new Date().getDate()).padStart(2, '0')}일`,
        effectiveDate: generatedRaw.effectiveDate,
        drafter: generatedRaw.drafter || { name: drafterName || '홍길동', department: drafterDepartment || '기획팀', position: drafterPosition || '담당자' },
        recipient: generatedRaw.recipient,
        supplier: generatedRaw.supplier,
        approvalLine: generatedRaw.approvalLine || [
          { role: '기안자', name: drafterName || '홍길동', status: 'approved', signature: '승인' },
          { role: '팀장', name: '팀장', status: 'approved', signature: '승인' },
          { role: '본부장', name: '본부장', status: 'pending' },
          { role: '대표이사', name: '대표이사', status: 'pending' },
        ],
        totalAmountText: generatedRaw.totalAmountText,
        totalAmountNumber: generatedRaw.totalAmountNumber,
        supplyAmount: generatedRaw.supplyAmount,
        taxAmount: generatedRaw.taxAmount,
        sections: generatedRaw.sections || [],
        specialTerms: generatedRaw.specialTerms || [],
        metadata: { createdAt: Date.now(), updatedAt: Date.now() },
      };
      sendStatus(200);
      sendJson({ success: true, document: formDocument });
      return;
    }

    // 11. AI Edit Business Form
    if (endpoint === 'ai-edit-form') {
      const { currentDocument, instruction } = req.body || {};
      const updatedRaw = await aiEditBusinessForm(apiKey, currentDocument, instruction);
      const updatedFormDoc = {
        ...currentDocument,
        title: updatedRaw.title || currentDocument.title,
        docNumber: updatedRaw.docNumber || currentDocument.docNumber,
        draftDate: updatedRaw.draftDate || currentDocument.draftDate,
        effectiveDate: updatedRaw.effectiveDate || currentDocument.effectiveDate,
        drafter: updatedRaw.drafter || currentDocument.drafter,
        recipient: updatedRaw.recipient || currentDocument.recipient,
        supplier: updatedRaw.supplier || currentDocument.supplier,
        approvalLine: Array.isArray(updatedRaw.approvalLine) ? updatedRaw.approvalLine : currentDocument.approvalLine,
        totalAmountText: updatedRaw.totalAmountText || currentDocument.totalAmountText,
        totalAmountNumber: updatedRaw.totalAmountNumber !== undefined ? updatedRaw.totalAmountNumber : currentDocument.totalAmountNumber,
        supplyAmount: updatedRaw.supplyAmount !== undefined ? updatedRaw.supplyAmount : currentDocument.supplyAmount,
        taxAmount: updatedRaw.taxAmount !== undefined ? updatedRaw.taxAmount : currentDocument.taxAmount,
        sections: Array.isArray(updatedRaw.sections) ? updatedRaw.sections : currentDocument.sections,
        specialTerms: Array.isArray(updatedRaw.specialTerms) ? updatedRaw.specialTerms : currentDocument.specialTerms,
        metadata: { ...currentDocument.metadata, updatedAt: Date.now() },
      };
      sendStatus(200);
      sendJson({ success: true, document: updatedFormDoc });
      return;
    }

    // 12. AI Recommended Presets (4 new presets across 4 domains)
    if (endpoint === 'generate-templates') {
      const { existingTitles = [] } = req.body || {};
      const newPresets = await generateRecommendedPresets(apiKey, existingTitles);
      sendStatus(200);
      sendJson({ success: true, templates: newPresets });
      return;
    }

    // 13. AI Image Generation (gemini-3.1-flash-image)
    if (endpoint === 'generate-image-asset') {
      const { prompt, aspectRatio = '1:1' } = req.body || {};
      if (!prompt) {
        sendStatus(400);
        sendJson({ error: '이미지 생성 프롬프트가 필요합니다.' });
        return;
      }
      const base64 = await generateImageAsset(apiKey, prompt, aspectRatio);
      sendStatus(200);
      sendJson({ success: true, base64 });
      return;
    }

    // 14. News Fact Gathering with Google Search Grounding
    if (endpoint === 'generate-news-fact') {
      const { topic, category = 'trend' } = req.body || {};
      if (!topic) {
        sendStatus(400);
        sendJson({ error: '검색 주제가 필요합니다.' });
        return;
      }
      const item = await generateNewsFact(apiKey, topic, category);
      sendStatus(200);
      sendJson({ success: true, item });
      return;
    }

    // 15. AI Base Knowledge Generator
    if (endpoint === 'generate-ai-knowledge') {
      const { topic, category = 'corporate' } = req.body || {};
      if (!topic) {
        sendStatus(400);
        sendJson({ error: '지식 생성 주제가 필요합니다.' });
        return;
      }
      const item = await generateAiKnowledge(apiKey, topic, category);
      sendStatus(200);
      sendJson({ success: true, item });
      return;
    }

    // 16. AI Knowledge Topic Recommender
    if (endpoint === 'recommend-knowledge-topics') {
      const { category = 'all', keywords = '', mode = 'knowledge' } = req.body || {};
      const topics = await recommendKnowledgeTopics(apiKey, category, keywords, mode);
      sendStatus(200);
      sendJson({ success: true, topics });
      return;
    }

    // 17. AI Knowledge Hub RAG Chat
    if (endpoint === 'chat-knowledge') {
      const { message, history = [], contextDocs = [] } = req.body || {};
      if (!message) {
        sendStatus(400);
        sendJson({ error: '질문 메시지가 필요합니다.' });
        return;
      }
      const reply = await chatKnowledge(apiKey, message, history, contextDocs);
      sendStatus(200);
      sendJson({ success: true, reply });
      return;
    }

    // 18. AI Market Document Quality Audit
    if (endpoint === 'audit-market-item') {
      const { item } = req.body || {};
      if (!item || !item.title) {
        sendStatus(400);
        sendJson({ error: '검수할 마켓 문서 데이터가 필요합니다.' });
        return;
      }
      const result = await auditMarketItem(apiKey, item);
      sendStatus(200);
      sendJson({ success: true, ...result });
      return;
    }

    // 19. AI Service Help Content Generator
    if (endpoint === 'generate-help-content') {
      const { type, topic, category = '일반', detail = '' } = req.body || {};
      if (!type || !topic) {
        sendStatus(400);
        sendJson({ error: '도움말 타입(type)과 주제(topic)는 필수 입력 항목입니다.' });
        return;
      }
      const item = await generateHelpContent(apiKey, type, topic, category, detail);
      sendStatus(200);
      sendJson({ success: true, item });
      return;
    }

    sendStatus(404);
    sendJson({ error: `Not Found endpoint: /api/${endpoint}` });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    console.error(`Error handling /api/${endpoint} (status ${statusCode}):`, error.message || error);
    sendStatus(statusCode);
    sendJson({ error: error.message || '서버 처리 중 오류가 발생했습니다.' });
  }
}
