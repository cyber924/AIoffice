import { GoogleGenAI } from '@google/genai';

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.7-flash',
  'gemini-2.5-pro',
];

/**
 * Extracts and parses JSON from text that might be wrapped in markdown codeblocks
 */
export function extractJsonFromResponse(rawText: string): any {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  
  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {}

  // Try extracting markdown ```json ... ``` block
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {}
  }

  // Try finding the first '{' and last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

export async function generateWithFallback(
  apiKey: string,
  params: {
    systemInstruction?: string;
    prompt: string;
    responseSchema?: any;
    temperature?: number;
  }
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI Generator] Trying ${model} (attempt ${attempt})...`);
        const config: any = {
          temperature: params.temperature ?? 0.7,
        };

        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        if (params.responseSchema) {
          config.responseMimeType = 'application/json';
          config.responseSchema = params.responseSchema;
        }

        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config,
        });

        const text = response.text;
        if (text && text.trim().length > 0) {
          return text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Generator] Model ${model} attempt ${attempt} failed:`, err?.message || err);
        await new Promise(resolve => setTimeout(resolve, 600 * attempt));
      }
    }
  }

  // Fallback attempt: Try without strict schema if schema was failing
  if (params.responseSchema) {
    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[AI Generator] Fallback prompt attempt with ${model}...`);
        const promptWithJsonInstruction = `${params.prompt}\n\n[CRITICAL]: Respond ONLY with valid, raw JSON satisfying the required schema without any surrounding text or explanation.`;
        const response = await ai.models.generateContent({
          model,
          contents: promptWithJsonInstruction,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: 0.6,
          },
        });
        const text = response.text;
        if (text && text.trim().length > 0) {
          const parsed = extractJsonFromResponse(text);
          if (parsed && typeof parsed === 'object') {
            return JSON.stringify(parsed);
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('현재 AI 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithDocumentAgent(
  apiKey: string,
  messages: ChatMessage[],
  currentContext?: string
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const systemInstruction = `당신은 대한민국 최고 수준의 '분야별 전문 비즈니스 & 테크니컬 문서 전략 컨설팅 수석 에이전트(Chief Document Strategist AI)'입니다.

[당신의 전문 분야 및 역할]
1. 16대 비즈니스 도메인(경영/전략, 마케팅, 광고/PR, 영업/B2B, 기획/신사업, IT/소프트웨어, AI/데이터, 금융/투자, 부동산, 교육/HR, 법률, 정책/공공, 연구/학술, 제조, 물류 등)의 모든 전문 문서 작성법을 마스터하고 있습니다.
2. 주요 문서 유형(사업계획서, 수주 제안서, PRD 기획서, 시장조사 보고서, 경쟁사 분석서, 마케팅 전략서, 기술 사양서, 경영진 보고서, 교육 가이드라인, 정책 제안서, IR 투자 피치 등)에 대한 목차 구성, 프레임워크(MECE, SWOT, 4P, TAM/SAM/SOM, Unit Economics, WBS, NPV/IRR 등), 설득 논리, 실무 팁을 최고 전문가 수준으로 전수합니다.
3. 사용자가 작성하고자 하는 문서 아이디어나 초안을 검토하고, 즉시 실무에 투입 가능한 '최적 목차', '필수 정량 지표', '독자별 맞춤 설득 포인트', '주의할 리스크'를 명쾌하게 답변합니다.
4. 사용자가 문서 작성을 위해 파라미터를 추천받길 원할 경우, 바로 생성기에 적용할 수 있는 [추천 분야], [추천 문서 유형], [최적화된 주제], [목적], [대상 독자], [핵심 키워드]를 명확히 정리해 줍니다.

[답변 스타일]
- 정중하고 격식 있는 비즈니스 컨설턴트 톤 (해요체 또는 하십시오체의 친절하면서도 전문적인 어조).
- Markdown 서식(소제목 ###, 불릿 포인트, 굵은 글씨, 표, 코드블록)을 적극 활용하여 가독성을 극대화하십시오.
- 실무 예시와 구체적인 수치/프레임워크를 포함하여 바로 적용할 수 있도록 실용적으로 답변하십시오.`;

  // Build conversational transcript
  const transcript = messages.map(m => `${m.role === 'user' ? '사용자' : '문서 전략 에이전트'}: ${m.content}`).join('\n\n');
  const fullPrompt = `${currentContext ? `[현재 앱/문서 컨텍스트]\n${currentContext}\n\n` : ''}[대화 내역]\n${transcript}\n\n문서 전략 에이전트로서 전문적이고 친절하게 실무 조언을 작성하십시오:`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`[Agent Chat] Model ${model} failed:`, err?.message || err);
    }
  }

  throw new Error('에이전트 응답 생성 중 일시적인 오류가 발생했습니다. 잠시 후 다시 질문해 주세요.');
}

export async function generatePresentationDeck(
  apiKey: string,
  params: {
    field: string;
    presentationType: string;
    topic: string;
    purpose: string;
    targetAudience: string;
    companyName?: string;
    theme: string;
    slideCountPreference: number;
    keyPoints?: string;
  }
): Promise<any> {
  const count = params.slideCountPreference || 10;
  const systemInstruction = `당신은 맥킨지, BCG, 글로벌 탑티어 벤처캐피탈(VC) 출신의 '수석 피치덱 전략가 및 프레젠테이션 수석 디자이너'입니다.
사용자가 요청한 산업 분야와 목적에 맞추어, 실제 청중과 투자자를 매료시킬 수 있는 완성도 높은 16:9 규격의 프레젠테이션 슬라이드 덱을 JSON 형태로 생성하십시오.

[슬라이드 덱 구성 필수 규칙]
1. 총 슬라이드 수: 정확히 ${count}장으로 구성하십시오.
2. 1페이지(표지)부터 마지막 페이지(결론)까지 단 1장도 빠짐없이 완벽하고 풍부한 데이터를 채워 넣어야 합니다. (빈 배열이나 null 금지)
3. 슬라이드 레이아웃 다양성 배치 (순차적으로 논리적인 비즈니스 흐름 구성):
   - Slide 1 [title]: 표지 (강렬한 메인 타이틀, 서브타이틀, 회사명/발표자)
   - Slide 2 [cards_grid_3]: 3대 핵심 문제점 및 시장 페인포인트 (cards 배열 3개 - tag, title, description 필수)
   - Slide 3 [bullets_split]: 당사의 솔루션 및 차별화된 핵심 가치 (bulletPoints 3~4개 + keyTakeaway)
   - Slide 4 [market_tam_sam_som]: 시장 규모 및 성장성 (marketSize: tam, sam, som 각각 title, value, desc 수치 기재)
   - Slide 5 [cards_grid_4]: 비즈니스 모델 및 4단계 핵심 프로세스 (cards 배열 4개)
   - Slide 6 [comparison_table]: 경쟁사 대비 비교 우위 분석 표 (table: headers 4개, rows 3~4행)
   - Slide 7 [financial_kpi]: 3개 핵심 재무 목표 및 성장 지표 (metrics 배열 3개: label, value, change, note)
   - Slide 8 [timeline_roadmap]: 4단계 중장기 추진 로드맵 (timeline 배열 4개: phase, period, title, details 2개)
   - Slide 9 [swot_matrix]: SWOT 정밀 전략 분석 (swot: strengths, weaknesses, opportunities, threats 각 2개 항목)
   - Slide 10 [conclusion_call_to_action]: 결론 및 투자/협업 요청 (The Ask & Action Plan, bulletPoints 3개)
   (만약 ${count}장이 다를 경우 위 핵심 레이아웃들을 알맞게 조합하십시오)
4. 모든 슬라이드마다 45초~1분 분량의 실제 발표 대본인 'speakerNotes'를 설득력 있는 정중한 구어체로 반드시 작성하십시오.
5. 각 슬라이드에 어울리는 영문 이미지 검색 키워드('imageKeywords', 예: "business strategy meeting", "cloud data analytics", "financial growth chart")를 1~3단어로 기재하십시오.
6. 반드시 오직 유효한 JSON 포맷으로만 응답하십시오.

[반환 JSON 스키마 예시]
{
  "title": "메인 프레젠테이션 타이틀",
  "subtitle": "부제목 또는 핵심 슬로건",
  "company": "${params.companyName || '글로벌 전략 연구소'}",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "title",
      "category": "COVER",
      "title": "스마트 AI 기반 공급망 최적화 및 비즈니스 혁신 전략",
      "subtitle": "데이터 기반 예측과 자동화를 통한 차세대 엔터프라이즈 운영 모델",
      "keyTakeaway": "운영비용 35% 절감 및 납기 리드타임 50% 단축을 위한 실행 계획",
      "imageKeywords": "modern enterprise business skyline architecture",
      "content": {},
      "speakerNotes": "안녕하십니까, 오늘 발표를 맡은 전략기획팀입니다. 지금부터..."
    },
    {
      "slideNumber": 2,
      "layout": "cards_grid_3",
      "category": "01. PROBLEM DEFINITION",
      "title": "기존 공급망 체계의 3대 한계와 시장 페인포인트",
      "keyTakeaway": "단절된 데이터와 수작업 프로세스로 연간 수십억 원의 손실이 발생하고 있습니다.",
      "imageKeywords": "supply chain logistics warehouse technology",
      "content": {
        "cards": [
          { "tag": "PAIN POINT 1", "title": "수작업 기반의 비효율", "description": "주문 및 재고 관리가 수작업 엑셀에 의존하여 휴먼 에러 발생률이 18%에 달합니다." },
          { "tag": "PAIN POINT 2", "title": "실시간 가시성 부재", "description": "물류 거점 간 정보 단절로 공급 지연에 대한 사전 대응이 불가능합니다." },
          { "tag": "PAIN POINT 3", "title": "과다 재고 비용", "description": "부정확한 수요 예측으로 인해 안전재고 유지비가 매년 25% 이상 증가하고 있습니다." }
        ]
      },
      "speakerNotes": "2페이지에서는 현재 시장과 고객사가 겪고 있는 세 가지 핵심 문제를 짚어보겠습니다..."
    },
    {
      "slideNumber": 3,
      "layout": "bullets_split",
      "category": "02. SOLUTION & VALUE",
      "title": "AI 기반 엔드투엔드 통합 솔루션 아키텍처",
      "keyTakeaway": "실시간 머신러닝 예측 모델을 통해 공급망 전 주기를 지능적으로 자동화합니다.",
      "imageKeywords": "artificial intelligence data analytics dashboard",
      "content": {
        "bulletPoints": [
          "딥러닝 수요 예측 엔진 도입으로 예측 정확도 94.8% 달성",
          "IoT 센서 기반 실시간 화물 추적 및 경로 자동 최적화 시스템 구축",
          "공급업체 및 고객사 간 API 연동을 통한 무중단 자동 발주 체계 완성",
          "이상 징후 발생 시 3분 이내 대체 경로를 제시하는 실시간 관제 센터"
        ]
      },
      "speakerNotes": "3페이지에서는 이러한 문제를 해결하기 위한 당사의 혁신 솔루션을 설명드리겠습니다..."
    }
  ]
}`;

  const prompt = `[프레젠테이션 제작 요청 정보]
- 산업 분야: ${params.field}
- PPT 유형: ${params.presentationType}
- 주제: ${params.topic}
- 목적: ${params.purpose}
- 대상 청중: ${params.targetAudience}
- 회사명: ${params.companyName || ''}
- 선호 슬라이드 장수: ${count}장
${params.keyPoints ? `- 핵심 강조 내용:\n${params.keyPoints}` : ''}

위 정보를 바탕으로 1페이지부터 ${count}페이지까지 단 하나의 슬라이드도 누락 없이 완벽한 컨텐츠를 담은 16:9 프레젠테이션 JSON 슬라이드 덱을 작성하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.slides || !Array.isArray(parsed.slides)) {
    throw new Error('슬라이드 데이터 구조를 파싱하지 못했습니다. 다시 시도해 주세요.');
  }

  return parsed;
}

export async function regenerateSingleSlide(
  apiKey: string,
  params: {
    presentationTitle: string;
    slide: any;
    requestedLayout?: string;
    customPrompt?: string;
  }
): Promise<any> {
  const systemInstruction = `당신은 수석 프레젠테이션 디자이너입니다. 사용자가 요청한 슬라이드 1장을 수정/재작성하여 유효한 단일 Slide JSON 객체로 반환하십시오.
반드시 다음 JSON 구조를 유지하십시오:
{
  "slideNumber": ${params.slide.slideNumber || 1},
  "layout": "${params.requestedLayout || params.slide.layout || 'cards_grid_3'}",
  "category": "카테고리명",
  "title": "슬라이드 제목",
  "subtitle": "부제목",
  "keyTakeaway": "핵심 결론 1문장",
  "content": { ...레이아웃에 맞는 구조화된 데이터... },
  "speakerNotes": "발표자 스피커 노트 대본..."
}`;

  const prompt = `[전체 프레젠테이션 주제]: ${params.presentationTitle}
[기존 슬라이드 정보]:
${JSON.stringify(params.slide, null, 2)}

${params.requestedLayout ? `[요청된 새 레이아웃]: ${params.requestedLayout}` : ''}
${params.customPrompt ? `[수정 요청 지침]: ${params.customPrompt}` : ''}

위 지침을 반영하여 개선된 단일 슬라이드 JSON 객체를 생성하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.65,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.title) {
    throw new Error('슬라이드 재작성 결과 파싱에 실패했습니다.');
  }

  return parsed;
}

export async function convertDocToPresentation(
  apiKey: string,
  params: {
    documentTitle: string;
    executiveSummary: string;
    sectionsSummary: string;
    field: string;
    theme: string;
  }
): Promise<any> {
  const systemInstruction = `당신은 장문의 비즈니스 문서를 '핵심 10장 프레젠테이션 슬라이드 덱'으로 요약 및 변환하는 수석 전략가입니다.
입력된 문서의 핵심 논리와 수치를 완벽히 계승하면서, 시각적으로 매력적인 프레젠테이션 JSON 슬라이드 덱으로 변환하십시오.
반드시 유효한 JSON으로만 응답하십시오.`;

  const prompt = `[원본 문서 제목]: ${params.documentTitle}
[산업 분야]: ${params.field}
[요약본]: ${params.executiveSummary}
[섹션별 핵심 내용]:
${params.sectionsSummary}

위 전문 문서를 10장의 프레젠테이션 슬라이드 덱(title, bullets_split, cards_grid_3, swot_matrix, comparison_table, timeline_roadmap, financial_kpi, conclusion_call_to_action 등 다양한 레이아웃 조합)으로 변환하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.slides) {
    throw new Error('문서 변환 슬라이드 생성에 실패했습니다.');
  }

  return parsed;
}

export async function generateExcelSpreadsheet(
  apiKey: string,
  params: {
    templateType: string;
    title: string;
    companyName?: string;
    period?: string;
    currency?: string;
    businessDescription: string;
    keyMetricsToInclude?: string;
    numberOfMonths?: number;
  }
): Promise<any> {
  const isMonthlySales = params.templateType === 'monthly_sales_report';
  const currencySymbol = params.currency === 'USD' ? '$' : '₩';
  const formatType = params.currency === 'USD' ? 'currency_usd' : 'currency_krw';

  const systemInstruction = `당신은 글로벌 탑티어 전략컨설팅 및 투자은행(IB) 출신의 '수석 재무 모델링 & 엑셀 스프레드시트 아키텍트'입니다.
사용자가 요청한 비즈니스 목적에 맞추어, 실제 업무에서 즉시 활용 가능한 최고 수준의 엑셀 스프레드시트 데이터(다중 시트, 컬럼 정의, 셀 수식/포맷, 통계 요약, 차트 데이터)를 JSON으로 완벽하게 설계하십시오.

[필수 요구사항]
1. ${isMonthlySales ? '반드시 1월부터 12월까지의 "월별 총괄 매출/목표/달성율/증감" 시트와 "제품/채널별 세부 매출 내역" 시트를 포함해야 합니다.' : '요청된 양식에 부합하는 정밀 다중 시트 구조'}
2. 모든 시트(sheets)의 행(rows) 데이터는 실무에서 바로 쓸 수 있는 현실적인 숫자를 포함해야 합니다.
3. 합계(Total) 행은 반드시 'isTotal: true'로 설정하십시오.
4. 주요 지표를 직관적으로 파악할 수 있도록 3~4개의 'kpis' 요약 카드(label, value, subValue, change, isPositive)를 작성하십시오.
5. 차트 시각화를 위한 'chartData'(예: 1월~12월 월별 매출/목표 배열)와 'chartSuggestion'을 완벽히 작성하십시오.
6. 반드시 순수한 JSON 형식으로만 응답하십시오.

[반환 JSON 스키마 예시]
{
  "title": "2026년도 월별 매출 실적 및 목표 달성 분석 보고서",
  "subtitle": "주요 사업부문별 월간 매출 추이, 목표 달성율 및 전년 대비 성장 분석",
  "company": "${params.companyName || '글로벌 엔터프라이즈'}",
  "templateType": "${params.templateType}",
  "currency": "${params.currency || 'KRW'}",
  "period": "${params.period || '2026년 1월 ~ 12월'}",
  "executiveSummary": "2026년도 연간 총 매출액은 128.5억 원으로 연간 목표 대비 104.2%를 달성하였으며, 특히 B2B 엔터프라이즈 솔루션 부문의 3분기 급성장(전년비 +34%)이 전사 실적을 견인하였습니다.",
  "kpis": [
    { "label": "연간 누적 매출액", "value": "128.5억 원", "subValue": "목표: 123.3억 원", "change": "+104.2% 달성", "isPositive": true, "iconName": "DollarSign" },
    { "label": "전년 대비 성장률 (YoY)", "value": "+24.8%", "subValue": "전년 102.9억 원", "change": "+25.6억 원 순증", "isPositive": true, "iconName": "TrendingUp" },
    { "label": "영업이익률 (OP Margin)", "value": "28.4%", "subValue": "영업이익 36.5억 원", "change": "+3.2%p 개선", "isPositive": true, "iconName": "PieChart" },
    { "label": "최고 매출 달성 월", "value": "11월 (14.2억)", "subValue": "연말 프로모션 효과", "change": "목표 대비 118%", "isPositive": true, "iconName": "Award" }
  ],
  "sheets": [
    {
      "id": "sheet_monthly_overview",
      "name": "1. 월별_매출_총괄",
      "description": "2026년 1월 ~ 12월 월별 매출 실적, 목표, 달성율 및 전년 대비 성장 추이",
      "freezeHeader": true,
      "columns": [
        { "key": "month", "header": "기간 (월)", "width": 14, "align": "center", "format": "text" },
        { "key": "target", "header": "목표 매출 (${currencySymbol})", "width": 18, "align": "right", "format": "${formatType}" },
        { "key": "actual", "header": "실제 매출 (${currencySymbol})", "width": 18, "align": "right", "format": "${formatType}" },
        { "key": "achievement", "header": "목표 달성율", "width": 14, "align": "right", "format": "percent" },
        { "key": "prevYear", "header": "전년 동월 (${currencySymbol})", "width": 18, "align": "right", "format": "${formatType}" },
        { "key": "growth", "header": "YoY 성장률", "width": 14, "align": "right", "format": "percent" },
        { "key": "note", "header": "주요 비고 및 이벤트", "width": 24, "align": "left", "format": "text" }
      ],
      "rows": [
        { "rowNumber": 1, "cells": [{ "value": "2026년 1월" }, { "value": 900000000 }, { "value": 940000000 }, { "value": 1.044, "formula": "=C5/B5" }, { "value": 780000000 }, { "value": 0.205, "formula": "=(C5-E5)/E5" }, { "value": "신년 프로모션 효과" }] },
        { "rowNumber": 2, "cells": [{ "value": "2026년 2월" }, { "value": 850000000 }, { "value": 880000000 }, { "value": 1.035 }, { "value": 720000000 }, { "value": 0.222 }, { "value": "영업일수 단축 영향" }] },
        { "rowNumber": 3, "cells": [{ "value": "2026년 3월" }, { "value": 1000000000 }, { "value": 1050000000 }, { "value": 1.050 }, { "value": 850000000 }, { "value": 0.235 }, { "value": "1분기 마감 수주" }] },
        { "rowNumber": 4, "cells": [{ "value": "2026년 4월" }, { "value": 950000000 }, { "value": 980000000 }, { "value": 1.032 }, { "value": 800000000 }, { "value": 0.225 }, { "value": "신제품 라인업 출시" }] },
        { "rowNumber": 5, "cells": [{ "value": "2026년 5월" }, { "value": 1050000000 }, { "value": 1120000000 }, { "value": 1.067 }, { "value": 880000000 }, { "value": 0.273 }, { "value": "가정의달 특수" }] },
        { "rowNumber": 6, "cells": [{ "value": "2026년 6월" }, { "value": 1100000000 }, { "value": 1150000000 }, { "value": 1.045 }, { "value": 920000000 }, { "value": 0.250 }, { "value": "상반기 실적 호조" }] },
        { "rowNumber": 7, "cells": [{ "value": "2026년 7월" }, { "value": 1000000000 }, { "value": 1020000000 }, { "value": 1.020 }, { "value": 840000000 }, { "value": 0.214 }, { "value": "여름 비수기 방어" }] },
        { "rowNumber": 8, "cells": [{ "value": "2026년 8월" }, { "value": 980000000 }, { "value": 1010000000 }, { "value": 1.031 }, { "value": 830000000 }, { "value": 0.217 }, { "value": "하반기 전략 수립" }] },
        { "rowNumber": 9, "cells": [{ "value": "2026년 9월" }, { "value": 1150000000 }, { "value": 1200000000 }, { "value": 1.043 }, { "value": 950000000 }, { "value": 0.263 }, { "value": "추석 시즌 대형 수주" }] },
        { "rowNumber": 10, "cells": [{ "value": "2026년 10월" }, { "value": 1080000000 }, { "value": 1110000000 }, { "value": 1.028 }, { "value": 910000000 }, { "value": 0.220 }, { "value": "글로벌 파트너십 개시" }] },
        { "rowNumber": 11, "cells": [{ "value": "2026년 11월" }, { "value": 1200000000 }, { "value": 1420000000 }, { "value": 1.183 }, { "value": 1020000000 }, { "value": 0.392 }, { "value": "블랙프라이데이/연말 세일즈" }] },
        { "rowNumber": 12, "cells": [{ "value": "2026년 12월" }, { "value": 1300000000 }, { "value": 1370000000 }, { "value": 1.054 }, { "value": 1090000000 }, { "value": 0.257 }, { "value": "연말 결산 프로젝트" }] },
        { "rowNumber": 13, "isTotal": true, "cells": [{ "value": "연간 누계 합계 (TOTAL)", "isBold": true }, { "value": 12560000000, "formula": "=SUM(B5:B16)", "isBold": true }, { "value": 13250000000, "formula": "=SUM(C5:C16)", "isBold": true }, { "value": 1.055, "formula": "=C17/B17", "isBold": true }, { "value": 10390000000, "formula": "=SUM(E5:E16)", "isBold": true }, { "value": 0.275, "formula": "=(C17-E17)/E17", "isBold": true }, { "value": "전사 목표 초과 달성", "isBold": true }] }
      ]
    },
    {
      "id": "sheet_by_product",
      "name": "2. 제품_채널별_세부실적",
      "description": "주요 제품군 및 판매 채널별 연간 매출 구성비 및 기여도",
      "freezeHeader": true,
      "columns": [
        { "key": "category", "header": "구분 / 제품군", "width": 16, "align": "left", "format": "text" },
        { "key": "channel", "header": "판매 채널", "width": 14, "align": "center", "format": "text" },
        { "key": "q1", "header": "1분기 (${currencySymbol})", "width": 16, "align": "right", "format": "${formatType}" },
        { "key": "q2", "header": "2분기 (${currencySymbol})", "width": 16, "align": "right", "format": "${formatType}" },
        { "key": "q3", "header": "3분기 (${currencySymbol})", "width": 16, "align": "right", "format": "${formatType}" },
        { "key": "q4", "header": "4분기 (${currencySymbol})", "width": 16, "align": "right", "format": "${formatType}" },
        { "key": "annualTotal", "header": "연간 총계 (${currencySymbol})", "width": 18, "align": "right", "format": "${formatType}" },
        { "key": "share", "header": "매출 비중 (%)", "width": 14, "align": "right", "format": "percent" }
      ],
      "rows": [
        { "rowNumber": 1, "cells": [{ "value": "엔터프라이즈 솔루션" }, { "value": "B2B 직판" }, { "value": 1250000000 }, { "value": 1450000000 }, { "value": 1580000000 }, { "value": 1920000000 }, { "value": 6200000000, "formula": "=SUM(C5:F5)" }, { "value": 0.468 }] },
        { "rowNumber": 2, "cells": [{ "value": "클라우드 SaaS 구독" }, { "value": "온라인 셀프서브" }, { "value": 850000000 }, { "value": 980000000 }, { "value": 1050000000 }, { "value": 1220000000 }, { "value": 4100000000, "formula": "=SUM(C6:F6)" }, { "value": 0.309 }] },
        { "rowNumber": 3, "cells": [{ "value": "전문 컨설팅 & SI" }, { "value": "파트너 채널" }, { "value": 520000000 }, { "value": 560000000 }, { "value": 600000000 }, { "value": 770000000 }, { "value": 2450000000, "formula": "=SUM(C7:F7)" }, { "value": 0.185 }] },
        { "rowNumber": 4, "cells": [{ "value": "유지보수 & 교육" }, { "value": "고객지원팀" }, { "value": 120000000 }, { "value": 130000000 }, { "value": 140000000 }, { "value": 160000000 }, { "value": 550000000, "formula": "=SUM(C8:F8)" }, { "value": 0.038 }] },
        { "rowNumber": 5, "isTotal": true, "cells": [{ "value": "합계 (TOTAL)", "isBold": true }, { "value": "전체", "isBold": true }, { "value": 2740000000, "formula": "=SUM(C5:C8)", "isBold": true }, { "value": 3120000000, "formula": "=SUM(D5:D8)", "isBold": true }, { "value": 3370000000, "formula": "=SUM(E5:E8)", "isBold": true }, { "value": 4070000000, "formula": "=SUM(F5:F8)", "isBold": true }, { "value": 13300000000, "formula": "=SUM(G5:G8)", "isBold": true }, { "value": 1.0, "isBold": true }] }
      ]
    }
  ],
  "chartData": [
    { "name": "1월", "target": 900, "actual": 940, "prevYear": 780 },
    { "name": "2월", "target": 850, "actual": 880, "prevYear": 720 },
    { "name": "3월", "target": 1000, "actual": 1050, "prevYear": 850 },
    { "name": "4월", "target": 950, "actual": 980, "prevYear": 800 },
    { "name": "5월", "target": 1050, "actual": 1120, "prevYear": 880 },
    { "name": "6월", "target": 1100, "actual": 1150, "prevYear": 920 },
    { "name": "7월", "target": 1000, "actual": 1020, "prevYear": 840 },
    { "name": "8월", "target": 980, "actual": 1010, "prevYear": 830 },
    { "name": "9월", "target": 1150, "actual": 1200, "prevYear": 950 },
    { "name": "10월", "target": 1080, "actual": 1110, "prevYear": 910 },
    { "name": "11월", "target": 1200, "actual": 1420, "prevYear": 1020 },
    { "name": "12월", "target": 1300, "actual": 1370, "prevYear": 1090 }
  ],
  "chartSuggestion": {
    "type": "line",
    "title": "2026년 월별 목표 대비 실제 매출 및 전년 실적 비교 (단위: 백만 원)",
    "xAxisKey": "name",
    "dataKeys": [
      { "key": "actual", "name": "실제 매출", "color": "#4F46E5" },
      { "key": "target", "name": "목표 매출", "color": "#10B981" },
      { "key": "prevYear", "name": "전년 동월", "color": "#94A3B8" }
    ]
  }
}`;

  const prompt = `[전문 엑셀 스프레드시트 생성 요청]
- 템플릿 종류: ${params.templateType} (${isMonthlySales ? '월별 매출 보고서' : params.title})
- 문서 제목: ${params.title}
- 회사/부서명: ${params.companyName || '글로벌 전략 기획실'}
- 기간: ${params.period || '2026년 1월 ~ 12월'}
- 통화: ${params.currency || 'KRW'}
- 상세 설명 및 조건:
${params.businessDescription}
${params.keyMetricsToInclude ? `- 필수 포함 지표: ${params.keyMetricsToInclude}` : ''}

위 가이드라인과 JSON 스키마 예시를 엄격히 준수하여, 실제 업무에서 곧바로 결재 및 분석에 사용할 수 있는 고품질 다중 시트 엑셀 JSON 데이터를 생성하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sheets) {
    throw new Error('AI가 유효한 엑셀 스프레드시트 구조를 생성하지 못했습니다. 다시 시도해 주세요.');
  }

  return parsed;
}

export async function aiEditExcelSpreadsheet(
  apiKey: string,
  currentDoc: any,
  instructionPrompt: string
): Promise<any> {
  const systemInstruction = `당신은 최고 수준의 'AI 엑셀 & 재무 스프레드시트 수석 아키텍트'입니다.
사용자가 제공한 기존 엑셀 스프레드시트(다중 시트, 컬럼 정의, 행/셀 데이터, KPI, 차트 데이터)와 자연어 수정 요청사항을 분석하여, 요청사항을 완벽히 반영한 업데이트된 엑셀 스프레드시트 전체 JSON 구조를 반환하십시오.

[수정 원칙]
1. 사용자의 자연어 지시(예: "하반기 매출 목표 10% 일괄 상향", "새로운 열/행 추가", "특정 항목 수치 변경", "시트 추가" 등)를 정밀하게 적용합니다.
2. 수치가 변경되면 관련 수식(달성율, 성장률, 합계 SUM)과 차트 데이터(chartData), KPI 카드(kpis)의 값도 반드시 일관성 있게 업데이트하십시오.
3. 기존 시트의 서식(format, align, isBold, isTotal)과 컬럼 구조를 깨지 않고 정밀하게 유지하십시오.
4. 반드시 순수한 JSON 형식으로만 응답하십시오.`;

  const prompt = `[기존 엑셀 스프레드시트 데이터]
${JSON.stringify(currentDoc, null, 2)}

[사용자의 자연어 수정 지시사항]
"${instructionPrompt}"

위 지시사항을 기존 데이터에 정확히 반영하여 최신 상태의 엑셀 JSON 데이터를 반환하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.5,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sheets) {
    throw new Error('AI가 엑셀 스프레드시트를 성공적으로 수정하지 못했습니다. 다시 시도해 주세요.');
  }

  return parsed;
}

export async function generateBusinessForm(
  apiKey: string,
  params: any
): Promise<any> {
  const systemInstruction = `당신은 대한민국 1위 대기업 비서실 및 전략기획실 출신의 '공문서·행정 양식 수석 아키텍트'입니다.
사용자가 요청한 업무 양식(품의서, 견적서, 전자세금계산서, 주간업무보고서, 경력기술서/이력서, 비즈니스공문, 근로계약서, 회의록 등)을 표준 규격에 맞게 완벽한 JSON 구조로 생성하십시오.

[필수 원칙]
1. 대한민국 기업 및 관공서 표준 결재선(기안자, 팀장, 본부장, 대표이사 등)을 상황에 맞게 구성하십시오.
2. 견적서/세금계산서의 경우 공급가액, 세액(10%), 총합계금액(한글 금액 표기 포함: 예 "일천일백만 원정 (₩11,000,000)")을 정확하게 연산하십시오.
3. 섹션(sections)은 text, table, key_value, bullet_list 타입을 적절히 조합하여 실무적이고 프로페셔널한 서식으로 구성하십시오.
4. 순수한 JSON 문자열만 출력하십시오.

[반환 JSON 스키마 구조]
{
  "title": "2026년 상반기 클라우드 인프라 확장 및 AI GPU 서버 도입 품의서",
  "formType": "${params.formType}",
  "docNumber": "IT-2026-0822",
  "draftDate": "2026년 08월 22일",
  "effectiveDate": "2026년 09월 01일",
  "drafter": {
    "name": "${params.drafterName || '홍길동'}",
    "department": "${params.drafterDepartment || 'IT인프라팀'}",
    "position": "${params.drafterPosition || '수석연구원'}",
    "contact": "010-1234-5678",
    "email": "drafter@company.com"
  },
  "recipient": {
    "company": "${params.recipientCompany || '(주)알파비즈니스'}",
    "name": "${params.recipientName || '김대표'}"
  },
  "supplier": {
    "company": "${params.companyName || '(주)클라우드테크놀로지'}",
    "ceoName": "이대표",
    "businessNumber": "123-45-67890",
    "address": "서울특별시 강남구 테헤란로 123"
  },
  "approvalLine": [
    { "role": "기안자", "name": "${params.drafterName || '홍길동 수석'}", "status": "approved", "date": "2026-08-22", "signature": "승인" },
    { "role": "팀장", "name": "김철수 팀장", "status": "approved", "date": "2026-08-22", "signature": "승인" },
    { "role": "본부장", "name": "박영희 본부장", "status": "pending" },
    { "role": "대표이사", "name": "이대표", "status": "pending" }
  ],
  "totalAmountNumber": 11000000,
  "supplyAmount": 10000000,
  "taxAmount": 1000000,
  "totalAmountText": "일천일백만 원정 (VAT 포함)",
  "sections": [
    {
      "id": "sec_1",
      "title": "추진 목적 및 배경",
      "type": "text",
      "content": "서비스 이용자 급증에 따른 인프라 병목을 해소하고 LLM AI 서빙을 위한 전용 GPU 인스턴스를 확보하고자 함."
    },
    {
      "id": "sec_2",
      "title": "주요 세부 내역 및 예산 소요액",
      "type": "table",
      "columns": [
        { "key": "item", "header": "항목명", "align": "left" },
        { "key": "spec", "header": "규격 및 사양", "align": "left" },
        { "key": "qty", "header": "수량", "align": "center", "format": "number" },
        { "key": "unitPrice", "header": "단가 (₩)", "align": "right", "format": "currency" },
        { "key": "amount", "header": "공급가액 (₩)", "align": "right", "format": "currency" }
      ],
      "rows": [
        { "id": "r1", "cells": { "item": "NVIDIA H100 인스턴스", "spec": "8-GPU 640GB", "qty": 1, "unitPrice": 8000000, "amount": 8000000 } },
        { "id": "r2", "cells": { "item": "스토리지 NVMe 10TB", "spec": "고속 캐싱 풀", "qty": 2, "unitPrice": 1000000, "amount": 2000000 } },
        { "id": "r_total", "isTotal": true, "cells": { "item": "합계 (TOTAL)", "spec": "-", "qty": 3, "unitPrice": "-", "amount": 10000000 } }
      ]
    },
    {
      "id": "sec_3",
      "title": "기대 효과 및 향후 일정",
      "type": "bullet_list",
      "items": [
        "AI 응답 지연 시간 45% 단축 및 동시 접속자 10만 명 수용 가능",
        "2026년 9월 1일 인프라 세팅 완료 및 부하 테스트 실시"
      ]
    }
  ],
  "specialTerms": [
    "본 건은 예산 승인 완료 즉시 발주를 진행하며, 납품 후 14일 이내 검수를 완료함."
  ]
}`;

  const prompt = `다음 조건에 맞춰 실무 표준 결재/행정 문서를 생성해 주십시오:
- 양식 종류: ${params.formType}
- 제목: ${params.title}
- 기안자: ${params.drafterName} (${params.drafterDepartment || ''} ${params.drafterPosition || ''})
- 회사명: ${params.companyName || ''}
- 수신처: ${params.recipientCompany || ''} ${params.recipientName || ''}
- 예산/금액: ${params.totalBudget || ''}
- 목표/시행일: ${params.targetDate || ''}
- 핵심 기재 내용 및 요구사항:
${params.keyDetails}

위 가이드라인과 JSON 스키마를 엄격히 준수하여 전문적이고 완성도 높은 공문서 JSON을 작성하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sections) {
    throw new Error('AI가 유효한 비즈니스 양식 구조를 생성하지 못했습니다. 다시 시도해 주세요.');
  }

  return parsed;
}

export async function aiEditBusinessForm(
  apiKey: string,
  currentDoc: any,
  instructionPrompt: string
): Promise<any> {
  const systemInstruction = `당신은 대한민국 최고 수준의 '공문서·행정 양식 수석 편집위원'입니다.
사용자가 제공한 기존 비즈니스 양식(결재선, 공급자/수신자 정보, 표, 목록, 섹션 본문)과 자연어 수정 요청을 분석하여, 요청사항이 완벽하게 반영된 업데이트된 공문서 JSON 구조를 반환하십시오.

[수정 원칙]
1. 사용자의 자연어 지시(예: "결재선에 재무이사 추가", "금액을 부가세 포함 1500만원으로 상향하고 품목 수량 조정", "경력사항에 AI 프로젝트 항목 추가", "특약사항 조항 추가" 등)를 정밀하게 적용합니다.
2. 표 수치가 변경되면 공급가액, 세액, 총합계, 한글 금액 표기(totalAmountText)를 일치시킵니다.
3. 순수한 JSON 형식으로만 응답하십시오.`;

  const prompt = `[기존 공문서 데이터]
${JSON.stringify(currentDoc, null, 2)}

[사용자의 자연어 수정 지시사항]
"${instructionPrompt}"

위 지시사항을 기존 공문서 데이터에 정확히 반영하여 최신 상태의 양식 JSON 데이터를 반환하십시오.`;

  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.5,
  });

  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sections) {
    throw new Error('AI가 공문서 양식을 성공적으로 수정하지 못했습니다. 다시 시도해 주세요.');
  }

  return parsed;
}


