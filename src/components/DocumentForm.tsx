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
  FileSpreadsheet
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI 기반 지능형 전문 문서 아키텍처</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          분야별 전문 문서 생성기
        </h1>
        <p className="mt-2.5 text-base text-slate-600 max-w-2xl mx-auto">
          분야와 문서 유형을 선택하고 주제를 입력하면, AI가 체계적인 목차 설계부터
          섹션별 심층 실무 콘텐츠와 데이터 표까지 완성된 전문 문서를 생성합니다.
        </p>

        {/* Quick Presets Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            추천 프리셋:
          </span>
          {DOCUMENT_PRESETS.slice(0, 4).map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 shadow-2xs transition-all cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenTemplates}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            전체 템플릿 보기 →
          </button>
        </div>
      </div>

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Industry Field */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              전문 분야 선택
            </h2>
            <span className="text-xs text-slate-500 ml-auto">
              {INDUSTRY_FIELDS.length}개 산업 및 직무 분야 지원
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {INDUSTRY_FIELDS.map(f => {
              const isSelected = field === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  id={`field-btn-${f.value}`}
                  onClick={() => setField(f.value)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {f.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {f.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom field input if selected */}
          {field === 'custom' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                맞춤 분야명 직접 입력
              </label>
              <input
                type="text"
                value={customField}
                onChange={e => setCustomField(e.target.value)}
                placeholder="예: 우주항공, 친환경 신재생에너지, K-뷰티 글로벌 유통 등"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}
        </div>

        {/* Step 2: Document Type */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              문서 유형 선택
            </h2>
            <span className="text-xs text-slate-500 ml-auto">
              유형별 최적화된 프레임워크 적용
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DOCUMENT_TYPES.map(dt => {
              const isSelected = documentType === dt.value;
              return (
                <button
                  key={dt.value}
                  type="button"
                  id={`doctype-btn-${dt.value}`}
                  onClick={() => setDocumentType(dt.value)}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {dt.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {dt.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom doc type input */}
          {documentType === 'custom' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                맞춤 문서 유형명 직접 입력
              </label>
              <input
                type="text"
                value={customDocumentType}
                onChange={e => setCustomDocumentType(e.target.value)}
                placeholder="예: 주간 핵심 이슈 브리프, 조직 개편안, 벤더 평가 보고서 등"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}
        </div>

        {/* Step 3: Core Information */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              문서 기본 정보 및 목표
            </h2>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              문서 주제 / 핵심 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="doc-topic-input"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="예: 생성형 AI 기반 B2B 업무 자동화 플랫폼 신사업 런칭 계획"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
              required
            />
          </div>

          {/* Purpose */}
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-slate-500" />
                대상 독자 (Target Audience)
              </label>
              <input
                type="text"
                id="doc-audience-input"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="예: 경영진 (C-Level), 투자 심사역, 엔터프라이즈 고객사"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Advanced Specifications */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              전문성 수준 및 분량 상세 설정
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Professional Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                전문성 수준 (Tone & Depth)
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
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      professionalLevel === lvl.value
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="professionalLevel"
                      value={lvl.value}
                      checked={professionalLevel === lvl.value}
                      onChange={() => setProfessionalLevel(lvl.value as ProfessionalLevel)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{lvl.label}</div>
                      <div className="text-[11px] text-slate-500">{lvl.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Length */}
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
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      length === len.value
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="documentLength"
                      value={len.value}
                      checked={length === len.value}
                      onChange={() => setLength(len.value as DocumentLength)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{len.label}</div>
                      <div className="text-[11px] text-slate-500">{len.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Keywords Input */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  핵심 키워드 (Keywords)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeyDownKeyword}
                    placeholder="키워드 입력 후 Enter"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    추가
                  </button>
                </div>

                {/* Keyword tags */}
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {keywords.map(kw => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-blue-900 cursor-pointer"
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>

        {/* Submit CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-generate-document"
            disabled={isGenerating || !topic.trim()}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer ${
              isGenerating || !topic.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI가 전문 목차를 설계하고 섹션별 내용을 생성 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>전문 문서 자동 생성 시작</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-2.5">
            생성 후 목차 점프, 개별 섹션 실시간 재작성/보강, Markdown·PDF 내보내기가 가능합니다.
          </p>
        </div>
      </form>
    </div>
  );
};
