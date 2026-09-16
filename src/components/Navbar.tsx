import React, { useState } from 'react';
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  FolderArchive,
  LayoutTemplate,
  Bot,
  Plus,
  LogIn,
  LogOut,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin } from '../constants/adminConfig';

export type AppMode = 'intro' | 'doc_generator' | 'presentation_generator' | 'excel_generator' | 'form_studio' | 'market' | 'admin_console';

interface NavbarProps {
  savedCount: number;
  savedPresCount?: number;
  savedExcelCount?: number;
  savedFormCount?: number;
  appMode: AppMode;
  onSelectAppMode: (mode: AppMode) => void;
  onOpenTemplates: () => void;
  onOpenAgent: () => void;
  onOpenSavedDocs: () => void;
  onOpenSavedPresentations?: () => void;
  onOpenSavedExcel?: () => void;
  onOpenSavedForms?: () => void;
  onNewDocument: () => void;
  onOpenAuthModal: () => void;
  currentView: 'form' | 'viewer';
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  savedPresCount = 0,
  savedExcelCount = 0,
  savedFormCount = 0,
  appMode,
  onSelectAppMode,
  onOpenTemplates,
  onOpenAgent,
  onOpenSavedDocs,
  onOpenSavedPresentations,
  onOpenSavedExcel,
  onOpenSavedForms,
  onNewDocument,
  onOpenAuthModal,
  currentView,
}) => {
  const { currentUser, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand & Mode Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto min-w-max">
          <div
            id="nav-brand-logo"
            onClick={onNewDocument}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors shrink-0 ${
                appMode === 'intro'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 group-hover:from-indigo-700 group-hover:to-purple-700'
                  : appMode === 'form_studio'
                  ? 'bg-amber-600 group-hover:bg-amber-700'
                  : appMode === 'excel_generator'
                  ? 'bg-emerald-600 group-hover:bg-emerald-700'
                  : appMode === 'presentation_generator'
                  ? 'bg-indigo-600 group-hover:bg-indigo-700'
                  : 'bg-slate-800 group-hover:bg-slate-900'
              }`}
            >
              {appMode === 'intro' ? (
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              ) : appMode === 'form_studio' ? (
                <FileText className="w-4 h-4 text-white" />
              ) : appMode === 'excel_generator' ? (
                <FileSpreadsheet className="w-4 h-4" />
              ) : appMode === 'presentation_generator' ? (
                <Presentation className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight whitespace-nowrap">
                워크젠 AI
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold tracking-tight uppercase shrink-0 border border-slate-200">
                SaaS
              </span>
            </div>
          </div>

          {/* Mode Switch Tabs (Intro, Doc, PPT, Excel, Form, Market) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => onSelectAppMode('intro')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'intro'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>소개</span>
            </button>

            <button
              onClick={() => onSelectAppMode('doc_generator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'doc_generator'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>전문 문서</span>
            </button>

            <button
              onClick={() => onSelectAppMode('presentation_generator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'presentation_generator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>전문 PPT</span>
            </button>

            <button
              onClick={() => onSelectAppMode('excel_generator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'excel_generator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>전문 엑셀</span>
            </button>

            <button
              onClick={() => onSelectAppMode('form_studio')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'form_studio'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>전문 양식</span>
            </button>

            <button
              id="nav-btn-market"
              onClick={() => onSelectAppMode('market')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                appMode === 'market'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs ring-1 ring-purple-400/40'
                  : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span>마켓</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white leading-tight animate-pulse">
                HOT
              </span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Template Gallery (in Doc mode) */}
          {appMode === 'doc_generator' && (
            <button
              id="nav-btn-templates"
              onClick={onOpenTemplates}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LayoutTemplate className="w-4 h-4 text-slate-500 shrink-0" />
              <span>템플릿</span>
            </button>
          )}

          {/* AI Document Expert Agent */}
          <button
            id="nav-btn-agent"
            onClick={onOpenAgent}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs group whitespace-nowrap"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </div>
            <span>AI 에이전트</span>
          </button>

          {/* Saved Storage (Document / Presentation / Excel / Form) */}
          {appMode === 'form_studio' ? (
            <button
              id="nav-btn-saved-forms"
              onClick={onOpenSavedForms}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span>양식 보관함</span>
              {savedFormCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] font-bold rounded-full">
                  {savedFormCount}
                </span>
              )}
            </button>
          ) : appMode === 'excel_generator' ? (
            <button
              id="nav-btn-saved-excel"
              onClick={onOpenSavedExcel}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>엑셀 보관함</span>
              {savedExcelCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                  {savedExcelCount}
                </span>
              )}
            </button>
          ) : appMode === 'presentation_generator' ? (
            <button
              id="nav-btn-saved-presentations"
              onClick={onOpenSavedPresentations}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Presentation className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>PPT 보관함</span>
              {savedPresCount > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                  {savedPresCount}
                </span>
              )}
            </button>
          ) : (
            <button
              id="nav-btn-saved-docs"
              onClick={onOpenSavedDocs}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FolderArchive className="w-4 h-4 text-slate-500 shrink-0" />
              <span>문서 보관함</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Menu (Visible only to authorized admin account: cyber924@naver.com) */}
          {isUserAdmin(currentUser?.email) && (
            <button
              id="nav-btn-admin-console"
              onClick={() => onSelectAppMode('admin_console')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                appMode === 'admin_console'
                  ? 'bg-slate-900 text-amber-300 border border-slate-700 shadow-md ring-2 ring-amber-400/40'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 border border-amber-300/80'
              }`}
              title="최고 관리자 전용 콘솔 (cyber924@naver.com)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>관리자</span>
              <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-500 text-slate-950 leading-tight">
                ADMIN
              </span>
            </button>
          )}

          {/* Auth Button or User Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                id="nav-btn-user-profile"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer text-left whitespace-nowrap"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-5.5 h-5.5 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-5.5 h-5.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700 max-w-[80px] sm:max-w-[100px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </button>

              {/* Dropdown */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {currentUser.displayName || '사용자'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>클라우드 동기화 켜짐</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              id="nav-btn-login"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}

          {/* New Document / Presentation Action Button */}
          {currentView === 'viewer' && (
            <button
              id="nav-btn-new-item"
              onClick={onNewDocument}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{appMode === 'presentation_generator' ? '새 PPT 작성' : '새 문서 작성'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

