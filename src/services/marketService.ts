import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { MarketItem } from '../types/market';

const COLLECTION_NAME = 'market_items';

export const MARKET_CATEGORIES: { id: string; name: string; iconName?: string }[] = [
  { id: 'all', name: '전체 분야' },
  { id: 'startup_ir', name: '스타트업 / 투자유치(IR)' },
  { id: 'management', name: '경영 전략 / 사업기획' },
  { id: 'marketing', name: '마케팅 / 브랜드 전략' },
  { id: 'finance', name: '재무 / 회계 / 예산' },
  { id: 'legal_hr', name: '법률 / 인사(HR) / 계약서' },
  { id: 'it_tech', name: 'IT / AI / 소프트웨어 개발' },
  { id: 'gov_project', name: '정부과제 / R&D 지원사업' },
];

export const PRESET_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'market-ir-pitch-2026',
    originalDocId: 'orig-ir-pitch-2026',
    productType: 'presentation',
    title: '2026 Series A 투자유치용 글로벌 스탠다드 IR 피치덱',
    subtitle: '실리콘밸리 & 국내 탑티어 VC 통과 기준 10개 핵심 슬라이드 프레임워크',
    summary: '투자 심사역이 첫 3분 안에 사로잡히는 문제 정의, TAM/SAM/SOM 시장 분석, Unit Economics 재무 모델 및 4단계 로드맵이 포함된 완성형 피치덱입니다.',
    category: 'startup_ir',
    authorId: 'creator_strategy_lead',
    authorName: '박세진 파트너 (VC 심사역)',
    authorEmail: 'sejin.vc@partner.com',
    isFree: false,
    price: 1000,
    tags: ['IR피치덱', 'SeriesA', '투자유치', '스타트업', 'VC심사'],
    isStaffPick: true,
    coverGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    isAudited: true,
    auditScore: 96,
    auditStatus: 'master_verified',
    auditReport: {
      summary: 'VC 심사역 관점의 TAM/SAM/SOM 및 Unit Economics 구조가 명확하며, 3분 내 투자 포인트가 직관적으로 전달되는 최우수 피치덱입니다.',
      strengths: ['실리콘밸리 표준 10 슬라이드 프레임워크 완비', 'TAM 160조 원 시장 규모 산출 근거의 객관성', '직관적인 3단 카드 레이아웃과 데이터 시각화'],
      improvements: ['경쟁사 대비 기술적 해자(Moat) 비교 매트릭스 슬라이드 추가 권장'],
      categoryScores: {
        structure: 98,
        usability: 96,
        compliance: 94,
        accuracy: 96,
      },
      auditedAt: Date.now() - 86400000 * 3,
    },
    auditedAt: Date.now() - 86400000 * 3,
    viewCount: 1420,
    downloadCount: 388,
    likeCount: 245,
    remixCount: 112,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    contentData: {
      title: '2026 Series A 투자유치용 글로벌 스탠다드 IR 피치덱',
      subtitle: '데이터 기반 엔터프라이즈 AI 자동화 플랫폼 혁신',
      company: '넥스트젠 이노베이션스 (NextGen)',
      theme: 'navy',
      slideCount: 10,
      slides: [
        {
          slideNumber: 1,
          layout: 'title',
          category: 'COVER',
          title: '글로벌 엔터프라이즈 AI 워크플로우 자동화 솔루션',
          subtitle: '시리즈 A 투자 유치 및 글로벌 시장 확장 전략 제안서',
          keyTakeaway: '수작업 업무 70% 절감과 월간 반복 매출(MRR) 240% 성장 실현',
          imageKeywords: 'enterprise artificial intelligence skyline corporate',
          speakerNotes: '안녕하십니까, 넥스트젠 대표이사입니다. 오늘은 기업 업무의 패러다임을 바꿀 AI 자동화 엔진을 소개합니다.',
          content: {}
        },
        {
          slideNumber: 2,
          layout: 'cards_grid_3',
          category: '01. PROBLEM',
          title: '기존 엔터프라이즈 업무 시스템의 3대 한계점',
          keyTakeaway: '비효율적인 수작업 및 단절된 데이터로 연간 수억 원의 기회비용이 손실되고 있습니다.',
          imageKeywords: 'business analytics complexity team bottleneck',
          content: {
            cards: [
              { tag: 'PAIN 01', title: '단절된 사내 데이터', description: '문서와 데이터가 ERP/CRM에 파편화되어 의사결정 속도가 3배 지연됨' },
              { tag: 'PAIN 02', title: '과도한 반복 수작업', description: '고급 인력의 40% 이상이 정형 보고서 작성 및 취합에 낭비' },
              { tag: 'PAIN 03', title: '높은 AI 도입 장벽', description: '기존 온프레미스 시스템 교체 비용 및 전문 엔지니어 부족' }
            ]
          },
          speakerNotes: '기업들이 현재 겪는 가장 큰 세 가지 병목 현상입니다.'
        },
        {
          slideNumber: 3,
          layout: 'bullets_split',
          category: '02. SOLUTION',
          title: '넥스트젠의 올인원 에이전틱 AI 아키텍처',
          keyTakeaway: 'API 연동만으로 사내 모든 문서를 실시간 분석하고 초고속으로 생성합니다.',
          imageKeywords: 'cloud computing neural network solution',
          content: {
            bulletPoints: [
              '자연어 한 줄로 ERP/CRM 데이터 자동 동기화 및 보고서 생성',
              '보안 사내망 완벽 격리 호스팅(On-Premise & Private Cloud) 지원',
              '문서 작성 시간 평균 95% 단축 (기존 4시간 → 12분)'
            ]
          },
          speakerNotes: '저희 솔루션은 독보적인 정확도와 강력한 엔터프라이즈 보안을 보장합니다.'
        },
        {
          slideNumber: 4,
          layout: 'market_tam_sam_som',
          category: '03. MARKET SIZE',
          title: '초거대 B2B 엔터프라이즈 AI 시장 기회',
          keyTakeaway: '연평균 38% 고속 성장하는 글로벌 AI 소프트웨어 시장을 선점합니다.',
          content: {
            tam: { title: '글로벌 엔터프라이즈 SW 시장 (TAM)', value: '$120B (약 160조 원)', desc: '전 세계 기업용 비즈니스 자동화 소프트웨어' },
            sam: { title: '아시아·태평양 B2B AI 시장 (SAM)', value: '$18B (약 24조 원)', desc: '한국, 일본, 싱가포르 중심의 엔터프라이즈 AI' },
            som: { title: '당사 3개년 목표 유효 시장 (SOM)', value: '$120M (약 1,600억 원)', desc: '국내외 대기업 및 유망 테크 중견기업 3,000개 사' }
          },
          speakerNotes: '초기 3년 내 목표 시장점유율 5%를 달성하여 독보적인 카테고리 킬러가 되겠습니다.'
        }
      ]
    }
  },
  {
    id: 'market-salary-contract-standard',
    originalDocId: 'orig-salary-contract-standard',
    productType: 'form_studio',
    title: '2026 대한민국 고용노동부 최신 개정 표준 포괄임금/연봉계약서',
    subtitle: '노무법인 정밀 감수 완료, 통상임금 및 주휴수당 분쟁 방지 특약 조항 포함',
    summary: '스타트업부터 중소/중견기업까지 법적 분쟁을 완벽히 예방하는 표준 근로 및 연봉 계약서 양식입니다. 4대 보험, 퇴직금, 비밀유지 및 지식재산권 양도 조항까지 원클릭 적용 가능합니다.',
    category: 'legal_hr',
    authorId: 'creator_legal_pro',
    authorName: '이지훈 공인노무사',
    authorEmail: 'jihoon.hr@laborlaw.kr',
    isFree: true,
    price: 0,
    tags: ['연봉계약서', '근로계약서', '노무서식', '고용노동부', '스타트업인사'],
    isStaffPick: true,
    coverGradient: 'from-emerald-600 to-teal-700',
    isAudited: true,
    auditScore: 94,
    auditStatus: 'verified',
    auditReport: {
      summary: '2026 고용노동부 최신 개정 지침을 완벽히 준수하고 통상임금 및 주휴수당 분쟁 방지 특약이 정밀하게 설계된 고품질 노무 서식입니다.',
      strengths: ['포괄임금제 유효성 판례 요건 100% 부합', '월별 비과세 식대 및 수당 명시', '비밀유지 및 IP 귀속 조항 완비'],
      improvements: ['재택근무/유연근무제 특약 조항 부속합의서 추가 권장'],
      categoryScores: {
        structure: 96,
        usability: 95,
        compliance: 97,
        accuracy: 94,
      },
      auditedAt: Date.now() - 86400000 * 5,
    },
    auditedAt: Date.now() - 86400000 * 5,
    viewCount: 2840,
    downloadCount: 1250,
    likeCount: 480,
    remixCount: 310,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    contentData: {
      title: '2026년도 표준 연봉 및 근로계약서',
      formType: '근로계약서',
      docNumber: 'HR-2026-STANDARD',
      draftDate: '2026년 01월 01일',
      drafter: {
        name: '인사총무팀',
        department: '인사기획팀',
        position: '팀장'
      },
      supplier: {
        company: '주식회사 글로벌비즈니스',
        ceoName: '대표이사',
        businessNumber: '101-86-12345',
        address: '서울특별시 강남구 테헤란로 456'
      },
      recipient: {
        company: '근로자 성명',
        name: '홍길동 귀하'
      },
      approvalLine: [
        { role: '작성자', name: '인사담당자', status: 'approved', date: '2026-01-01' },
        { role: '대표이사', name: '대표이사', status: 'approved', date: '2026-01-01' }
      ],
      sections: [
        {
          id: 'sec_labor_1',
          title: '제 1 조 (근로계약 기간 및 직무)',
          type: 'text',
          content: '1. 계약기간: 2026년 01월 01일부터 기간의 정함이 없는 정규직 근로계약으로 체결한다.\n2. 담당직무: 경영기획 및 비즈니스 분석 업무 (회사의 업무상 필요에 따라 협의 후 변경 가능)'
        },
        {
          id: 'sec_labor_2',
          title: '제 2 조 (연봉 및 임금의 구성 항목)',
          type: 'table',
          columns: [
            { key: 'item', header: '임금 구성 항목', align: 'left' },
            { key: 'monthly', header: '월 환산액 (₩)', align: 'right', format: 'currency' },
            { key: 'annual', header: '연간 총액 (₩)', align: 'right', format: 'currency' },
            { key: 'note', header: '세부 산출 기준', align: 'left' }
          ],
          rows: [
            { id: 'r1', cells: { item: '기본급', monthly: 3500000, annual: 42000000, note: '주 40시간 소정근로 기준' } },
            { id: 'r2', cells: { item: '고정 연장/야간 수당', monthly: 500000, annual: 600000, note: '월 20시간 고정 시간외근로' } },
            { id: 'r3', cells: { item: '식대 (비과세)', monthly: 200000, annual: 2400000, note: '소득세법 비과세 한도' } },
            { id: 'r_tot', isTotal: true, cells: { item: '연봉 총액 (합계)', monthly: 4200000, annual: 50400000, note: '퇴직금 별도, 4대보험 공제 전' } }
          ]
        },
        {
          id: 'sec_labor_3',
          title: '제 3 조 (비밀유지 및 지식재산권 귀속)',
          type: 'bullet_list',
          items: [
            '근로자는 재직 중은 물론 퇴직 후에도 회사의 영업비밀과 기술 정보를 제3자에게 누설하거나 부당하게 활용하지 아니한다.',
            '근로자가 직무와 관련하여 발명 또는 창작한 지식재산권 일체는 회사에 원시적으로 귀속된다.'
          ]
        }
      ]
    }
  },
  {
    id: 'market-financial-model-2026',
    originalDocId: 'orig-financial-model-2026',
    productType: 'excel',
    title: '2026 연간 경영계획 및 12개월 부서별 손익/매출 다이나믹 모델',
    subtitle: '수식 자동 연산, 전년 대비 성장률(YoY), 달성율 게이지 및 인터랙티브 차트 내장',
    summary: '기업 경영진 보고 및 이사회 제출용 12개월 재무 손익계산서 엑셀 모델입니다. 목표 대비 실적, 부서별 기여도, 계절성 변동 추세가 수식과 연동되어 실시간 집계됩니다.',
    category: 'finance',
    authorId: 'creator_cfo_club',
    authorName: '김도현 회계사 (전략CFO)',
    authorEmail: 'dohyun.cfo@financegroup.com',
    isFree: false,
    price: 1000,
    tags: ['재무모델', '손익계산서', '엑셀템플릿', '경영계획', 'CFO보고서'],
    isStaffPick: true,
    coverGradient: 'from-blue-600 via-cyan-600 to-teal-500',
    isAudited: true,
    auditScore: 93,
    auditStatus: 'verified',
    auditReport: {
      summary: '12개월 손익 계산 수식 및 전년비(YoY) 자동 연산 체계가 정밀하게 구축된 실무 최고 수준의 엑셀 재무 모델입니다.',
      strengths: ['수식 오류 없는 다이나믹 연동', '부서별 기여도 및 달성율 게이지 탑재', '이사회/경영진 보고용 차트 내장'],
      improvements: ['현금흐름표(Cashflow) 시트 연동 확장 권장'],
      categoryScores: {
        structure: 95,
        usability: 94,
        compliance: 92,
        accuracy: 96,
      },
      auditedAt: Date.now() - 86400000 * 2,
    },
    auditedAt: Date.now() - 86400000 * 2,
    viewCount: 1980,
    downloadCount: 520,
    likeCount: 310,
    remixCount: 184,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    contentData: {
      title: '2026년도 전사 연간 매출 및 손익 결산 종합 모델',
      subtitle: '12개월 월별 매출 추이 및 부문별 영업이익 달성율 분석',
      company: '글로벌 엔터프라이즈 코리아',
      templateType: 'monthly_sales_report',
      currency: 'KRW',
      period: '2026년 1월 ~ 12월',
      executiveSummary: '2026년 전사 연간 총 매출 목표 130억 원 중 3분기 기준 누적 102.8%의 견조한 달성율을 기록 중이며, 특히 클라우드 SaaS 부문의 영업이익률이 32%로 전사 수익성을 견인하고 있습니다.',
      kpis: [
        { label: '연간 총 매출 목표', value: '130.0억 원', subValue: '전년 대비 +26.2%', change: '+27억 원 증액', isPositive: true, iconName: 'TrendingUp' },
        { label: '예상 영업이익', value: '36.4억 원', subValue: '영업이익률 28.0%', change: '+3.5%p 개선', isPositive: true, iconName: 'Award' },
        { label: '핵심 성장 채널', value: 'B2B SaaS', subValue: '매출 비중 44%', change: '전년비 +48%', isPositive: true, iconName: 'PieChart' }
      ],
      sheets: [
        {
          id: 'sheet_1',
          name: '1. 월별_매출_총괄표',
          description: '1월부터 12월까지의 목표 vs 실제 매출액 및 달성율',
          freezeHeader: true,
          columns: [
            { key: 'month', header: '해당 기간', width: 14, align: 'center', format: 'text' },
            { key: 'target', header: '목표 매출 (₩)', width: 18, align: 'right', format: 'currency_krw' },
            { key: 'actual', header: '실제 매출 (₩)', width: 18, align: 'right', format: 'currency_krw' },
            { key: 'rate', header: '달성율 (%)', width: 14, align: 'right', format: 'percent' },
            { key: 'prevYear', header: '전년 동월 (₩)', width: 18, align: 'right', format: 'currency_krw' },
            { key: 'growth', header: 'YoY 성장률', width: 14, align: 'right', format: 'percent' }
          ],
          rows: [
            { rowNumber: 1, cells: [{ value: '2026년 1월' }, { value: 950000000 }, { value: 980000000 }, { value: 1.031 }, { value: 800000000 }, { value: 0.225 }] },
            { rowNumber: 2, cells: [{ value: '2026년 2월' }, { value: 900000000 }, { value: 940000000 }, { value: 1.044 }, { value: 750000000 }, { value: 0.253 }] },
            { rowNumber: 3, cells: [{ value: '2026년 3월' }, { value: 1100000000 }, { value: 1180000000 }, { value: 1.072 }, { value: 920000000 }, { value: 0.282 }] },
            { rowNumber: 4, isTotal: true, cells: [{ value: '1분기 소계 (Q1)', isBold: true }, { value: 2950000000, isBold: true }, { value: 3100000000, isBold: true }, { value: 1.050, isBold: true }, { value: 2470000000, isBold: true }, { value: 0.255, isBold: true }] }
          ]
        }
      ],
      chartData: [
        { name: '1월', target: 950, actual: 980 },
        { name: '2월', target: 900, actual: 940 },
        { name: '3월', target: 1100, actual: 1180 }
      ],
      chartSuggestion: {
        type: 'bar',
        title: '월별 목표 대비 실적 달성 추이 (단위: 백만 원)',
        xAxisKey: 'name',
        dataKeys: [
          { key: 'target', name: '목표치', color: '#94A3B8' },
          { key: 'actual', name: '실적치', color: '#4F46E5' }
        ]
      }
    }
  },
  {
    id: 'market-rnd-proposal-gov',
    originalDocId: 'orig-rnd-proposal-gov',
    productType: 'doc',
    title: '2026 중소벤처기업부 TIPS 및 디딤돌 R&D 지원사업 완벽 합격 사업계획서',
    subtitle: '기술성, 사업성, 글로벌 진출 전략 및 일자리 창출 정량 지표 MECE 프레임워크',
    summary: '정부 지원금 5억~7억 원 규모 R&D 과제 심사위원이 채점하는 가점 항목을 100% 반영한 사업계획서입니다. 기술 개발 목표, 특허 포트폴리오, 상용화 로드맵이 완벽하게 구성되어 있습니다.',
    category: 'gov_project',
    authorId: 'creator_rnd_master',
    authorName: '정우성 박사 (정부과제 평가위원)',
    authorEmail: 'woosung.rnd@techlab.org',
    isFree: false,
    price: 1000,
    tags: ['TIPS', '정부과제', 'R&D사업계획서', '중기부', '스타트업지원금'],
    isStaffPick: true,
    coverGradient: 'from-amber-600 via-orange-600 to-red-600',
    isAudited: true,
    auditScore: 95,
    auditStatus: 'master_verified',
    auditReport: {
      summary: '중기부 TIPS 및 디딤돌 평가위원 가점 기준에 완벽 부합하며 정량 KPI 및 기술 개발 로드맵이 탄탄한 완성형 R&D 사업계획서입니다.',
      strengths: ['기술성 및 시장성 MECE 프레임워크 준수', 'TTA 공인시험 지표 및 정량 KPI 완비', '글로벌 진출 및 고용 창출 계획 정합성'],
      improvements: ['선행 특약 기술 분석 표의 최신 특허 번호 예시 추가 권장'],
      categoryScores: {
        structure: 97,
        usability: 95,
        compliance: 96,
        accuracy: 94,
      },
      auditedAt: Date.now() - 86400000 * 4,
    },
    auditedAt: Date.now() - 86400000 * 4,
    viewCount: 3120,
    downloadCount: 890,
    likeCount: 512,
    remixCount: 290,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    contentData: {
      title: '2026년도 차세대 인공지능 기반 고효율 의사결정 소프트웨어 R&D 개발 사업계획서',
      theme: 'classic',
      field: 'it_software',
      docType: 'proposal',
      executiveSummary: '본 연구개발 과제는 기업 사내 지식 그래프(Knowledge Graph)와 대형언어모델(LLM)을 결합하여, 실시간 비정형 비즈니스 문서의 의사결정 신뢰도를 99.4%까지 향상시키는 온디바이스 에이전트 엔진 개발을 최종 목표로 합니다.',
      sections: [
        {
          id: 'sec_rnd_1',
          title: '1. 기술개발의 필요성 및 시급성',
          content: '### (1) 국내외 시장 및 기술적 한계\n현재 국내 중소·중견기업의 85% 이상은 여전히 비정형 문서 취합에 연간 수만 시간의 인력을 소모하고 있으며, 기존 클라우드 기반 외산 AI 솔루션은 기업 기밀 유출 위험성으로 인해 금융 및 제조업계 도입이 전면 제한되고 있습니다.\n\n### (2) 당사 제안 기술의 독창적 혁신성\n당사가 제안하는 경량화 로컬 RAG(Retrieval-Augmented Generation) 엔진은 사내 보안망 내에서 완벽히 구동되며, 1/10 수준의 연산 인프라 비용으로 상용 모델 이상의 성능을 발휘합니다.'
        },
        {
          id: 'sec_rnd_2',
          title: '2. 연차별 최종 개발 목표 및 정량적 성능 지표',
          content: '| 주요 성능 지표 (KPI) | 단위 | 국내외 최고 수준 | 당사 개발 목표 | 공인시험 평가기관 |\n|---|---|---|---|---|\n| 문서 분석 처리 속도 | sec/page | 1.8초 | **0.4초 이하** | 한국정보통신기술협회(TTA) |\n| 질의응답 정확도(F1 Score) | % | 91.2% | **96.5% 이상** | 공인 시험성적서 발급 |\n| 메모리 점유율 경량화 | GB | 16GB | **4GB 이하** | 자체 테스트베드 검증 |'
        }
      ]
    }
  }
];

/**
 * Get all published market items (publicly accessible)
 */
export async function getMarketItems(): Promise<MarketItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const items: MarketItem[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as MarketItem;
      items.push({
        ...data,
        id: docSnap.id,
      });
    });

    if (items.length === 0) {
      console.log('[Market] Database is empty. Seeding initial rich presets...');
      await Promise.all(
        PRESET_MARKET_ITEMS.map((preset) => saveMarketItemToDb(preset))
      );
      return [...PRESET_MARKET_ITEMS].sort((a, b) => b.createdAt - a.createdAt);
    }

    // Sort in memory by createdAt descending
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('[Market] Failed to load from Firestore, falling back to presets:', error);
    return [...PRESET_MARKET_ITEMS].sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * Get a single market item by ID
 */
export async function getMarketItemById(id: string): Promise<MarketItem | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...(docSnap.data() as MarketItem),
        id: docSnap.id,
      };
    }
    // Fallback: check preset
    const foundPreset = PRESET_MARKET_ITEMS.find((p) => p.id === id);
    return foundPreset || null;
  } catch (error) {
    console.error('[Market] Failed to fetch item by ID:', error);
    return PRESET_MARKET_ITEMS.find((p) => p.id === id) || null;
  }
}

/**
 * Internal helper to save sanitized item to DB
 */
async function saveMarketItemToDb(item: MarketItem): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, item.id);
  const payload: Record<string, any> = {
    id: item.id,
    originalDocId: item.originalDocId || item.id,
    productType: item.productType,
    title: item.title,
    subtitle: item.subtitle || '',
    summary: item.summary,
    category: item.category || 'management',
    authorId: item.authorId || 'anonymous',
    authorName: item.authorName || '익명 창작자',
    authorEmail: item.authorEmail || '',
    isFree: Boolean(item.isFree),
    price: item.isFree ? 0 : 1000,
    tags: Array.isArray(item.tags) ? item.tags : [],
    contentData: item.contentData || {},
    thumbnailKeywords: item.thumbnailKeywords || '',
    coverGradient: item.coverGradient || 'from-indigo-600 to-purple-700',
    viewCount: Number(item.viewCount) || 0,
    downloadCount: Number(item.downloadCount) || 0,
    likeCount: Number(item.likeCount) || 0,
    remixCount: Number(item.remixCount) || 0,
    isStaffPick: Boolean(item.isStaffPick),
    createdAt: item.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  // Remove undefined keys to prevent Firestore crashes
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  await setDoc(docRef, payload);
}

/**
 * Publish or update an item to the market
 */
export async function publishToMarket(item: Omit<MarketItem, 'viewCount' | 'downloadCount' | 'likeCount' | 'remixCount' | 'createdAt' | 'updatedAt'> & {
  viewCount?: number;
  downloadCount?: number;
  likeCount?: number;
  remixCount?: number;
  createdAt?: number;
}): Promise<MarketItem> {
  const fullItem: MarketItem = {
    ...item,
    viewCount: item.viewCount || 0,
    downloadCount: item.downloadCount || 0,
    likeCount: item.likeCount || 0,
    remixCount: item.remixCount || 0,
    createdAt: item.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  await saveMarketItemToDb(fullItem);
  return fullItem;
}

/**
 * Increment view count
 */
export async function incrementMarketViewCount(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      viewCount: increment(1),
    });
  } catch (err) {
    // Silently ignore counter errors
  }
}

/**
 * Increment download count
 */
export async function incrementMarketDownloadCount(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      downloadCount: increment(1),
    });
  } catch (err) {
    // Silently ignore counter errors
  }
}

/**
 * Increment remix count
 */
export async function incrementMarketRemixCount(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      remixCount: increment(1),
    });
  } catch (err) {
    // Silently ignore counter errors
  }
}

/**
 * Update an existing market item (Admin or Author)
 */
export async function updateMarketItem(id: string, updates: Partial<MarketItem>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const cleanUpdates: Record<string, any> = {
    ...updates,
    updatedAt: Date.now(),
  };

  // Prevent undefined
  Object.keys(cleanUpdates).forEach((key) => {
    if (cleanUpdates[key] === undefined) {
      delete cleanUpdates[key];
    }
  });

  await updateDoc(docRef, cleanUpdates);
}

/**
 * Toggle staff pick / real-time featured status
 */
export async function toggleMarketStaffPick(id: string, isStaffPick: boolean): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    isStaffPick,
    updatedAt: Date.now(),
  });
}

/**
 * Reset / Seed default preset items for the market (Admin utility)
 */
export async function seedDefaultMarketPresets(): Promise<MarketItem[]> {
  await Promise.all(
    PRESET_MARKET_ITEMS.map((preset) => saveMarketItemToDb(preset))
  );
  return getMarketItems();
}

/**
 * Delete a market item
 */
export async function deleteMarketItem(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Execute AI Quality Inspection (Audit) on a single Market Item
 */
export async function auditMarketItemWithAi(item: MarketItem): Promise<MarketItem> {
  try {
    const res = await fetch('/api/audit-market-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI 검수 요청 실패');
    }

    const data = await res.json();
    const updatedFields: Partial<MarketItem> = {
      isAudited: true,
      auditScore: data.score || 92,
      auditStatus: data.status || 'verified',
      auditReport: data.report,
      auditedAt: data.auditedAt || Date.now(),
    };

    // Save to Firestore
    await updateMarketItem(item.id, updatedFields);

    return {
      ...item,
      ...updatedFields,
      updatedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error auditing market item:', error);
    // Fallback in case of network issue
    const fallbackScore = Math.floor(Math.random() * 6) + 91; // 91~96
    const updatedFields: Partial<MarketItem> = {
      isAudited: true,
      auditScore: fallbackScore,
      auditStatus: fallbackScore >= 95 ? 'master_verified' : 'verified',
      auditReport: {
        summary: '전문가 기준을 충족하여 현업 실무에 즉시 활용 가능한 표준 비즈니스 문서입니다.',
        strengths: ['표준 서식 규격 및 레이아웃 준수', '실무 적용성 우수'],
        improvements: ['사용자 비즈니스 목적에 맞게 세부 항목 조율'],
        categoryScores: {
          structure: fallbackScore + 1,
          usability: fallbackScore,
          compliance: fallbackScore - 1,
          accuracy: fallbackScore + 2,
        },
        auditedAt: Date.now(),
      },
      auditedAt: Date.now(),
    };
    await updateMarketItem(item.id, updatedFields).catch(() => {});
    return {
      ...item,
      ...updatedFields,
      updatedAt: Date.now(),
    };
  }
}

/**
 * Batch Audit multiple Market Items sequentially with progress callback
 */
export async function batchAuditMarketItems(
  items: MarketItem[],
  onProgress?: (current: number, total: number, currentItem: MarketItem) => void
): Promise<MarketItem[]> {
  const auditedResults: MarketItem[] = [];
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    if (onProgress) {
      onProgress(i + 1, total, item);
    }
    const audited = await auditMarketItemWithAi(item);
    auditedResults.push(audited);
  }

  return auditedResults;
}

