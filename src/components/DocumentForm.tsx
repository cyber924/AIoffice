import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  FileCheck2,
  Users2,
  Tag,
  Gauge,
  SlidersHorizontal,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Plus,
  X,
  FileSpreadsheet,
  Briefcase,
  Megaphone,
  Radio,
  Handshake,
  Compass,
  Cpu,
  TrendingUp,
  Building2,
  GraduationCap,
  Scale,
  Landmark,
  Microscope,
  Factory,
  Truck,
  Sliders,
  Send,
  LayoutList,
  BarChart3,
  Target,
  FileCode,
  LineChart,
  BookOpen,
  ScrollText,
  DollarSign,
  FileText,
  Check,
} from 'lucide-react';
import {
  DocumentInputForm,
  IndustryField,
  DocumentCategoryType,
  ProfessionalLevel,
  DocumentLength
} from '../types/document';
import {
  INDUSTRY_FIELDS,
  DOCUMENT_TYPES,
  DOCUMENT_PRESETS
} from '../data/presets';

interface DocumentFormProps {
  initialData?: Partial<DocumentInputForm>;
  onSubmit: (formData: DocumentInputForm) => void;
  isGenerating: boolean;
  onOpenTemplates: () => void;
}

// Map industry fields to matching icons and distinct subtle color tags
const FIELD_ICONS: Record<IndustryField, { icon: React.FC<{ className?: string }>; tag: string }> = {
  management: { icon: Briefcase, tag: '경영·전략' },
  marketing: { icon: Megaphone, tag: '마케팅' },
  advertising: { icon: Radio, tag: '광고·PR' },
  sales: { icon: Handshake, tag: '영업·B2B' },
  planning: { icon: Compass, tag: '기획·신사업' },
  it_tech: { icon: Cpu, tag: 'IT·SW' },
  ai_data: { icon: Sparkles, tag: 'AI·데이터' },
  finance: { icon: TrendingUp, tag: '금융·투자' },
  real_estate: { icon: Building2, tag: '부동산' },
  education_hr: { icon: GraduationCap, tag: '교육·HR' },
  legal: { icon: Scale, tag: '법률·규제' },
  policy: { icon: Landmark, tag: '정책·공공' },
  research: { icon: Microscope, tag: '연구·R&D' },
  manufacturing: { icon: Factory, tag: '제조·품질' },
  logistics: { icon: Truck, tag: '유통·물류' },
  custom: { icon: Sliders, tag: '맞춤 분야' },
};

// Map document types to matching icons and framework badges
const DOC_TYPE_META: Record<DocumentCategoryType, { icon: React.FC<{ className?: string }>; framework: string }> = {
  business_plan: { icon: Briefcase, framework: '3C/4P · TAM-SAM-SOM · 로드맵' },
  proposal: { icon: Send, framework: 'WBS 일정 · 기대효과 · 예산배분' },
  prd_planning: { icon: LayoutList, framework: 'User Story · 기능 사양 · KPI' },
  market_research: { icon: BarChart3, framework: '시장동향 · 고객조사 · 성장추정' },
  competitor_analysis: { icon: Target, framework: 'SWOT · 포지셔닝 · 차별화' },
  marketing_strategy: { icon: Megaphone, framework: '퍼널설계 · ROAS · 미디어믹스' },
  tech_spec: { icon: FileCode, framework: '아키텍처 · API · 보안/인프라' },
  executive_report: { icon: LineChart, framework: '성과진단 · 리스크 · 의사결정' },
  curriculum_guide: { icon: BookOpen, framework: '학습목표 · 모듈설계 · 평가' },
  policy_proposal: { icon: ScrollText, framework: '사회적배경 · 조례규정 · 파급력' },
  ir_pitch: { icon: DollarSign, framework: 'IR스토리 · 3개년재무 · 밸류에이션' },
  custom: { icon: FileText, framework: '자유형식 · 맞춤 구조화' },
};

export const DocumentForm: React.FC<DocumentFormProps> = ({
  initialData,
  onSubmit,
  isGenerating,
  onOpenTemplates,
}) => {
  const [field, setField] = useState<IndustryField>(initialData?.field || 'management');
  const [customField, setCustomField] = useState(initialData?.customField || '');
  const [documentType, setDocumentType] = useState<DocumentCategoryType>(initialData?.documentType || 'business_plan');
  const [customDocumentType, setCustomDocumentType] = useState(initialData?.customDocumentType || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [purpose, setPurpose] = useState(initialData?.purpose || '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || '사내 경영진 및 관련 부서 의사결정권자');
  const [professionalLevel, setProfessionalLevel] = useState<ProfessionalLevel>(initialData?.professionalLevel || 'practitioner');
  const [length, setLength] = useState<DocumentLength>(initialData?.length || 'standard');
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState(initialData?.additionalRequirements || '');

  // Quick preset apply
  const applyPreset = (presetId: string) => {
    const preset = DOCUMENT_PRESETS.find(p => p.id === presetId);
    if (!preset || !preset.defaultData) return;

    if (preset.defaultData.field) setField(preset.defaultData.field);
    if (preset.defaultData.documentType) setDocumentType(preset.defaultData.documentType);
    if (preset.defaultData.topic) setTopic(preset.defaultData.topic);
    if (preset.defaultData.purpose) setPurpose(preset.defaultData.purpose);
    if (preset.defaultData.targetAudience) setTargetAudience(preset.defaultData.targetAudience);
    if (preset.defaultData.professionalLevel) setProfessionalLevel(preset.defaultData.professionalLevel);
    if (preset.defaultData.length) setLength(preset.defaultData.length);
    if (preset.defaultData.keywords) setKeywords([...preset.defaultData.keywords]);
    if (preset.defaultData.additionalRequirements) setAdditionalRequirements(preset.defaultData.additionalRequirements);
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (tagToRemove: string) => {
    setKeywords(keywords.filter(k => k !== tagToRemove));
  };

  const handleKeyDownKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('문서 주제를 입력해 주세요.');
      return;
    }

    const payload: DocumentInputForm = {
      field,
      customField: field === 'custom' ? customField : undefined,
      documentType,
      customDocumentType: documentType === 'custom' ? customDocumentType : undefined,
      topic: topic.trim(),
      purpose: purpose.trim() || '해당 분야의 체계적인 전략 및 실행 방안 수립',
      targetAudience: targetAudience.trim() || '해당 분야 실무자 및 의사결정권자',
      professionalLevel,
      length,
      keywords,
      additionalRequirements: additionalRequirements.trim() || undefined,
    };

    onSubmit(payload);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>엔터프라이즈 AI 전문 문서 아키텍처 v2.5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            분야별 전문 비즈니스 문서 생성
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            산업 도메인과 문서 유형을 선택하면, 인공지능이 정밀한 목차 구조화부터 실무 핵심 지표, 정량 분석 표, 구체적 실행 로드맵까지 완결성 높은 보고서를 완성합니다.
          </p>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>원클릭 추천 프리셋:</span>
          </span>
          {DOCUMENT_PRESETS.slice(0, 4).map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/40 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenTemplates}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs shrink-0 self-stretch md:self-auto text-center"
        >
          전체 템플릿 탐색 &rarr;
        </button>
      </div>

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Industry Field */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-sm shadow-indigo-500/30">
                01
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>전문 산업 및 직무 분야 선택</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  해당 도메인의 전문 비즈니스 용어와 산업 표준 맥락을 반영합니다.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>{INDUSTRY_FIELDS.length}개 전문 도메인 지원</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {INDUSTRY_FIELDS.map(f => {
              const isSelected = field === f.value;
              const meta = FIELD_ICONS[f.value] || { icon: Briefcase, tag: '분야' };
              const IconComponent = meta.icon;

              return (
                <button
                  key={f.value}
                  type="button"
                  id={`field-btn-${f.value}`}
                  onClick={() => setField(f.value)}
                  className={`group relative p-3.5 rounded-2xl text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[112px] ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20 translate-y-[-1px]'
                      : 'border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/70 bg-white hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar: Icon + Label + Selection Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          선택
                        </span>
                      )}
                    </div>

                    <div className="font-extrabold text-xs sm:text-sm tracking-tight leading-snug">
                      <span className={isSelected ? 'text-indigo-950' : 'text-slate-900 group-hover:text-indigo-900'}>
                        {f.label}
                      </span>
                    </div>
                  </div>

                  {/* Sub Description */}
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {f.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom field input if selected */}
          {field === 'custom' && (
            <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in-50 duration-200">
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                맞춤 분야명 직접 입력 <span className="text-indigo-600">*</span>
              </label>
              <input
                type="text"
                value={customField}
                onChange={e => setCustomField(e.target.value)}
                placeholder="예: 우주항공, 친환경 신재생에너지, K-뷰티 글로벌 유통, 바이오 헬스케어 등"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-50/50 focus:bg-white transition-all font-medium"
              />
            </div>
          )}
        </div>

        {/* Step 2: Document Type */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-sm shadow-indigo-500/30">
                02
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <span>문서 유형 및 분석 프레임워크 선택</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  보고 목적에 최적화된 목차 구성과 구조화 분석 템플릿이 자동으로 연계됩니다.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>표준 프레임워크 내장</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DOCUMENT_TYPES.map(dt => {
              const isSelected = documentType === dt.value;
              const meta = DOC_TYPE_META[dt.value] || { icon: FileText, framework: '표준 구조' };
              const IconComponent = meta.icon;

              return (
                <button
                  key={dt.value}
                  type="button"
                  id={`doctype-btn-${dt.value}`}
                  onClick={() => setDocumentType(dt.value)}
                  className={`group relative p-4 rounded-2xl text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20 translate-y-[-1px]'
                      : 'border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/70 bg-white hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header: Icon + Title + Check */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-extrabold tracking-tight ${isSelected ? 'text-indigo-950' : 'text-slate-900 group-hover:text-indigo-900'}`}>
                          {dt.label}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mt-1.5 pl-9">
                      {dt.description}
                    </p>
                  </div>

                  {/* Bottom: Framework Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">연계 프레임워크:</span>
                    <span className="font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {meta.framework}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom doc type input */}
          {documentType === 'custom' && (
            <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in-50 duration-200">
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                맞춤 문서 유형명 직접 입력 <span className="text-indigo-600">*</span>
              </label>
              <input
                type="text"
                value={customDocumentType}
                onChange={e => setCustomDocumentType(e.target.value)}
                placeholder="예: 주간 핵심 이슈 브리프, 조직 개편안, 벤더 평가 보고서, RFP 제안 응답서 등"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-50/50 focus:bg-white transition-all font-medium"
              />
            </div>
          )}
        </div>

        {/* Step 3: Core Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-sm shadow-indigo-500/30">
              03
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <span>문서 핵심 주제 및 목표 설정</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                문서의 명확한 주제와 목적, 보고 대상자를 정의하여 정밀도를 높입니다.
              </p>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-2">
              문서 주제 / 핵심 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="doc-topic-input"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="예: 생성형 AI 기반 B2B 업무 자동화 플랫폼 신사업 런칭 및 투자 유치 계획서"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-xs sm:text-sm font-semibold bg-slate-50/40 focus:bg-white transition-all shadow-2xs"
              required
            />
          </div>

          {/* Purpose & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                문서 작성 목적 (Goal)
              </label>
              <input
                type="text"
                id="doc-purpose-input"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="예: 2026년 상반기 이사회 승인 및 시리즈 A 투자 유치"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-50/30 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-slate-500" />
                <span>대상 독자 (Target Audience)</span>
              </label>
              <input
                type="text"
                id="doc-audience-input"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="예: 경영진 (C-Level), 투자 심사역, 엔터프라이즈 고객사"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm bg-slate-50/30 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Advanced Specifications */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-sm shadow-indigo-500/30">
              04
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <span>전문성 수준 및 분량 상세 설정</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                원하는 어조(Tone & Depth)와 섹션 구성 깊이를 정밀하게 제어합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Professional Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <span>전문성 수준 (Tone & Depth)</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'practitioner', label: '실무자 / 담당자 수준', desc: '구체적 프로세스 및 기술적 세부사항 중심' },
                  { value: 'manager', label: '팀장 / 관리자 수준', desc: '일정, 리소스, 성과지표(KPI) 및 의사결정 체계' },
                  { value: 'executive', label: '임원 / C-Level 수준', desc: '전략적 가치, ROI, 핵심 리스크 및 의사결정 권고안' },
                  { value: 'academic', label: '학술 / 심층 연구자 수준', desc: '이론적 타당성, 정밀 데이터 및 비교 분석' },
                  { value: 'entry', label: '기초 / 입문자 수준', desc: '친절하고 직관적인 설명 및 기초 개념 정리' },
                ].map(lvl => (
                  <label
                    key={lvl.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      professionalLevel === lvl.value
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="professionalLevel"
                      value={lvl.value}
                      checked={professionalLevel === lvl.value}
                      onChange={() => setProfessionalLevel(lvl.value as ProfessionalLevel)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{lvl.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Length & Keywords */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                문서 분량 및 깊이 (Sections & Scope)
              </label>
              <div className="space-y-2">
                {[
                  { value: 'standard', label: '표준 비즈니스형 (5~6개 섹션)', desc: '실무 제안 및 정기 보고에 가장 적합한 표준 완성도' },
                  { value: 'comprehensive', label: '상세 심층형 (7~9개+ 섹션)', desc: '철저한 분석, 표, 지표, 세부 로드맵까지 총망라' },
                  { value: 'concise', label: '핵심 요약형 (3~4개 섹션)', desc: '주요 핵심 요지만 명료하고 빠르게 파악' },
                ].map(len => (
                  <label
                    key={len.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      length === len.value
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="documentLength"
                      value={len.value}
                      checked={length === len.value}
                      onChange={() => setLength(len.value as DocumentLength)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{len.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{len.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Keywords Input */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>필수 포함 핵심 키워드 (Keywords)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeyDownKeyword}
                    placeholder="키워드 입력 후 Enter"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/30 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>추가</span>
                  </button>
                </div>

                {/* Keyword tags */}
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {keywords.map(kw => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                      >
                        {kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-indigo-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              추가 요구사항 / 특이사항 (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalRequirements}
              onChange={e => setAdditionalRequirements(e.target.value)}
              placeholder="예: 3개년 매출 추정치 표를 반드시 포함할 것, 엔터프라이즈 보안 및 규제 준수 방안을 중점 기술할 것 등"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Submit CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-generate-document"
            disabled={isGenerating || !topic.trim()}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer ${
              isGenerating || !topic.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI가 전문 목차를 설계하고 섹션별 정밀 콘텐츠를 생성 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>전문 비즈니스 문서 자동 생성 시작</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-3 font-medium">
            생성 후 반응형 목차 내비게이션, 섹션별 원클릭 재작성/보강, 표 편집, Markdown 및 PDF 다운로드를 지원합니다.
          </p>
        </div>
      </form>
    </div>
  );
};

