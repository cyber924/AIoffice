import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db as newDb, auth as newAuth } from './firebase';
import { DEFAULT_HELP_PRESETS } from './helpContentService';
import { DEFAULT_KNOWLEDGE_PRESETS } from './knowledgeHubService';
import { PRESET_MARKET_ITEMS } from './marketService';
import { RECOVERED_OLD_MARKET_ITEMS } from '../data/recoveredOldDbMarket';
import { DEFAULT_PRESETS as DEFAULT_IMAGE_PRESETS } from './imageAssetService';
import { getLocalDocuments } from './firebaseService';
import { getLocalExcelDocuments } from './excelFirebaseService';
import { getLocalBusinessForms } from './formFirebaseService';

export const OLD_FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0549768744',
  appId: '1:366238703587:web:10e2bb9269c5ae8ac4cad6',
  apiKey: 'AIzaSyDZ1uzVpqz_TgWzI9RG_lWaWHq-7gBw-hM',
  authDomain: 'gen-lang-client-0549768744.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-7e2dd0f2-c8e1-4566-8808-a4469ba64521',
  storageBucket: 'gen-lang-client-0549768744.firebasestorage.app',
  messagingSenderId: '366238703587',
};

// Initialize or get Old DB instance
function getOldDbInstance() {
  const appName = 'oldFirebaseApp';
  let oldApp;
  try {
    oldApp = getApp(appName);
  } catch {
    oldApp = initializeApp(OLD_FIREBASE_CONFIG, appName);
  }
  return getFirestore(oldApp, OLD_FIREBASE_CONFIG.firestoreDatabaseId);
}

export interface MigrationLog {
  collection: string;
  count: number;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  totalMigrated: number;
  logs: MigrationLog[];
  quotaExceeded: boolean;
  message: string;
}

/**
 * Check connectivity and quota state of Old Firebase DB
 */
export async function checkOldDbStatus(): Promise<{
  isQuotaExceeded: boolean;
  canRead: boolean;
  message: string;
}> {
  try {
    const oldDb = getOldDbInstance();
    const snap = await getDocs(collection(oldDb, 'help_contents'));
    return {
      isQuotaExceeded: false,
      canRead: true,
      message: `구(Old) DB 정상 연결됨. (확인된 문서: ${snap.size}개)`,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('Quota limit exceeded') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        isQuotaExceeded: true,
        canRead: false,
        message: '구(Old) DB 일일 무료 조회 한도(50,000 Read Quota) 초과로 구글 클라우드에서 일시 차단된 상태입니다. (한국시간 오전 09시 또는 자정 리셋)',
      };
    }
    return {
      isQuotaExceeded: false,
      canRead: false,
      message: `구 DB 접속 오류: ${msg}`,
    };
  }
}

/**
 * Check connectivity and security rules state of New Firebase DB
 */
export async function checkNewDbStatus(): Promise<{
  connected: boolean;
  rulesConfigured: boolean;
  message: string;
}> {
  try {
    // Try reading test doc
    const snap = await getDocs(collection(newDb, 'market_items'));
    return {
      connected: true,
      rulesConfigured: true,
      message: `신규 DB 정상 가동 중! (조회된 마켓 아이템: ${snap.size}개)`,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      return {
        connected: true,
        rulesConfigured: false,
        message: '신규 DB가 생성되었으나 Firestore 보안 규칙(Rules)이 아직 배포되지 않아 권한 오류가 발생 중입니다. 콘솔에 규칙을 게시해 주세요.',
      };
    }
    return {
      connected: false,
      rulesConfigured: false,
      message: `신규 DB 연결 실패: ${msg}`,
    };
  }
}

/**
 * Direct Migration: Fetch all documents from Old DB and write them to New DB
 */
export async function migrateFromOldDbToNewDb(): Promise<MigrationResult> {
  const oldDb = getOldDbInstance();
  const targetCollections = [
    'help_contents',
    'knowledge_hub',
    'public_images',
    'market_items',
    'documents',
    'presentations',
    'excel_documents',
  ];

  const logs: MigrationLog[] = [];
  let totalMigrated = 0;
  let quotaHit = false;

  for (const colName of targetCollections) {
    try {
      const snap = await getDocs(collection(oldDb, colName));
      let count = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        await setDoc(doc(newDb, colName, docSnap.id), data, { merge: true });
        count++;
        totalMigrated++;
      }

      logs.push({
        collection: colName,
        count,
        status: 'success',
      });
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        quotaHit = true;
        logs.push({
          collection: colName,
          count: 0,
          status: 'failed',
          error: 'Old DB 5만 조회 쿼터 한도 초과로 읽기 거부됨',
        });
        break;
      } else {
        logs.push({
          collection: colName,
          count: 0,
          status: 'failed',
          error: msg,
        });
      }
    }
  }

  if (quotaHit) {
    return {
      success: false,
      totalMigrated,
      logs,
      quotaExceeded: true,
      message: '구 DB의 일일 5만 회 무료 쿼터가 초과되어 구글 서버에서 데이터 반출이 차단되었습니다. 쿼터 리셋 후 다시 시도하거나, 아래의 [초기 데이터 시딩] 및 [로컬 캐시 마이그레이션]을 즉시 실행하세요.',
    };
  }

  return {
    success: true,
    totalMigrated,
    logs,
    quotaExceeded: false,
    message: `총 ${totalMigrated}개의 데이터가 신규 파이어베이스로 완벽하게 마이그레이션되었습니다!`,
  };
}

/**
 * Seed all default presets (Help, Knowledge, Market, Images) into the New DB
 */
export async function seedInitialDataToNewDb(): Promise<{
  success: boolean;
  totalSeeded: number;
  message: string;
}> {
  let totalSeeded = 0;

  try {
    // 1. Connection doc
    await setDoc(doc(newDb, 'test', 'connection'), {
      status: 'active',
      timestamp: Date.now(),
      service: 'WorkGen AI Enterprise',
    });

    // 2. Help contents
    for (const item of DEFAULT_HELP_PRESETS) {
      await setDoc(doc(newDb, 'help_contents', item.id), item, { merge: true });
      totalSeeded++;
    }

    // 3. Knowledge Hub
    for (const item of DEFAULT_KNOWLEDGE_PRESETS) {
      await setDoc(doc(newDb, 'knowledge_hub', item.id), item, { merge: true });
      totalSeeded++;
    }

    // 4. Market Items (Both presets & recovered items from old DB)
    const combinedMarketMap = new Map<string, any>();
    PRESET_MARKET_ITEMS.forEach((it) => combinedMarketMap.set(it.id, it));
    RECOVERED_OLD_MARKET_ITEMS.forEach((it) => combinedMarketMap.set(it.id, it));

    for (const item of combinedMarketMap.values()) {
      await setDoc(doc(newDb, 'market_items', item.id), item, { merge: true });
      totalSeeded++;
    }

    // 5. System Images
    for (const item of DEFAULT_IMAGE_PRESETS) {
      await setDoc(doc(newDb, 'public_images', item.id), item, { merge: true });
      totalSeeded++;
    }

    return {
      success: true,
      totalSeeded,
      message: `총 ${totalSeeded}개의 필수 비즈니스 데이터(공지사항/FAQ, 지식허브, 마켓플레이스, 디자인 에셋)가 신규 DB에 완벽히 구축되었습니다!`,
    };
  } catch (err: any) {
    return {
      success: false,
      totalSeeded,
      message: `시딩 중 오류 발생: ${err.message}`,
    };
  }
}

/**
 * Migrate browser's localStorage cache (documents, presentations, excels, forms) into the New DB
 */
export async function migrateLocalCacheToNewDb(): Promise<{
  success: boolean;
  migratedCount: number;
  message: string;
}> {
  let count = 0;
  const currentUid = newAuth.currentUser?.uid || 'migrated_user';
  const currentEmail = newAuth.currentUser?.email || 'admin@workgen.ai';

  try {
    // 1. Local documents
    const localDocs = getLocalDocuments();
    for (const d of localDocs) {
      await setDoc(doc(newDb, 'documents', d.id), {
        ...d,
        userId: (d as any).userId || currentUid,
        userEmail: (d as any).userEmail || currentEmail,
        updatedAt: d.metadata?.updatedAt || Date.now(),
      }, { merge: true });
      count++;
    }

    // 2. Local presentations
    try {
      const presRaw = localStorage.getItem('professional_presentations_store_v1');
      if (presRaw) {
        const localPres = JSON.parse(presRaw);
        for (const p of localPres) {
          await setDoc(doc(newDb, 'presentations', p.id), {
            ...p,
            userId: (p as any).userId || currentUid,
            userEmail: (p as any).userEmail || currentEmail,
            updatedAt: p.metadata?.updatedAt || Date.now(),
          }, { merge: true });
          count++;
        }
      }
    } catch {}

    // 3. Local excels
    const localExcels = getLocalExcelDocuments();
    for (const e of localExcels) {
      await setDoc(doc(newDb, 'excel_documents', e.id), {
        ...e,
        userId: (e as any).userId || currentUid,
        userEmail: (e as any).userEmail || currentEmail,
        updatedAt: e.metadata?.updatedAt || Date.now(),
      }, { merge: true });
      count++;
    }

    // 4. Local business forms
    const localForms = getLocalBusinessForms();
    for (const f of localForms) {
      await setDoc(doc(newDb, 'users', currentUid, 'business_forms', f.id), {
        ...f,
        userId: currentUid,
        updatedAt: f.metadata?.updatedAt || Date.now(),
      }, { merge: true });
      count++;
    }

    return {
      success: true,
      migratedCount: count,
      message: `브라우저 로컬 스토리지에 보관되어 있던 ${count}개의 문서(기획서, PPT, 엑셀, 양식)가 신규 클라우드 DB로 안전하게 동기화되었습니다!`,
    };
  } catch (err: any) {
    return {
      success: false,
      migratedCount: count,
      message: `로컬 캐시 마이그레이션 오류: ${err.message}`,
    };
  }
}

/**
 * Export all local data and presets as a downloadable JSON backup
 */
export function exportAllDataAsBackupFile() {
  const localDocs = getLocalDocuments();
  let localPres = [];
  try {
    const raw = localStorage.getItem('professional_presentations_store_v1');
    if (raw) localPres = JSON.parse(raw);
  } catch {}
  const localExcels = getLocalExcelDocuments();
  const localForms = getLocalBusinessForms();

  const backupData = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    firebaseTargetProject: 'studio-7279538363-d9e82',
    documents: localDocs,
    presentations: localPres,
    excels: localExcels,
    forms: localForms,
    presetHelp: DEFAULT_HELP_PRESETS,
    presetKnowledge: DEFAULT_KNOWLEDGE_PRESETS,
    presetMarket: PRESET_MARKET_ITEMS,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workgen_ai_database_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
