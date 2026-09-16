import { IndustryField, DocumentCategoryType, DocumentPreset } from '../types/document';
import { PresentationType, PresentationThemeId } from '../types/presentation';
import { ExcelTemplateType } from '../types/excel';
import { BusinessFormType } from '../types/formStudio';

export interface FieldOption {
  value: IndustryField;
  label: string;
  description: string;
  badgeColor: string;
}

export interface DocumentTypeOption {
  value: DocumentCategoryType;
  label: string;
  description: string;
}

export const INDUSTRY_FIELDS: FieldOption[] = [
  { value: 'management', label: '경영 / 전략', description: '경영 전략, 사업 모델, 경영 혁신 및 리더십 체계', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'marketing', label: '마케팅 / 브랜드', description: 'GTM 전략, 브랜드 포지셔닝, 고객 획득 및 전환', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'advertising', label: '광고 / 홍보 (PR)', description: 'IMC 캠페인, 미디어 믹스, 바이럴 및 보도자료', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'sales', label: '영업 / B2B', description: 'B2B 제안서, 세일즈 파이프라인, 파트너십 협약', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'planning', label: '기획 / 신사업', description: '신규 서비스 PRD, 사업 타당성, 프로덕트 로드맵', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'it_tech', label: 'IT / 소프트웨어', description: '시스템 아키텍처, API 명세, Tech Spec, 인프라', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'ai_data', label: '인공지능 / 데이터', description: 'AI 도입 계획, MLOps, 데이터 파이프라인, 프롬프트', badgeColor: 'bg-violet-50 text-violet-700 border-violet-200' },
  { value: 'finance', label: '금융 / 투자', description: '기업 재무 분석, 투자 유치 IR, 수익성 시뮬레이션', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'real_estate', label: '부동산 / 공간', description: '부동산 개발, 상권/입지 분석, 자산운용 전략', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'education_hr', label: '교육 / 인사 (HR)', description: '사내 교육 커리큘럼, 역량 평가, 온보딩 가이드', badgeColor: 'bg-lime-50 text-lime-700 border-lime-200' },
  { value: 'legal', label: '법률 / 규제', description: '컴플라이언스 검토, 약관/개인정보, IP 보호 전략', badgeColor: 'bg-slate-50 text-slate-700 border-slate-200' },
  { value: 'policy', label: '정책 / 공공', description: '정부 지원사업 신청서, 정책 제안, 공공조달 입찰', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'research', label: '연구 / 학술', description: '산업 동향 백서(Whitepaper), 학술 논문 초록, 리서치', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'manufacturing', label: '제조 / 품질', description: '공정 개선, 스마트 팩토리, 품질 관리 매뉴얼', badgeColor: 'bg-zinc-50 text-zinc-700 border-zinc-200' },
  { value: 'logistics', label: '유통 / 물류', description: '공급망(SCM) 최적화, 풀필먼트 전략, 이커머스 입점', badgeColor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'custom', label: '기타 맞춤 분야', description: '사용자 지정 고유 비즈니스 영역', badgeColor: 'bg-neutral-50 text-neutral-700 border-neutral-200' },
];

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  { value: 'business_plan', label: '사업계획서 (Business Plan)', description: '비즈니스 모델, 시장 기회, 수익 모델, 실행 로드맵' },
  { value: 'proposal', label: '제안서 / RFP 응답서 (Proposal)', description: '고객 니즈 분석, 솔루션 제시, 차별점, 추진 일정 및 예산' },
  { value: 'prd_planning', label: '프로덕트 기획서 (PRD)', description: '문제 정의, 사용자 페르소나, 핵심 기능 사양, KPI 지표' },
  { value: 'market_research', label: '시장조사 및 분석 보고서', description: '시장 규모(TAM/SAM/SOM), 성장률, 트렌드, 소비자 행태' },
  { value: 'competitor_analysis', label: '기업 및 경쟁사 분석서', description: '경쟁사 SWOT, 포지셔닝 맵, 강약점 비교, 시장 진입 전략' },
  { value: 'marketing_strategy', label: '마케팅 / 광고 전략서', description: '타깃 오디언스, 4P/4C 믹스, 채널별 캠페인, ROAS 목표' },
  { value: 'tech_spec', label: '기술 사양서 / 아키텍처 문서', description: '시스템 구성도, 기술 스택, 데이터 흐름, 비기능 요구사항' },
  { value: 'executive_report', label: '경영 보고서 / 업무 분석서', description: '현황 진단, 핵심 성과 지표, 리스크 요인, 의사결정 권고사항' },
  { value: 'curriculum_guide', label: '교육 자료 / 가이드라인', description: '학습 목표, 모듈별 커리큘럼, 실습 과제, 평가 기준' },
  { value: 'policy_proposal', label: '정책 및 제도 제안서', description: '사회적/제도적 배경, 정책 추진 방안, 기대 효과, 조례/규정안' },
  { value: 'ir_pitch', label: '투자 유치 IR 문서 (Pitch & Financials)', description: 'Problem/Solution, 재무 추정치, 펀딩 계획 및 투자 매력도' },
  { value: 'custom', label: '기타 맞춤 문서 (Custom Document)', description: '사용자 정의 목적에 맞춘 자유 형식 전문 문서' },
];

export interface UnifiedPreset {
  id: string;
  name: string;
  description: string;
  productType: 'doc' | 'presentation' | 'excel' | 'form_studio';
  field: IndustryField;
  iconName: string;
  hasCompanyCustomizer?: boolean;
  companyPlaceholder?: string;
  defaultData: any;
}

// Keep DOCUMENT_PRESETS for backward compatibility in DocumentForm.tsx
export const DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: 'preset-b2b-ad-proposal',
    name: 'B2B 타깃 고객사 맞춤형 광고·마케팅 제안서',
    description: '제안 대상 고객사명을 입력하면 해당 기업의 비즈니스 현황과 업종에 최적화된 맞춤형 광고 집행 전략 및 미디어 믹스 제안서로 자동 변경됩니다.',
    field: 'sales',
    documentType: 'proposal',
    iconName: 'Megaphone',
    hasCompanyCustomizer: true,
    companyPlaceholder: '예: 삼일회계법인, 토스, 무신사, 쿠팡, 현대자동차 등',
    defaultData: {
      field: 'sales',
      documentType: 'proposal',
      topic: '[고객사명] 브랜드 인지도 극대화 및 고관여 잠재고객 전환을 위한 타깃 맞춤형 디지털 B2B 광고 캠페인 제안서',
      purpose: '[고객사명]의 2026년 마케팅 핵심 목표(신규 리드 획득 40% 증대, ROAS 350% 달성) 달성을 위한 성과 지향형 통합 광고 솔루션 제시',
      targetAudience: '[고객사명] 마케팅 총괄 이사(CMO), 브랜드 전략 부서장 및 광고 예산 집행 의사결정권자',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['고객사 맞춤형 전략', '타깃 오디언스 분석', '디지털 미디어 믹스', '퍼포먼스 광고', 'ROAS 350%', '전환 퍼널 최적화', '예산 배분표'],
      additionalRequirements: '[고객사명]의 비즈니스 도메인 및 시장 포지셔닝에 맞추어, 제안 배경, 타깃 고객 분석, 핵심 광고 메시지(USP), 채널별 미디어 믹스(유튜브/인스타그램/검색/배너), 집행 타임라인 및 예상 성과(ROAS, CAC) 측정 지표를 상세하고 구체적인 수치와 함께 구성할 것.'
    }
  },
  {
    id: 'preset-biz-feasibility-roi',
    name: '경영진 보고용 신사업 투자 타당성 & ROI 검토 보고서',
    description: '신규 비즈니스 진출, 설비/기술 투자 또는 M&A 추진 시 C-Level 경영진의 합리적 의사결정을 위한 시장성·수익성(NPV/IRR)·리스크 종합 분석 보고서',
    field: 'management',
    documentType: 'executive_report',
    iconName: 'Briefcase',
    defaultData: {
      field: 'management',
      documentType: 'executive_report',
      topic: '차세대 미래 성장동력 확보를 위한 신규 비즈니스 진출 타당성 및 3개년 투자 수익률(ROI) 정밀 검토 보고서',
      purpose: '경영전략회의 및 이사회 보고를 위해 시장 기회(TAM/SAM), 경제성 분석(손익분기점, NPV, IRR), 5대 핵심 리스크 및 방어 전략을 종합 제시',
      targetAudience: '대표이사(CEO), 최고재무책임자(CFO), 최고전략책임자(CSO) 및 이사회 구성원',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['투자 타당성 검토', '시장 기회 분석', '순현재가치(NPV)', '내부수익률(IRR)', '손익분기점(BEP)', 'CAPEX/OPEX', '시나리오별 리스크 관리'],
      additionalRequirements: '경영진이 신속하고 명확하게 승인 여부를 결정할 수 있도록 Executive Summary 요약, 3개년 정량적 재무 시뮬레이션(낙관/중립/비관), 단계별 추진 로드맵 및 Exit 전략을 일목요연하게 포함할 것.'
    }
  },
  {
    id: 'preset-ai-saas-biz-plan',
    name: 'AI SaaS B2B 사업계획서',
    description: '생성형 AI 기반 기업용 솔루션의 투자 유치 및 신사업 런칭을 위한 표준 사업계획서',
    field: 'ai_data',
    documentType: 'business_plan',
    iconName: 'Sparkles',
    defaultData: {
      field: 'ai_data',
      documentType: 'business_plan',
      topic: '생성형 AI 기반 기업 내부 문서 자동화 및 업무 어시스턴트 SaaS',
      purpose: '시리즈 A 투자 유치 및 초기 엔터프라이즈 고객 확보를 위한 종합 사업계획서 수립',
      targetAudience: '벤처캐피털(VC) 심사역 및 엔터프라이즈 기업 의사결정권자 (C-Level)',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['생성형 AI', 'B2B SaaS', '보안 온프레미스/하이브리드', 'MRR 성장률', 'TAM/SAM/SOM', 'CAC/LTV', 'Enterprise AI'],
      additionalRequirements: '구체적인 시장 규모 수치, 3개년 재무 추정치, 엔터프라이즈 보안 및 데이터 프라이버시 대응 전략을 반드시 포함할 것.'
    }
  },
  {
    id: 'preset-gtm-marketing',
    name: '신규 모바일 앱 GTM 마케팅 전략서',
    description: '글로벌 런칭 대상 헬스케어 모바일 앱의 Go-To-Market 획득 및 브랜딩 전략',
    field: 'marketing',
    documentType: 'marketing_strategy',
    iconName: 'TrendingUp',
    defaultData: {
      field: 'marketing',
      documentType: 'marketing_strategy',
      topic: 'AI 개인 맞춤형 수면 개선 및 웰니스 모바일 앱 GTM 런칭 전략',
      purpose: '런칭 3개월 내 유기적 다운로드 10만 달성 및 유료 구독 전환율 5% 달성을 위한 마케팅 플랜',
      targetAudience: '마케팅 총괄 이사(CMO), 퍼포먼스 마케팅 팀 및 프로덕트 팀',
      professionalLevel: 'manager',
      length: 'standard',
      keywords: ['GTM 전략', '퍼포먼스 마케팅', '인플루언서 협업', '앱스토어 최적화(ASO)', 'CAC 절감', '리텐션 퍼널', 'ROAS 300%'],
      additionalRequirements: '주차별(Week 1~12) 실행 마일스톤과 유료 매체 믹스 예산 배분표를 포함할 것.'
    }
  }
];

export const ALL_PRESETS: UnifiedPreset[] = [
  // ================= DOCUMENT PRESETS =================
  {
    id: 'preset-doc-b2b-ad',
    name: 'B2B 타깃 고객사 맞춤형 광고·마케팅 제안서',
    description: '지정된 고객사 업종 및 마케팅 니즈를 철저히 반영하여 미디어 믹스와 고효율 퍼널 전략을 제시하는 제안 문서입니다.',
    productType: 'doc',
    field: 'sales',
    iconName: 'Megaphone',
    hasCompanyCustomizer: true,
    companyPlaceholder: '예: 삼일회계법인, 토스, 무신사, 쿠팡 등',
    defaultData: {
      field: 'sales',
      documentType: 'proposal',
      topic: '[고객사명] 브랜드 인지도 극대화 및 고관여 잠재고객 전환을 위한 타깃 맞춤형 디지털 B2B 광고 캠페인 제안서',
      purpose: '[고객사명]의 2026년 마케팅 핵심 목표(신규 리드 획득 40% 증대, ROAS 350% 달성) 달성을 위한 성과 지향형 통합 광고 솔루션 제시',
      targetAudience: '[고객사명] 마케팅 총괄 이사(CMO), 브랜드 전략 부서장 및 광고 예산 집행 의사결정권자',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['고객사 맞춤형 전략', '타깃 오디언스 분석', '디지털 미디어 믹스', '퍼포먼스 광고', 'ROAS 350%', '전환 퍼널 최적화'],
      additionalRequirements: '[고객사명]의 비즈니스 도메인 및 시장 포지셔닝에 맞추어, 제안 배경, 타깃 고객 분석, 핵심 광고 메시지(USP), 채널별 미디어 믹스, 예상 성과 측정 지표를 상세히 구성할 것.'
    }
  },
  {
    id: 'preset-doc-biz-feasibility',
    name: '경영진 보고용 신사업 투자 타당성 검토 보고서',
    description: 'C-Level 경영진의 합리적 의사결정을 돕기 위해 시장 규모, 경제성 지표(NPV/IRR/BEP) 및 핵심 위험 시나리오를 심도 있게 담아낸 전문 보고서입니다.',
    productType: 'doc',
    field: 'management',
    iconName: 'Briefcase',
    defaultData: {
      field: 'management',
      documentType: 'executive_report',
      topic: '차세대 미래 성장동력 확보를 위한 신규 비즈니스 진출 타당성 및 3개년 투자 수익률(ROI) 정밀 검토 보고서',
      purpose: '경영전략회의 및 이사회 보고를 위해 시장 기회(TAM/SAM), 경제성 분석(손익분기점, NPV, IRR), 5대 핵심 리스크 및 방어 전략을 종합 제시',
      targetAudience: '대표이사(CEO), 최고재무책임자(CFO), 최고전략책임자(CSO) 및 이사회 구성원',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['투자 타당성 검토', '시장 기회 분석', '순현재가치(NPV)', '내부수익률(IRR)', '손익분기점(BEP)', 'CAPEX/OPEX'],
      additionalRequirements: 'Executive Summary 요약, 3개년 정량적 재무 시뮬레이션(낙관/중립/비관), 단계별 추진 로드맵 및 Exit 전략을 포함할 것.'
    }
  },
  {
    id: 'preset-doc-ai-saas',
    name: 'AI SaaS B2B 사업계획서',
    description: '생성형 AI 기반 협업 솔루션의 투자 유치 및 신규 런칭을 위한 비즈니스 모델, 시장 기회, 재무 시뮬레이션 포함 계획서입니다.',
    productType: 'doc',
    field: 'ai_data',
    iconName: 'Sparkles',
    defaultData: {
      field: 'ai_data',
      documentType: 'business_plan',
      topic: '생성형 AI 기반 기업 내부 문서 자동화 및 업무 어시스턴트 SaaS',
      purpose: '시리즈 A 투자 유치 및 초기 엔터프라이즈 고객 확보를 위한 종합 사업계획서 수립',
      targetAudience: '벤처캐피털(VC) 심사역 및 엔터프라이즈 기업 의사결정권자 (C-Level)',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['생성형 AI', 'B2B SaaS', '보안 온프레미스/하이브리드', 'MRR 성장률', 'TAM/SAM/SOM', 'CAC/LTV'],
      additionalRequirements: '구체적인 시장 규모 수치, 3개년 재무 추정치, 엔터프라이즈 보안 및 데이터 프라이버시 대응 전략을 포함할 것.'
    }
  },

  // ================= PRESENTATION PRESETS (PPT) =================
  {
    id: 'preset-pres-ir-seed',
    name: '스타트업 시드/프리A IR 피치덱 슬라이드 (10장)',
    description: '투자자를 즉각 매료시키는 스타트업 공식 프레임워크인 문제정의, 솔루션, 시장규모, BM, 성장지표, 펀딩 제안으로 정교화된 투자 유치 발표 자료입니다.',
    productType: 'presentation',
    field: 'management',
    iconName: 'TrendingUp',
    hasCompanyCustomizer: true,
    companyPlaceholder: '예: 넥스트오토메이트, 토스, 무신사 등',
    defaultData: {
      field: 'management',
      presentationType: 'ir_pitch',
      theme: 'dark_navy',
      topic: '[고객사명] 인공지능 기반 B2B 업무 자동화 SaaS 플랫폼 투자 유치 피치덱',
      purpose: '벤처캐피탈(VC) 및 기관투자자 대상 15억 원 규모 Pre-A 라운드 투자 성공 유치',
      targetAudience: '초기 스타트업 전문 VC 심사역, 엔젤 투자 파트너',
      companyName: '[고객사명]',
      slideCountPreference: 10,
      keyPoints: 'LLM 기반 복합 워크플로우 자동화, 출시 6개월 만에 유료 기업 고객 120개사 확보, MoM 35% 지속 성장, TAM 12조 원 시장성'
    }
  },
  {
    id: 'preset-pres-b2b-dx',
    name: 'B2B 엔터프라이즈 DX 수주 제안 슬라이드 (12장)',
    description: '고객사 당면 과제, 제안 To-Be 아키텍처, 단계별 시스템 마이그레이션 방안, WBS 추진 일정 및 투입인력 SLA를 포함한 수주용 프리미엄 제안 덱입니다.',
    productType: 'presentation',
    field: 'it_tech',
    iconName: 'Laptop',
    hasCompanyCustomizer: true,
    companyPlaceholder: '예: 하나은행, 삼성화재, SK텔레콤 등',
    defaultData: {
      field: 'it_tech',
      presentationType: 'b2b_proposal',
      theme: 'tech_indigo',
      topic: '[고객사명] 차세대 금융 클라우드 데이터 파이프라인 및 실시간 이상거래 탐지(FDS) 시스템 구축 수주 제안서',
      purpose: '[고객사명] 차세대 디지털혁신부문 핵심 클라우드 DX 전환 파트너 및 우선협상대상자 선정',
      targetAudience: '[고객사명] 최고정보책임자(CIO), IT 인프라기획본부장, 금융 보안 총괄 리더',
      companyName: '클라우드웨이브 테크놀로지',
      slideCountPreference: 12,
      keyPoints: '초당 10만 건 초고속 분산 처리, 99.999% 중단 없는 가용성 보장, 금융보안원 규정 컴플라이언스 100% 준수, 평균 실시간 탐지 지연 20ms 이하'
    }
  },
  {
    id: 'preset-pres-esg-policy',
    name: 'ESG 지속가능경영 & 친환경 신사업 발표 덱 (10장)',
    description: '글로벌 ESG 공시 규제 의무화에 선제 대응하는 탄소배출량 감축 로드맵, 공급망 실사 대응, 거버넌스 투명성 강화전략을 담은 고품격 발표 자료입니다.',
    productType: 'presentation',
    field: 'planning',
    iconName: 'Compass',
    defaultData: {
      field: 'planning',
      presentationType: 'business_plan',
      theme: 'emerald_growth',
      topic: '2026 탄소 중립 및 글로벌 친환경 배터리 순환경제(Circular Economy) 밸류체인 신사업 추진 마스터플랜',
      purpose: '이사회 및 주주총회 상정용 신사업 예산 50억 승인 및 핵심 기관 평가 등급 A+ 획득 목표 수립',
      targetAudience: '에코파워 모빌리티 사외이사, 기후 테크 전문 PEF 투자 위원, 전사 임직원',
      companyName: '에코에너지 솔루션즈',
      slideCountPreference: 10,
      keyPoints: '배터리 여권 제도 선제 준수, 폐배터리 리튬/코발트 95% 회수 공정 특허, 연간 탄소배출량 30% 감축 마일스톤, 2028 RE100 전면 가동'
    }
  },
  {
    id: 'preset-pres-mna-synergy',
    name: 'M&A 인수합병 시너지 및 통합(PMI) 발표 덱 (10장)',
    description: '기업 인수 후 신속한 조직 안정화, 직무/IT 시스템 물리 통합, 중복 비용 제거 및 사업 포트폴리오 크로스셀링(Cross-selling) 시너지를 극대화하는 실행 전략입니다.',
    productType: 'presentation',
    field: 'management',
    iconName: 'Building2',
    defaultData: {
      field: 'management',
      presentationType: 'executive_report',
      theme: 'clean_slate',
      topic: '테크 플랫폼 인수 후 화학적 통합 및 조직 안정화를 위한 180일 통합(PMI) 실행 로드맵',
      purpose: '인수 후 시너지위원회 수석위원 보고용 핵심 성과 및 1단계 통합 지표 확정',
      targetAudience: 'PMI 전담 기획본부장, 피인수 기업 전사 임직원, 기관 대주주단',
      companyName: '유니온 글로벌 그룹',
      slideCountPreference: 10,
      keyPoints: '통합 ERP 단일화, 중복 판관비 20% 최적화, HR 인사 평가 체계 통합 가이드라인 수립, 크로스보더 영업망 공유 시너지 500억 확보'
    }
  },
  {
    id: 'preset-pres-brand-marketing',
    name: '글로벌 브랜드 GTM 마케팅 전략 캠페인 (10장)',
    description: 'MZ세대 중심 타깃 페르소나 분석, 숏폼/인플루언서 퍼포먼스 마케팅 예산 비중 최적화, O2O 팝업 스토어 연계형 통합 IMC 전략 덱입니다.',
    productType: 'presentation',
    field: 'marketing',
    iconName: 'Megaphone',
    hasCompanyCustomizer: true,
    companyPlaceholder: '예: 비건글로우, 무신사, 야놀자 등',
    defaultData: {
      field: 'marketing',
      presentationType: 'marketing_deck',
      theme: 'creative_coral',
      topic: '[고객사명] 브랜드 글로벌 런칭 마케팅 및 해외 잠재고객 선점을 위한 Go-To-Market(GTM) 실행 계획서',
      purpose: '신규 글로벌 웹3/K-뷰티 버티컬 브랜드의 런칭 3개월 내 해외 누적 가입자 50만 돌파 및 매출 50억 달성',
      targetAudience: '글로벌 사업본부장, CMO, 투자 배정 심사역',
      companyName: '[고객사명]',
      slideCountPreference: 10,
      keyPoints: '글로벌 틱톡 챌린지 1억 뷰 달성 방안, 로컬 대표 인플루언서 앰버서더 섭외 전략, 퍼포먼스 광고 ROAS 380% 목표 배분, 쇼피/아마존 입점 연계'
    }
  },

  // ================= EXCEL PRESETS =================
  {
    id: 'preset-excel-monthly-sales',
    name: '연간 월별 목표 대비 매출 분석 종합 보고서',
    description: '1월~12월 연간 매출 목표 대비 실제 달성율을 구하고 YoY 성장률, 주요 품목/사업 부문별 세부 기여도 및 동적 수식 집계를 산출하는 표준 재무 대장입니다.',
    productType: 'excel',
    field: 'finance',
    iconName: 'BarChart3',
    defaultData: {
      templateType: 'monthly_sales_report',
      title: '2026년도 전사 부문별 월간 매출 목표 대비 실제 달성 현황 대장',
      companyName: '전략기획재무실',
      period: '2026년 1월 ~ 12월 연간',
      currency: 'KRW',
      businessDescription: '1월부터 12월까지의 월별 목표 매출액(연간 120억 원 기준)과 실제 달성 매출액을 비교하고, 엔터프라이즈 B2B 솔루션, 클라우드 SaaS, 전문 컨설팅 3개 사업 부문별 세부 매출 및 목표 달성율, 전년 대비 성장률(YoY)을 정밀 분석하는 전문 엑셀 보고서입니다.',
      keyMetricsToInclude: '연간 총 매출액, 목표 달성율(%), 전년 대비 성장율(YoY), 영업이익률, 분기별 집계 합계(Q1~Q4), 최고 매출 달성 월'
    }
  },
  {
    id: 'preset-excel-pl-forecast',
    name: '3개년 추정 손익계산서 & Financial Model',
    description: '매출 원가율, 판관비(인건비/마케팅비/R&D), 감가상각, 영업이익률(OP Margin), EBITDA 및 CAGR 성장을 예측하여 밸류에이션의 기반을 수립하는 투자 유치용 재무 모델입니다.',
    productType: 'excel',
    field: 'management',
    iconName: 'TrendingUp',
    defaultData: {
      templateType: 'financial_pl_forecast',
      title: '2026-2028 향후 3개년 사업 다각화에 따른 추정 손익계산서 및 손익분기점 검토 모델',
      companyName: '재무전략본부 FPA팀',
      period: '2026년 ~ 2028년 (3개년)',
      currency: 'KRW',
      businessDescription: '향후 3개년 동안 신사업 진출 및 기존 사업 확장에 따른 연평균 35% 매출 성장 추이와, 이에 따른 변동비(매출원가율 30%) 및 고정비(임직원 인건비, 마케팅 예산, 임차료)의 흐름을 시뮬레이션하여 영업이익 및 EBITDA 흑자 전환 지점을 정밀 분석하는 금융 재무 모델입니다.',
      keyMetricsToInclude: '연평균 매출 성장률(CAGR), 누적 변동비 및 판관비 추이, 연도별 영업이익률(%), EBITDA 배수 및 손익분기점(BEP) 시점'
    }
  },
  {
    id: 'preset-excel-b2b-pipeline',
    name: 'B2B 엔터프라이즈 영업 파이프라인 대장',
    description: '영업 리드 발굴, 미팅, 제안서 제출, PoC 검증, 계약 체결 단계별 수주 가중 매출(Weighted Value)과 딜 전환율 및 세일즈맨별 수수료(Incentive)를 자동 산출하는 세일즈 대장입니다.',
    productType: 'excel',
    field: 'sales',
    iconName: 'Briefcase',
    defaultData: {
      templateType: 'b2b_sales_pipeline',
      title: '2026년 하반기 B2B 엔터프라이즈 타겟 영업 파이프라인 및 수주 예측 대장',
      companyName: 'B2B글로벌세일즈 사업부',
      period: '2026년 하반기(Q3~Q4)',
      currency: 'USD',
      businessDescription: 'B2B 엔터프라이즈 고객사 30개 주요 계약 딜(Deal)에 대해 제안, 견적, 계약 등 각 단계별 성사 확률(10% ~ 90%)을 기반으로 기대 수주액(Weighted Revenue)을 산출하고, 영업대표별 실적 및 인센티브 보상액을 집계하는 파이프라인 관리표입니다.',
      keyMetricsToInclude: '총 파이프라인 딜 총액, 가중치 적용 기대 수주액 총합, 영업대표별 계약 체결 성공율, 분기별 타겟 수주 달성율(%)'
    }
  },
  {
    id: 'preset-excel-wbs-budget',
    name: 'IT 프로젝트 WBS 일정 및 투입 예산 집행 대장',
    description: '프로젝트 개발 마일스톤(착수-설계-개발-QA-오픈)과 인력 등급별 공수(Man-Month) 산출, 인건비/라이선스비/서버 인프라 비용 집행 현황을 동적으로 통합 제어하는 예산표입니다.',
    productType: 'excel',
    field: 'it_tech',
    iconName: 'Cpu',
    defaultData: {
      templateType: 'project_wbs_budget',
      title: '차세대 클라우드 AI 서비스 구축 프로젝트 WBS 및 인적/물적 리소스 예산 관리표',
      companyName: 'PMO / 기술지원본부',
      period: '6개월 (2026년 9월 ~ 2027년 2월)',
      currency: 'KRW',
      businessDescription: '신규 인공지능 엔터프라이즈 SaaS 솔루션 구축의 주요 마일스톤에 따라 투입되는 FE, BE, AI 엔지니어, UI 디자이너의 직급별 공수(Man-Month) 비용과 테스트 서버, 외부 오픈소스 솔루션 라이선스비, 전용선 구축 등 물적 비용의 전체 예산 및 예산 대비 실제 사용액의 집행율을 연산하는 관리 대장입니다.',
      keyMetricsToInclude: '총 투입 인력 공수(M/D), 개발 단계별 실 소요 예산 총합, 예산 집행 대비 잔여 예산 비율, 프로젝트 리스크 마일스톤 경보'
    }
  },

  // ================= FORM STUDIO PRESETS =================
  {
    id: 'preset-form-proposal',
    name: '사내 표준 기안서 / 업무 품의서 양식',
    description: '상향식 결재 시스템에 맞춤 설계된 표준 기안문으로, 직관적인 소요 예산 상세 항목과 기대 효과, 단계별 결재 서명란이 포함된 행정 양식입니다.',
    productType: 'form_studio',
    field: 'management',
    iconName: 'FileText',
    defaultData: {
      formType: 'proposal_approval',
      title: '2026년 상반기 엔터프라이즈 클라우드 GPU 서버 확장 및 사내 AI 기술 도입 품의서',
      drafterName: '김현우',
      drafterDepartment: '인프라전략실',
      drafterPosition: '수석 아키텍트',
      companyName: '(주)미래소프트웨어',
      recipientName: '대표이사 이민혁',
      recipientCompany: '(주)미래소프트웨어',
      totalBudget: '35,000,000원 (VAT 별도)',
      targetDate: '2026년 10월 01일',
      keyDetails: `1. 품의 배경 및 목적
- 사내 생성형 AI 문서 초안 고속 생성 및 딥러닝 미세조정(Fine-Tuning) 연산 수요 급증으로 인한 전용 GPU 서버 인프라 보강
- 기존 공용 서버 대비 처리 속도 350% 단축 및 임직원 평균 인당 업무 시간 연간 80시간 세이브

2. 주요 구매 장비 및 소요 예산 세부 명세
- NVIDIA H100 인스턴스 전용 클라우드 노드 2개 6개월 선결제 임차 (30,000,000원)
- 대용량 분산 스토리지 10TB 연동 드라이브 구매 (3,000,000원)
- 외부 전문 컨설팅 아키텍처 자문 수수료 (2,000,000원)

3. 정량적/정성적 기대 효과
- 부서별 리드타임 개선율 45% 확보 및 보안을 보장하는 프라이빗 AI 기술 환경 조성 완료`
    }
  },
  {
    id: 'preset-form-quotation',
    name: '자동 부가세 산출 표준 견적서 양식',
    description: '공급자 세부 정보와 직인 날인 영역, 고객사 정보, 개별 품목 단가 및 수량 입력 시 공급가액과 부가세(10%)가 자동 연산되어 완벽히 일치하는 공식 견적서 양식입니다.',
    productType: 'form_studio',
    field: 'sales',
    iconName: 'Receipt',
    defaultData: {
      formType: 'quotation',
      title: '2026년도 하반기 맞춤형 생성 AI 엔진 라이선스 및 API 구축 지원 견적서',
      drafterName: '이동현',
      drafterDepartment: 'B2B 솔루션 사업부',
      drafterPosition: '이사',
      companyName: '엔터프라이즈AI 솔루션즈 주식회사',
      recipientName: '구매담당자 백지훈 대리',
      recipientCompany: '글로벌 물류 유통홀딩스 주식회사',
      totalBudget: '16,500,000원 (VAT 10% 포함)',
      targetDate: '2026년 09월 30일',
      keyDetails: `1. 견적 품목 명세 (단가 연동 표준 가액)
- 엔터프라이즈 AI 코어 엔진 라이선스 1식 (공급가액 10,000,000원)
- 커스텀 API 게이트웨이 모듈 및 내부 레거시 시스템 연동 1식 (공급가액 3,000,000원)
- 임직원 교육 및 유지보수 전담 핫라인 구축 서비스 1식 (공급가액 2,000,000원)

2. 총합 공급가액 및 세액
- 공급가액 총합계: 15,000,000원 (금 일천오백만 원정)
- 부가가치세(10%): 1,500,000원 (금 일백오십만 원정)
- 합계금액 (공급가액 + 부가세): 16,500,000원 (금 일천육백오십만 원정)

3. 납품 및 지불 조건
- 발주 후 30일 이내 검수 완료 및 세금계산서 발행 후 15일 이내 전액 현금 지급 조건`
    }
  },
  {
    id: 'preset-form-resume',
    name: '핵심 성과 중심의 수석급 경력기술서 양식',
    description: '인적 사항, 핵심 역량 요약, 프로젝트별 기여도 및 구체적인 비즈니스 수치 성과가 논리정연하게 작성된 프리미엄 경력기술서 양식입니다.',
    productType: 'form_studio',
    field: 'education_hr',
    iconName: 'UserCheck',
    defaultData: {
      formType: 'resume_career',
      title: '수석 AI 프로덕트 매니저(PM) & 기술 아키텍트 이동원 경력기술서',
      drafterName: '이동원',
      drafterDepartment: 'AI 개발총괄본부',
      drafterPosition: '총괄 테크 리더',
      companyName: '엔터프라이즈AI 솔루션즈 주식회사',
      recipientName: '인재영입위원회 위원장 귀중',
      recipientCompany: '글로벌 테크놀로지스 그룹',
      totalBudget: '희망 연봉: 직전 대비 협의 결정',
      targetDate: '입사 희망일: 합격 후 4주 이내',
      keyDetails: `1. 핵심 역량 요약
- 8+ Years 엔터프라이즈 소프트웨어 아키텍처 설계 및 B2B SaaS 프로덕트 매니징 경력
- 거대 언어 모델(LLM) 파이프라인 개발 및 데이터 전처리 자동화 에이전트 설계 전문 역량 보유

2. 주요 대표 경력 및 수치적 비즈니스 성과
- (주)에이아이랩스 개발 총괄 이사 (2023.03 ~ 현재)
  * 생성형 AI 문서 에디터 솔루션 초기 기획부터 출시 총괄, 연 매출 50억 달성 기여
  * 30개 대기업 엔터프라이즈 온프레미스 망 연동 보안 시스템 구축, 수주 계약 30억 체결 성과
- (주)클라우드소프트 수석 소프트웨어 엔지니어 (2018.02 ~ 2023.02)
  * 이벤트 기반 분산 아키텍처 도입으로 대용량 거래 트래픽 처리 성능 400% 개선
  * AWS 클라우드 아키텍처 마이그레이션을 리드하여 연간 인프라 비용 32% 최적화 달성`
    }
  }
];
