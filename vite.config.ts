import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { Type } from '@google/genai';
import { generateWithFallback, extractJsonFromResponse, chatWithDocumentAgent } from './src/server/geminiGenerator';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Health endpoint
        if (req.url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            service: 'Domain-Specific Professional Document Generator',
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // Collect request body
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = body ? JSON.parse(body) : {};
            const apiKey = process.env.GEMINI_API_KEY || '';

            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' }));
              return;
            }

            if (req.url === '/api/generate-document' && req.method === 'POST') {
              const {
                field,
                customField,
                documentType,
                customDocumentType,
                topic,
                purpose,
                targetAudience,
                professionalLevel,
                length,
                keywords = [],
                additionalRequirements,
              } = data;

              const fieldName = customField || field;
              const docTypeName = customDocumentType || documentType;
              const keywordsStr = keywords.length > 0 ? keywords.join(', ') : '핵심 도메인 키워드 자동 추출';

              const systemInstruction = `당신은 맥킨지, BCG, 글로벌 테크 기업 및 전문 연구기관 출신의 최고 전문 문서 작성 컨설턴트입니다.
사용자가 요청한 분야(${fieldName})와 문서 유형(${docTypeName})에 특화된 대한민국 최고 수준의 전문 비즈니스/기술 문서를 작성해야 합니다.

[작성 원칙]
1. 단순한 블로그나 개괄적 글이 아닌, 실제 이사회 보고, 고객사 제출, 투자 유치, 개발 착수에 사용 가능한 '고품질 전문 문서' 형식이어야 합니다.
2. 각 섹션 내용은 서술식 문장뿐만 아니라 명확한 소제목, 불릿 포인트, 정량적 KPI/데이터 표(Markdown Table), 핵심 체크리스트, 단계별 액션 플랜을 포함해야 합니다.
3. 문서의 톤앤매너는 대상 독자(${targetAudience || '전문가'})와 전문성 수준(${professionalLevel || '실무자'})에 완벽히 맞추어야 합니다.
4. 문서는 한국어로 정중하고 격식 있는 비즈니스 문체(개조식 및 정형 비즈니스 어조)로 작성합니다.
5. 반드시 요청된 JSON 스키마를 엄격히 준수하여 응답하십시오.`;

              const prompt = `[문서 생성 요청 사항]
- 적용 분야: ${fieldName}
- 문서 유형: ${docTypeName}
- 문서 주제: ${topic}
- 문서 작성 목적: ${purpose || '해당 분야의 체계적인 전략 및 실행 방안 수립'}
- 대상 독자: ${targetAudience || '해당 분야 실무진 및 의사결정권자'}
- 전문성 수준: ${professionalLevel}
- 문서 분량: ${length}
- 핵심 강조 키워드: ${keywordsStr}
- 추가 요구사항: ${additionalRequirements || '전문적이고 실질적인 비즈니스 포맷 준수'}

위 요구사항을 바탕으로 깊이 있고 완성도 높은 전문 문서를 설계하고 작성해 주세요.`;

              const generatedJsonText = await generateWithFallback(apiKey, {
                systemInstruction,
                prompt,
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: '문서의 공식 메인 제목' },
                    subtitle: { type: Type.STRING, description: '문서의 부제목 또는 핵심 슬로건' },
                    executiveSummary: { type: Type.STRING, description: '경영진 요약 (Executive Summary - 3~4개 핵심 단락과 핵심 시사점)' },
                    tableOfContents: {
                      type: Type.ARRAY,
                      description: '목차 리스트',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          sectionNumber: { type: Type.STRING, description: '예: 1.0, 2.1, 제1장 등' },
                          title: { type: Type.STRING, description: '섹션 제목' },
                        },
                        required: ['sectionNumber', 'title'],
                      },
                    },
                    sections: {
                      type: Type.ARRAY,
                      description: '각 목차별 심층 전문 콘텐츠',
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          sectionNumber: { type: Type.STRING, description: '목차와 일치하는 섹션 번호' },
                          title: { type: Type.STRING, description: '섹션 제목' },
                          summaryGuideline: { type: Type.STRING, description: '해당 섹션의 핵심 요지 1줄' },
                          content: {
                            type: Type.STRING,
                            description: '섹션의 상세 내용 (Markdown 형식: 표, 소제목(###), 불릿 포인트, 정량 지표, 실행 방안 포함)',
                          },
                        },
                        required: ['sectionNumber', 'title', 'content'],
                      },
                    },
                    conclusion: { type: Type.STRING, description: '종합 결론 및 향후 추진 로드맵 제언' },
                  },
                  required: ['title', 'executiveSummary', 'tableOfContents', 'sections'],
                },
              });

              const parsed = extractJsonFromResponse(generatedJsonText) || JSON.parse(generatedJsonText || '{}');
              const now = Date.now();
              const sectionsWithIds = (parsed.sections || []).map((sec: any, idx: number) => ({
                id: `sec-${idx + 1}-${Math.random().toString(36).substr(2, 6)}`,
                sectionNumber: sec.sectionNumber || `${idx + 1}.0`,
                title: sec.title || `섹션 ${idx + 1}`,
                summaryGuideline: sec.summaryGuideline || '',
                content: sec.content || '',
              }));

              const tocWithIds = (parsed.tableOfContents || sectionsWithIds).map((toc: any, idx: number) => {
                const matchedSec = sectionsWithIds[idx];
                return {
                  id: matchedSec ? matchedSec.id : `toc-${idx + 1}`,
                  sectionNumber: toc.sectionNumber || `${idx + 1}.0`,
                  title: toc.title || `섹션 ${idx + 1}`,
                };
              });

              const fullContent = [
                parsed.title,
                parsed.subtitle,
                parsed.executiveSummary,
                ...sectionsWithIds.map((s: any) => s.title + ' ' + s.content),
                parsed.conclusion,
              ].filter(Boolean).join('\n\n');

              const charCount = fullContent.length;
              const wordCount = fullContent.split(/\s+/).filter(Boolean).length;
              const estimatedReadTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

              const finalDoc = {
                id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
                title: parsed.title || topic,
                subtitle: parsed.subtitle || '',
                executiveSummary: parsed.executiveSummary || '',
                field,
                customField,
                documentType,
                customDocumentType,
                purpose,
                targetAudience,
                professionalLevel,
                length,
                keywords,
                tableOfContents: tocWithIds,
                sections: sectionsWithIds,
                conclusion: parsed.conclusion || '',
                metadata: {
                  createdAt: now,
                  updatedAt: now,
                  wordCount,
                  charCount,
                  estimatedReadTimeMinutes,
                  version: 1,
                  isStarred: false,
                  tags: [fieldName, docTypeName, ...(keywords || [])].slice(0, 5),
                },
              };

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, document: finalDoc }));
              return;
            }

            if (req.url === '/api/generate-section' && req.method === 'POST') {
              const {
                docTitle,
                field,
                documentType,
                sectionNumber,
                sectionTitle,
                existingContent,
                instruction,
                tone,
              } = data;

              const prompt = `[전문 문서 개별 섹션 재작성/보강 요청]
- 전체 문서 제목: ${docTitle}
- 문서 분야 및 유형: ${field} / ${documentType}
- 섹션 번호 및 제목: ${sectionNumber} ${sectionTitle}
- 기존 내용:
${existingContent || '(신규 작성)'}

- 개선 요구사항:
${instruction || '더 상세한 실무 데이터, 구체적 예시, 표(Table), 단계별 체크리스트를 포함하여 전문성을 높여 재작성해 주세요.'}
- 요청 톤앤매너: ${tone || '전문적이고 논리적인 비즈니스 문체'}

위 섹션의 내용만을 Markdown 형식으로 상세히 작성해 주세요. (소제목 ###, 표, 불릿 포인트 적극 활용)`;

              const sectionText = await generateWithFallback(apiKey, {
                prompt,
                temperature: 0.7,
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, content: sectionText || '' }));
              return;
            }

            if (req.url === '/api/agent/chat' && req.method === 'POST') {
              const { messages = [], currentContext } = data;
              const reply = await chatWithDocumentAgent(apiKey, messages, currentContext);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, reply }));
              return;
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not Found' }));
          } catch (err: any) {
            console.error('API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || '서버 오류가 발생했습니다.' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
