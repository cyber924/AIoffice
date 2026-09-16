import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Presentation,
  FileSpreadsheet,
  Bot,
  ArrowRight,
  CheckCircle2,
  ArrowRightLeft,
  Download,
  Share2,
  Briefcase,
  Layers,
  Database,
  BookOpen,
  Users,
  Check,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  FileCode,
  FolderHeart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppMode } from './Navbar';

interface IntroPageProps {
  onSelectAppMode: (mode: AppMode) => void;
  onOpenAgent: () => void;
  onOpenAuthModal: () => void;
  onApplyPreset: (preset: any, autoGenerate?: boolean) => void;
}

type RoleType = 'sales' | 'shopping' | 'admin' | 'startup' | 'educator';

export const IntroPage: React.FC<IntroPageProps> = ({
  onSelectAppMode,
  onOpenAgent,
  onOpenAuthModal,
  onApplyPreset,
}) => {
  const [promptInput, setPromptInput] = useState('2026년 상반기 사업계획서와 발표용 PPT를 만들어줘');
  const [simulationState, setSimulationState] = useState<'idle' | 'analyzing' | 'generating' | 'completed'>('idle');
  const [activeRole, setActiveRole] = useState<RoleType>('sales');
  const [activeTab, setActiveTab] = useState<'doc' | 'ppt' | 'excel' | 'form'>('doc');

  // Hero section auto simulation on mount
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setSimulationState('analyzing');
    }, 1500);

    const timer2 = setTimeout(() => {
      setSimulationState('generating');
    }, 3500);

    const timer3 = setTimeout(() => {
      setSimulationState('completed');
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleRestartSimulation = () => {
    setSimulationState('analyzing');
    const timer2 = setTimeout(() => {
      setSimulationState('generating');
    }, 2000);
    const timer3 = setTimeout(() => {
      setSimulationState('completed');
    }, 5500);
  };

  // Preset data mapping for fast start in workspace
  const handleQuickCreate = (type: 'doc' | 'presentation' | 'excel' | 'form_studio', title: string) => {
    let defaultData: any = {};
    if (type === 'doc') {
      defaultData = {
        topic: title,
        documentType: 'report',
        field: 'management',
        tone: 'formal',
        sectionsCount: 4,
        includeTable: true,
        includeChart: true,
      };
    } else if (type === 'presentation') {
      defaultData = {
        topic: title,
        subtitle: '워크젠 AI가 추천하는 최적의 사업 계획',
        theme: 'dark_navy',
        slidesCount: 6,
        targetAudience: 'investor',
      };
    } else if (type === 'excel') {
      defaultData = {
        title: title,
        company: '워크젠 코퍼레이션',
        sheetsCount: 3,
        includeCharts: true,
        complexity: 'expert',
      };
    } else if (type === 'form_studio') {
      defaultData = {
        title: title,
        docNumber: 'WZ-2026-0901',
        sender: '경영지원본부',
        recipient: '임직원 일동',
      };
    }

    onApplyPreset({
      productType: type,
      defaultData,
    }, true);
  };

  return (
    <div className="bg-slate-50 text-slate-900 pb-20">
      {/* 2. 메인 히어로 영역 */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 bg-linear-to-b from-white via-slate-50 to-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute top-60 -left-20 w-[400px] h-[400px] rounded-full bg-purple-200/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                <span>기업의 모든 업무를 하나의 AI 워크스페이스로</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
                  AI 협업을 통해 전문적이고, <br className="hidden sm:inline" />
                  내용이 충실한 문서를 생성하고 <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-indigo-650 via-indigo-700 to-purple-650 bg-clip-text text-transparent">
                    빠르게 업무를 처리하세요
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  AI 에이전트가 문서를 평가하여 수정 및 보완을 통해 당신의 비즈니스를 완성하세요.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onOpenAgent}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm sm:text-base hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-5 h-5 text-indigo-200" />
                  <span>AI에게 업무 요청하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#templates-section"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm sm:text-base border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>템플릿 살펴보기</span>
                </a>
              </div>

              {/* Service metrics */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>MS 오피스(.docx, .pptx, .xlsx) 완벽 연동</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>실시간 클라우드 자동 동기화</span>
                </div>
              </div>
            </div>

            {/* Right Simulation Interface */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative group">
                {/* Header Window Bar */}
                <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 tracking-wider">WORKZEN-AGENT-VM.sh</span>
                  <button
                    onClick={handleRestartSimulation}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/10 cursor-pointer transition-colors"
                  >
                    데모 다시보기
                  </button>
                </div>

                {/* Prompt Bar */}
                <div className="p-4 bg-slate-950/50 border-b border-slate-800/60">
                  <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800">
                    <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {promptInput}
                    </span>
                    <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500 text-white animate-pulse">
                      AGENT
                    </span>
                  </div>
                </div>

                {/* Simulation Output Body */}
                <div className="p-5 sm:p-6 space-y-6 min-h-[300px] flex flex-col justify-between">
                  {/* Status Indicator */}
                  <div>
                    <AnimatePresence mode="wait">
                      {simulationState === 'analyzing' && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>요청 의도 및 패키지 구조 분석 중...</span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-amber-500 rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: '40%' }}
                              transition={{ duration: 1.5 }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            - 1단계: 마켓 인사이트 및 사업계획 구조 수립 <br />
                            - 2단계: 핵심 재무 엑셀 모델 양식 생성 계획 매핑
                          </p>
                        </motion.div>
                      )}

                      {simulationState === 'generating' && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                            <span>스마트 에이전트 문서 연결 생성 중...</span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-indigo-500 rounded-full"
                              initial={{ width: '40%' }}
                              animate={{ width: '85%' }}
                              transition={{ duration: 3.5 }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            - Word 사업계획서 템플릿 실시간 채우기 진행 <br />
                            - 기획안 기반 발표용 PPT 슬라이드 레이아웃 오토포커스
                          </p>
                        </motion.div>
                      )}

                      {simulationState === 'completed' && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>연결된 오피스 워크스페이스 생성 성공</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            단 한 번의 스마트 프롬프트로 4가지 상호 연동 결과물이 완성되었습니다.
                          </p>
                        </motion.div>
                      )}

                      {simulationState === 'idle' && (
                        <div className="text-xs text-slate-500 text-center py-8">
                          로딩 완료 후 가상 시뮬레이션이 자동으로 실행됩니다.
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Generated File list */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        name: '사업계획서.docx',
                        type: 'doc',
                        desc: '정규 목차 및 마켓분석',
                        color: 'border-blue-500/35 bg-blue-950/20 text-blue-300',
                        icon: <FileText className="w-5 h-5 text-blue-400" />,
                        mode: 'doc_generator' as AppMode
                      },
                      {
                        name: '발표자료.pptx',
                        type: 'presentation',
                        desc: '6슬라이드 프리미엄 테마',
                        color: 'border-indigo-500/35 bg-indigo-950/20 text-indigo-300',
                        icon: <Presentation className="w-5 h-5 text-indigo-400" />,
                        mode: 'presentation_generator' as AppMode
                      },
                      {
                        name: '예산계획.xlsx',
                        type: 'excel',
                        desc: '자동 수식 재무 대시보드',
                        color: 'border-emerald-500/35 bg-emerald-950/20 text-emerald-300',
                        icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
                        mode: 'excel_generator' as AppMode
                      },
                      {
                        name: '결재요청서.docx',
                        type: 'form_studio',
                        desc: '표준 공문서 및 결재 양식',
                        color: 'border-amber-500/35 bg-amber-950/20 text-amber-300',
                        icon: <FileText className="w-5 h-5 text-amber-400 animate-pulse" />,
                        mode: 'form_studio' as AppMode
                      }
                    ].map((file, idx) => {
                      const isVisible =
                        simulationState === 'completed' ||
                        (simulationState === 'generating' && idx < 2) ||
                        (simulationState === 'analyzing' && idx < 1);

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (simulationState === 'completed') {
                              handleQuickCreate(file.type as any, file.name.replace(/\.[^/.]+$/, ''));
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isVisible
                              ? `${file.color} cursor-pointer hover:scale-[1.02] shadow-md hover:border-white/20`
                              : 'opacity-15 border-slate-800 bg-slate-950/20 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-slate-950/40">{file.icon}</div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black truncate">{file.name}</h4>
                              <p className="text-[9px] text-slate-400 mt-0.5 truncate">{file.desc}</p>
                            </div>
                          </div>
                          {isVisible && (
                            <div className="mt-2.5 flex items-center justify-between text-[9px] font-black font-mono">
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> READY
                              </span>
                              <span className="text-slate-400 hover:text-white transition-colors">편집하러 가기 &rarr;</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 핵심 기능 소개 */}
      <section className="py-12 sm:py-14 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-10">
            <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase">ALL-IN-ONE WORKSPACE</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              필요한 모든 업무 결과물을 한곳에서
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              더 이상 개별 도구를 찾아 헤매지 마세요. 워크젠 AI 하나로 모든 비즈니스 결과물을 즉시 생성합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'AI 전문 문서',
                desc: '보고서, 제안서, 사업계획서, 계약서, 공문',
                detail: '체계적인 목차 구성과 심층 분석을 결합하여, 다운로드 후 즉시 제출 가능한 수준의 고품질 워드 리포트를 자동으로 조율합니다.',
                mode: 'doc_generator' as AppMode,
                color: 'border-indigo-100 bg-indigo-50/20 hover:border-indigo-300',
                icon: <FileText className="w-5 h-5 text-indigo-600" />
              },
              {
                title: 'AI 프레젠테이션',
                desc: '발표자료, 회사소개서, 교육자료, IR 자료',
                detail: '선택한 목적에 따른 테마와 구조화된 슬라이드 덱을 구축합니다. 장표별 맞춤 레이아웃과 요약이 즉시 반영되어 빠른 피칭에 제격입니다.',
                mode: 'presentation_generator' as AppMode,
                color: 'border-purple-100 bg-purple-50/20 hover:border-purple-300',
                icon: <Presentation className="w-5 h-5 text-purple-600" />
              },
              {
                title: 'AI 스프레드시트',
                desc: '데이터 정리, 수식 작성, 분석, 차트, 매출 보고',
                detail: '복잡한 비즈니스 데이터 모델을 직관적인 표와 그래프로 연출합니다. 전문가형 완성도와 실무 맞춤 공식을 활용한 다차원 집계가 가능합니다.',
                mode: 'excel_generator' as AppMode,
                color: 'border-emerald-100 bg-emerald-50/20 hover:border-emerald-300',
                icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              },
              {
                title: 'AI 스마트 양식',
                desc: '품의서, 견적서, 이력서, 업무보고서, 협조전',
                detail: '사내외 행정과 정식 결재에 필요한 공문서 서식을 격식 있고 통일된 표준 형태로 도출합니다. 결재 도장 날인부터 인감 삽입 기능까지 제공합니다.',
                mode: 'form_studio' as AppMode,
                color: 'border-amber-100 bg-amber-50/20 hover:border-amber-300',
                icon: <FileCode className="w-5 h-5 text-amber-600" />
              },
              {
                title: 'AI 업무 에이전트',
                desc: '여러 문서와 데이터를 연결해 업무 전체 수행',
                detail: '단 하나의 지시어로 매출 분석 엑셀, 경영 보고서, 발표 PPT까지 업무 프로세스 전체를 유기적으로 동기화하여 완벽한 시너지를 이끌어냅니다.',
                mode: 'intro' as AppMode,
                color: 'border-rose-100 bg-rose-50/20 hover:border-rose-300',
                icon: <Bot className="w-5 h-5 text-rose-600" />,
                isAgent: true
              },
              {
                title: '템플릿 보관함',
                desc: '기업별 문서와 자주 사용하는 양식 저장 및 재사용',
                detail: '그동안 축적해 둔 양식이나 AI가 빌드한 문서를 개인 보관함에 영구히 저장하고, 언제든 다시 꺼내 최신 데이터로 업데이트 및 복제할 수 있습니다.',
                mode: 'doc_generator' as AppMode,
                color: 'border-slate-200 bg-slate-50/40 hover:border-slate-300',
                icon: <FolderHeart className="w-5 h-5 text-slate-700" />,
                openSaved: true
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-4.5 sm:p-5 rounded-xl border transition-all hover:shadow-lg flex flex-col justify-between ${feature.color}`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-xs border border-slate-100 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{feature.title}</h3>
                    <p className="text-[11px] font-bold text-indigo-700 mt-0.5">{feature.desc}</p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{feature.detail}</p>
                  </div>
                </div>
                <div className="pt-3.5 mt-3.5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (feature.isAgent) {
                        onOpenAgent();
                      } else {
                        onSelectAppMode(feature.mode);
                      }
                    }}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>바로 시작하기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 서비스의 핵심 차별점 */}
      <section className="py-12 sm:py-14 bg-linear-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-10">
            <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase">CORE VALUE</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              단순 생성이 아니라, AI와 함께하는 업무 협업
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              사용자와 상호 교감하고, 파일들을 고리로 엮어 고도화하는 워크젠 만의 스마트 차별화 포인트를 경험하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: '대화하며 완성',
                desc: 'AI가 만든 초안을 보면서 “더 짧게”, “표로 변경”, “매출 데이터를 반영해줘”라고 자유롭게 대화하듯 수정 요청을 보낼 수 있습니다.',
                badge: '피드백 루프',
                color: 'text-indigo-600'
              },
              {
                title: '업무 간 자동 연결',
                desc: '엑셀 스프레드시트에 기입된 대량의 데이터를 AI가 자동 추출 및 인지하여 사업보고서로 만들고, 이를 다시 원클릭으로 정형화된 발표용 PPT로 즉시 변환합니다.',
                badge: '스마트 파이프라인',
                color: 'text-purple-600'
              },
              {
                title: '한국 업무환경 최적화',
                desc: '공문, 품의서, 견적서, 세금계산서, 주간보고서처럼 한국 사내외 비즈니스 절차와 공문서 규격에 알맞는 실무 최적화 형식을 기본으로 보장합니다.',
                badge: '국내 표준 보장',
                color: 'text-amber-600'
              },
              {
                title: '실제 파일로 저장',
                desc: '가상의 텍스트가 아닙니다. Word(.docx), PowerPoint(.pptx), Excel(.xlsx), PDF 등 정식 마이크로소프트 표준 포맷 파일로 안전하게 생성하고 다운로드합니다.',
                badge: '오피스 파일 아웃풋',
                color: 'text-emerald-600'
              }
            ].map((val, idx) => (
              <div key={idx} className="p-4.5 sm:p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs space-y-2 hover:shadow-md transition-all">
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 ${val.color} uppercase tracking-wider`}>
                  {val.badge}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">{val.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 사용 방법 */}
      <section className="py-20 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              말로 요청하면, AI가 업무를 시작합니다
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              자연스러운 대화 요청부터 실제 파일 다운로드까지 간결하고 세련된 5단계 표준 흐름
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
            {/* Steps */}
            {[
              {
                step: '01',
                title: '업무 요청',
                desc: '만들고 싶은 문서나 처리할 비즈니스 업무를 가볍게 입력합니다.'
              },
              {
                step: '02',
                title: '자료 연결',
                desc: '기존 문서 엑셀 파일, 관련 이미지 또는 사내 핵심 정보를 연결해 줍니다.'
              },
              {
                step: '03',
                title: 'AI 작업 수행',
                desc: '스마트 에이전트가 연동된 내용을 분석하여 즉각 목차와 표, 슬라이드를 디자인합니다.'
              },
              {
                step: '04',
                title: '검토 및 수정',
                desc: '뷰어 미리보기에서 실시간 AI 채팅창을 열어 피드백하며 정밀 튜닝합니다.'
              },
              {
                step: '05',
                title: '파일 저장 및 공유',
                desc: '완성된 결과물을 정형 파일 형식으로 로컬 PC에 저장하거나 공유 링크를 발행합니다.'
              }
            ].map((stepObj, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:bg-slate-100/50 transition-colors">
                <div className="space-y-3">
                  <span className="text-3xl font-black font-mono text-indigo-300 block">{stepObj.step}</span>
                  <h3 className="text-base font-black text-slate-950">{stepObj.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{stepObj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 실제 업무 활용 사례 */}
      <section className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">REAL USE CASES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              실제 현업에서는 이렇게 활용하고 있습니다
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              다양한 부서와 비즈니스 정체성에 맞춘 최고 효율의 연결 문서 생성 시나리오
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Roles selector list */}
            <div className="lg:col-span-4 space-y-2.5">
              {[
                { id: 'sales', label: '영업 담당자', icon: '💼', text: '고객사 맞춤형 제안서, 견적서, 발표용 PPT를 원스톱 일괄 빌드' },
                { id: 'shopping', label: '쇼핑몰 운영자', icon: '🛒', text: '주간 매출 엑셀을 기반으로 분석 보고서와 브리핑 자료 동시 제작' },
                { id: 'admin', label: '경영지원 담당자', icon: '📁', text: '사내 품의서, 정기 보고서, 협조전 서식을 신속하고 통일성 있게 도출' },
                { id: 'startup', label: '스타트업 대표', icon: '🚀', text: '사업계획서와 최신 시장분석, IR 투자를 위한 덱을 상호 참조하여 구성' },
                { id: 'educator', label: '교육 담당자', icon: '🎓', text: '강의 기획서, 연계 강의자료, 설문 조사지와 분석 리포트 종합 세트' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as RoleType)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3.5 ${
                    activeRole === role.id
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-500/10'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{role.icon}</span>
                  <div>
                    <h4 className="text-sm font-black">{role.label}</h4>
                    <p className={`text-[11px] mt-1 leading-snug ${activeRole === role.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {role.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Visualizer content for selected role */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <span className="p-3 bg-indigo-50 rounded-2xl text-2xl">
                    {activeRole === 'sales' ? '💼' : activeRole === 'shopping' ? '🛒' : activeRole === 'admin' ? '📁' : activeRole === 'startup' ? '🚀' : '🎓'}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {activeRole === 'sales' && '영업 담당자 시나리오'}
                      {activeRole === 'shopping' && '온라인 쇼핑몰 마스터 시나리오'}
                      {activeRole === 'admin' && '경영기획 및 행정 지원 시나리오'}
                      {activeRole === 'startup' && '벤처/스타트업 고속 성장 시나리오'}
                      {activeRole === 'educator' && '기업 교육 및 학술 강사 시나리오'}
                    </h3>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">상호 관계성이 극대화되는 고밀도 문서 패키지</p>
                  </div>
                </div>

                {/* Scenario details */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-[10px] font-black uppercase text-indigo-700">핵심 연동 과제 및 프롬프트 예문</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 italic">
                      {activeRole === 'sales' && '“공공기관 입찰용 클라우드 보안 제안서와 견적서 양식을 연동해서 작성하고, 미팅 때 발표할 5분짜리 요약 슬라이드를 뽑아줘.”'}
                      {activeRole === 'shopping' && '“지난 분기 패션 카테고리 매출 실적 스프레드시트를 정리하고, 베스트 아이템 3종 분석을 곁들인 경영진 보고서를 같이 생성해줘.”'}
                      {activeRole === 'admin' && '“차세대 사내 임직원 복지제도 개편안을 품의 양식으로 기안하고, 정식 공문서 발송을 위한 협조전도 세트로 같이 만들어줘.”'}
                      {activeRole === 'startup' && '“바이오 헬스케어 비즈니스 사업계획서 문서를 마켓 트렌드 포함하여 완성하고, 엔젤 투자 유치용 IR 피치덱 발표 본문으로 유기적 이관해줘.”'}
                      {activeRole === 'educator' && '“HR 직무 역량 강화 교육을 위한 세부 기획서를 먼저 빌드하고, 교육생 교재 및 강의를 위한 메인 슬라이드와 설문 평가 양식을 완성해줘.”'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-700 block">원스톱 동시 완성 성과물</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeRole === 'sales' && (
                        <>
                          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/10 text-blue-900 text-xs">
                            <span className="font-bold text-blue-600 block mb-1">1. 고객 제안서</span>
                            목차 및 시스템 사양, 보안 인증 내역 Word 문서 완벽화
                          </div>
                          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/10 text-emerald-900 text-xs">
                            <span className="font-bold text-emerald-600 block mb-1">2. 상세 견적서</span>
                            서식 보증 및 규격 수식이 포함된 공식 단가 양식 제공
                          </div>
                          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/10 text-indigo-900 text-xs">
                            <span className="font-bold text-indigo-600 block mb-1">3. 입찰 PT 슬라이드</span>
                            시각 강조 레이아웃으로 간결함과 가독성이 돋보이는 덱
                          </div>
                        </>
                      )}
                      {activeRole === 'shopping' && (
                        <>
                          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/10 text-emerald-900 text-xs">
                            <span className="font-bold text-emerald-600 block mb-1">1. 실적 엑셀 시트</span>
                            월별/품목별 매출 데이터 통합 차트 대시보드 자동 작성
                          </div>
                          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/10 text-blue-900 text-xs">
                            <span className="font-bold text-blue-600 block mb-1">2. 매출 동향 보고서</span>
                            실적 추이와 주요 성장 요인을 객관적으로 정밀 분석한 워드
                          </div>
                          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/10 text-indigo-900 text-xs">
                            <span className="font-bold text-indigo-600 block mb-1">3. 전략 보고 PPT</span>
                            핵심 성과 리캡과 익월 목표 설정을 반영한 프레젠테이션 장표
                          </div>
                        </>
                      )}
                      {activeRole === 'admin' && (
                        <>
                          <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/10 text-amber-900 text-xs">
                            <span className="font-bold text-amber-600 block mb-1">1. 제도 개편 품의서</span>
                            예산 및 복지 개편 내역이 표준 결재 양식으로 안전히 정돈
                          </div>
                          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 text-slate-900 text-xs">
                            <span className="font-bold text-slate-700 block mb-1">2. 정식 공문 협조전</span>
                            유관 부서 배포용 법적 형식 및 공정 서명란이 포함된 행정 양식
                          </div>
                          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/10 text-blue-900 text-xs">
                            <span className="font-bold text-blue-600 block mb-1">3. 시행 계획 보고서</span>
                            복지 대상 범위와 월별 예상 소요 비용을 세분화한 비즈니스 문서
                          </div>
                        </>
                      )}
                      {activeRole === 'startup' && (
                        <>
                          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/10 text-blue-900 text-xs">
                            <span className="font-bold text-blue-600 block mb-1">1. 공식 사업계획서</span>
                            경쟁사 비교, SWOT 분석, 단계별 이정표를 서술형 핵심 정리
                          </div>
                          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/10 text-indigo-900 text-xs">
                            <span className="font-bold text-indigo-600 block mb-1">2. 투자 유치 IR 피치덱</span>
                            투자 심사역 시선을 사로잡는 모던한 프레임워크 템플릿의 슬라이드
                          </div>
                          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/10 text-emerald-900 text-xs">
                            <span className="font-bold text-emerald-600 block mb-1">3. 재무 추정 엑셀 모델</span>
                            3개년 매출 추이와 비용 배분 계획이 포함된 견고한 테이블 모델
                          </div>
                        </>
                      )}
                      {activeRole === 'educator' && (
                        <>
                          <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/10 text-blue-900 text-xs">
                            <span className="font-bold text-blue-600 block mb-1">1. 교육 상세 기획안</span>
                            대상 타겟, 회차별 커리큘럼, 강의 목적이 기술된 세부 제안서
                          </div>
                          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/10 text-indigo-900 text-xs">
                            <span className="font-bold text-indigo-600 block mb-1">2. 시각 교재 강의 PPT</span>
                            풍성한 개념 시각화 도표와 교육 몰입도 높은 구조화된 슬라이드
                          </div>
                          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 text-slate-900 text-xs">
                            <span className="font-bold text-slate-700 block mb-1">3. 연수 만족도 설문</span>
                            피드백 수집 및 품질 보완을 위해 실무자가 즉시 활용 가능한 양식
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (activeRole === 'sales') handleQuickCreate('doc', '클라우드 보안 고객 제안서');
                      else if (activeRole === 'shopping') handleQuickCreate('excel', '종합 쇼핑몰 매출 분석 실적');
                      else if (activeRole === 'admin') handleQuickCreate('form_studio', '임직원 복지제도 개편 품의서');
                      else if (activeRole === 'startup') handleQuickCreate('presentation', '헬스케어 비즈니스 투자 IR 피치덱');
                      else handleQuickCreate('doc', '직무 역량 강화 교육 세부 기획서');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>이 시나리오 템플릿으로 시작하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI 에이전트 강조 영역 */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border-b border-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Context Left */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">NEXT-GEN AI AGENT</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                파일 하나가 아니라, <br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  업무 전체를 맡기세요
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                단순 텍스트 생성기가 아닙니다. 워크젠 AI 스마트 에이전트는 서로 성격이 다른 여러 문서를 논리적 사슬로 자동 묶어 동시 작성하며 비즈니스 프로세스 전체를 자동화합니다.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-amber-400">💬 에이전트 대표 프롬프트 예시</p>
                <p className="text-xs sm:text-sm text-slate-150 font-medium leading-relaxed italic">
                  “지난달 매출 엑셀을 분석해서 경영보고서를 만들고, 회의용 PPT와 다음 달 실행계획표까지 작성해줘.”
                </p>
              </div>
              <button
                onClick={onOpenAgent}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>AI 스마트 에이전트 즉시 대화하기</span>
              </button>
            </div>

            {/* Infographics Diagram Right */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-3xl bg-slate-950/60 border border-white/10 relative overflow-hidden space-y-6">
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <h3 className="text-xs font-black tracking-wider text-slate-400 uppercase relative z-10">AI 업무 추진 에이전트 작업 파이프라인 흐름도</h3>
                
                <div className="space-y-4 relative z-10">
                  {[
                    { title: '매출 분석 엑셀', desc: 'Raw 데이터를 취합하여 다차원 공식 및 시각화 차트 삽입', step: '01' },
                    { title: '경영진 보고서', desc: '엑셀 데이터 인사이트를 근간으로 텍스트 요약 보고서 자동 추출', step: '02' },
                    { title: '회의용 PPT', desc: '보고서 본문 내용을 프리미엄 템플릿 테마 슬라이드로 이관', step: '03' },
                    { title: '다음 달 실행계획표', desc: '달력 형식 및 담당자 배정이 가미된 주간 핵심 태스크 양식 빌드', step: '04' },
                    { title: '업무 요청 양식', desc: '대내외 발송과 기안을 위한 서명 도장란 완비 스마트 공문서 규격화', step: '05' }
                  ].map((flow, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {/* Badge / Line connection */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/80 border border-indigo-400 flex items-center justify-center font-bold text-[10px] text-white z-10 shadow-md">
                          {flow.step}
                        </div>
                        {idx < 4 && <div className="w-0.5 h-10 bg-gradient-to-b from-indigo-500 to-amber-500/50" />}
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-colors flex items-center justify-between">
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-white">{flow.title}</h4>
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{flow.desc}</p>
                        </div>
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">자동 연동</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. 템플릿 영역 */}
      <section id="templates-section" className="py-20 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">READY-TO-USE PRESETS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              가장 빈번하게 쓰이는 분야별 베스트 실무 템플릿
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              클릭 한 번으로 고품질 데이터 프리셋이 자동 주입되어 초고속 생성을 보증합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'management',
                category: '경영·전략',
                title: '상반기 중장기 경영 전략 기획안',
                type: 'doc',
                desc: '회사의 실적 검토 및 신규 추진 과제',
                badge: 'Word 전문 문서',
                badgeStyle: 'bg-blue-50 text-blue-700 border-blue-100'
              },
              {
                id: 'marketing',
                category: '영업·마케팅',
                title: '모바일 서비스 마케팅 제안 피치덱',
                type: 'presentation',
                desc: '시장 분석 및 분기 프로모션 장표',
                badge: '프리미엄 PPT',
                badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-100'
              },
              {
                id: 'hr',
                category: '인사·총무',
                title: '신규 입사자 온보딩 만족도 서식',
                type: 'form_studio',
                desc: '표준 인사 교육 사후 설문지 양식',
                badge: '행정 양식',
                badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100'
              },
              {
                id: 'finance',
                category: '재무·회계',
                title: '연간 연령별 추정 재무 손익 모델',
                type: 'excel',
                desc: '자동 수식 반영 차트 포함 재무 분석',
                badge: '전문 엑셀',
                badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100'
              },
              {
                id: 'shopping',
                category: '쇼핑몰·상품',
                title: '인플루언서 협찬 성과 종합 정산서',
                type: 'excel',
                desc: '쿠폰 매출 기여도 및 마케팅 효율',
                badge: '전문 엑셀',
                badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100'
              },
              {
                id: 'government',
                category: '정부지원사업',
                title: '스타트업 혁신성장 디딤돌 지원 신청서',
                type: 'doc',
                desc: 'SWOT 분석 및 자금 집행 로드맵',
                badge: 'Word 전문 문서',
                badgeStyle: 'bg-blue-50 text-blue-700 border-blue-100'
              },
              {
                id: 'education',
                category: '교육·강의',
                title: 'AI 역량 강화를 위한 임직원 워크숍 장표',
                type: 'presentation',
                desc: '기술 로드맵 및 혁신 과제 실습',
                badge: '프리미엄 PPT',
                badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-100'
              },
              {
                id: 'legal',
                category: '공문·행정 양식',
                title: '기획 부서 협조 및 업무 보고 협조전',
                type: 'form_studio',
                desc: '대외 공무 발신 표준 서명란 포함',
                badge: '행정 양식',
                badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100'
              }
            ].map((tmpl, idx) => (
              <div key={idx} className="group rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-400 p-5 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-400">{tmpl.category}</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${tmpl.badgeStyle}`}>
                      {tmpl.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {tmpl.desc}
                  </p>
                </div>

                {/* Hover actions */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickCreate(tmpl.type as any, tmpl.title)}
                    className="py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer text-center"
                    title="선택된 세부 데이터를 로딩하여 생성창으로 바로 점프합니다."
                  >
                    AI 고속작성
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tmpl.title);
                      alert(`템플릿명 [ ${tmpl.title} ] 복사 완료! 생성 프롬프트에 활용해 보세요.`);
                    }}
                    className="py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer text-center"
                  >
                    제목 복사
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 마지막 CTA */}
      <section className="py-14 sm:py-16 bg-linear-to-b from-slate-50 to-indigo-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              반복 업무는 AI에게, <br className="sm:hidden" /> 중요한 결정은 사람에게
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              지금 워크젠 AI와 함께 첫 번째 업무를 시작해 보세요. <br />
              문서 기획부터 다운로드까지의 완벽한 오피스 혁신 파트너
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base transition-all shadow-md cursor-pointer"
            >
              무료로 시작하기
            </button>
            <button
              onClick={() => alert('워크젠 AI 기업 도입 문의: cyber924@gmail.com\n본 가상 데모 계정을 통해 실무 검증을 진행해 보세요.')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-sm sm:text-base transition-all cursor-pointer"
            >
              기업 도입 문의
            </button>
          </div>

        </div>
      </section>

      {/* 10. 기업 비즈니스 푸터 */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
            {/* Left Brand Column */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight whitespace-nowrap bg-gradient-to-r from-indigo-400 to-purple-450 bg-clip-text text-transparent">
                  워크젠 AI (WorkGen AI)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-black tracking-tight uppercase">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                AI 협업을 기반으로 전문적이고 내용이 충실한 문서를 생성하며 비즈니스 성장을 위한 최적의 오피스 솔루션을 제공합니다.
              </p>
            </div>

            {/* Middle Links Column 1 */}
            <div className="md:col-span-4 space-y-2.5">
              <h4 className="font-bold text-slate-300 text-xs">고객 지원 및 문의</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li>제휴 및 도입 문의: <span className="text-slate-200 hover:underline">cyber924@gmail.com</span></li>
                <li>고객지원 이메일: <span className="text-slate-200 hover:underline">contact@found-ai.co</span></li>
                <li>고객 지원 시간: 평일 09:30 ~ 18:30 (주말/공휴일 휴무)</li>
              </ul>
            </div>

            {/* Middle Links Column 2 */}
            <div className="md:col-span-4 space-y-2.5">
              <h4 className="font-bold text-slate-300 text-xs">서비스 안내</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
                <span className="hover:text-white cursor-pointer transition-colors">이용약관</span>
                <span className="text-slate-700">|</span>
                <span className="font-bold text-slate-200 hover:text-white cursor-pointer transition-colors">개인정보처리방침</span>
                <span className="text-slate-700">|</span>
                <span className="hover:text-white cursor-pointer transition-colors">이메일무단수집거부</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                본 웹사이트는 (주)파운드가 제공하는 인공지능 기반 오피스 생성 및 자동화 솔루션 워크스페이스입니다.
              </p>
            </div>
          </div>

          {/* Business Info Details */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[11px] text-slate-500 leading-relaxed">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span><strong>회사명:</strong> 파운드 (FOUND)</span>
                <span><strong>대표자:</strong> 윤지윤</span>
                <span><strong>사업자등록번호:</strong> 312-88-02456</span>
                <span><strong>통신판매업신고:</strong> 제 2026-서울강남-1025호</span>
              </div>
              <div>
                <span><strong>주소지:</strong> 서울특별시 강남구 테헤란로 411, 12층 (삼성동, 파운드타워)</span>
              </div>
              <p className="text-[10px] text-slate-650 mt-2">
                &copy; 2026 FOUND Inc. All rights reserved. WorkGen AI is powered by Found's generative AI frameworks.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 border border-slate-800 rounded-lg px-3 py-2 bg-slate-950/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>시스템 정상 운영 중</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
