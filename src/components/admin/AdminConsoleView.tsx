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
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'users';

interface AdminConsoleViewProps {
  stats: AdminOverviewStats;
  serviceShares: ServiceShareItem[];
  dailyTrends: DailyTrendItem[];
  industryTops: IndustryTopItem[];
  recentLogs: AdminActivityLog[];
  userList: AdminUserData[];
  onBackToApp: () => void;
  onRefreshData?: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  stats,
  serviceShares,
  dailyTrends,
  industryTops,
  recentLogs,
  userList,
  onBackToApp,
  onRefreshData,
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
        ) : (
          <AdminUserManagement users={userList} />
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
