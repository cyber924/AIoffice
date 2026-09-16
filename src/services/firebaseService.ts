import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { GeneratedDocument } from '../types/document';
import { PresentationDocument } from '../types/presentation';

const LOCAL_STORAGE_KEY = 'professional_documents_store_v2';
const LOCAL_STORAGE_PRES_KEY = 'professional_presentations_store_v1';
const ANONYMOUS_SESSION_KEY = 'doc_gen_anon_session_id';

export function getAnonymousSessionId(): string {
  let sessionId = localStorage.getItem(ANONYMOUS_SESSION_KEY);
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(ANONYMOUS_SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getCurrentUserId(): string {
  return auth.currentUser?.uid || getAnonymousSessionId();
}

export function isUserLoggedIn(): boolean {
  return !!auth.currentUser;
}

// Local storage helpers for immediate responsive caching
export function getLocalDocuments(): GeneratedDocument[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local documents:', e);
    return [];
  }
}

export function saveLocalDocuments(docs: GeneratedDocument[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving local documents:', e);
  }
}

export async function saveDocument(document: GeneratedDocument): Promise<void> {
  // Always update local cache first
  const localDocs = getLocalDocuments();
  const index = localDocs.findIndex(d => d.id === document.id);
  if (index >= 0) {
    localDocs[index] = document;
  } else {
    localDocs.unshift(document);
  }
  saveLocalDocuments(localDocs);

  // If user is authenticated in Firebase, persist to Firestore
  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const userEmail = auth.currentUser.email || '';
    try {
      const docRef = doc(db, 'documents', document.id);
      await setDoc(docRef, {
        id: document.id,
        userId: uid,
        userEmail: userEmail,
        title: document.title,
        subtitle: document.subtitle || '',
        field: document.field,
        customField: document.customField || '',
        documentType: document.documentType,
        customDocumentType: document.customDocumentType || '',
        purpose: document.purpose || '',
        targetAudience: document.targetAudience || '',
        professionalLevel: document.professionalLevel || 'practitioner',
        length: document.length || 'standard',
        keywords: document.keywords || [],
        executiveSummary: document.executiveSummary || '',
        sections: document.sections || [],
        tableOfContents: document.tableOfContents || [],
        conclusion: document.conclusion || '',
        metadata: document.metadata,
        createdAt: document.metadata?.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.warn('[Firestore] Failed to save document to cloud, preserved locally:', error);
    }
  }
}

export async function fetchAllDocuments(): Promise<GeneratedDocument[]> {
  const localDocs = getLocalDocuments();

  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const path = 'documents';
    try {
      const docsRef = collection(db, path);
      const q = query(
        docsRef,
        where('userId', '==', uid),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const cloudDocs: GeneratedDocument[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        cloudDocs.push({
          id: data.id || docSnap.id,
          title: data.title,
          subtitle: data.subtitle,
          field: data.field,
          customField: data.customField,
          documentType: data.documentType,
          customDocumentType: data.customDocumentType,
          purpose: data.purpose || '',
          targetAudience: data.targetAudience || '',
          professionalLevel: data.professionalLevel || 'practitioner',
          length: data.length || 'standard',
          keywords: data.keywords || [],
          executiveSummary: data.executiveSummary || '',
          sections: data.sections || [],
          tableOfContents: data.tableOfContents || [],
          conclusion: data.conclusion || '',
          metadata: data.metadata || {
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
            wordCount: 0,
            charCount: 0,
            estimatedReadTimeMinutes: 1,
            version: 1,
            isStarred: false,
          },
        });
      });

      // Merge cloud documents with local documents
      const map = new Map<string, GeneratedDocument>();
      cloudDocs.forEach(d => map.set(d.id, d));
      localDocs.forEach(d => {
        if (!map.has(d.id)) {
          map.set(d.id, d);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0)
      );
      saveLocalDocuments(merged);
      return merged;
    } catch (error) {
      console.warn('[Firestore] Failed to load cloud documents, using local cache:', error);
      return localDocs;
    }
  }

  return localDocs.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
}

export async function deleteDocument(id: string): Promise<void> {
  const localDocs = getLocalDocuments().filter(d => d.id !== id);
  saveLocalDocuments(localDocs);

  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'documents', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('[Firestore] Failed to delete document from cloud:', error);
    }
  }
}

// ---------------- Presentation CRUD ----------------

export function getLocalPresentations(): PresentationDocument[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local presentations:', e);
    return [];
  }
}

export function saveLocalPresentations(presList: PresentationDocument[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRES_KEY, JSON.stringify(presList));
  } catch (e) {
    console.error('Error saving local presentations:', e);
  }
}

export async function savePresentation(presentation: PresentationDocument): Promise<void> {
  const localList = getLocalPresentations();
  const index = localList.findIndex(p => p.id === presentation.id);
  if (index >= 0) {
    localList[index] = presentation;
  } else {
    localList.unshift(presentation);
  }
  saveLocalPresentations(localList);

  if (auth.currentUser) {
    try {
      const presRef = doc(db, 'presentations', presentation.id);
      await setDoc(
        presRef,
        {
          ...presentation,
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || '',
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('[Firestore] Failed to sync presentation to cloud:', error);
    }
  }
}

export async function fetchAllPresentations(): Promise<PresentationDocument[]> {
  const localList = getLocalPresentations();

  if (auth.currentUser) {
    try {
      const q = query(
        collection(db, 'presentations'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const cloudList: PresentationDocument[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        cloudList.push({
          id: docSnap.id,
          title: data.title || '무제 프레젠테이션',
          subtitle: data.subtitle || '',
          company: data.company || '',
          author: data.author || '',
          field: data.field || 'management',
          presentationType: data.presentationType || 'ir_pitch',
          targetAudience: data.targetAudience || '',
          theme: data.theme || 'dark_navy',
          slides: data.slides || [],
          metadata: data.metadata || {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            slideCount: data.slides?.length || 0,
          },
        });
      });

      const map = new Map<string, PresentationDocument>();
      cloudList.forEach(p => map.set(p.id, p));
      localList.forEach(p => {
        if (!map.has(p.id)) {
          map.set(p.id, p);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0)
      );
      saveLocalPresentations(merged);
      return merged;
    } catch (error) {
      console.warn('[Firestore] Failed to load cloud presentations:', error);
      return localList;
    }
  }

  return localList.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
}

export async function deletePresentation(id: string): Promise<void> {
  const localList = getLocalPresentations().filter(p => p.id !== id);
  saveLocalPresentations(localList);

  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'presentations', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('[Firestore] Failed to delete presentation from cloud:', error);
    }
  }
}

export async function fetchAllDocumentsForAdmin(): Promise<GeneratedDocument[]> {
  try {
    const docsRef = collection(db, 'documents');
    const snapshot = await getDocs(docsRef);
    const list: GeneratedDocument[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: data.id || docSnap.id,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        title: data.title,
        subtitle: data.subtitle,
        field: data.field,
        customField: data.customField,
        documentType: data.documentType,
        customDocumentType: data.customDocumentType,
        purpose: data.purpose || '',
        targetAudience: data.targetAudience || '',
        professionalLevel: data.professionalLevel || 'practitioner',
        length: data.length || 'standard',
        keywords: data.keywords || [],
        executiveSummary: data.executiveSummary || '',
        sections: data.sections || [],
        tableOfContents: data.tableOfContents || [],
        conclusion: data.conclusion || '',
        metadata: data.metadata || {
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          wordCount: 0,
          charCount: 0,
          estimatedReadTimeMinutes: 1,
          version: 1,
          isStarred: false,
        },
      } as any);
    });
    return list.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
  } catch (err) {
    console.error('[Firestore] Error fetching admin documents:', err);
    return [];
  }
}

export async function fetchAllPresentationsForAdmin(): Promise<PresentationDocument[]> {
  try {
    const snapshot = await getDocs(collection(db, 'presentations'));
    const list: PresentationDocument[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        title: data.title || '무제 프레젠테이션',
        subtitle: data.subtitle || '',
        company: data.company || '',
        author: data.author || '',
        field: data.field || 'management',
        presentationType: data.presentationType || 'ir_pitch',
        targetAudience: data.targetAudience || '',
        theme: data.theme || 'dark_navy',
        slides: data.slides || [],
        metadata: data.metadata || {
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
          slideCount: data.slides?.length || 0,
        },
      } as any);
    });
    return list.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
  } catch (err) {
    console.error('[Firestore] Error fetching admin presentations:', err);
    return [];
  }
}


