import React, { useState, useEffect } from 'react';
import {
  PresentationInputForm,
  PresentationType,
  PresentationThemeId,
  PresentationPreset,
} from '../types/presentation';
import { IndustryField, GeneratedDocument } from '../types/document';
import { PRESENTATION_THEMES, PRESENTATION_PRESETS } from '../constants/presentationThemes';
import {
  Sparkles,
  Presentation,
  TrendingUp,
  Laptop,
  Megaphone,
  Compass,
  Palette,
  Layers,
  Building2,
  Users,
  Target,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface PresentationFormProps {
  initialData?: Partial<PresentationInputForm>;
  onSubmit: (formData: PresentationInputForm) => void;
  isGenerating: boolean;
  savedDocuments?: GeneratedDocument[];
  onConvertDocument?: (doc: GeneratedDocument, theme: PresentationThemeId) => void;
}

const FIELD_OPTIONS: { id: IndustryField; label: string; icon: string }[] = [
  { id: 'management', label: '경영 / 전략 / 스타트업', icon: '💼' },
  { id: 'it_tech', label: 'IT / 소프트웨어 / 클라우드', icon: '💻' },
  { id: 'ai_data', label: '인공지능 / 빅데이터', icon: '🤖' },
  { id: 'planning', label: '신사업 / 서비스 기획', icon: '🚀' },
  { id: 'marketing', label: '마케팅 / 브랜드', icon: '📢' },
  { id: 'advertising', label: '광고 / 홍보 (PR)', icon: '🎯' },
  { id: 'sales', label: '영업 / B2B 수주', icon: '🤝' },
  { id: 'finance', label: '금융 / 핀테크 / 투자', icon: '📈' },
  { id: 'education_hr', label: '교육 / HR / 역량개발', icon: '🎓' },
  { id: 'real_estate', label: '부동산 / 공간개발', icon: '🏢' },
  { id: 'legal', label: '법률 / 규제 / 컴플라이언스', icon: '⚖️' },
  { id: 'policy', label: '정책 / 공공 / 정부사업', icon: '🏛️' },
  { id: 'research', label: '바이오 / 연구 / R&D', icon: '🔬' },
  { id: 'manufacturing', label: '제조 / 스마트팩토리', icon: '⚙️' },
  { id: 'logistics', label: '유통 / 물류 / 커머스', icon: '📦' },
];

const PRESENTATION_TYPES: { id: PresentationType; label: string; desc: string }[] = [
  { id: 'ir_pitch', label: '스타트업 IR 피치덱', desc: '투자 유치, 시장기회, 비즈니스 모델, 재무 추정' },
  { id: 'b2b_proposal', label: 'B2B 수주 제안서', desc: '고객사 과제 분석, 제안 아키텍처, WBS 일정, 기대효과' },
  { id: 'business_plan', label: '신사업 계획서', desc: '신시장 기회, 3C 분석, 핵심 역량, 3개년 로드맵' },
  { id: 'product_launch', label: '신제품 런칭 덱', desc: '제품 USP, 타겟 페르소나, GTM 전략, 프로모션' },
  { id: 'marketing_deck', label: '통합 마케팅 전략', desc: '4P 믹스, 퍼널 설계, 캠페인 플랜, KPI 목표' },
  { id: 'tech_architecture', label: '기술 사양 & 아키텍처', desc: '시스템 구조, 데이터 흐름, 보안 요건, 인프라 설계' },
  { id: 'executive_report', label: '경영진 브리핑 보고서', desc: '핵심 현안, 성과 분석, 리스크 요인, 의사결정 권고' },
];

export const PresentationForm: React.FC<PresentationFormProps> = ({
  initialData,
  onSubmit,
  isGenerating,
  savedDocuments = [],
  onConvertDocument,
}) => {
  const [formData, setFormData] = useState<PresentationInputForm>({
    field: 'management',
    presentationType: 'ir_pitch',
    theme: 'dark_navy',
    topic: '',
    purpose: '',
    targetAudience: '',
    companyName: '',
    slideCountPreference: 10,
    keyPoints: '',
  });

  const [selectedDocId, setSelectedDocId] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleApplyPreset = (preset: PresentationPreset) => {
    setFormData((prev) => ({
      ...prev,
      ...preset.defaultData,
      theme: preset.theme,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim() || !formData.purpose.trim()) {
      alert('프레젠테이션 주제와 목적을 모두 입력해 주세요.');
      return;
    }
    onSubmit(formData);
  };

  const handleDocConvert = () => {
    if (!selectedDocId || !onConvertDocument) return;
    const doc = savedDocuments.find((d) => d.id === selectedDocId);
    if (doc) {
      onConvertDocument(doc, formData.theme);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black">
            <Presentation className="w-3.5 h-3.5" />
            <span>분야별 전문 AI 슬라이드 & PPT 엔진</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            아이디어 하나로 완성하는 고품질 프레젠테이션
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            16대 전문 도메인과 표준 슬라이드 덱 구조를 결합하여, 16:9 반응형 슬라이드 및 네이티브 파워포인트(.pptx) 파일을 즉시 생성합니다.
          </p>
        </div>
      </div>

      {/* Preset Quick Starters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>추천 전문 덱 프리셋 (1초 적용)</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESENTATION_PRESETS.map((preset) => {
            const isSelected = formData.topic === preset.defaultData.topic;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{preset.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {preset.defaultData.slideCountPreference}장
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Convert From Saved Document Card */}
      {savedDocuments.length > 0 && onConvertDocument && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                기존에 작성된 전문 문서가 있으신가요?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                보관함에 저장된 사업계획서나 제안서를 가져와 10장의 핵심 프레젠테이션 슬라이드로 자동 압축 변환합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
            >
              <option value="">문서 선택하기...</option>
              {savedDocuments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDocConvert}
              disabled={!selectedDocId || isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              PPT로 변환
            </button>
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* 1. Field Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>1. 전문 산업 분야 선택 (16대 도메인)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {FIELD_OPTIONS.map((f) => {
              const isSelected = formData.field === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, field: f.id })}
                  className={`px-3 py-2 rounded-xl text-left border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">{f.icon}</span>
                  <span className="truncate">{f.label.split('/')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Presentation Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>2. 슬라이드 덱 유형 선택</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESENTATION_TYPES.map((t) => {
              const isSelected = formData.presentationType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, presentationType: t.id })}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                      {t.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Visual Theme Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. 비주얼 테마 선택 (클릭 시 실시간 적용)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {(Object.keys(PRESENTATION_THEMES) as PresentationThemeId[]).map((themeKey) => {
              const themeItem = PRESENTATION_THEMES[themeKey];
              const isSelected = formData.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: themeKey })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-2xs"
                        style={{ backgroundColor: `#${themeItem.pptxColors.bg}` }}
                      />
                      <div
                        className="w-3 h-3 rounded-full -ml-1 border border-white/20"
                        style={{ backgroundColor: `#${themeItem.pptxColors.accentColor}` }}
                      />
                      <span className="text-xs font-bold text-slate-900">{themeItem.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{themeItem.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Core Details Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>프레젠테이션 주제 / 타이틀 *</span>
              <span className="text-[11px] text-slate-400 font-normal">명확하고 핵심을 담은 문장</span>
            </label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="예: AI 기반 B2B 업무 자동화 SaaS 플랫폼 투자 유치 피치덱"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              발표 및 제작 목적 *
            </label>
            <input
              type="text"
              required
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="예: 15억 원 규모 Pre-A 투자 유치 및 심사역 설득"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              대상 청중 (Audience) *
            </label>
            <input
              type="text"
              required
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="예: 스타트업 전문 VC 심사역 및 파트너"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              회사명 / 팀명 (선택)
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="예: (주)넥스트오토메이트"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              선호 슬라이드 장수
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[8, 10, 12, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, slideCountPreference: num })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    formData.slideCountPreference === num
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {num}장
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>핵심 강조 사항 및 데이터 (선택)</span>
              <span className="text-[11px] text-slate-400 font-normal">수치, 주요 성과, 특허 등</span>
            </label>
            <textarea
              rows={2}
              value={formData.keyPoints}
              onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
              placeholder="예: 유료 기업 고객 120개사 확보, MoM 35% 성장, TAM 12조 원 시장, 2년 차 손익분기점(BEP) 달성"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            ⚡ 16:9 반응형 HTML 슬라이드 생성 후 네이티브 PPTX 파일로 언제든 변환 다운로드 가능합니다.
          </div>
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI가 슬라이드 덱 및 스피커 노트를 설계 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI 슬라이드 덱 즉시 생성하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
