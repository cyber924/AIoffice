import React, { useState } from 'react';
import {
  X,
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileText,
  BarChart3,
  GraduationCap,
  Megaphone,
  Briefcase,
  Building2,
  Check,
  Laptop,
  Receipt,
  UserCheck,
  Compass,
} from 'lucide-react';
import { ALL_PRESETS, UnifiedPreset } from '../data/presets';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: any, autoGenerate?: boolean) => void;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-purple-600" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-600" />,
  Cpu: <Cpu className="w-5 h-5 text-cyan-600" />,
  FileText: <FileText className="w-5 h-5 text-blue-600" />,
  BarChart3: <BarChart3 className="w-5 h-5 text-rose-600" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-amber-600" />,
  Megaphone: <Megaphone className="w-5 h-5 text-indigo-600" />,
  Briefcase: <Briefcase className="w-5 h-5 text-blue-700" />,
  Laptop: <Laptop className="w-5 h-5 text-indigo-600" />,
  Receipt: <Receipt className="w-5 h-5 text-pink-600" />,
  UserCheck: <UserCheck className="w-5 h-5 text-violet-600" />,
  Compass: <Compass className="w-5 h-5 text-teal-600" />,
  Building2: <Building2 className="w-5 h-5 text-slate-600" />,
};

const PRODUCT_TYPES = [
  { id: 'all', label: '전체 템플릿', icon: '✨' },
  { id: 'doc', label: '전문 보고서', icon: '📄' },
  { id: 'presentation', label: '전문 PPT 슬라이드', icon: '📊' },
  { id: 'excel', label: '전문 엑셀', icon: '📈' },
  { id: 'form_studio', label: '행정 양식', icon: '📝' },
];

const CATEGORIES = [
  { id: 'all', label: '전체 분야' },
  { id: 'sales_marketing', label: '영업 / 마케팅', match: ['sales', 'marketing', 'advertising'] },
  { id: 'management_plan', label: '경영 / 전략', match: ['management', 'planning', 'finance'] },
  { id: 'it_ai', label: 'IT / AI 기술', match: ['it_tech', 'ai_data'] },
  { id: 'research_edu', label: '리서치 / 교육', match: ['research', 'education_hr'] },
];

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const [activeProduct, setActiveProduct] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // State for company name customizations (keyed by preset ID)
  const [customCompanies, setCustomCompanies] = useState<Record<string, string>>({
    'preset-doc-b2b-ad': '무신사', // default examples
    'preset-pres-ir-seed': '무신사',
    'preset-pres-b2b-dx': '하나은행',
    'preset-pres-brand-marketing': '비건글로우',
  });

  const getCustomizedPreset = (preset: UnifiedPreset): UnifiedPreset => {
    if (!preset.hasCompanyCustomizer) return preset;

    const company = customCompanies[preset.id]?.trim() || '고객사';
    const replaceCompany = (str?: string) => {
      if (!str) return str;
      return str.replace(/\[고객사명\]/g, company);
    };

    const updatedData = { ...preset.defaultData };
    
    // Dynamic replacement depending on product fields
    if (updatedData.topic) updatedData.topic = replaceCompany(updatedData.topic);
    if (updatedData.purpose) updatedData.purpose = replaceCompany(updatedData.purpose);
    if (updatedData.targetAudience) updatedData.targetAudience = replaceCompany(updatedData.targetAudience);
    if (updatedData.companyName) updatedData.companyName = replaceCompany(updatedData.companyName);
    if (updatedData.additionalRequirements) updatedData.additionalRequirements = replaceCompany(updatedData.additionalRequirements);
    if (updatedData.title) updatedData.title = replaceCompany(updatedData.title);
    if (updatedData.businessDescription) updatedData.businessDescription = replaceCompany(updatedData.businessDescription);
    if (updatedData.keyDetails) updatedData.keyDetails = replaceCompany(updatedData.keyDetails);

    return {
      ...preset,
      defaultData: updatedData,
    };
  };

  const filteredPresets = ALL_PRESETS.filter(p => {
    // 1. Filter by product type
    if (activeProduct !== 'all' && p.productType !== activeProduct) {
      return false;
    }

    // 2. Filter by category
    if (activeTab === 'all') return true;
    const cat = CATEGORIES.find(c => c.id === activeTab);
    return cat?.match ? cat.match.includes(p.field) : true;
  });

  const getProductBadgeColor = (type: string) => {
    switch (type) {
      case 'doc': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'presentation': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'excel': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'form_studio': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getProductLabel = (type: string) => {
    switch (type) {
      case 'doc': return '전문 보고서';
      case 'presentation': return 'PPT 슬라이드';
      case 'excel': return '전문 엑셀';
      case 'form_studio': return '행정 양식';
      default: return '공통';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  실무 표준 통합 전문 템플릿 갤러리
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {ALL_PRESETS.length}종 수록
                </span>
              </div>
              <p className="text-xs text-slate-500">
                보고서, PPT, 엑셀, 행정 양식까지 사전 정의된 고품격 비즈니스 시나리오 템플릿
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Type Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-150 overflow-x-auto">
          {PRODUCT_TYPES.map(prod => (
            <button
              key={prod.id}
              onClick={() => {
                setActiveProduct(prod.id);
                // Also reset fields tab if the field list doesn't apply nicely or just keep it
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeProduct === prod.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{prod.icon}</span>
              <span>{prod.label}</span>
            </button>
          ))}
        </div>

        {/* Category / Field Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
          {filteredPresets.length > 0 ? (
            filteredPresets.map(preset => {
              const icon = PRESET_ICONS[preset.iconName] || <FileText className="w-5 h-5 text-indigo-600" />;
              const customizedPreset = getCustomizedPreset(preset);
              const currentCompany = customCompanies[preset.id] || '';

              // Find primary preview text
              const previewTopic = customizedPreset.defaultData.topic || customizedPreset.defaultData.title || '';
              const previewTarget = customizedPreset.defaultData.targetAudience || customizedPreset.defaultData.companyName || customizedPreset.defaultData.drafterName || '실무진';

              return (
                <div
                  key={preset.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {icon}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProductBadgeColor(preset.productType)}`}>
                          {getProductLabel(preset.productType)}
                        </span>
                        {preset.hasCompanyCustomizer && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            회사명 자동 치환
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {preset.field}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {preset.description}
                    </p>

                    {/* Company Name Customizer Input (For B2B proposals) */}
                    {preset.hasCompanyCustomizer && (
                      <div className="mb-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>제안 대상 고객사명 입력</span>
                        </label>
                        <input
                          type="text"
                          value={currentCompany}
                          onChange={(e) =>
                            setCustomCompanies(prev => ({
                              ...prev,
                              [preset.id]: e.target.value,
                            }))
                          }
                          placeholder={preset.companyPlaceholder || '예: 하나은행, 무신사, 삼성전자'}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-300 font-medium"
                        />
                        <p className="text-[10px] text-indigo-600 mt-1">
                          * 입력한 회사명이 주제, 목적, 주요 입력 데이터에 즉시 실시간 치환 반영됩니다.
                        </p>
                      </div>
                    )}

                    {/* Dynamic Highlights Preview */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 text-slate-600 mb-4">
                      <div className="font-medium text-slate-800">
                        <span className="text-slate-400">주제/제목: </span>
                        <span className="text-indigo-950 font-semibold line-clamp-2">{previewTopic}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        <span className="text-slate-400">대상/기안자: </span>
                        {previewTarget}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreset(customizedPreset, false);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      폼에 불러오기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreset(customizedPreset, true);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>즉시 생성</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
              선택한 유형의 템플릿이 없습니다. 다른 필터를 선택해 주세요.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>템플릿을 선택하면 최적화된 서식 목차와 AI 생성 지침이 폼에 즉시 세팅됩니다.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
