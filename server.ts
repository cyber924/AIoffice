import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
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
} from './src/server/geminiGenerator';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

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

// 1. Full Document Generation Endpoint
app.post('/api/generate-document', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

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
    } = req.body;

    const fieldName = customField || FIELD_LABELS[field] || field;
    const docTypeName = customDocumentType || DOC_TYPE_LABELS[documentType] || documentType;
    const levelDesc = LEVEL_LABELS[professionalLevel] || professionalLevel;
    const lengthDesc = LENGTH_INSTRUCTIONS[length] || length;
    const keywordsStr = keywords.length > 0 ? keywords.join(', ') : '주제와 관련된 핵심 키워드 자동 도출';

    const systemInstruction = `당신은 맥킨지, BCG, 글로벌 테크 기업 및 전문 연구기관 출신의 최고 전문 문서 작성 컨설턴트입니다.
사용자가 요청한 분야(${fieldName})와 문서 유형(${docTypeName})에 특화된 대한민국 최고 수준의 전문 비즈니스/기술 문서를 작성해야 합니다.

[작성 원칙]
1. 단순한 블로그나 개괄적 글이 아닌, 실제 이사회 보고, 고객사 제출, 투자 유치, 개발 착수에 사용 가능한 '고품질 전문 문서' 형식이어야 합니다.
2. 각 섹션 내용은 서술식 문장뿐만 아니라 명확한 소제목, 불릿 포인트, 정량적 KPI/데이터 표(Markdown Table), 핵심 체크리스트, 단계별 액션 플랜을 포함해야 합니다.
3. 문서의 톤앤매너는 대상 독자(${targetAudience || '전문가'})와 전문성 수준(${levelDesc})에 완벽히 맞추어야 합니다.
4. 문서는 한국어로 정중하고 격식 있는 비즈니스 문체(하십시오체/해요체 배제, 개조식 및 정형 비즈니스 어조)로 작성합니다.
5. 반드시 요청된 JSON 스키마를 엄격히 준수하여 응답하십시오.`;

    const prompt = `[문서 생성 요청 사항]
- 적용 분야: ${fieldName}
- 문서 유형: ${docTypeName}
- 문서 주제: ${topic}
- 문서 작성 목적: ${purpose || '해당 분야의 체계적인 전략 및 실행 방안 수립'}
- 대상 독자: ${targetAudience || '해당 분야 실무진 및 의사결정권자'}
- 전문성 수준: ${levelDesc}
- 문서 분량 및 깊이: ${lengthDesc}
- 핵심 강조 키워드: ${keywordsStr}
- 추가 요구사항: ${additionalRequirements || '없음 (전문적이고 실질적인 비즈니스 포맷 준수)'}

위 요구사항을 바탕으로 완성도 높은 전문 문서를 설계하고 작성해 주세요.`;

    const generatedJsonText = await generateWithFallback(apiKey, {
      systemInstruction,
      prompt,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: '문서의 공식 메인 제목' },
          subtitle: { type: Type.STRING, description: '문서의 부제목 또는 핵심 슬로건' },
          executiveSummary: { type: Type.STRING, description: '경영진 요약 (Executive Summary - 3~4개 핵심 단락과 핵심 시사점)' },
          tableOfContents: {
            type: Type.ARRAY,
            description: '목차 리스트',
            items: {
              type: Type.OBJECT,
              properties: {
                sectionNumber: { type: Type.STRING, description: '예: 1.0, 2.1, 제1장 등' },
                title: { type: Type.STRING, description: '섹션 제목' },
              },
              required: ['sectionNumber', 'title'],
            },
          },
          sections: {
            type: Type.ARRAY,
            description: '각 목차별 심층 전문 콘텐츠',
            items: {
              type: Type.OBJECT,
              properties: {
                sectionNumber: { type: Type.STRING, description: '목차와 일치하는 섹션 번호' },
                title: { type: Type.STRING, description: '섹션 제목' },
                summaryGuideline: { type: Type.STRING, description: '해당 섹션의 핵심 요지 1줄' },
                content: {
                  type: Type.STRING,
                  description: '섹션의 상세 내용 (Markdown 형식: 표, 소제목(###), 불릿 포인트, 정량 지표, 실행 방안 포함)',
                },
              },
              required: ['sectionNumber', 'title', 'content'],
            },
          },
          conclusion: { type: Type.STRING, description: '종합 결론 및 향후 추진 로드맵 제언' },
        },
        required: ['title', 'executiveSummary', 'tableOfContents', 'sections'],
      },
    });

    const parsed = extractJsonFromResponse(generatedJsonText) || JSON.parse(generatedJsonText || '{}');

    // Build document structure with IDs
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

    const charCount = fullContent.length;
    const wordCount = fullContent.split(/\s+/).filter(Boolean).length;
    const estimatedReadTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

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
        charCount,
        estimatedReadTimeMinutes,
        version: 1,
        isStarred: false,
        tags: [fieldName, docTypeName, ...(keywords || [])].slice(0, 5),
      },
    };

    res.json({ success: true, document: finalDoc });
  } catch (error: any) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: error.message || '문서 생성 중 오류가 발생했습니다.' });
  }
});

// 2. Section Regeneration / Improvement Endpoint
app.post('/api/generate-section', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const {
      docTitle,
      field,
      documentType,
      sectionNumber,
      sectionTitle,
      existingContent,
      instruction,
      tone,
    } = req.body;

    const prompt = `[전문 문서 개별 섹션 재작성/보강 요청]
- 전체 문서 제목: ${docTitle}
- 문서 분야 및 유형: ${field} / ${documentType}
- 섹션 번호 및 제목: ${sectionNumber} ${sectionTitle}
- 기존 내용:
${existingContent || '(신규 작성)'}

- 개선 요구사항:
${instruction || '더 상세한 실무 데이터, 구체적 예시, 표(Table), 단계별 체크리스트를 포함하여 전문성을 높여 재작성해 주세요.'}
- 요청 톤앤매너: ${tone || '전문적이고 논리적인 비즈니스 문체'}

위 섹션의 내용만을 Markdown 형식으로 상세히 작성해 주세요. (소제목 ###, 표, 불릿 포인트 적극 활용)`;

    const newContent = await generateWithFallback(apiKey, {
      prompt,
      temperature: 0.7,
    });

    res.json({ success: true, content: newContent });
  } catch (error: any) {
    console.error('Error in generate-section:', error);
    res.status(500).json({ error: error.message || '섹션 재작성 중 오류가 발생했습니다.' });
  }
});

// 3. Document Expert Consultant Agent Chat Endpoint
app.post('/api/agent/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const { messages = [], currentContext } = req.body;
    const reply = await chatWithDocumentAgent(apiKey, messages, currentContext);

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in agent chat:', error);
    res.status(500).json({ error: error.message || '에이전트 상담 처리 중 오류가 발생했습니다.' });
  }
});

function sanitizeSeed(str: string): string {
  return (str || 'business_growth')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30);
}

function normalizeSlideItem(rawSlide: any, idx: number, mainTopic: string, totalCount: number) {
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

  // Guarantee rich content for every layout type
  if (layout === 'cards_grid_3') {
    const cards = Array.isArray(content.cards) && content.cards.length >= 2 ? content.cards : [
      {
        tag: '핵심 과제 01',
        title: '데이터 통합 및 실시간 가시성 확보',
        description: '파편화된 사일로 시스템을 연계하여 전사 의사결정 속도를 40% 이상 가속화합니다.',
      },
      {
        tag: '핵심 과제 02',
        title: '지능형 자동화 워크플로우 도입',
        description: '반복적인 수작업 공정을 85% 자동화하여 운영 비용을 절감하고 휴먼 에러를 방지합니다.',
      },
      {
        tag: '핵심 과제 03',
        title: '고객 맞춤형 가치 제안 고도화',
        description: '정밀 데이터 분석을 통해 고객 유지율을 극대화하고 생애가치(LTV)를 증대시킵니다.',
      },
    ];
    content.cards = cards.slice(0, 3);
  } else if (layout === 'cards_grid_4') {
    const cards = Array.isArray(content.cards) && content.cards.length >= 2 ? content.cards : [
      { tag: 'STEP 01', title: '환경 분석 및 타당성 진단', description: '시장 트렌드와 규제 환경을 면밀히 분석합니다.' },
      { tag: 'STEP 02', title: '핵심 아키텍처 설계', description: '확장 가능한 모듈형 인프라를 구축합니다.' },
      { tag: 'STEP 03', title: '시범 적용 및 PoC 검증', description: '핵심 지표를 실시간 모니터링하여 안정성을 확보합니다.' },
      { tag: 'STEP 04', title: '전사 확대 및 시장 스케일업', description: '글로벌 표준에 맞춘 전면 확장을 추진합니다.' },
    ];
    content.cards = cards.slice(0, 4);
  } else if (layout === 'bullets_split') {
    const bullets = Array.isArray(content.bulletPoints) && content.bulletPoints.length >= 2 ? content.bulletPoints : [
      '엔드투엔드 AI 예측 엔진을 통한 실시간 지표 모니터링 및 선제적 대응 체계 구축',
      '기존 레거시 인프라와의 무중단 연동을 지원하는 표준 API 인터페이스 제공',
      '업무 자동화 및 최적화를 통한 운영 비용 30% 이상 절감 및 생산성 제고',
      '글로벌 보안 표준 준수와 다중 암호화를 통한 엔터프라이즈급 신뢰성 확보',
    ];
    content.bulletPoints = bullets;
  } else if (layout === 'swot_matrix') {
    const swot = content.swot || {};
    content.swot = {
      strengths: Array.isArray(swot.strengths) && swot.strengths.length > 0 ? swot.strengths : [
        '독보적인 원천 기술력 및 특허 포트폴리오 보유',
        '다양한 산업군에 검증된 레퍼런스 및 고객 기반',
      ],
      weaknesses: Array.isArray(swot.weaknesses) && swot.weaknesses.length > 0 ? swot.weaknesses : [
        '초기 마케팅 및 브랜드 인지도 확대 필요',
        '글로벌 전문 인력 추가 확보 과제',
      ],
      opportunities: Array.isArray(swot.opportunities) && swot.opportunities.length > 0 ? swot.opportunities : [
        '디지털 전환 가속화에 따른 시장 수요 폭발적 증가',
        '정부 정책 지원 및 규제 완화 기회 확대',
      ],
      threats: Array.isArray(swot.threats) && swot.threats.length > 0 ? swot.threats : [
        '기존 대기업 및 신규 진입자의 경쟁 심화',
        '글로벌 거시 경제 불확실성 증대',
      ],
    };
  } else if (layout === 'market_tam_sam_som') {
    const market = content.marketSize || {};
    content.marketSize = {
      tam: market.tam || { title: 'TAM (전체 시장)', value: '15.8조 원', desc: '국내외 관련 산업 전방위 총 시장 규모 (연 18.2% 성장)' },
      sam: market.sam || { title: 'SAM (유효 시장)', value: '4.2조 원', desc: '당사 타겟 고객군 대상 비즈니스 모델 시장' },
      som: market.som || { title: 'SOM (수익 시장)', value: '6,500억 원', desc: '초기 3개년 점유율 15% 목표 실행 시장' },
    };
  } else if (layout === 'financial_kpi') {
    const metrics = Array.isArray(content.metrics) && content.metrics.length >= 2 ? content.metrics : [
      { label: '연평균 매출 성장률 (CAGR)', value: '+48.5%', change: '업계 평균 대비 2.4배', note: '구독형 SaaS 모델 기반 반복 매출(ARR) 가속' },
      { label: '3개년 목표 누적 매출', value: '250억 원', change: '영업이익률 28%', note: '고정비 절감 및 규모의 경제 달성' },
      { label: '고객 유지율 (Retention)', value: '96.2%', change: '+5.4%p 향상', note: '높은 전환 비용과 제품 만족도 기반' },
    ];
    content.metrics = metrics.slice(0, 3);
  } else if (layout === 'comparison_table') {
    const table = content.table;
    if (!table || !Array.isArray(table.headers) || table.headers.length === 0) {
      content.table = {
        headers: ['비교 항목', '당사 솔루션', '기존 솔루션 A사', '대체재 B사'],
        rows: [
          ['배포 및 도입 기간', '2주 이내 즉시 도입', '3~6개월 소요', '구축형 1년 이상'],
          ['운영 비용 절감율', '최대 45% 절감', '10~15% 절감', '비용 절감 미미'],
          ['AI 실시간 분석', '지원 (99.2% 정확도)', '부분 지원 (배치)', '미지원'],
          ['커스터마이징 유연성', 'API 기반 자유 확장', '제한적 설정', '불가능'],
        ],
      };
    }
  } else if (layout === 'timeline_roadmap') {
    const timeline = Array.isArray(content.timeline) && content.timeline.length >= 2 ? content.timeline : [
      { phase: 'PHASE 01', period: '1Q ~ 2Q', title: '핵심 엔진 개발 및 PoC', details: ['알고리즘 최적화 완료', '초기 베타 테스터 10개사 확보'] },
      { phase: 'PHASE 02', period: '3Q ~ 4Q', title: '상용 제품 런칭 및 마케팅', details: ['정식 SaaS 서비스 출시', '엔터프라이즈 수주 30건'] },
      { phase: 'PHASE 03', period: '내년 상반기', title: '글로벌 시장 진출', details: ['북미/일본 파트너십 체결', '다국어 현지화 완성'] },
      { phase: 'PHASE 04', period: '내년 하반기', title: '생태계 플랫폼 확장', details: ['오픈 마켓플레이스 구축', '업계 1위 포지셔닝'] },
    ];
    content.timeline = timeline.slice(0, 4);
  } else if (layout === 'conclusion_call_to_action') {
    const bullets = Array.isArray(content.bulletPoints) && content.bulletPoints.length >= 2 ? content.bulletPoints : [
      '투자 유치 금액: 시리즈 A 30억 원 (R&D 고도화 50%, 글로벌 마케팅 30%, 인재 영입 20%)',
      '예상 회수 기간: 2.5년 이내 손익분기점(BEP) 달성 및 2028년 IPO 추진',
      '전략적 파트너십 및 투자 상담 문의: contact@company.io / 02-1234-5678',
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
    speakerNotes: rawSlide.speakerNotes || `슬라이드 ${slideNum}번에서는 ${rawSlide.title || mainTopic}의 핵심 내용을 청중에게 명확히 전달합니다.`,
  };
}

// 4. Generate Presentation Deck Endpoint
app.post('/api/generate-presentation', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const {
      field = 'management',
      presentationType = 'ir_pitch',
      topic = '',
      purpose = '',
      targetAudience = '',
      companyName = '',
      theme = 'dark_navy',
      slideCountPreference = 10,
      keyPoints = '',
    } = req.body;

    if (!topic || !purpose) {
      res.status(400).json({ error: '프레젠테이션 주제와 목적을 모두 입력해 주세요.' });
      return;
    }

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
    const normalizedSlides = rawSlides.map((s: any, idx: number) =>
      normalizeSlideItem(s, idx, topic, rawSlides.length)
    );

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
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slideCount: normalizedSlides.length,
      },
    };

    res.json({ success: true, presentation: presentationDoc });
  } catch (error: any) {
    console.error('Error in generate-presentation:', error);
    res.status(500).json({ error: error.message || '프레젠테이션 슬라이드 생성 중 오류가 발생했습니다.' });
  }
});

// 5. Regenerate Single Slide Endpoint
app.post('/api/regenerate-slide', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const { presentationTitle, slide, requestedLayout, customPrompt } = req.body;
    if (!slide) {
      res.status(400).json({ error: '슬라이드 데이터가 전달되지 않았습니다.' });
      return;
    }

    const updatedSlideData = await regenerateSingleSlide(apiKey, {
      presentationTitle: presentationTitle || '',
      slide,
      requestedLayout,
      customPrompt,
    });

    const normalized = normalizeSlideItem(
      { ...slide, ...updatedSlideData },
      (slide.slideNumber || 1) - 1,
      presentationTitle || '비즈니스 전략',
      10
    );

    res.json({
      success: true,
      slide: normalized,
    });
  } catch (error: any) {
    console.error('Error in regenerate-slide:', error);
    res.status(500).json({ error: error.message || '슬라이드 재작성 중 오류가 발생했습니다.' });
  }
});

// 6. Convert Document to Presentation Endpoint
app.post('/api/document-to-presentation', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const { document, theme = 'dark_navy' } = req.body;
    if (!document || !document.title) {
      res.status(400).json({ error: '변환할 문서 데이터가 유효하지 않습니다.' });
      return;
    }

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
    const normalizedSlides = rawSlides.map((s: any, idx: number) =>
      normalizeSlideItem(s, idx, document.title, rawSlides.length)
    );

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
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slideCount: normalizedSlides.length,
      },
    };

    res.json({ success: true, presentation: presentationDoc });
  } catch (error: any) {
    console.error('Error in document-to-presentation:', error);
    res.status(500).json({ error: error.message || '문서의 PPT 변환 중 오류가 발생했습니다.' });
  }
});

// 7. Generate Professional Excel Document Endpoint
app.post('/api/generate-excel', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const {
      templateType = 'monthly_sales_report',
      title = '',
      companyName = '',
      period = '2026년 1월 ~ 12월',
      currency = 'KRW',
      businessDescription = '',
      keyMetricsToInclude = '',
    } = req.body;

    if (!title || !businessDescription) {
      res.status(400).json({ error: '문서 제목과 비즈니스 상세 설명을 모두 입력해 주세요.' });
      return;
    }

    const rawExcelData = await generateExcelSpreadsheet(apiKey, {
      templateType,
      title,
      companyName,
      period,
      currency,
      businessDescription,
      keyMetricsToInclude,
    });

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
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sheetCount: rawExcelData.sheets?.length || 1,
      },
    };

    res.json({ success: true, document: excelDoc });
  } catch (error: any) {
    console.error('Error in generate-excel:', error);
    res.status(500).json({ error: error.message || '전문 엑셀 문서 생성 중 오류가 발생했습니다.' });
  }
});

// 8. AI 자연어 엑셀 수정 어시스턴트 Endpoint
app.post('/api/ai-edit-excel', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
      return;
    }

    const { currentDocument, instructionPrompt } = req.body;
    if (!currentDocument || !instructionPrompt) {
      res.status(400).json({ error: '문서 데이터와 수정 지시사항이 필요합니다.' });
      return;
    }

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
      metadata: {
        ...currentDocument.metadata,
        updatedAt: Date.now(),
        sheetCount: updatedRaw.sheets?.length || currentDocument.sheets?.length || 1,
      },
    };

    res.json({ success: true, document: updatedExcelDoc });
  } catch (error: any) {
    console.error('Error in ai-edit-excel:', error);
    res.status(500).json({ error: error.message || 'AI 엑셀 수정 중 오류가 발생했습니다.' });
  }
});

// 9. AI Business Form Generator Endpoint
app.post('/api/generate-form', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.',
      });
    }

    const {
      formType,
      title,
      drafterName,
      drafterDepartment,
      drafterPosition,
      companyName,
      recipientName,
      recipientCompany,
      keyDetails,
      totalBudget,
      targetDate,
    } = req.body;

    if (!title || !keyDetails) {
      return res.status(400).json({ error: '문서 제목과 핵심 기재 내용은 필수 입력 항목입니다.' });
    }

    const generatedRaw = await generateBusinessForm(apiKey, {
      formType: formType || 'proposal_approval',
      title,
      drafterName: drafterName || '홍길동',
      drafterDepartment,
      drafterPosition,
      companyName,
      recipientName,
      recipientCompany,
      keyDetails,
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
      drafter: generatedRaw.drafter || {
        name: drafterName || '홍길동',
        department: drafterDepartment || '기획팀',
        position: drafterPosition || '담당자',
      },
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
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    res.json({ success: true, document: formDocument });
  } catch (error: any) {
    console.error('Error in generate-form:', error);
    res.status(500).json({ error: error.message || '업무 양식 문서 생성 중 오류가 발생했습니다.' });
  }
});

// 10. AI Business Form Assistant (Natural Language Edit)
app.post('/api/ai-edit-form', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.',
      });
    }

    const { currentDocument, instruction } = req.body;
    if (!currentDocument || !instruction) {
      return res.status(400).json({ error: '기존 공문서 데이터와 수정 지시사항은 필수입니다.' });
    }

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
      metadata: {
        ...currentDocument.metadata,
        updatedAt: Date.now(),
      },
    };

    res.json({ success: true, document: updatedFormDoc });
  } catch (error: any) {
    console.error('Error in ai-edit-form:', error);
    res.status(500).json({ error: error.message || '공문서 양식 수정 중 오류가 발생했습니다.' });
  }
});

// 11. Health & Environment Status Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Domain-Specific Professional Document Generator',
      version: '2.0.0',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Professional Document Generator running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
