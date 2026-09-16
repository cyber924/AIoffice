import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface KnowledgeHubItem {
  id: string;
  title: string;
  type: 'fact' | 'knowledge';
  content: string; // Markdown or detailed text
  sourceUrl?: string; // Optional link for "fact" types
  keywords?: string; // Comma-separated search words
  category: string; // 'corporate' | 'legal' | 'trend' | 'marketing' | 'other'
  createdAt: number;
}

// Highly realistic and professional out-of-the-box business templates and news facts
const DEFAULT_KNOWLEDGE_PRESETS: KnowledgeHubItem[] = [
  {
    id: 'kb-corporate-articles',
    title: '스타트업 및 중소기업 설립용 회사 표준 정관',
    type: 'knowledge',
    category: 'corporate',
    keywords: '정관, 법인설립, 회사운영, 주주총회, 이사회',
    createdAt: Date.now() - 10000000,
    content: `## 제 1 장 총 칙

### 제 1 조 (상호)
본 회사는 **주식회사 글로벌 이노베이션** (이하 "회사"라 한다)이라 칭하며, 영문으로는 **Global Innovation Co., Ltd.**라 표기한다.

### 제 2 조 (목적)
본 회사는 다음 각 호의 사업을 영위함을 목적으로 한다.
1. 소프트웨어 개발, 제작, 공급 및 판매업
2. 인공지능(AI) 솔루션 및 데이터 분석 서비스업
3. 정보통신 및 네트워크 관련 하드웨어 개발 및 제조유통업
4. 인터넷 정보 서비스 및 온라인 정보 제공업
5. 위 각 호에 관련되는 부대사업 일체

### 제 3 조 (본점의 소재지 및 지점의 설치)
① 본 회사의 본점은 서울특별시에 둔다.
② 본 회사는 이사회의 결의로 국내외 필요한 곳에 지점, 출장소, 사무소 및 현지법인을 둘 수 있다.

---

## 제 2 장 주 식

### 제 4 조 (발행예정주식의 총수 및 1주의 금액)
① 본 회사가 발행할 주식의 총수는 **10,000,000주**로 한다.
② 본 회사가 발행하는 주식 1주의 금액은 **금 500원**으로 한다.

### 제 5 조 (설립 시에 발행하는 주식의 총수)
본 회사가 설립 시에 발행하는 주식의 총수는 **100,000주**(금 일천만원)로 한다.`
  },
  {
    id: 'kb-legal-nondisclosure',
    title: '기술 유출 및 아이디어 보호를 위한 범용 비밀유지계약서(NDA)',
    type: 'knowledge',
    category: 'legal',
    keywords: 'NDA, 비밀유지, 계약서, 법률, 특허, 정보보호',
    createdAt: Date.now() - 9000000,
    content: `# 비밀유지 계약서 (Non-Disclosure Agreement)

**정보제공자**(이하 "갑"이라 한다)와 **정보수령자**(이하 "을"이라 한다)는 상호 업무협력 및 기술 교류(이하 "목적"이라 한다)를 진행함에 있어, 상대방으로부터 제공받는 비밀정보를 보호하기 위하여 다음과 같이 계약을 체결한다.

### 제 1 조 (목적)
본 계약은 "갑"과 "을"이 업무 협력 가능성을 검토하고 공동 비즈니스를 수행하는 과정에서 제공되는 비밀정보를 한쪽 당사자가 무단으로 사용하는 행위를 방지하고 철저히 기밀로 유지하도록 규정함을 목적으로 한다.

### 제 2 조 (비밀정보의 정의)
"비밀정보"란 본 계약 체결 전후를 막론하고 문서, 구두, 전자적 형태 기타 어떠한 방법으로든 일방 당사자가 상대방에게 제공한 기술상, 영업상의 기밀, 도면, 데이터, 고객 명부, 가격 정책 등을 말하며, 정보 제공 시 '비밀' 또는 'Confidential'이라고 명시된 자료 일체를 포함한다.

### 제 3 조 (비밀유지의무)
① "을"은 "갑"의 서면 동의가 없는 한 수령한 모든 비밀정보를 본 계약상의 목적 이외의 용도로 사용할 수 없으며 제3자에게 누설하여서는 안 된다.
② "을"은 자사 임직원 중 본 목적 수행을 위해 최소한의 범위 내에서만 정보를 제공하여야 하며, 해당 임직원에게 본 계약과 동일한 비밀유지의무를 지워야 한다.`
  },
  {
    id: 'kb-trend-ai-2026',
    title: '2026 정부 정보통신산업(ICT) 육성 기본 계획 분석 요약',
    type: 'fact',
    category: 'trend',
    sourceUrl: 'https://www.msit.go.kr',
    keywords: 'ICT, 정부지원, AI예산, 테크놀로지, 스타트업',
    createdAt: Date.now() - 8000000,
    content: `### [보도요약] 과학기술정보통신부 2026 차세대 AI 원천기술 및 주권 국산화 계획

1. **R&D 초격차 예산 배정**: 
   정부는 2026년 정보통신 및 인공지능 주권 확보를 위해 차세대 원천 알고리즘 개발(Gemini형 대형언어모델 한국어 고도화 연구 포함)에 **총 3.4조 원의 초격차 R&D 예산**을 확정 집행합니다.
   
2. **산업 활성화 바우처**:
   국내 유망 중소 및 스타트업 대상 **'AI 디지털 전환 바우처'** 혜택 기업을 기존 500개 사에서 **1,200개 사**로 대폭 늘려 인프라 사용료의 최대 80%(연 5천만 원 한도)를 보전할 방침입니다.

3. **글로벌 얼라이언스**:
   아시아·태평양 허브로서 초고속 연산 서버 인프라 망을 서울-대전-부산 3대 거점에 추가 개소하여 데이터 분산 클러스터를 가동합니다.`
  },
  {
    id: 'kb-marketing-synergy',
    title: 'B2B 엔터프라이즈 멀티 채널 미디어 믹스 실행 전략 프레임워크',
    type: 'knowledge',
    category: 'marketing',
    keywords: '마케팅, B2B, 웨비나, 미디어믹스, 퍼널',
    createdAt: Date.now() - 7000000,
    content: `## B2B 엔터프라이즈 멀티 채널 미디어 믹스 실행 전략

B2B 비즈니스는 구매 결정 과정이 매우 길고 의사결정권자가 다양하므로, **다각적인 미디어 퍼널 구성**이 필수적입니다.

### 1단계: 인지도 제고 (Top-of-Funnel)
* **목표**: 브랜드 및 핵심 가치 제안(Value Proposition) 노출
* **전략적 채널**: 
  - 링크드인 오피니언 리더십 콘텐츠 연재
  - 산업 특화 보고서 및 백서(Whitepaper) 배포
  - 구글 검색 최적화(SEO)를 통한 전문 칼럼 노출

### 2단계: 신뢰성 구축 및 전환 (Middle-of-Funnel)
* **목표**: 실제 고품질 리드(MQL) 정보 획득 및 관계 개시
* **전략적 채널**:
  - 온라인 라이브 웨비나 정기 개최 (월 1~2회)
  - 실제 대기업 도입 성공사례(Case Study) 및 아키텍처 상세 공개
  - 무료 데모 샌드박스 플레이그라운드 지원`
  }
];

const COLLECTION_NAME = 'knowledge_hub';

/**
 * Fetches all items from the Knowledge Hub. If the DB is empty, seeds default presets first.
 */
export async function getKnowledgeItems(): Promise<KnowledgeHubItem[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    if (snapshot.empty) {
      console.log('[KnowledgeHub] Database is empty. Seeding defaults...');
      await Promise.all(
        DEFAULT_KNOWLEDGE_PRESETS.map((preset) => saveKnowledgeItem(preset))
      );
      return [...DEFAULT_KNOWLEDGE_PRESETS].sort((a, b) => b.createdAt - a.createdAt);
    }

    const items: KnowledgeHubItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as KnowledgeHubItem);
    });

    // Safe in-memory sorting to completely avoid Firestore index requirements
    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
  } catch (error) {
    console.error('[KnowledgeHub] Failed to fetch items, returning default presets:', error);
    return [...DEFAULT_KNOWLEDGE_PRESETS].sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * Saves or updates a knowledge item in Firestore.
 */
export async function saveKnowledgeItem(item: Omit<KnowledgeHubItem, 'createdAt'> & { createdAt?: number }): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, item.id);
    const payload: Record<string, any> = {
      id: item.id,
      title: item.title,
      type: item.type,
      category: item.category,
      content: item.content,
      keywords: item.keywords || '',
      sourceUrl: item.sourceUrl || '',
      createdAt: item.createdAt || Date.now(),
    };

    // Remove any undefined keys to prevent Firestore crashes
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    await setDoc(docRef, payload);
    console.log(`[KnowledgeHub] Successfully saved item: ${item.id}`);
  } catch (error) {
    console.error(`[KnowledgeHub] Failed to save item ${item.id}:`, error);
    throw error;
  }
}

/**
 * Deletes a knowledge item from Firestore.
 */
export async function deleteKnowledgeItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log(`[KnowledgeHub] Successfully deleted item: ${id}`);
  } catch (error) {
    console.error(`[KnowledgeHub] Failed to delete item ${id}:`, error);
    throw error;
  }
}
