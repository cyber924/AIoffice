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

const LOCAL_STORAGE_EXCEL_KEY = 'professional_excel_docs_store_v1';

export function getLocalExcelDocuments(): ExcelDocument[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXCEL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local excel documents:', e);
    return [];
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
      saveLocalExcelDocuments(merged);
      return merged;
    } catch (error) {
      console.warn('[Firestore] Failed to load cloud excel documents:', error);
      return localList;
    }
  }

  return localList.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
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
