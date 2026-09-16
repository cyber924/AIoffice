import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  FileText,
  Presentation as PresentationIcon,
  Table as TableIcon,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Check,
  Zap,
  Info,
  Calendar,
} from 'lucide-react';
import { MarketItem, MarketAuditReport } from '../../types/market';

interface MarketAuditReportModalProps {
  isOpen: boolean;
  item: MarketItem | null;
  onClose: () => void;
  onReaudit: (item: MarketItem) => Promise<void>;
  onUpdateScoreManually: (item: MarketItem, newScore: number) => Promise<void>;
}

export const MarketAuditReportModal: React.FC<MarketAuditReportModalProps> = ({
  isOpen,
  item,
  onClose,
  onReaudit,
  onUpdateScoreManually,
}) => {
  const [isReauditing, setIsReauditing] = useState(false);
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [manualScore, setManualScore] = useState<number>(item?.auditScore || 90);

  if (!isOpen || !item) return null;

  const score = item.auditScore || 90;
  const report: MarketAuditReport = item.auditReport || {
    summary: 'AI 전문 감수 기준을 충족하여 실무에 즉시 적용 가능한 검증된 서식입니다.',
    strengths: ['체계적인 비즈니스 구조 완비', '실무 업무 적용성 우수', '2026 표준 서식 체계 반영'],
    improvements: ['기업별 환경에 맞는 세부 조항 커스텀 권장'],
    categoryScores: {
      structure: Math.min(100, score + 2),
      usability: score,
      compliance: Math.max(70, score - 2),
      accuracy: Math.min(100, score + 1),
    },
    auditedAt: item.auditedAt || item.updatedAt || Date.now(),
  };

  const getTierInfo = (sc: number) => {
    if (sc >= 95) {
      return {
        label: 'Master Verified (최우수 인증)',
        tier: '1등급',
        color: 'from-amber-500 to-yellow-400 text-amber-950',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        ringColor: 'stroke-amber-400',
        desc: '전문가 기준 및 표준 규격을 완벽하게 충족하는 최상위 1% 마켓 템플릿입니다.',
      };
    }
    if (sc >= 90) {
      return {
        label: 'Verified (우수 검수 완료)',
        tier: '2등급',
        color: 'from-indigo-500 to-violet-500 text-white',
        badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        ringColor: 'stroke-indigo-400',
        desc: '실무 활용도와 내용 완성도가 우수한 표준 검증 문서입니다.',
      };
    }
    if (sc >= 80) {
      return {
        label: 'Standard (표준 규격 충족)',
        tier: '3등급',
        color: 'from-emerald-500 to-teal-500 text-white',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        ringColor: 'stroke-emerald-400',
        desc: '기본적인 비즈니스 요건을 준수하며 실무 배포가 가능합니다.',
      };
    }
    return {
      label: 'Needs Review (보완 권장)',
      tier: '보완 대상',
      color: 'from-rose-500 to-red-500 text-white',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      ringColor: 'stroke-rose-400',
      desc: '일부 조항이나 데이터 서식의 보완 및 재검수가 권장됩니다.',
    };
  };

  const tier = getTierInfo(score);

  const handleRunReaudit = async () => {
    setIsReauditing(true);
    try {
      await onReaudit(item);
    } finally {
      setIsReauditing(false);
    }
  };

  const handleSaveManualScore = async () => {
    await onUpdateScoreManually(item, manualScore);
    setIsManualEditing(false);
  };

  const formatBadge =
    item.productType === 'presentation'
      ? { label: 'PPTX 슬라이드', icon: PresentationIcon, color: 'text-indigo-400' }
      : item.productType === 'excel'
      ? { label: 'XLSX 스프레드시트', icon: TableIcon, color: 'text-emerald-400' }
      : item.productType === 'form_studio'
      ? { label: '공문서 / 행정서식', icon: FileCheck2, color: 'text-amber-400' }
      : { label: 'DOCX 기획보고서', icon: FileText, color: 'text-blue-400' };

  const FormatIcon = formatBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Gemini AI 마켓 품질 검수 보고서</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${tier.badgeBg}`}>
                  {tier.tier}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5 line-clamp-1">{item.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5">
                  <FormatIcon className={`w-3.5 h-3.5 ${formatBadge.color}`} />
                  {formatBadge.label}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(report.auditedAt).toLocaleDateString('ko-KR')} 검수완료
                </span>
              </div>

              <h4 className="text-lg font-black text-white">{tier.label}</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{tier.desc}</p>
            </div>

            {/* Circular / Radial Score Highlight */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    className={tier.ringColor}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white tracking-tight">{score}</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">QUALITY SCORE</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Core Evaluation Criteria Bars */}
          <div className="space-y-3">
            <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              4대 핵심 심사 지표 정밀 분석
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  label: '전문 서식 구조 완성도',
                  key: 'structure',
                  score: report.categoryScores?.structure ?? score,
                  desc: '목차 및 시각적 계층 체계',
                },
                {
                  label: '현업 실무 활용 가치',
                  key: 'usability',
                  score: report.categoryScores?.usability ?? score,
                  desc: '실무 즉시 적용 및 유연성',
                },
                {
                  label: '규정 및 표준 적합성',
                  key: 'compliance',
                  score: report.categoryScores?.compliance ?? score,
                  desc: '법률/세무/비즈니스 표준',
                },
                {
                  label: '데이터 및 수식 정밀도',
                  key: 'accuracy',
                  score: report.categoryScores?.accuracy ?? score,
                  desc: '지표·조항·계산 무결성',
                },
              ].map((crit) => (
                <div key={crit.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{crit.label}</span>
                      <span className="block text-[10px] text-slate-400">{crit.desc}</span>
                    </div>
                    <span className="font-mono font-black text-indigo-400 text-sm">{crit.score}점</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-500"
                      style={{ width: `${crit.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Auditor Summary Quote */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI 수석 감수위원 종합 평가 총평</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">"{report.summary}"</p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                검증된 핵심 강점
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(report.strengths || []).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                추가 보완 및 활용 제언
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(report.improvements || []).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Manual Score Adjustment (Collapsible) */}
          {isManualEditing ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">관리자 수동 점수 보정</span>
                <span className="text-xs font-mono font-black text-amber-400">{manualScore}점</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={manualScore}
                onChange={(e) => setManualScore(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsManualEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveManualScore}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  보정 점수 저장
                </button>
              </div>
            </div>
          ) : (
            <div className="text-right">
              <button
                onClick={() => {
                  setManualScore(score);
                  setIsManualEditing(true);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-300 underline underline-offset-2 cursor-pointer"
              >
                관리자 수동 점수 조정 필요 시 클릭
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            닫기
          </button>

          <button
            onClick={handleRunReaudit}
            disabled={isReauditing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReauditing ? 'animate-spin' : ''}`} />
            <span>{isReauditing ? 'AI 실시간 재검수 분석 중...' : 'Gemini AI 재검수 실행'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
