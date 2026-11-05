import { DocumentInputForm, GeneratedDocument } from '../types/document';
import { PresentationInputForm, PresentationDocument, SlideItem } from '../types/presentation';
import { ExcelInputForm, ExcelDocument } from '../types/excel';

export interface GenerateDocResponse {
  success: boolean;
  document?: GeneratedDocument;
  error?: string;
}

export interface GenerateSectionResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface AgentChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

function parseErrorMessage(err: any, status?: number): string {
  const statusPrefix = status ? `[HTTP ${status}] ` : '';

  if (!err) {
    if (status === 404) return `${statusPrefix}API 엔드포인트를 찾을 수 없습니다. (404 Not Found)`;
    if (status === 503) return `${statusPrefix}AI 서버가 혼잡합니다. 잠시 후 다시 시도해 주세요.`;
    if (status === 504) return `${statusPrefix}요청 처리 시간이 초과되었습니다 (60초 타임아웃).`;
    return `${statusPrefix}AI 생성 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`;
  }

  if (typeof err === 'string') {
    if (err.includes('FUNCTION_INVOCATION_FAILED')) {
      return `${statusPrefix}Vercel 서버리스 실행 실패: Vercel Project Settings에서 GEMINI_API_KEY 환경변수가 설정되어 있는지 확인해 주세요.`;
    }
    if (err === 'Not Found' || err.includes('404')) {
      return `${statusPrefix}서버 API 경로를 찾을 수 없습니다. (404 Not Found)`;
    }
    try {
      const parsed = JSON.parse(err);
      if (parsed?.error) {
        const msg = typeof parsed.error === 'string' ? parsed.error : parsed.error.message;
        return `${statusPrefix}${msg}`;
      }
    } catch {}
    return `${statusPrefix}${err}`;
  }

  if (err.message) {
    return parseErrorMessage(err.message, status);
  }

  return `${statusPrefix}서버와 통신 중 오류가 발생했습니다.`;
}

async function safeFetchJson(url: string, options: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const text = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON response (e.g., Vercel Gateway error or HTML)
    throw new Error(parseErrorMessage(text || response.statusText, response.status));
  }

  if (!response.ok || (data && data.success === false)) {
    throw new Error(parseErrorMessage(data?.error || `서버 오류 (${response.status})`, response.status));
  }

  return data;
}

export async function requestDocumentGeneration(
  formData: DocumentInputForm
): Promise<GeneratedDocument> {
  const data = await safeFetchJson('/api/generate-document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!data.document) {
    throw new Error('문서 데이터 생성 결과가 올바르지 않습니다.');
  }

  return data.document;
}

export async function requestSectionRegeneration(params: {
  docTitle: string;
  field: string;
  documentType: string;
  sectionNumber: string;
  sectionTitle: string;
  existingContent: string;
  instruction?: string;
  tone?: string;
}): Promise<string> {
  const data = await safeFetchJson('/api/generate-section', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!data.content) {
    throw new Error('섹션 생성 결과가 비어 있습니다.');
  }

  return data.content;
}

export async function requestAgentConsultation(
  messages: AgentChatMessage[],
  currentContext?: string
): Promise<string> {
  const data = await safeFetchJson('/api/agent/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, currentContext }),
  });

  if (!data.reply) {
    throw new Error('에이전트 답변을 받지 못했습니다.');
  }

  return data.reply;
}

export async function requestPresentationGeneration(
  formData: PresentationInputForm
): Promise<PresentationDocument> {
  const data = await safeFetchJson('/api/generate-presentation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!data.presentation) {
    throw new Error('프레젠테이션 데이터가 올바르게 생성되지 않았습니다.');
  }

  return data.presentation;
}

export async function requestSlideRegeneration(params: {
  presentationTitle: string;
  slide: SlideItem;
  requestedLayout?: string;
  customPrompt?: string;
}): Promise<SlideItem> {
  const data = await safeFetchJson('/api/regenerate-slide', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!data.slide) {
    throw new Error('슬라이드 데이터가 올바르게 반환되지 않았습니다.');
  }

  return data.slide;
}

export async function requestDocumentToPresentation(
  document: GeneratedDocument,
  theme: string = 'dark_navy'
): Promise<PresentationDocument> {
  const data = await safeFetchJson('/api/document-to-presentation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document, theme }),
  });

  if (!data.presentation) {
    throw new Error('PPT 변환 데이터가 올바르게 생성되지 않았습니다.');
  }

  return data.presentation;
}

export async function requestGenerateExcel(
  formData: ExcelInputForm
): Promise<ExcelDocument> {
  const data = await safeFetchJson('/api/generate-excel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!data.document) {
    throw new Error('엑셀 스프레드시트 데이터가 올바르게 생성되지 않았습니다.');
  }

  return data.document;
}

export async function requestAiEditExcel(
  currentDocument: ExcelDocument,
  instructionPrompt: string
): Promise<ExcelDocument> {
  const data = await safeFetchJson('/api/ai-edit-excel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentDocument, instructionPrompt }),
  });

  if (!data.document) {
    throw new Error('AI 엑셀 수정 결과를 받아오지 못했습니다.');
  }

  return data.document;
}

export async function requestGenerateBusinessForm(
  formData: any
): Promise<any> {
  const data = await safeFetchJson('/api/generate-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!data.document) {
    throw new Error('업무 양식 데이터가 올바르게 생성되지 않았습니다.');
  }

  return data.document;
}

export async function requestAiEditBusinessForm(
  currentDocument: any,
  instruction: string
): Promise<any> {
  const data = await safeFetchJson('/api/ai-edit-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentDocument, instruction }),
  });

  if (!data.document) {
    throw new Error('AI 양식 수정 결과를 받아오지 못했습니다.');
  }

  return data.document;
}



