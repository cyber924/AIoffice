import { BusinessFormDocument } from '../types/formStudio';
import { db, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  collectionGroup,
} from 'firebase/firestore';

const LOCAL_STORAGE_FORMS_KEY = 'domain_doc_generator_saved_forms_v1';

// Local storage fallback
function getLocalForms(): BusinessFormDocument[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FORMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read forms from localStorage', err);
    return [];
  }
}

function setLocalForms(forms: BusinessFormDocument[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_FORMS_KEY, JSON.stringify(forms));
  } catch (err) {
    console.error('Failed to write forms to localStorage', err);
  }
}

export async function saveBusinessForm(formDoc: BusinessFormDocument): Promise<void> {
  const user = auth.currentUser;
  const forms = getLocalForms();
  const existingIdx = forms.findIndex((f) => f.id === formDoc.id);

  if (existingIdx >= 0) {
    forms[existingIdx] = formDoc;
  } else {
    forms.unshift(formDoc);
  }
  setLocalForms(forms);

  if (user && db) {
    try {
      const docRef = doc(db, 'users', user.uid, 'business_forms', formDoc.id);
      await setDoc(docRef, {
        ...formDoc,
        userId: user.uid,
        userEmail: user.email || '',
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Firestore form save failed, kept in local storage:', err);
    }
  }
}

export async function fetchAllBusinessForms(): Promise<BusinessFormDocument[]> {
  const user = auth.currentUser;
  const localForms = getLocalForms();

  if (user && db) {
    try {
      const colRef = collection(db, 'users', user.uid, 'business_forms');
      const snap = await getDocs(colRef);
      const remoteDocs: BusinessFormDocument[] = [];
      snap.forEach((d) => {
        remoteDocs.push(d.data() as BusinessFormDocument);
      });

      if (remoteDocs.length > 0) {
        remoteDocs.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
        return remoteDocs;
      }
    } catch (err) {
      console.warn('Firestore form fetch failed, using local storage:', err);
    }
  }

  return localForms.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
}

export async function deleteBusinessForm(formId: string): Promise<void> {
  const user = auth.currentUser;
  const forms = getLocalForms().filter((f) => f.id !== formId);
  setLocalForms(forms);

  if (user && db) {
    try {
      const docRef = doc(db, 'users', user.uid, 'business_forms', formId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore form delete failed:', err);
    }
  }
}

// Admin function to delete a business form belonging to any user
export async function deleteBusinessFormForAdmin(userId: string, formId: string): Promise<void> {
  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'business_forms', formId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Failed to delete business form for admin:', err);
      throw err;
    }
  }
}

export async function fetchAllBusinessFormsForAdmin(): Promise<BusinessFormDocument[]> {
  if (db) {
    try {
      const groupQuery = collectionGroup(db, 'business_forms');
      const snap = await getDocs(groupQuery);
      const list: BusinessFormDocument[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          userId: data.userId || '',
          userEmail: data.userEmail || '',
          title: data.title || '무제 양식',
          field: data.field || '',
          category: data.category || '',
          formFields: data.formFields || [],
          generatedMarkdown: data.generatedMarkdown || '',
          metadata: data.metadata || {
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          },
        } as any);
      });
      return list.sort((a, b) => (b.metadata?.updatedAt || 0) - (a.metadata?.updatedAt || 0));
    } catch (err) {
      console.error('[Firestore] Error fetching admin business forms:', err);
      return [];
    }
  }
  return [];
}
