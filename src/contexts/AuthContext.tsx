import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '이메일 주소 또는 비밀번호가 일치하지 않습니다.';
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일 주소입니다. 로그인을 시도해 주세요.';
    case 'auth/weak-password':
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    case 'auth/invalid-email':
      return '올바른 이메일 주소 형식을 입력해 주세요.';
    case 'auth/popup-closed-by-user':
      return '구글 로그인 팝업 창이 닫혔습니다.';
    case 'auth/popup-blocked':
      return '브라우저 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.';
    case 'auth/too-many-requests':
      return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결 상태를 확인해 주세요.';
    case 'auth/operation-not-allowed':
      return 'Firebase 콘솔에서 해당 로그인 방식이 활성화되지 않았습니다.';
    default:
      return '인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || '사용자',
          photoURL: user.photoURL || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        await setDoc(
          userRef,
          {
            updatedAt: Date.now(),
            displayName: user.displayName || snap.data().displayName || '',
            photoURL: user.photoURL || snap.data().photoURL || '',
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('[Firebase] Profile sync warning:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setErrorMessage(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code || '');
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    setErrorMessage(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (res.user) {
        if (name && name.trim()) {
          await updateProfile(res.user, { displayName: name.trim() });
        }
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code || '');
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code || '');
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setErrorMessage(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    setErrorMessage(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code || '');
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        errorMessage,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
