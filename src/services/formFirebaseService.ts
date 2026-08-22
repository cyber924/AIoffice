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
