import React, { useState } from 'react';
import {
  SlideItem,
  PresentationThemeId,
} from '../types/presentation';
import { PRESENTATION_THEMES } from '../constants/presentationThemes';
import {
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  BarChart3,
  Building2,
  Calendar,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';

interface SlideCanvasProps {
  slide: SlideItem;
  theme: PresentationThemeId;
  totalSlides?: number;
  companyName?: string;
  presentationTitle?: string;
  isThumbnail?: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  theme,
  totalSlides,
  companyName,
  presentationTitle,
  isThumbnail = false,
}) => {
  const themeConfig = PRESENTATION_THEMES[theme] || PRESENTATION_THEMES.dark_navy;
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl flex flex-col select-none transition-all ${
        themeConfig.bgClass
      } ${isThumbnail ? 'p-2.5 text-[9px]' : 'p-6 sm:p-9'}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/8 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

      {/* Slide Header (for non-title slides) */}
      {slide.layout !== 'title' && slide.layout !== 'section_header' && (
        <div className={`relative z-10 flex items-start justify-between ${isThumbnail ? 'mb-1.5' : 'mb-5'}`}>
          <div className="min-w-0 flex-1 pr-3">
            {slide.category && (
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`font-black tracking-wider uppercase ${
                    isThumbnail ? 'text-[8px]' : 'text-xs'
                  } ${themeConfig.accentClass}`}
                >
                  {slide.category}
                </span>
                {!isThumbnail && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                )}
              </div>
            )}
            <h2
              className={`font-black tracking-tight ${themeConfig.textPrimary} ${
                isThumbnail ? 'text-[11px] leading-tight line-clamp-1' : 'text-xl sm:text-2xl md:text-3xl leading-tight'
              }`}
            >
              {slide.title}
            </h2>
            {slide.keyTakeaway && !isThumbnail && (
              <p className={`mt-1 text-xs sm:text-sm font-medium ${themeConfig.textSecondary} flex items-center gap-1.5`}>
                <span className="text-amber-400 font-bold">💡 핵심 요약:</span>
                <span>{slide.keyTakeaway}</span>
              </p>
            )}
          </div>

          {/* Slide Number Badge */}
          <div className="shrink-0 flex items-center gap-2 text-right">
            {!isThumbnail && totalSlides && (
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10 ${themeConfig.cardBgClass} text-white/90`}>
                {slide.slideNumber} / {totalSlides}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Slide Layout Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
        {renderLayoutContent(slide, themeConfig, isThumbnail, companyName, presentationTitle, imageError, () => setImageError(true))}
      </div>

      {/* Slide Footer */}
      {!isThumbnail && (
        <div className="relative z-10 pt-3 mt-auto border-t border-white/10 flex items-center justify-between text-[11px] opacity-70">
          <div className="flex items-center gap-2 truncate max-w-[400px]">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-white/90 truncate">
              {companyName || presentationTitle || 'AI Executive Studio'}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>CONFIDENTIAL</span>
            <span>•</span>
            <span className="font-bold text-white">SLIDE {slide.slideNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

function renderLayoutContent(
  slide: SlideItem,
  themeConfig: any,
  isThumb: boolean,
  companyName?: string,
  presTitle?: string,
  imageError: boolean = false,
  onImageError?: () => void
) {
  const imageUrl = slide.imageUrl;

  switch (slide.layout) {
    case 'title': {
      return (
        <div className="relative h-full flex flex-col justify-between py-2">
          {/* Cover Hero Background Visual */}
          {imageUrl && !imageError && (
            <div className="absolute inset-0 -m-6 sm:-m-9 rounded-xl overflow-hidden pointer-events-none opacity-30 z-0">
              <img
                src={imageUrl}
                alt="Presentation Cover Backdrop"
                className="w-full h-full object-cover filter blur-[1px] scale-105"
                referrerPolicy="no-referrer"
                onError={onImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80" />
            </div>
          )}

          {/* Cover Header Meta */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-black uppercase tracking-widest px-3 py-1 rounded-full text-xs border ${themeConfig.accentBadge} shadow-xs`}>
                {slide.category || 'EXECUTIVE PITCH DECK'}
              </span>
              <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                16:9 PRO
              </span>
            </div>
            {companyName && (
              <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {companyName}
              </span>
            )}
          </div>

          {/* Cover Title Area */}
          <div className="relative z-10 my-auto py-2">
            <h1
              className={`font-black tracking-tight text-white ${
                isThumb ? 'text-sm leading-tight' : 'text-2xl sm:text-4xl md:text-5xl leading-[1.15] max-w-4xl drop-shadow-md'
              }`}
            >
              {slide.title || presTitle}
            </h1>
            {(slide.subtitle || slide.keyTakeaway) && (
              <p
                className={`mt-3 font-medium text-slate-200 ${
                  isThumb ? 'text-[9px] line-clamp-2' : 'text-sm sm:text-lg max-w-3xl leading-relaxed'
                }`}
              >
                {slide.subtitle || slide.keyTakeaway}
              </p>
            )}
          </div>

          {/* Cover Footer Info */}
          {!isThumb && (
            <div className="relative z-10 flex flex-wrap items-center gap-3 text-xs">
              <div className={`px-3 py-1.5 rounded-lg ${themeConfig.cardBgClass} font-semibold flex items-center gap-1.5 border border-white/10`}>
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>발표: {companyName || '전략 기획 총괄팀'}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg ${themeConfig.cardBgClass} opacity-90 flex items-center gap-1.5 border border-white/10`}>
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg ${themeConfig.cardBgClass} font-mono text-emerald-400 border border-emerald-500/20`}>
                CONFIDENTIAL & PROPRIETARY
              </div>
            </div>
          )}
        </div>
      );
    }

    case 'cards_grid_3': {
      const cards = slide.content.cards || [];
      return (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 h-full items-stretch">
          {cards.slice(0, 3).map((card, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 sm:p-5 flex flex-col justify-between transition-all border border-white/10 hover:border-indigo-400/40 shadow-sm ${themeConfig.cardBgClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-black uppercase tracking-wider text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md ${themeConfig.accentBadge}`}
                  >
                    {card.tag || `POINT 0${idx + 1}`}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                    <Sparkles className={`w-3.5 h-3.5 ${themeConfig.accentClass}`} />
                  </div>
                </div>
                <h3
                  className={`font-bold ${themeConfig.textPrimary} ${
                    isThumb ? 'text-[9px] line-clamp-1' : 'text-sm sm:text-base mb-2 font-black'
                  }`}
                >
                  {card.title}
                </h3>
                {card.subtitle && !isThumb && (
                  <p className="text-xs font-semibold text-indigo-400 mb-1.5">{card.subtitle}</p>
                )}
                <p
                  className={`leading-relaxed ${themeConfig.textSecondary} ${
                    isThumb ? 'text-[7.5px] line-clamp-3' : 'text-xs sm:text-[13px]'
                  }`}
                >
                  {card.description}
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] opacity-60">
                <span className="font-mono">CORE ITEM {idx + 1}</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'bullets_split': {
      const bullets = slide.content.bulletPoints || [];
      return (
        <div className="grid grid-cols-12 gap-3 sm:gap-5 h-full items-stretch">
          {/* Left Key Insight & Small Photography Card */}
          <div
            className={`col-span-5 rounded-xl p-3 sm:p-5 flex flex-col justify-between border border-white/10 shadow-sm ${themeConfig.cardBgClass}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-black text-[10px] uppercase tracking-wider ${themeConfig.accentClass}`}>
                  KEY STRATEGY & INSIGHT
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h3
                className={`font-black ${themeConfig.textPrimary} ${
                  isThumb ? 'text-[9px] line-clamp-2 my-1' : 'text-sm sm:text-lg my-2'
                }`}
              >
                {slide.title}
              </h3>
              <p
                className={`leading-relaxed ${themeConfig.textSecondary} ${
                  isThumb ? 'text-[7.5px] line-clamp-3' : 'text-xs sm:text-sm'
                }`}
              >
                {slide.keyTakeaway || slide.subtitle || '도메인 특화 전략을 통해 목표치를 초과 달성합니다.'}
              </p>
            </div>

            {/* Small Contextual Photo Accent (Page 2/3 Image Integration) */}
            {imageUrl && !imageError && !isThumb && (
              <div className="mt-3 relative rounded-lg overflow-hidden h-24 sm:h-28 border border-white/15 shadow-inner">
                <img
                  src={imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={onImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[10px] font-bold text-white/90 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-indigo-400" />
                    <span>실행 프레임워크 아키텍처</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Detailed Bullet Cards */}
          <div className={`col-span-7 rounded-xl p-3 sm:p-5 flex flex-col justify-center border border-white/10 ${themeConfig.cardBgClass}`}>
            <ul className={`space-y-2.5 sm:space-y-3.5 ${themeConfig.textPrimary} ${isThumb ? 'text-[7.5px]' : 'text-xs sm:text-sm'}`}>
              {bullets.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed text-slate-200">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    case 'market_tam_sam_som': {
      const market = slide.content.marketSize || {
        tam: { title: 'TAM (전체 시장)', value: '15.8조 원', desc: '국내외 관련 전방위 총 시장 규모' },
        sam: { title: 'SAM (유효 시장)', value: '4.2조 원', desc: '당사 타겟 고객군 유효 시장' },
        som: { title: 'SOM (수익 시장)', value: '6,500억 원', desc: '초기 3개년 목표 수익 시장' },
      };
      const tiers = [
        { name: 'TAM', ...market.tam, badge: 'text-sky-400 bg-sky-500/10 border-sky-400/30' },
        { name: 'SAM', ...market.sam, badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-400/30' },
        { name: 'SOM', ...market.som, badge: 'text-amber-400 bg-amber-500/10 border-amber-400/30' },
      ];
      return (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 h-full items-stretch">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 sm:p-5 flex flex-col justify-between border border-white/10 ${themeConfig.cardBgClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${t.badge}`}>
                    {t.name}
                  </span>
                  <BarChart3 className="w-4 h-4 opacity-60 text-indigo-400" />
                </div>
                <h4 className={`text-xs font-bold ${themeConfig.textSecondary} mb-1`}>{t.title}</h4>
                <div
                  className={`font-black text-white ${
                    isThumb ? 'text-xs' : 'text-xl sm:text-2xl md:text-3xl my-2 tracking-tight'
                  }`}
                >
                  {t.value}
                </div>
                <p className={`leading-relaxed ${themeConfig.textSecondary} ${isThumb ? 'text-[7px]' : 'text-xs'}`}>
                  {t.desc}
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
                CAGR +18.4% EXPECTED
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'financial_kpi': {
      const metrics = slide.content.metrics || [];
      return (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 h-full items-stretch">
          {metrics.slice(0, 3).map((m, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 sm:p-5 flex flex-col justify-between border border-white/10 ${themeConfig.cardBgClass}`}
            >
              <div>
                <span className={`text-[10px] sm:text-xs font-black ${themeConfig.accentClass} block mb-1 uppercase tracking-wider`}>
                  {m.label}
                </span>
                <div
                  className={`font-black tracking-tight text-white ${
                    isThumb ? 'text-xs my-1' : 'text-2xl sm:text-3xl md:text-4xl my-2.5'
                  }`}
                >
                  {m.value}
                </div>
                {m.change && (
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded mb-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>{m.change}</span>
                  </div>
                )}
                {m.note && (
                  <p className={`leading-relaxed ${themeConfig.textSecondary} ${isThumb ? 'text-[7px]' : 'text-xs'}`}>
                    {m.note}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                <span>TARGET METRIC</span>
                <span>ON TRACK</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'swot_matrix': {
      const swot = slide.content.swot || {
        strengths: ['독보적 원천 기술', '검증된 레퍼런스'],
        weaknesses: ['초기 인지도 제고 필요', '글로벌 인력 확보'],
        opportunities: ['디지털 전환 수요 급증', '정부 지원 정책'],
        threats: ['신규 진입자 경쟁 심화', '거시 경제 변동성'],
      };
      const items = [
        { label: '강점 (Strengths)', bullets: swot.strengths, color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20', icon: Award },
        { label: '약점 (Weaknesses)', bullets: swot.weaknesses, color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
        { label: '기회 (Opportunities)', bullets: swot.opportunities, color: 'text-sky-400', badge: 'bg-sky-500/10 border-sky-500/20', icon: Lightbulb },
        { label: '위협 (Threats)', bullets: swot.threats, color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/20', icon: ShieldAlert },
      ];
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 h-full">
          {items.map((q, idx) => {
            const IconComponent = q.icon;
            return (
              <div
                key={idx}
                className={`rounded-xl p-3 sm:p-4 flex flex-col justify-start border border-white/10 ${themeConfig.cardBgClass}`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`p-1 rounded ${q.badge}`}>
                    <IconComponent className={`w-3.5 h-3.5 ${q.color}`} />
                  </span>
                  <span className={`font-black ${isThumb ? 'text-[8.5px]' : 'text-xs sm:text-sm'} ${q.color}`}>
                    {q.label}
                  </span>
                </div>
                <ul className={`space-y-1.5 ${themeConfig.textSecondary} ${isThumb ? 'text-[7px]' : 'text-xs'}`}>
                  {(q.bullets || []).map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-white/40 font-bold">•</span>
                      <span className={isThumb ? 'line-clamp-1' : 'text-slate-200'}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      );
    }

    case 'timeline_roadmap': {
      const timeline = slide.content.timeline || [];
      return (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 h-full items-stretch">
          {timeline.slice(0, 4).map((phase, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-2.5 sm:p-4 flex flex-col relative border border-white/10 ${themeConfig.cardBgClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/20`}>
                  {phase.period || `PHASE 0${idx + 1}`}
                </span>
                <Clock className="w-3.5 h-3.5 opacity-50 text-indigo-400" />
              </div>
              <h4
                className={`font-black ${themeConfig.textPrimary} ${
                  isThumb ? 'text-[8.5px] line-clamp-1' : 'text-xs sm:text-sm mb-2'
                }`}
              >
                {phase.title}
              </h4>
              <ul className={`space-y-1 ${themeConfig.textSecondary} ${isThumb ? 'text-[7px]' : 'text-xs'}`}>
                {(phase.details || []).map((d, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-1">
                    <span className="text-indigo-400">•</span>
                    <span className={isThumb ? 'line-clamp-1' : 'text-slate-200'}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    case 'cards_grid_4': {
      const cards = slide.content.cards || [];
      return (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 h-full items-stretch">
          {cards.slice(0, 4).map((card, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-2.5 sm:p-4 flex flex-col justify-between border border-white/10 ${themeConfig.cardBgClass}`}
            >
              <div>
                <span
                  className={`font-black text-[9px] sm:text-[10px] uppercase px-2 py-0.5 rounded block w-fit mb-2 ${themeConfig.accentBadge}`}
                >
                  {card.tag || `STEP 0${idx + 1}`}
                </span>
                <h4
                  className={`font-black ${themeConfig.textPrimary} ${
                    isThumb ? 'text-[8.5px] line-clamp-1' : 'text-xs sm:text-sm mb-1.5'
                  }`}
                >
                  {card.title}
                </h4>
                <p
                  className={`leading-relaxed ${themeConfig.textSecondary} ${
                    isThumb ? 'text-[7px] line-clamp-3' : 'text-xs text-slate-200'
                  }`}
                >
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'comparison_table': {
      const tableData = slide.content.table;
      if (!tableData || !tableData.headers || tableData.headers.length === 0) {
        return null;
      }
      return (
        <div className={`h-full overflow-hidden rounded-xl border border-white/15 shadow-sm ${themeConfig.cardBgClass}`}>
          <table className="w-full h-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {tableData.headers.map((h, idx) => (
                  <th
                    key={idx}
                    className={`font-black text-white px-2.5 sm:px-4 py-2 ${
                      isThumb ? 'text-[8px]' : 'text-xs sm:text-sm'
                    } ${idx === 1 ? 'text-indigo-300 bg-indigo-500/10' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 ${themeConfig.textSecondary} ${
                        isThumb ? 'text-[7px]' : 'text-xs'
                      } ${cIdx === 0 ? 'font-bold text-white' : ''} ${
                        cIdx === 1 ? 'font-black text-indigo-300 bg-indigo-500/5' : 'text-slate-300'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'conclusion_call_to_action': {
      const bullets = slide.content.bulletPoints || [];
      return (
        <div className={`rounded-xl p-4 sm:p-8 flex flex-col justify-center h-full ${themeConfig.cardBgClass} border border-amber-400/30 shadow-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className={`w-5 h-5 ${themeConfig.accentClass}`} />
            <span className={`font-black text-xs uppercase tracking-wider ${themeConfig.accentClass}`}>
              THE ASK & ACTION PLAN
            </span>
          </div>
          <h3
            className={`font-black text-white ${
              isThumb ? 'text-[10px]' : 'text-lg sm:text-2xl mb-4'
            }`}
          >
            {slide.keyTakeaway || slide.title}
          </h3>
          <ul className={`space-y-2.5 ${themeConfig.textSecondary} ${isThumb ? 'text-[7.5px]' : 'text-sm'}`}>
            {bullets.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-200 font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case 'section_header': {
      return (
        <div className="flex flex-col justify-center items-start h-full pl-2">
          {slide.category && (
            <span className={`text-xs font-black tracking-widest uppercase mb-2 ${themeConfig.accentClass}`}>
              {slide.category}
            </span>
          )}
          <h2
            className={`font-black tracking-tight text-white ${
              isThumb ? 'text-xs' : 'text-3xl sm:text-4xl md:text-5xl'
            }`}
          >
            {slide.title}
          </h2>
          {(slide.subtitle || slide.keyTakeaway) && (
            <p className={`mt-3 text-slate-300 ${isThumb ? 'text-[8px]' : 'text-base max-w-2xl'}`}>
              {slide.subtitle || slide.keyTakeaway}
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
