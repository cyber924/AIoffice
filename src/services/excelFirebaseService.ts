import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { ExcelDocument } from '../types/excel';
import { RECOVERED_SAVED_EXCELS } from '../data/recoveredDocuments';

const LOCAL_STORAGE_EXCEL_KEY = 'professional_excel_docs_store_v1';

export function getLocalExcelDocuments(): ExcelDocument[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXCEL_KEY);
    if (!raw) {
      if (RECOVERED_SAVED_EXCELS.length > 0) {
        saveLocalExcelDocuments(RECOVERED_SAVED_EXCELS);
        return [...RECOVERED_SAVED_EXCELS];
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      if (RECOVERED_SAVED_EXCELS.length > 0) {
        saveLocalExcelDocuments(RECOVERED_SAVED_EXCELS);
        return [...RECOVERED_SAVED_EXCELS];
      }
    }
    return parsed;
  } catch (e) {
    console.error('Error reading local excel documents:', e);
    return [...RECOVERED_SAVED_EXCELS];
  }
}

export function saveLocalExcelDocuments(docs: ExcelDocument[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_EXCEL_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving local excel documents:', e);
  }
}

export async function saveExcelDocument(excelDoc: ExcelDocument): Promise<void> {
  const localList = getLocalExcelDocuments();
  const index = localList.findIndex((d) => d.id === excelDoc.id);
  if (index >= 0) {
    localList[index] = excelDoc;
  } else {
    localList.unshift(excelDoc);
  }
  saveLocalExcelDocuments(localList);

  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'excel_documents', excelDoc.id);
      await setDoc(docRef, {
        ...excelDoc,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.warn('[Firestore] Failed to save excel document to cloud:', error);
    }
  }
}

export async function fetchAllExcelDocuments(): Promise<ExcelDocument[]> {
  const localList = getLocalExcelDocuments();

  if (auth.currentUser) {
    try {
      const docsRef = collection(db, 'excel_documents');
      const q = query(docsRef, where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const cloudList: ExcelDocument[] = [];
      snapshot.forEach((docSnap) => {
        cloudList.push(docSnap.data() as ExcelDocument);
      });

      // If user cloud excels are empty, seed recovered excels to user's cloud account
      if (cloudList.length === 0 && RECOVERED_SAVED_EXCELS.length > 0) {
        for (const rExcel of RECOVERED_SAVED_EXCELS) {
          try {
            await setDoc(doc(db, 'excel_documents', rExcel.id), {
              ...rExcel,
              userId: auth.currentUser.uid,
              userEmail: auth.currentUser.email || '',
              updatedAt: rExcel.metadata?.updatedAt || Date.now(),
            }, { merge: true });
            cloudList.push(rExcel);
          } catch (e) {
            console.warn('[Firestore] Seed recovered excel failed:', e);
          }
        }
      }

      const map = new Map<string, ExcelDocument>();
      cloudList.forEach((d) => map.set(d.id, d));
      localList.forEach((d) => {
        if (!map.has(d.id)) {
          map.set(d.id, d);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0)
      );
      if (merged.length > 0) {
        saveLocalExcelDocuments(merged);
        return merged;
      }
      return [...RECOVERED_SAVED_EXCELS];
    } catch (error) {
      console.warn('[Firestore] Failed to load cloud excel documents:', error);
      return localList.length > 0 ? localList : [...RECOVERED_SAVED_EXCELS];
    }
  }

  return localList.length > 0
    ? localList.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0))
    : [...RECOVERED_SAVED_EXCELS];
}

export async function deleteExcelDocument(id: string): Promise<void> {
  const localList = getLocalExcelDocuments().filter((d) => d.id !== id);
  saveLocalExcelDocuments(localList);

  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'excel_documents', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('[Firestore] Failed to delete excel document from cloud:', error);
    }
  }
}

export async function fetchAllExcelDocumentsForAdmin(): Promise<ExcelDocument[]> {
  try {
    const docsRef = collection(db, 'excel_documents');
    const snapshot = await getDocs(docsRef);
    const list: ExcelDocument[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        title: data.title || '무제 엑셀',
        sheets: data.sheets || [],
        metadata: data.metadata || {
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        },
      } as any);
    });
    return list.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
  } catch (err) {
    console.error('[Firestore] Error fetching admin excel documents:', err);
    return [];
  }
}
