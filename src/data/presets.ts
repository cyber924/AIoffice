import { IndustryField, DocumentCategoryType, DocumentPreset } from '../types/document';

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

export const DOCUMENT_PRESETS: DocumentPreset[] = [
  // 1. New Requested Preset: 영업 B2B 광고 제안서 (회사명 동적 치환 지원)
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
  // 2. New Preset: 경영/전략 신사업 투자 타당성 및 ROI 분석 보고서
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
  },
  {
    id: 'preset-tech-spec-architecture',
    name: '대용량 마이크로서비스 아키텍처 기술 사양서',
    description: '동시접속 10만 처리를 위한 클라우드 네이티브 마이크로서비스 설계서 (Tech Spec)',
    field: 'it_tech',
    documentType: 'tech_spec',
    iconName: 'Cpu',
    defaultData: {
      field: 'it_tech',
      documentType: 'tech_spec',
      topic: '이커머스 대규모 트래픽 처리를 위한 이벤트 기반 MSA(마이크로서비스) 시스템 아키텍처 설계',
      purpose: '레거시 모놀리식 시스템을 분산 아키텍처로 무중단 전환하고 개발팀 간 기술 표준을 정립',
      targetAudience: '수석 소프트웨어 엔지니어, DevOps 엔지니어 및 기술 이사(CTO)',
      professionalLevel: 'practitioner',
      length: 'comprehensive',
      keywords: ['마이크로서비스(MSA)', 'Kafka 이벤트 브로커', 'Redis 캐싱', 'Kubernetes', 'CQRS 패턴', 'Zero Downtime 배포', 'SLA 99.99%'],
      additionalRequirements: 'API 게이트웨이 라우팅, 데이터 일관성 보장 전략, 장애 격리(Circuit Breaker) 설계를 명확히 서술할 것.'
    }
  },
  {
    id: 'preset-b2b-rfp-proposal',
    name: '공공/금융 클라우드 전환 B2B 제안서',
    description: '금융권 망분리 규제 완화에 따른 프라이빗 클라우드 인프라 현대화 수주 제안서',
    field: 'sales',
    documentType: 'proposal',
    iconName: 'FileText',
    defaultData: {
      field: 'sales',
      documentType: 'proposal',
      topic: '금융기관 차세대 데이터 플랫폼 및 하이브리드 클라우드 인프라 구축 수주 제안',
      purpose: '고객사의 엄격한 금융 보안 요건을 충족하면서 데이터 처리 효율을 300% 개선하는 솔루션 제안',
      targetAudience: '금융사 전산정보부장, 입찰 평가 위원회 심사위원',
      professionalLevel: 'executive',
      length: 'comprehensive',
      keywords: ['하이브리드 클라우드', '금융보안 가이드라인', '무중단 마이그레이션', 'TCO 35% 절감', '전담 기술지원 SLA', '재해복구(DR) 체계'],
      additionalRequirements: '타 경쟁 컨소시엄 대비 우리 회사의 압도적 차별점 3가지와 구체적 투입 인력 이력 관리를 강조할 것.'
    }
  },
  {
    id: 'preset-market-research-ev',
    name: '친환경 이차전지 배터리 시장동향 분석 보고서',
    description: '글로벌 전기차(EV) 배터리 및 차세대 전고체 배터리 시장 경쟁구도 분석',
    field: 'research',
    documentType: 'market_research',
    iconName: 'BarChart3',
    defaultData: {
      field: 'research',
      documentType: 'market_research',
      topic: '차세대 전고체 배터리 및 원통형 4680 배터리 글로벌 시장 동향 및 공급망 리서치',
      purpose: '신규 배터리 소재 R&D 투자 및 2026~2030년 중장기 포트폴리오 전략 수립',
      targetAudience: '신사업 기획팀, 연구소장, 사내 전략위원회',
      professionalLevel: 'academic',
      length: 'standard',
      keywords: ['전고체 배터리', '에너지 밀도', '글로벌 공급망(IRA/CRMA)', '원자재 가격 추이', '주요 3사(LG/삼성/SK) CAPEX'],
      additionalRequirements: '글로벌 규제 환경(미국 IRA, EU 배터리법)이 국내 기업에 미치는 기회와 위험 요인을 SWOT으로 정리할 것.'
    }
  },
  {
    id: 'preset-hr-onboarding-guide',
    name: 'IT 스타트업 신규 입사자 온보딩 가이드북',
    description: '첫 30일-60일-90일 안착을 위한 사내 문화 및 직무 교육 매뉴얼',
    field: 'education_hr',
    documentType: 'curriculum_guide',
    iconName: 'GraduationCap',
    defaultData: {
      field: 'education_hr',
      documentType: 'curriculum_guide',
      topic: '애자일 기반 IT 프로덕트 조직을 위한 신규 크루 온보딩 & 램프업 프로그램 가이드',
      purpose: '신규 입사자의 업무 적응 기간을 단축하고 조직 핵심 가치와 협업 툴킷 활용도 극대화',
      targetAudience: '신규 입사자, 멘토(버디), 피플팀(HR) 담당자',
      professionalLevel: 'practitioner',
      length: 'standard',
      keywords: ['30-60-90일 마일스톤', '핵심 가치(Core Values)', 'Slack/Jira 협업 룰', '1 on 1 미팅 체크리스트', '수습 평가 기준'],
      additionalRequirements: '실제 실무에서 체크할 수 있는 단계별 체크리스트와 슬랙/노션 활용 팁을 포함할 것.'
    }
  }
];
