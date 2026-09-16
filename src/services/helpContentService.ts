import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { HelpContent } from '../types/help';

const COLLECTION_NAME = 'help_contents';

// Standard high-quality presets for first-load seeding
const DEFAULT_HELP_PRESETS: HelpContent[] = [
  {
    id: 'help-announcement-reset',
    type: 'announcement',
    title: '[공지사항] 대화 초기화 및 8종의 비즈니스 컨설팅 예제 카드 전격 출시!',
    category: '신규 기능',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    content: `### 🚀 워크젠 AI 대화 편의성 및 프롬프트 Onboarding 전격 개선

안녕하세요, 워크젠 AI 운영팀입니다.
사용자 여러분의 더욱 원활한 업무 지식을 돕기 위해 **[대화 초기화]** 및 **[비즈니스 예제 카드]** 기능이 탑재되었습니다!

---

#### 1. 안전한 인라인 대화 초기화 (Conversation Reset)
- 이제 브라우저 경고창이 아닌, 워크젠만의 자체 정돈된 **'인라인 확인창'**을 통해 안전하고 즉각적으로 대화를 비울 수 있습니다.
- 대화 내역이 가득 차 속도가 느려졌거나 새로운 토픽으로 업무를 기획하고 싶을 때 우측 상단의 **[초기화]** 아이콘을 클릭해 보세요.

#### 2. 실무 고도화 전문 예제 카드 8종 도입
- AI 에이전트에게 어떤 질문을 해야 최고의 비즈니스 아웃풋을 얻을 수 있는지 고민이셨나요?
- 대화창 진입 시 바로 활용 가능한 **실무 8대 핵심 도메인 프롬프트 예제**를 제공합니다.
  - *사업 기획, 마케팅 문구, 기술 명세서, 이사회 보고서* 등 실무진의 노하우가 깃든 전문 프롬프트를 원클릭으로 주입하여 업무 생산성을 200% 더 확보해 보세요!

앞으로도 더 나은 서비스를 제공하기 위해 최선을 다하겠습니다.  
감사합니다.`
  },
  {
    id: 'help-manual-get-started',
    type: 'manual',
    title: '[사용 가이드] 워크젠 AI와 함께 첫 번째 업무 스마트하게 시작하기',
    category: '초보자 안내',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    content: `### 💡 문서 기획부터 다운로드까지 완벽한 오피스 혁신 파트너

워크젠 AI는 전문 문서(기획서), 전문 PPT 디자인, 전문 엑셀 자동화, 전문 업무 양식의 네 가지 강력한 도메인을 지원하는 올인원(All-in-One) 인공지능 오피스 생산성 어플리케이션입니다.

---

#### ① 1단계: 업무 아이디어 입력 및 도메인 선택
- 메인 화면의 **비즈니스 제어판**에서 작성하고자 하는 문서의 주제, 핵심 카테고리, 타겟 독자층을 기입하십시오.
- **보고서, 프레젠테이션(PPT), 엑셀 시트, 계약서/양식** 중 원하는 결과물 포맷을 고릅니다.

#### ② 2단계: AI 실시간 지식 허브 및 검수 활용
- 생성 전, **[지식 허브]**를 열어 타겟 도메인 지식(예: 스타트업 정관, NDA 계약 등)을 참조할 수 있습니다.
- 또한 AI가 실시간으로 문법 검수, 규정 준수 적합성을 체크해 오류 없는 문서를 담보합니다.

#### ③ 3단계: 다운로드 및 포맷 내보내기
- 생성된 결과물은 Word(.docx), PPTX, Excel 파일 등으로 원클릭 로컬 저장이 가능합니다.
- 메인 대시보드에서 보관된 기록을 언제든 불러와 재가공할 수 있습니다.`
  },
  {
    id: 'help-manual-excel-generation',
    type: 'manual',
    title: '[사용 가이드] 새로운 엑셀 문서 생성 및 기초 사용법 가이드',
    category: '문서 생성',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    content: `### 📊 새로운 엑셀 문서 생성 및 기초 사용법 가이드

안녕하세요! 새로운 엑셀 문서 생성 및 기초 사용법 가이드에 오신 것을 환영합니다.
이 가이드는 고객님께서 저희 서비스 내에서 엑셀 문서를 손쉽게 생성하고 기본적인 기능을 활용하여 데이터를 효율적으로 관리하실 수 있도록 돕기 위해 마련되었습니다.

이제 복잡한 과정 없이 몇 번의 클릭만으로 전문적인 엑셀 작업을 시작해 보세요!

---

#### 1. 새로운 엑셀 문서 생성하기
새로운 엑셀 문서를 생성하는 방법은 매우 간단합니다. 아래 단계를 따라 진행해 주십시오.

*   **💡 손쉬운 시작**: 고객님의 작업 환경에서 새로운 엑셀 파일을 즉시 만들 수 있습니다.
*   **단계별 절차**:
    1.  **① [파일] 메뉴 선택**: 먼저, 애플리케이션 상단 좌측에 위치한 \`파일\` 메뉴를 클릭해 주십시오.
    2.  **② [새로 만들기] 옵션 선택**: 드롭다운 메뉴에서 \`새로 만들기\` 옵션을 선택합니다.
    3.  **③ [새 통합 문서] 또는 템플릿 선택**: \`새 통합 문서\`를 선택하여 빈 엑셀 파일을 시작하거나, 필요에 따라 제공되는 다양한 템플릿 중 하나를 선택하여 효율적으로 작업할 수 있습니다.

---

#### 2. 기본 데이터 입력 및 편집하기
엑셀 문서가 생성되었다면, 이제 데이터를 입력하고 편집하는 방법을 알아보겠습니다.

*   **✍️ 셀(Cell)에 데이터 입력**: 
    - 원하는 셀(\`A1\`, \`B2\` 등)을 클릭한 후 키보드로 데이터를 입력하고 \`Enter\` 키를 누르면 입력이 완료됩니다.
    - 텍스트, 숫자, 날짜 등 다양한 형식의 데이터를 입력할 수 있습니다.
*   **✏️ 데이터 편집**: 
    - 이미 입력된 데이터를 수정하려면 해당 셀을 \`더블 클릭\`하거나 셀을 선택한 후 \`F2\` 키를 누르십시오.
    - \`복사(Ctrl+C)\`, \`잘라내기(Ctrl+X)\`, \`붙여넣기(Ctrl+V)\` 기능을 활용하여 데이터를 효율적으로 이동하거나 복제할 수 있습니다.
*   **➕ 행/열 추가 및 삭제**: 
    - 원하는 행 번호나 열 문자를 \`우클릭\` 한 후 \`삽입\` 또는 \`삭제\`를 선택하여 손쉽게 구조를 변경할 수 있습니다.

---

#### 3. 워크시트(Sheet) 관리하기
엑셀 문서는 여러 개의 워크시트(Sheet)로 구성될 수 있으며, 이를 효과적으로 관리하는 것이 중요합니다.`
  },
  {
    id: 'help-faq-reset',
    type: 'faq',
    title: 'AI 대화 도중 컨텍스트 초기화는 어떻게 하며 기존 대화는 완전히 삭제되나요?',
    category: '이용 방법',
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    content: `### 📌 대화 내역 초기화 및 개인 정보 보안 처리 안내

**Q. AI 에이전트와 나눈 대화를 완전히 초기화하고 싶습니다. 방법이 무엇인가요?**

**A.** 대화 모달창(Agent Chat Modal)의 우측 상단을 보시면 **휴지통 모양(초기화) 아이콘**이 위치하고 있습니다.
1. 아이콘을 누르면 **"정말 이전 대화 기록을 모두 비우시겠습니까?"** 라는 자체 팝업 UI가 표시됩니다.
2. 초록색 **[초기화 실행]** 버튼을 누르시면 브라우저 로컬 데이터 및 캐싱된 대화가 원클릭으로 정리됩니다.

> **💡 중요 안내:** 대화 초기화는 사용자의 브라우저 내 메모리를 비우는 완전 일회성 프로세스입니다. 개인정보 보호를 위해 서버에 대화 텍스트가 별도로 무기한 보관되지 않으므로 안심하고 초기화하셔도 좋습니다.`
  },
  {
    id: 'help-faq-ppt-generation',
    type: 'faq',
    title: '전문 프레젠테이션(PPT) 디자인 테마 변경 및 슬라이드 재생성 방법',
    category: '문서 생성',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    content: `### 🎨 와이드 헤더 뷰 기반 PPT 슬라이드 고도화 가이드

**Q. AI가 생성한 프레젠테이션의 레이아웃이나 슬라이드 하나를 부분적으로 수정하고 싶습니다.**

**A.** 워크젠 AI는 전체 디자인 테마 일관성을 보증하는 **와이드 히어로 섹션** 구조를 따릅니다.
1. 생성된 프레젠테이션의 각 슬라이드 하단에 위치한 **[이 슬라이드 재생성]** 또는 우측의 **[디자인 세션 편집]** 버튼을 클릭하십시오.
2. 변경할 구체적 요구사항(예: *"핵심 문장을 더 강조하는 3단 카드로 재구성해 줘"*)을 프롬프트로 전달하면, AI가 해당 장표만 지능적으로 디자인 통일성을 깨뜨리지 않고 수정 적용합니다.`
  }
];

/**
 * Fetches all help items. If empty, seeds default help content first.
 */
export async function getHelpContents(): Promise<HelpContent[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    if (snapshot.empty) {
      console.log('[HelpService] Database is empty. Seeding defaults...');
      await Promise.all(
        DEFAULT_HELP_PRESETS.map((preset) => saveHelpContent(preset))
      );
      return [...DEFAULT_HELP_PRESETS].sort((a, b) => b.createdAt - a.createdAt);
    }

    const items: HelpContent[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as HelpContent);
    });

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
  } catch (error) {
    console.error('[HelpService] Failed to fetch items, returning presets:', error);
    return [...DEFAULT_HELP_PRESETS].sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * Saves or updates help content in Firestore.
 */
export async function saveHelpContent(item: Omit<HelpContent, 'createdAt' | 'updatedAt'> & { createdAt?: number, updatedAt?: number }): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, item.id);
    const now = Date.now();
    const payload: Record<string, any> = {
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      category: item.category,
      createdAt: item.createdAt || now,
      updatedAt: now,
    };

    // Remove any undefined keys to prevent Firestore crashes
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    await setDoc(docRef, payload);
    console.log(`[HelpService] Successfully saved help content: ${item.id}`);
  } catch (error) {
    console.error(`[HelpService] Failed to save help content ${item.id}:`, error);
    throw error;
  }
}

/**
 * Deletes help content from Firestore.
 */
export async function deleteHelpContent(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log(`[HelpService] Successfully deleted help content: ${id}`);
  } catch (error) {
    console.error(`[HelpService] Failed to delete help content ${id}:`, error);
    throw error;
  }
}
