import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
  FileCheck2,
  BookOpen,
  Compass,
  Layers,
  HelpCircle,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { requestAgentConsultation, AgentChatMessage } from '../services/aiService';
import { DocumentInputForm, IndustryField, DocumentCategoryType } from '../types/document';

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm?: (suggestedData: Partial<DocumentInputForm>) => void;
  currentDocumentTitle?: string;
}

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedForm?: Partial<DocumentInputForm>;
}

const STARTER_PROMPTS = [
  {
    icon: Lightbulb,
    title: '스타트업 IR 피치덱',
    prompt: '초기 스타트업이 시드~시리즈A 투자 유치를 위해 작성하는 IR 피치덱(투자 제안서)의 필수 목차와 VC를 설득하는 핵심 지표(TAM/SAM/SOM, Unit Economics) 작성법을 알려줘.',
  },
  {
    icon: FileCheck2,
    title: 'B2B 수주 제안서',
    prompt: '대기업이나 공공기관 RFP에 대응하여 수주 확률을 높이는 B2B 제안서 작성 공식과 경쟁사 대비 차별화 포인트(USP) 작성 요령을 알려줘.',
  },
  {
    icon: Compass,
    title: 'IT 프로덕트 PRD',
    prompt: '신규 AI/웹 서비스 런칭을 위한 프로덕트 기획서(PRD)의 표준 목차와 개발팀/디자인팀이 바로 이해할 수 있는 기능 명세서(Feature Spec) 작성법을 알려줘.',
  },
  {
    icon: Layers,
    title: '신사업 투자 타당성 보고서',
    prompt: '경영진 및 이사회 보고용 신규 사업 타당성 검토 보고서에서 정량적 수익성(ROI, NPV, 손익분기점 BEP)과 리스크 대응 계획을 작성하는 방법을 알려줘.',
  },
  {
    icon: BookOpen,
    title: '시장조사 & 경쟁사 분석',
    prompt: '글로벌 및 국내 시장 조사 보고서 작성 시 신뢰도 높은 데이터 인용법과 3C, SWOT, 5-Forces 프레임워크를 활용한 경쟁사 분석 작성 가이드를 알려줘.',
  },
  {
    icon: Sparkles,
    title: '내 아이디어로 문서 개요 짜기',
    prompt: '내가 구상하고 있는 사업 아이디어를 말해줄 테니, 가장 적합한 [분야], [문서 유형], [제목], [목차 구조], [핵심 키워드]를 추천하고 문서 생성기에 입력할 수 있게 정리해 줘.',
  },
];

const INITIAL_GREETING: ChatItem = {
  id: 'greeting',
  role: 'assistant',
  content: `### 👋 안녕하세요! AI 문서 전략 수석 컨설턴트입니다.

본 서비스에서 다루는 **16대 전문 도메인**(경영/전략, 마케팅, 광고/PR, 영업/B2B, IT/SW, AI/데이터, 금융/투자, 정책 등) 및 **12가지 전문 문서 유형**(사업계획서, 제안서, PRD, 기술사양서, 시장조사서, IR 덱 등)에 관한 모든 질문에 전문적으로 답변해 드립니다.

#### 💡 다음과 같은 질문을 자유롭게 해보세요:
- **문서 구조 설계:** "이 주제에는 어떤 목차와 논리 프레임워크(MECE, SWOT, 4P)가 가장 효과적인가요?"
- **설득 논리 & KPI:** "투자자나 고객사 의사결정권자를 사로잡는 Executive Summary 작성 요령은?"
- **문서 유형별 실무 팁:** "PRD 기획서와 기술 사양서(Tech Spec)의 차이 및 연계 작성법"
- **맞춤 개요 도출:** "구상 중인 아이디어를 설명하면 최적의 문서 구성과 생성 폼 파라미터를 추천해 드립니다!"`,
  timestamp: Date.now(),
};

const STORAGE_KEY = 'domain_doc_agent_chat_history_v1';

export const AgentChatModal: React.FC<AgentChatModalProps> = ({
  isOpen,
  onClose,
  onApplyToForm,
  currentDocumentTitle,
}) => {
  const [messages, setMessages] = useState<ChatItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [INITIAL_GREETING];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build API messages payload (excluding greeting if it's default)
      const apiMessages: AgentChatMessage[] = newMessages
        .filter(m => m.id !== 'greeting')
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const contextStr = currentDocumentTitle
        ? `사용자가 현재 열람/작성 중인 문서 제목: "${currentDocumentTitle}"`
        : undefined;

      const reply = await requestAgentConsultation(apiMessages, contextStr);

      // Check if the reply suggests structured form parameters
      let detectedForm: Partial<DocumentInputForm> | undefined;
      try {
        // Simple heuristic to extract recommended form values if structured
        const topicMatch = reply.match(/\[추천 주제\]:?\s*([^\n]+)/i) || reply.match(/주제:\s*([^\n]+)/i);
        const purposeMatch = reply.match(/\[추천 목적\]:?\s*([^\n]+)/i) || reply.match(/목적:\s*([^\n]+)/i);
        const audienceMatch = reply.match(/\[대상 독자\]:?\s*([^\n]+)/i) || reply.match(/대상 독자:\s*([^\n]+)/i);

        if (topicMatch) {
          detectedForm = {
            topic: topicMatch[1].trim().replace(/^["']|["']$/g, ''),
            purpose: purposeMatch ? purposeMatch[1].trim().replace(/^["']|["']$/g, '') : undefined,
            targetAudience: audienceMatch ? audienceMatch[1].trim().replace(/^["']|["']$/g, '') : undefined,
          };
        }
      } catch {}

      const assistantMessage: ChatItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        suggestedForm: detectedForm,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatItem = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ 죄송합니다. 응답 생성 중 오류가 발생했습니다: ${error.message || '잠시 후 다시 시도해 주세요.'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (window.confirm('에이전트와의 모든 대화 내역을 초기화하시겠습니까?')) {
      setMessages([INITIAL_GREETING]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="agent-chat-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="agent-chat-modal-container"
        className="relative w-full max-w-4xl h-[92vh] sm:h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  AI 전문 문서 전략 에이전트
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  CHIEF CONSULTANT
                </span>
              </div>
              <p className="text-xs text-slate-300">
                16개 전 도메인 비즈니스·기술 문서 기획, 목차 설계, 설득 전략 전문 자문
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="agent-btn-reset"
              onClick={handleResetChat}
              title="대화 초기화"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">대화 초기화</span>
            </button>
            <button
              id="agent-btn-close"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60 space-y-5">
          {/* Quick Starter Prompts (Show when only initial greeting) */}
          {messages.length <= 1 && (
            <div className="mb-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  자주 묻는 전문가 질문 바로가기
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="text-left p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {/* Header inside bubble */}
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100/30">
                  <span
                    className={`text-[11px] font-semibold ${
                      msg.role === 'user' ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {msg.role === 'user' ? '나의 질문' : '문서 전략 에이전트'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] ${
                        msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                        title="답변 복사"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                {msg.role === 'user' ? (
                  <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-2 prose-headings:font-bold prose-headings:text-slate-900 prose-h3:text-base prose-h4:text-sm prose-p:text-sm prose-ul:my-2 prose-li:text-sm prose-table:text-xs prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-slate-200">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}

                {/* Optional Quick Action: Apply to Generator Form */}
                {msg.suggestedForm && onApplyToForm && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between bg-indigo-50/50 p-3 rounded-xl">
                    <div className="text-xs">
                      <span className="font-bold text-indigo-900 block">
                        💡 추천 설정이 감지되었습니다!
                      </span>
                      <span className="text-slate-600">
                        이 설정으로 바로 새 문서를 작성하시겠습니까?
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onApplyToForm(msg.suggestedForm!);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer flex-shrink-0"
                    >
                      <span>문서 생성기에 적용</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                  나
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  수석 문서 컨설턴트가 최적의 답변을 작성 중입니다...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="문서 작성 방법, 목차 설계, 제안 전략, 수치 산출법 등 무엇이든 질문하세요 (Enter: 전송, Shift+Enter: 줄바꿈)..."
                rows={2}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-11 px-5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">질문하기</span>
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>
              💡 팁: '아이디어 구상 중인데 개요 짜줘'라고 입력하면 바로 생성기에 적용할 수 있는 목차를 추천합니다.
            </span>
            <span className="hidden sm:inline">Gemini 3.7 Flash Pro Consultant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
