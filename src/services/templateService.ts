import { UnifiedPreset, ALL_PRESETS } from '../data/presets';

const STORAGE_KEY = 'domain_doc_ai_recommended_presets_v1';

/**
 * Robust normalization of preset structure and defaultData for all 4 product types.
 * Ensures that both '폼에 불러오기' and '즉시 생성' always receive complete, valid data.
 */
export function normalizePreset(preset: any): UnifiedPreset {
  if (!preset) {
    return ALL_PRESETS[0];
  }

  const rawProduct = String(preset.productType || preset.product || preset.type || 'doc').toLowerCase();
  let productType: 'doc' | 'presentation' | 'excel' | 'form_studio' = 'doc';

  if (rawProduct.includes('pres') || rawProduct.includes('ppt') || rawProduct.includes('slide')) {
    productType = 'presentation';
  } else if (rawProduct.includes('excel') || rawProduct.includes('sheet') || rawProduct.includes('table')) {
    productType = 'excel';
  } else if (rawProduct.includes('form') || rawProduct.includes('official') || rawProduct.includes('studio')) {
    productType = 'form_studio';
  } else {
    productType = 'doc';
  }

  const rawData = preset.defaultData || {};
  const resolvedTitle =
    rawData.topic ||
    rawData.title ||
    preset.name ||
    '맞춤 비즈니스 전문 표준 시나리오';

  const resolvedDesc =
    rawData.purpose ||
    rawData.businessDescription ||
    rawData.description ||
    rawData.keyDetails ||
    preset.description ||
    '현업 실무에서 바로 활용 가능한 체계적인 비즈니스 구조화 모델';

  const resolvedTarget =
    rawData.targetAudience ||
    rawData.companyName ||
    rawData.drafterName ||
    '사내 경영진 및 주요 의사결정권자';

  const resolvedField = rawData.field || preset.field || 'management';

  let normalizedData: any = { ...rawData };

  if (productType === 'doc') {
    normalizedData = {
      field: resolvedField,
      documentType: rawData.documentType || 'proposal',
      topic: resolvedTitle,
      title: resolvedTitle,
      purpose: resolvedDesc,
      targetAudience: resolvedTarget,
      professionalLevel: rawData.professionalLevel || 'executive',
      length: rawData.length || 'standard',
      keywords: Array.isArray(rawData.keywords) && rawData.keywords.length > 0
        ? rawData.keywords
        : ['전략 수립', '실무 실행', 'KPI 달성', '리스크 관리'],
      additionalRequirements: rawData.additionalRequirements || '',
    };
  } else if (productType === 'presentation') {
    normalizedData = {
      field: resolvedField,
      presentationType: rawData.presentationType || 'ir_pitch',
      theme: rawData.theme || 'dark_navy',
      topic: resolvedTitle,
      title: resolvedTitle,
      purpose: resolvedDesc,
      targetAudience: resolvedTarget,
      companyName: rawData.companyName || '',
      slideCountPreference: Number(rawData.slideCountPreference) || 10,
      keyPoints: rawData.keyPoints || resolvedDesc || '',
    };
  } else if (productType === 'excel') {
    normalizedData = {
      templateType: rawData.templateType || 'project_wbs_budget',
      title: resolvedTitle,
      topic: resolvedTitle,
      companyName: rawData.companyName || '전략 기획 총괄팀',
      period: rawData.period || '2026년 1월 ~ 12월 (연간)',
      currency: rawData.currency === 'USD' ? 'USD' : 'KRW',
      businessDescription: resolvedDesc,
      keyMetricsToInclude:
        rawData.keyMetricsToInclude ||
        '월별 목표 대비 달성율(%), 전년 대비 성장률(YoY), 부서별 기여도 및 마진율',
    };
  } else if (productType === 'form_studio') {
    normalizedData = {
      formType: rawData.formType || 'proposal_approval',
      title: resolvedTitle,
      topic: resolvedTitle,
      drafterName: rawData.drafterName || '홍길동',
      drafterDepartment: rawData.drafterDepartment || '기획전략팀',
      drafterPosition: rawData.drafterPosition || '수석 / 팀장',
      companyName: rawData.companyName || '(주)혁신그룹',
      recipientName: rawData.recipientName || '대표이사 귀하',
      recipientCompany: rawData.recipientCompany || '(주)혁신그룹',
      keyDetails:
        rawData.keyDetails ||
        `1. 추진 배경 및 목적:\n- ${resolvedDesc}\n2. 세부 실행 계획 및 일정\n3. 소요 예산 및 정량적 기대효과`,
      totalBudget: rawData.totalBudget || '15,000,000원',
      targetDate: rawData.targetDate || '2026년 12월 31일',
    };
  }

  return {
    ...preset,
    id: preset.id || `preset-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: preset.name || resolvedTitle,
    description: preset.description || resolvedDesc,
    productType,
    field: resolvedField,
    iconName:
      preset.iconName ||
      (productType === 'doc'
        ? 'Megaphone'
        : productType === 'presentation'
        ? 'Building2'
        : productType === 'excel'
        ? 'Cpu'
        : 'GraduationCap'),
    hasCompanyCustomizer:
      preset.hasCompanyCustomizer !== undefined ? Boolean(preset.hasCompanyCustomizer) : true,
    companyPlaceholder: preset.companyPlaceholder || '예: 대상 고객사/기업명 입력',
    isAiRecommended: true,
    createdAt: preset.createdAt || Date.now(),
    defaultData: normalizedData,
  };
}

export function getLocalAiPresets(): UnifiedPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizePreset(item));
  } catch (err) {
    console.error('Failed to load AI presets from localStorage:', err);
    return [];
  }
}

export function saveLocalAiPresets(presets: UnifiedPreset[]): void {
  try {
    const normalizedList = presets.map((p) => normalizePreset(p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedList));
  } catch (err) {
    console.error('Failed to save AI presets to localStorage:', err);
  }
}

export function clearAiPresets(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear AI presets:', err);
  }
}

export async function requestNewAiTemplates(existingTitles: string[] = []): Promise<UnifiedPreset[]> {
  try {
    const response = await fetch('/api/generate-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ existingTitles }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `서버 에러 (${response.status})`);
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.templates)) {
      return data.templates.map((tpl: any) => normalizePreset(tpl));
    }
    throw new Error('올바른 템플릿 목록 응답을 수신하지 못했습니다.');
  } catch (error) {
    console.warn('[templateService] requestNewAiTemplates error, using frontend fallback pool:', error);

    // Front-end dynamic fallback generation with 4 diverse items
    const timestamp = Date.now();
    const fallbackTemplates: UnifiedPreset[] = [
      {
        id: `preset-ai-fe-sales-${timestamp}-1`,
        name: '글로벌 엔터프라이즈 AI 솔루션 수주 제안서',
        description: '글로벌 500대 기업을 타깃으로 엔터프라이즈 생성형 AI 도입 비용 절감 효과와 보안 아키텍처를 강조하는 B2B 맞춤형 제안 문서입니다.',
        productType: 'doc',
        field: 'sales',
        iconName: 'Megaphone',
        hasCompanyCustomizer: true,
        companyPlaceholder: '예: 현대자동차, LG CNS, 카카오',
        isAiRecommended: true,
        createdAt: timestamp,
        defaultData: {
          field: 'sales',
          documentType: 'proposal',
          topic: '[고객사명] 업무 생산성 혁신을 위한 엔터프라이즈 생성형 AI 전사 구축 및 보안 연동 제안서',
          purpose: '[고객사명]의 임직원 업무 리드타임 50% 단축 및 연간 25억 비용 절감 달성을 위한 맞춤형 AI 인프라 구축 솔루션 제안',
          targetAudience: '[고객사명] 최고디지털책임자(CDO), IT 기획본부장 및 보안총괄책임자(CISO)',
          professionalLevel: 'executive',
          length: 'comprehensive',
          keywords: ['엔터프라이즈 AI', '프라이빗 LLM', '데이터 보안', 'RAG 지식허브', 'ROI 300%', '구축 WBS'],
          additionalRequirements: '고객사 내부 데이터 유출 방지 하이브리드 클라우드 아키텍처, 단계별 PoC 및 본 구축 로드맵, 정량적 ROI 추정치를 구체적으로 명시할 것.',
        },
      },
      {
        id: `preset-ai-fe-mgmt-${timestamp}-2`,
        name: '2026-2028 신성장 동력 M&A 및 지분투자 타당성 발표 슬라이드 (10장)',
        description: '산업 패러다임 변화에 선제 대응하기 위한 유망 딥테크 스타트업 M&A 시너지 및 밸류에이션 추정치를 일목요연하게 보고하는 이사회 발표 덱입니다.',
        productType: 'presentation',
        field: 'management',
        iconName: 'Building2',
        hasCompanyCustomizer: true,
        companyPlaceholder: '예: SK스퀘어, 미래에셋, 네이버',
        isAiRecommended: true,
        createdAt: timestamp,
        defaultData: {
          field: 'management',
          presentationType: 'executive_report',
          theme: 'dark_navy',
          topic: '[고객사명] 차세대 피지컬 AI 및 로보틱스 유망 기술 기업 전략적 지분투자(M&A) 타당성 검토',
          purpose: '이사회 상정용 신규 투자 재원 200억 집행 승인 및 핵심 시너지 로드맵 확정',
          targetAudience: '대표이사(CEO), 이사회 의장, 사외이사 및 재무최고책임자(CFO)',
          companyName: '[고객사명] 투자전략실',
          slideCountPreference: 10,
          keyPoints: '피인수사 핵심 특허 18건 보유, 포스트 머저(PMI) 100일 계획, 3개년 순이익 기여도 60억 전망, EV/EBITDA 배수 적정성 검증',
        },
      },
      {
        id: `preset-ai-fe-it-${timestamp}-3`,
        name: '멀티 클라우드 인프라 TCO 비용 절감 및 FinOps 예산 분석 대장',
        description: 'AWS, Azure, GCP 3대 클라우드 인스턴스 사용량과 스팟/예약 인스턴스(RI) 전환에 따른 절감액, 부서별 과금 모델을 정밀 계산하는 엑셀 모델입니다.',
        productType: 'excel',
        field: 'it_tech',
        iconName: 'Cpu',
        isAiRecommended: true,
        createdAt: timestamp,
        defaultData: {
          templateType: 'project_wbs_budget',
          title: '2026년도 전사 멀티 클라우드 FinOps 인프라 비용 최적화 및 부서별 집행 대장',
          companyName: '클라우드인프라 거버넌스팀',
          period: '2026년 1월 ~ 12월 (연간)',
          currency: 'USD',
          businessDescription: '개발, 운영, AI 연구 부서별 월별 클라우드 서버/스토리지 리소스 소비 현황과 FinOps 최적화에 따른 실질 절감율(35% 목표)을 추적 연산하는 엔지니어링 재무 대장입니다.',
          keyMetricsToInclude: '월별 클라우드 총비용(TCO), 부서별 원가 배부액, 유휴 자원 절감액, 예약 인스턴스 커버리지 비율(%), 연간 예상 세이빙 총액',
        },
      },
      {
        id: `preset-ai-fe-edu-${timestamp}-4`,
        name: '전사 AI 리터러시 사내 교육 및 자격 인증 추진 품의서',
        description: '전 임직원의 생성형 AI 실무 도구 활용 역량을 극대화하기 위한 단계별 교육 커리큘럼 도입과 외부 전문 강사진 섭외 예산 승인 행정 양식입니다.',
        productType: 'form_studio',
        field: 'education_hr',
        iconName: 'GraduationCap',
        isAiRecommended: true,
        createdAt: timestamp,
        defaultData: {
          formType: 'proposal_approval',
          title: '2026년 하반기 전사 임직원 실무 생성형 AI 활용 및 프롬프트 엔지니어링 역량 강화 교육 품의서',
          drafterName: '박서연',
          drafterDepartment: '인재개발원 HRD팀',
          drafterPosition: '선임 수석',
          companyName: '(주)혁신그룹홀딩스',
          recipientName: '경영지원총괄 전무이사',
          recipientCompany: '(주)혁신그룹홀딩스',
          totalBudget: '24,000,000원 (VAT 포함)',
          targetDate: '2026년 11월 15일',
          keyDetails: `1. 교육 추진 배경 및 목표
- 비즈니스 부서 전반의 생성형 AI 도입 가속화에 맞추어 임직원의 보안 준수 및 업무 자동화 실무 적용률 80% 달성
- 부서별 맞춤 프롬프트 라이브러리 구축 및 사내 챔피언 50명 양성

2. 주요 세부 소요 예산
- 전사 3단계 오프라인 실습 워크숍 강사료 및 멘토링 비용 (15,000,000원)
- 실습용 엔터프라이즈 AI 모델 전용 토큰 계정 라이선스 500계정 (6,000,000원)
- 교재 제작 및 우수 자동화 아이디어 해커톤 시상금 (3,000,000원)

3. 정량적 기대 효과
- 일상 문서/데이터 집계 작업 소요 시간 40% 단축 및 보안 사고 제로(Zero) 달성`,
        },
      },
    ];

    return fallbackTemplates;
  }
}
