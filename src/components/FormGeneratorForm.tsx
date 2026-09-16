import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileCheck2,
  Receipt,
  FileSpreadsheet,
  UserCheck,
  Building,
  Scale,
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BusinessFormType, BusinessFormInput } from '../types/formStudio';

interface FormGeneratorFormProps {
  onSubmit: (formData: BusinessFormInput) => void;
  isLoading: boolean;
  initialData?: Partial<BusinessFormInput>;
}

interface FormTypeOption {
  type: BusinessFormType;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  defaultTitle: string;
  defaultDetails: string;
  suggestedBudget?: string;
}

export const FORM_PRESETS: FormTypeOption[] = [
  {
    type: 'proposal_approval',
    title: '표준 기안서 / 품의서 (Approval)',
    badge: '필수 결재',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: '결재선(기안-검토-승인), 추진배경, 예산소요액, 기대효과 표준 공문 양식',
    defaultTitle: '2026년 상반기 클라우드 인프라 확장 및 AI 도입 품의서',
    defaultDetails: `1. 추진 배경: 사내 생성형 AI 도입 및 데이터 트래픽 증가에 따른 GPU 인프라 확충
2. 세부 내용: 클라우드 인스턴스 2대 증설, 고속 캐시 스토리지 도입, 보안 방화벽 업그레이드
3. 기대 효과: 시스템 응답 속도 40% 향상 및 월간 서비스 가용률 99.99% 확보
4. 일정: 2026년 9월 1일 계약 체결 및 9월 중순 구축 완료`,
    suggestedBudget: '15,000,000원',
  },
  {
    type: 'quotation',
    title: '공식 표준 견적서 (Quotation)',
    badge: '세액 자동합산',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: '공급자 정보, 직인 날인 칸, 품목/수량/단가/공급가액/부가세 10% 자동 분리 산출',
    defaultTitle: '2026년 엔터프라이즈 AI 문서 자동화 솔루션 구축 견적서',
    defaultDetails: `1. 공급 품목:
- AI 문서 자동화 커스텀 모델 라이선스 1식 (단가 8,000,000원)
- 온프레미스 연동 API 게이트웨이 모듈 1식 (단가 2,000,000원)
- 시스템 구축 및 관리자 교육 2회 (단가 1,000,000원)
2. 납기일: 발주 후 30일 이내
3. 결제조건: 계약금 50%, 납품 검수 완료 후 잔금 50% (세금계산서 발행)`,
    suggestedBudget: '11,000,000원 (VAT 포함)',
  },
  {
    type: 'tax_invoice',
    title: '전자 세금계산서 양식 (Tax Invoice)',
    badge: '공급자/공급받는자',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: '공급자(빨강)-공급받는자(파랑) 정규 세무 규격 레이아웃 및 한글 총액 자동 표기',
    defaultTitle: '2026년 8월분 소프트웨어 유지보수 및 클라우드 서비스 전자세금계산서',
    defaultDetails: `1. 공급자: (주)알파솔루션 / 대표자: 김대표 / 등록번호: 123-45-67890
2. 공급받는자: (주)베타인사이트 / 대표자: 이대표 / 등록번호: 987-65-43210
3. 품목: 8월분 정기 시스템 모니터링 및 AI 유지관리 용역
4. 공급가액: 5,000,000원 / 세액: 500,000원 / 영수/청구 구분: 청구`,
    suggestedBudget: '5,500,000원 (VAT 포함)',
  },
  {
    type: 'weekly_report',
    title: '주간 / 월간 업무 보고서 (Work Report)',
    badge: '실적 & 계획',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: '금주 주요 실적(Done), 차주 업무 계획(Plan), 부서별 KPI, 이슈 및 건의사항',
    defaultTitle: '2026년 8월 3주차 디지털혁신추진단 주간 업무 실적 및 계획 보고서',
    defaultDetails: `1. 금주 주요 실적 (Done):
- 사내 AI 문서 어시스턴트 파일럿 테스트 완료 (임직원 150명 대상, 만족도 94.2점)
- 3분기 신규 전사 ERP 데이터 마이그레이션 1단계 완료
2. 차주 계획 (Plan):
- 파일럿 피드백 기반 자연어 양식 수정 엔진 2차 고도화 적용
- 8월 말 부서장 대상 시연회 및 피드백 워크숍 개최
3. 주요 이슈 & 건의사항:
- AI API 사용량 증가에 따른 분기 예산 15% 증액 검토 필요`,
  },
  {
    type: 'resume_career',
    title: '전문 경력기술서 / 프리미엄 이력서',
    badge: '성과 중심',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    description: '인적사항, 핵심 역량 요약, 프로젝트별 기여도 및 수치 성과 중심 포트폴리오',
    defaultTitle: '수석 AI 프로덕트 매니저 & 풀스택 엔지니어 경력기술서',
    defaultDetails: `1. 기본 정보: 8년차 테크 리드 / AI & SaaS 프로덕트 아키텍트
2. 핵심 역량: LLM 파이프라인 설계, 멀티테넌트 SaaS 아키텍처, B2B 솔루션 런칭
3. 주요 경력 및 프로젝트 성과:
- (주)테크솔루션 AI 플랫폼 총괄 리드 (2023.01 ~ 현재): 연매출 40억 B2B 생성형 AI 문서 스위트 런칭, 고객사 업무 시간 65% 절감
- (주)데이터랩 시니어 백엔드 엔지니어 (2019.03 ~ 2022.12): 대용량 트래픽 처리 시스템 구축, 서버 비용 35% 최적화
4. 보유 자격 및 학력: 컴퓨터공학 학사, AWS Solution Architect Pro`,
  },
  {
    type: 'official_letter',
    title: '비즈니스 공문 / 업무 협조전',
    badge: '대외 발송',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: '문서번호, 시행일자, 수신처, 발신처, 공식 직인 날인 레이아웃 및 조항별 협조 내용',
    defaultTitle: '2026년 하반기 차세대 스마트 플랫폼 공동 개발을 위한 업무 협조 요청의 건',
    defaultDetails: `1. 귀 사의 무궁한 발전을 기원합니다.
2. 당사에서는 2026년 하반기 출시 예정인 '스마트 오피스 플랫폼'의 공동 연구 개발 및 상호 기술 제휴를 요청드리고자 합니다.
3. 주요 협조 사항:
- API 상호 연동 프로토콜 표준화 및 테스트베드 공동 구축
- 기술 제휴 실무진 킥오프 미팅 일정 조율 (9월 1주차 예정)
4. 본 건 관련 회신은 2026년 8월 29일까지 요청드립니다.`,
  },
];

export const FormGeneratorForm: React.FC<FormGeneratorFormProps> = ({
  onSubmit,
  isLoading,
  initialData,
}) => {
  const [selectedType, setSelectedType] = useState<BusinessFormType>('proposal_approval');
  const [title, setTitle] = useState(FORM_PRESETS[0].defaultTitle);
  const [drafterName, setDrafterName] = useState('홍길동');
  const [drafterDepartment, setDrafterDepartment] = useState('전략기획팀');
  const [drafterPosition, setDrafterPosition] = useState('수석연구원');
  const [companyName, setCompanyName] = useState('(주)스마트비즈니스');
  const [recipientName, setRecipientName] = useState('대표이사 / 고객사');
  const [recipientCompany, setRecipientCompany] = useState('(주)클라이언트');
  const [totalBudget, setTotalBudget] = useState('15,000,000원');
  const [targetDate, setTargetDate] = useState('2026년 09월 01일');
  const [keyDetails, setKeyDetails] = useState(FORM_PRESETS[0].defaultDetails);

  useEffect(() => {
    if (initialData) {
      if (initialData.formType) setSelectedType(initialData.formType);
      if (initialData.title) setTitle(initialData.title);
      if (initialData.drafterName) setDrafterName(initialData.drafterName);
      if (initialData.drafterDepartment) setDrafterDepartment(initialData.drafterDepartment);
      if (initialData.drafterPosition) setDrafterPosition(initialData.drafterPosition);
      if (initialData.companyName) setCompanyName(initialData.companyName);
      if (initialData.recipientName) setRecipientName(initialData.recipientName);
      if (initialData.recipientCompany) setRecipientCompany(initialData.recipientCompany);
      if (initialData.totalBudget) setTotalBudget(initialData.totalBudget);
      if (initialData.targetDate) setTargetDate(initialData.targetDate);
      if (initialData.keyDetails) setKeyDetails(initialData.keyDetails);
    }
  }, [initialData]);

  const handleSelectType = (preset: FormTypeOption) => {
    setSelectedType(preset.type);
    setTitle(preset.defaultTitle);
    setKeyDetails(preset.defaultDetails);
    if (preset.suggestedBudget) {
      setTotalBudget(preset.suggestedBudget);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !keyDetails.trim() || isLoading) return;

    onSubmit({
      formType: selectedType,
      title: title.trim(),
      drafterName: drafterName.trim(),
      drafterDepartment: drafterDepartment.trim(),
      drafterPosition: drafterPosition.trim(),
      companyName: companyName.trim(),
      recipientName: recipientName.trim(),
      recipientCompany: recipientCompany.trim(),
      keyDetails: keyDetails.trim(),
      totalBudget: totalBudget.trim(),
      targetDate: targetDate.trim(),
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>제4탄: 실무 표준 결재 & 행정 양식 스튜디오 (Form Studio)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            한국형 공문서·품의서·견적서·이력서 완벽 작성
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            결재선 날인 도장, 부가세 10% 자동 연산, A4 1페이지 최적화 레이아웃을 웹에서 실시간으로 확인하고 <strong>네이티브 MS Word(.DOCX)</strong>로 바로 내보내세요.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Preset Grid */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-xs font-black">
                1
              </span>
              <h2 className="text-base font-black text-slate-900">
                작성할 표준 공문서 / 행정 양식 선택
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">6대 실무 양식 프리셋</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FORM_PRESETS.map((preset) => {
              const isSelected = selectedType === preset.type;
              return (
                <button
                  type="button"
                  key={preset.type}
                  onClick={() => handleSelectType(preset)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black border ${preset.badgeColor}`}
                      >
                        {preset.badge}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Form Details Input */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-xs font-black">
              2
            </span>
            <h2 className="text-base font-black text-slate-900">양식 기본 정보 및 기안자 정보</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                문서 공식 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026년 상반기 클라우드 인프라 확장 및 AI 도입 품의서"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Drafter Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                기안자 / 작성자 성명
              </label>
              <input
                type="text"
                value={drafterName}
                onChange={(e) => setDrafterName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Department & Position */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                소속 부서 / 직급
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={drafterDepartment}
                  onChange={(e) => setDrafterDepartment(e.target.value)}
                  placeholder="예: 전략기획팀"
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={drafterPosition}
                  onChange={(e) => setDrafterPosition(e.target.value)}
                  placeholder="예: 수석연구원"
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Company / Supplier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                기안 회사명 / 공급자 상호
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: (주)스마트비즈니스"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Budget / Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                예산 소요액 / 견적 총액
              </label>
              <input
                type="text"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="예: 15,000,000원 (VAT 포함)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                시행 일자 / 납기 목표일
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="예: 2026년 09월 01일"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                수신처 / 공급받는자
              </label>
              <input
                type="text"
                value={recipientCompany}
                onChange={(e) => setRecipientCompany(e.target.value)}
                placeholder="예: (주)클라이언트 귀하"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Key Details Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              양식 핵심 내용 및 세부 조건 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={7}
              value={keyDetails}
              onChange={(e) => setKeyDetails(e.target.value)}
              placeholder="품의 배경, 품목 및 단가 내역, 기대 효과, 특약 조건 등을 자유롭게 입력하세요."
              required
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !keyDetails.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-sm font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI 공문서 양식 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>표준 공문서 양식 즉시 생성</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
