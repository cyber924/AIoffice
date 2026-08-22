import React, { useState } from 'react';
import { ExcelInputForm, ExcelTemplateType } from '../types/excel';
import {
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  Layers,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  Package,
  Target,
  Clock,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface ExcelGeneratorFormProps {
  onGenerate: (data: ExcelInputForm) => Promise<void>;
  isLoading: boolean;
}

interface TemplateOption {
  id: ExcelTemplateType;
  name: string;
  badge: string;
  description: string;
  defaultTitle: string;
  defaultPeriod: string;
  icon: any;
  highlight?: boolean;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'monthly_sales_report',
    name: '월별 매출 분석 및 실적 보고서',
    badge: '필수 실무 양식',
    description: '1월~12월 월별 목표 vs 실제 매출, 달성율(%), YoY 성장률, 제품/채널별 세부 기여도 및 시각화 차트',
    defaultTitle: '2026년도 월별 매출 실적 및 목표 달성 종합 보고서',
    defaultPeriod: '2026년 1월 ~ 12월 연간',
    icon: TrendingUp,
    highlight: true,
  },
  {
    id: 'financial_pl_forecast',
    name: '3개년 추정 손익계산서 (P&L)',
    badge: '재무 / 투자유치',
    description: '매출원가, 판관비, 감가상각, 영업이익률(OP Margin), EBITDA, 순이익 및 CAGR 성장 시뮬레이션',
    defaultTitle: '2026-2028 중장기 3개년 추정 손익계산서 및 재무 모델',
    defaultPeriod: '2026년 ~ 2028년 (3개년)',
    icon: DollarSign,
  },
  {
    id: 'b2b_sales_pipeline',
    name: 'B2B 영업 파이프라인 & 딜 관리',
    badge: '영업 / 사업개발',
    description: '리드 발굴, 제안, PoC, 계약 체결 단계별 가중 매출(Weighted Pipeline), 전환율 및 영업대표별 실적',
    defaultTitle: 'B2B 엔터프라이즈 타겟 영업 파이프라인 및 수주 예측 대장',
    defaultPeriod: '2026년 상/하반기',
    icon: Target,
  },
  {
    id: 'project_wbs_budget',
    name: '프로젝트 WBS 일정 & 투입 예산',
    badge: '기획 / 개발 / PM',
    description: '단계별 마일스톤, 투입 공수(M/D), 인건비, 외주비, 서버 인프라비 및 실행 예산 집행율 관리',
    defaultTitle: '차세대 AI 서비스 구축 프로젝트 WBS 및 종합 예산 집행표',
    defaultPeriod: '6개월 프로젝트',
    icon: Clock,
  },
  {
    id: 'payroll_calculator',
    name: '급여대장 및 4대보험 자동 산출',
    badge: '인사 / 노무',
    description: '기본급, 비과세 식대, 국민연금, 건강보험, 장기요양, 고용보험, 근로소득세 자동 공제 및 실수령액',
    defaultTitle: '2026년도 전사 임직원 월간 급여대장 및 4대보험 원천세 집계표',
    defaultPeriod: '월간 기준',
    icon: Users,
  },
  {
    id: 'inventory_stock_eoq',
    name: '재고 수불부 & 적정 발주량(EOQ)',
    badge: '제조 / 물류 / 커머스',
    description: '기초 재고, 당월 입고, 출고, 기말 재고, 안전재고 일수, 회전율 및 최적 경제적 주문량 산출',
    defaultTitle: '핵심 품목별 재고 수불 현황 및 안전재고 발주 관리표',
    defaultPeriod: '월간 / 분기별',
    icon: Package,
  },
];

export const ExcelGeneratorForm: React.FC<ExcelGeneratorFormProps> = ({
  onGenerate,
  isLoading,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ExcelTemplateType>('monthly_sales_report');
  const [title, setTitle] = useState('2026년도 월별 매출 실적 및 목표 달성 종합 보고서');
  const [companyName, setCompanyName] = useState('전략기획총괄본부');
  const [period, setPeriod] = useState('2026년 1월 ~ 12월 연간');
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [businessDescription, setBusinessDescription] = useState(
    '1월부터 12월까지의 월별 목표 매출액(연간 120억 원 기준)과 실제 달성 매출액을 비교하고, 엔터프라이즈 B2B 솔루션, 클라우드 SaaS, 전문 컨설팅 3개 사업 부문별 세부 매출 및 목표 달성율, 전년 대비 성장률(YoY)을 정밀 분석하는 전문 엑셀 보고서입니다.'
  );
  const [keyMetricsToInclude, setKeyMetricsToInclude] = useState(
    '연간 총 매출액, 목표 달성율(%), 전년 대비 성장율(YoY), 영업이익률, 분기별 집계 합계(Q1~Q4), 최고 매출 달성 월'
  );

  const handleTemplateChange = (templateId: ExcelTemplateType) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATE_OPTIONS.find((t) => t.id === templateId);
    if (template) {
      setTitle(template.defaultTitle);
      setPeriod(template.defaultPeriod);
      if (templateId === 'monthly_sales_report') {
        setBusinessDescription(
          '1월부터 12월까지의 월별 목표 매출액(연간 120억 원 기준)과 실제 달성 매출액을 비교하고, 주요 사업부문별 세부 실적과 전년 동월 대비 성장률을 분석하는 월별 총괄 매출 보고서입니다.'
        );
      } else if (templateId === 'financial_pl_forecast') {
        setBusinessDescription(
          '초기 3개년 동안의 매출 성장 추이(연평균 35% 성장), 매출원가(COGS 30%), 판관비(인건비/마케팅비/R&D), 영업이익률 개선 및 손익분기점(BEP) 달성을 시뮬레이션하는 P&L 재무 모델입니다.'
        );
      } else if (templateId === 'b2b_sales_pipeline') {
        setBusinessDescription(
          'B2B 엔터프라이즈 타겟 고객군 30개 파이프라인의 리드 접수, 1차 미팅, 제안 제출, PoC 검증, 최종 계약 체결 단계별 가중 수주액과 영업 담당자별 분기 달성 현황을 관리합니다.'
        );
      } else if (templateId === 'project_wbs_budget') {
        setBusinessDescription(
          '신규 소프트웨어 개발 프로젝트의 착수, 설계, 개발, QA, 배포 단계별 일정과 투입 인력(PM, FE, BE, AI 엔지니어) M/D 산출 및 클라우드 인프라/외주 용역 예산 집행율을 관리합니다.'
        );
      } else if (templateId === 'payroll_calculator') {
        setBusinessDescription(
          '부서별 임직원 15명의 기본급, 비과세 식대, 4대보험(국민연금 4.5%, 건강보험 3.545%, 장기요양 12.95%, 고용보험 0.9%) 및 근로소득세를 공제한 실지급액 산출 급여대장입니다.'
        );
      } else if (templateId === 'inventory_stock_eoq') {
        setBusinessDescription(
          '주요 10개 핵심 원자재 및 완제품의 기초 재고, 입고, 출고, 기말 재고, 안전재고 일수, 일평균 소진량 및 경제적 발주 수량(EOQ)을 산출하는 물류 수불부입니다.'
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !businessDescription.trim() || isLoading) return;

    await onGenerate({
      templateType: selectedTemplate,
      title: title.trim(),
      companyName: companyName.trim(),
      period: period.trim(),
      currency,
      businessDescription: businessDescription.trim(),
      keyMetricsToInclude: keyMetricsToInclude.trim(),
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>EXECUTIVE EXCEL STUDIO</span>
              </span>
              <span className="text-xs text-slate-300 font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                수식 & 서식 연동 .XLSX
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              실무 전문 엑셀 스프레드시트 & 대시보드 생성기
            </h1>
            <p className="mt-1.5 text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              월별 매출 보고서, 추정 손익계산서(P&L), 영업 파이프라인 등 실무 수식(SUM, CAGR, 달성율)과
              반응형 그리드, 네이티브 엑셀 다운로드를 즉시 지원합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Template Selector */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>1. 전문 엑셀 템플릿 양식 선택</span>
            </label>
            <span className="text-xs text-slate-700 font-bold">목적에 맞는 양식을 선택하세요</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATE_OPTIONS.map((t) => {
              const isSelected = selectedTemplate === t.id;
              const IconComp = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  {t.highlight && (
                    <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      추천 필수 양식
                    </span>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {t.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{t.name}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{t.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-medium">다중 시트 + 차트 포함</span>
                    {isSelected && (
                      <span className="text-emerald-600 font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>선택됨</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Metadata & Setting Inputs */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <label className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>2. 기본 정보 및 기준 설정</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                엑셀 문서 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2026년도 월별 매출 실적 종합 보고서"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Company / Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">회사 / 부서명</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: 전략기획실"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">조회 대상 기간</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="예: 2026년 1월 ~ 12월"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="pt-2 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700">기준 통화:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setCurrency('KRW')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currency === 'KRW' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                원화 (KRW, ₩)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                달러 (USD, $)
              </button>
            </div>
          </div>
        </div>

        {/* 3. Business Context & Requirements */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <label className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>3. 비즈니스 세부 내용 및 모델링 조건</span>
          </label>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              상세 설명 및 목표 수치 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="사업 내용, 연간 목표 매출 규모, 주요 제품/서비스 라인업, 부서별 투입 계획 등을 구체적으로 입력하세요."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              반드시 포함할 핵심 수식/지표 (선택 사항)
            </label>
            <input
              type="text"
              value={keyMetricsToInclude}
              onChange={(e) => setKeyMetricsToInclude(e.target.value)}
              placeholder="예: 월별 매출, 달성율(%), 전년 대비 성장률(YoY), 분기별 합계, 영업이익률"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !businessDescription.trim()}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-black text-base shadow-lg hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2.5"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>전문 엑셀 수식 및 다중 시트 생성 중...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5" />
                <span>전문 엑셀 스프레드시트 및 대시보드 생성하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
