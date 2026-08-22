import React, { useState } from 'react';
import { AdminUserData } from '../../types/admin';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  FileText,
  Presentation,
  FileSpreadsheet,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
} from 'lucide-react';

interface AdminUserManagementProps {
  users: AdminUserData[];
  onToggleUserStatus?: (uid: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onToggleUserStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'user'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        user.email.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q) ||
        user.uid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>회원 및 권한 관리 시스템</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            등록된 사용자의 활동 내역, 권한 등급 및 생성 문서 통계를 조회하고 관리합니다.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="이메일, 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              전체 ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('super_admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'super_admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              슈퍼 관리자
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'user' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              일반 회원
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">사용자 프로필</th>
                <th className="py-3.5 px-4">권한 등급</th>
                <th className="py-3.5 px-4 text-center">생성 현황 (문서/PPT/엑셀/양식)</th>
                <th className="py-3.5 px-4">총 생성 수</th>
                <th className="py-3.5 px-4">가입 / 최근 활동</th>
                <th className="py-3.5 px-4">계정 상태</th>
                <th className="py-3.5 px-4 text-right">상세 조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    일치하는 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span>{user.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.role === 'super_admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold text-[11px] border border-indigo-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>슈퍼 관리자</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          <span>일반 회원</span>
                        </span>
                      )}
                    </td>

                    {/* Creation breakdown badges */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-indigo-600" title="전문 문서">
                          문서 {user.docCount}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-violet-600" title="전문 PPT">
                          PPT {user.pptCount}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-emerald-600" title="전문 엑셀">
                          엑셀 {user.excelCount}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-amber-600" title="전문 양식">
                          양식 {user.formCount}
                        </span>
                      </div>
                    </td>

                    {/* Total Count */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                      {user.totalCreated}건
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-[11px] text-slate-700 font-medium">
                        가입: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>
                          최근: {new Date(user.lastActiveAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>정상 활성</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        상세 보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedUser.displayName}
                  </h4>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  selectedUser.role === 'super_admin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedUser.role === 'super_admin' ? '슈퍼 관리자' : '일반 회원'}
              </span>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-2">통합 생성 누적 지표</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500">전문 기획/보고서</span>
                    <p className="text-sm font-bold text-indigo-700">{selectedUser.docCount}건</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500">전문 PPT 슬라이드</span>
                    <p className="text-sm font-bold text-violet-700">{selectedUser.pptCount}건</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500">전문 엑셀 시트</span>
                    <p className="text-sm font-bold text-emerald-700">{selectedUser.excelCount}건</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500">전문 양식/공문서</span>
                    <p className="text-sm font-bold text-amber-700">{selectedUser.formCount}건</p>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">UID:</span>
                  <span className="font-mono">{selectedUser.uid}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">가입 일자:</span>
                  <span>{new Date(selectedUser.createdAt).toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">최근 활동 일자:</span>
                  <span>{new Date(selectedUser.lastActiveAt).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
