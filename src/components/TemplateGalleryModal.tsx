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
} from 'lucide-react';
import { DocumentPreset } from '../types/document';
import { DOCUMENT_PRESETS } from '../data/presets';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DocumentPreset, autoGenerate?: boolean) => void;
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
};

const CATEGORIES = [
  { id: 'all', label: '전체 템플릿' },
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

  const [activeTab, setActiveTab] = useState<string>('all');
  // State for company name customizations (keyed by preset ID)
  const [customCompanies, setCustomCompanies] = useState<Record<string, string>>({
    'preset-b2b-ad-proposal': '무신사', // default example
  });

  const getCustomizedPreset = (preset: DocumentPreset): DocumentPreset => {
    if (!preset.hasCompanyCustomizer) return preset;

    const company = customCompanies[preset.id]?.trim() || '고객사';
    const replaceCompany = (str?: string) => {
      if (!str) return str;
      return str.replace(/\[고객사명\]/g, company);
    };

    return {
      ...preset,
      defaultData: {
        ...preset.defaultData,
        topic: replaceCompany(preset.defaultData.topic),
        purpose: replaceCompany(preset.defaultData.purpose),
        targetAudience: replaceCompany(preset.defaultData.targetAudience),
        additionalRequirements: replaceCompany(preset.defaultData.additionalRequirements),
      },
    };
  };

  const filteredPresets = DOCUMENT_PRESETS.filter(p => {
    if (activeTab === 'all') return true;
    const cat = CATEGORIES.find(c => c.id === activeTab);
    return cat?.match ? cat.match.includes(p.field) : true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  실무 표준 전문 문서 템플릿 갤러리
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {DOCUMENT_PRESETS.length}종 수록
                </span>
              </div>
              <p className="text-xs text-slate-500">
                검증된 비즈니스 프레임워크와 맞춤형 변수가 사전 설계된 원클릭 프리셋
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

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
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
          {filteredPresets.map(preset => {
            const icon = PRESET_ICONS[preset.iconName] || <FileText className="w-5 h-5 text-indigo-600" />;
            const customizedPreset = getCustomizedPreset(preset);
            const currentCompany = customCompanies[preset.id] || '';

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
                      {preset.hasCompanyCustomizer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <span>회사명 자동 치환</span>
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {preset.field.toUpperCase()}
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
                        placeholder={preset.companyPlaceholder || '예: 삼성전자, 토스, 무신사'}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-300 font-medium"
                      />
                      <p className="text-[10px] text-indigo-600 mt-1">
                        * 입력한 회사명이 주제, 목적, 타깃 고객, 제안 요구사항에 즉시 반영됩니다.
                      </p>
                    </div>
                  )}

                  {/* Dynamic Highlights Preview */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 text-slate-600 mb-4">
                    <div className="font-medium text-slate-800">
                      <span className="text-slate-400">주제: </span>
                      <span className="text-indigo-950 font-semibold">{customizedPreset.defaultData.topic}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      <span className="text-slate-400">대상: </span>
                      {customizedPreset.defaultData.targetAudience}
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
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>템플릿을 선택하면 최적화된 목차와 세부 지침이 자동 입력됩니다.</span>
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
