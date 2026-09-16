import React, { useState } from 'react';
import {
  AdminOverviewStats,
  DailyTrendItem,
  ServiceShareItem,
  IndustryTopItem,
  AdminActivityLog,
  AdminUserData,
} from '../../types/admin';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminDocumentManagement } from './AdminDocumentManagement';
import { AdminImageAssetManagement } from './AdminImageAssetManagement';
import { AdminKnowledgeHub } from './AdminKnowledgeHub';
import { AdminMarketManagement } from './AdminMarketManagement';
import { AdminServiceManagement } from './AdminServiceManagement';
import { GeneratedDocument } from '../../types/document';
import { PresentationDocument } from '../../types/presentation';
import { ExcelDocument } from '../../types/excel';
import { BusinessFormDocument } from '../../types/formStudio';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Database,
  ArrowLeft,
  Sparkles,
  Server,
  Cpu,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
  BookOpen,
  ShoppingBag,
  Megaphone,
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'users' | 'documents' | 'market' | 'images' | 'knowledge' | 'service';

interface AdminConsoleViewProps {
  stats: AdminOverviewStats;
  serviceShares: ServiceShareItem[];
  dailyTrends: DailyTrendItem[];
  industryTops: IndustryTopItem[];
  recentLogs: AdminActivityLog[];
  userList: AdminUserData[];
  documents: GeneratedDocument[];
  presentations: PresentationDocument[];
  excels: ExcelDocument[];
  forms: BusinessFormDocument[];
  onBackToApp: () => void;
  onRefreshData?: () => void;
  onEditDocument: (doc: GeneratedDocument) => void;
  onDeleteDocument: (id: string) => Promise<void>;
  onEditPresentation: (pres: PresentationDocument) => void;
  onDeletePresentation: (id: string) => Promise<void>;
  onEditExcel: (excel: ExcelDocument) => void;
  onDeleteExcel: (id: string) => Promise<void>;
  onEditForm: (form: BusinessFormDocument) => void;
  onDeleteForm: (userId: string, id: string) => Promise<void>;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  stats,
  serviceShares,
  dailyTrends,
  industryTops,
  recentLogs,
  userList,
  documents,
  presentations,
  excels,
  forms,
  onBackToApp,
  onRefreshData,
  onEditDocument,
  onDeleteDocument,
  onEditPresentation,
  onDeletePresentation,
  onEditExcel,
  onDeleteExcel,
  onEditForm,
  onDeleteForm,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshData) {
      onRefreshData();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand & Return */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToApp}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>메인 앱으로 돌아가기</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                    Super Admin Console
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono font-bold">
                    v2.5 Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  전체 지표 현황 및 회원 통합 관리 시스템
                </p>
              </div>
            </div>
          </div>

          {/* Right: System Status & Refresh */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Gemini 2.5 API :</span>
              <span className="font-bold text-emerald-400">Online 100%</span>
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="데이터 새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Sub Header / Tab Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>종합 통합 대시보드</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>사용자 관리</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {userList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span>통합 문서함 관리</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {documents.length + presentations.length + excels.length + forms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'market'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>마켓플레이스 관리</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              HOT
            </span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'images'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>이미지 에셋 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'knowledge'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>지식허브 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'service'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <span>서비스 도움말 관리</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <AdminDashboardOverview
            stats={stats}
            serviceShares={serviceShares}
            dailyTrends={dailyTrends}
            industryTops={industryTops}
            recentLogs={recentLogs}
          />
        ) : activeTab === 'users' ? (
          <AdminUserManagement users={userList} />
        ) : activeTab === 'documents' ? (
          <AdminDocumentManagement
            documents={documents}
            presentations={presentations}
            excels={excels}
            forms={forms}
            onEditDocument={onEditDocument}
            onDeleteDocument={onDeleteDocument}
            onEditPresentation={onEditPresentation}
            onDeletePresentation={onDeletePresentation}
            onEditExcel={onEditExcel}
            onDeleteExcel={onDeleteExcel}
            onEditForm={onEditForm}
            onDeleteForm={onDeleteForm}
          />
        ) : activeTab === 'market' ? (
          <AdminMarketManagement />
        ) : activeTab === 'images' ? (
          <AdminImageAssetManagement />
        ) : activeTab === 'knowledge' ? (
          <AdminKnowledgeHub />
        ) : (
          <AdminServiceManagement />
        )}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>최고 관리자 전용 보안 콘솔 (Cyber924 Admin System)</span>
          <span className="font-mono text-[11px] text-slate-400">
            Node / Cloud Run / Firestore Realtime Sync Active
          </span>
        </div>
      </footer>
    </div>
  );
};
