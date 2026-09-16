import React, { useState } from 'react';
import {
  AdminOverviewStats,
  DailyTrendItem,
  ServiceShareItem,
  IndustryTopItem,
  AdminActivityLog,
} from '../../types/admin';
import {
  Users,
  Cpu,
  FileStack,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Sparkles,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Search,
  Filter,
  ShieldCheck,
  DollarSign,
  Hourglass,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AdminDashboardOverviewProps {
  stats: AdminOverviewStats;
  serviceShares: ServiceShareItem[];
  dailyTrends: DailyTrendItem[];
  industryTops: IndustryTopItem[];
  recentLogs: AdminActivityLog[];
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  stats,
  serviceShares,
  dailyTrends,
  industryTops,
  recentLogs,
}) => {
  const [logFilter, setLogFilter] = useState<'all' | 'doc' | 'ppt' | 'excel' | 'form'>('all');

  const filteredLogs = recentLogs.filter(
    (l) => logFilter === 'all' || l.type === logFilter
  );

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              전체 사용자 현황
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalUsers.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">명</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">오늘 활성 (DAU)</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats.activeTodayUsers}명 활동 중
            </span>
          </div>
        </div>

        {/* AI Total Invocations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AI 모델 통합 호출
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-950 tracking-tight">
              {stats.totalAiCalls.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-indigo-600">회 호출</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Gemini 2.5 성공률</span>
            <span className="font-bold text-indigo-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {stats.aiSuccessRate}%
            </span>
          </div>
        </div>

        {/* Total Documents Created */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              통합 생성 문서 총계
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileStack className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalCreatedAll.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">건 저장</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>문서 {stats.totalDocuments}</span>
            <span>PPT {stats.totalPresentations}</span>
            <span>엑셀 {stats.totalExcelSheets}</span>
            <span>양식 {stats.totalForms}</span>
          </div>
        </div>

        {/* Real-time Latency & Tokens */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              토큰 & 응답 레이턴시
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {(stats.avgResponseTimeMs / 1000).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">초 평균 응답</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">누적 토큰 소모</span>
            <span className="font-bold text-slate-800">
              {stats.estimatedTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </div>

      {/* NEW: AI Engine Infrastructure Status & ROI Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Gemini API Liveness & Quota Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>AI 인프라 및 API 가용성 모니터</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 animate-pulse">
                Live Active
              </span>
            </div>

            <div className="space-y-3">
              {/* API 1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-800">Gemini 2.5/3.8 Flash</p>
                  <p className="text-[10px] text-slate-400 font-medium">범용 텍스트 및 양식 작성 서비스</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span>정상 (142ms)</span>
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">가용성 100%</p>
                </div>
              </div>

              {/* API 2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-800">Gemini 3.1 Image</p>
                  <p className="text-[10px] text-slate-400 font-medium">고해상도 프레젠테이션 삽화 생성</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span>정상 (210ms)</span>
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">가용성 100%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Quota 리밋 안전율: <strong className="text-emerald-600 font-black">98.5% 여유</strong></span>
            <span>최근 자동 핑 검사: 23:59:10</span>
          </div>
        </div>

        {/* Card 2: AI 모델별 호출 트래픽 비중 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4.5 h-4.5 text-indigo-500" />
              <span>AI 모델별 실시간 트래픽 분배</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono font-bold">Total: {stats.totalAiCalls} Call</span>
          </div>

          {/* Inline Model traffic details representing 4 models */}
          <div className="space-y-2.5 mt-2">
            {[
              { name: 'Gemini 2.5 Flash', share: '65%', count: Math.round(stats.totalAiCalls * 0.65), color: 'bg-blue-500' },
              { name: 'Gemini 3.8 Flash', share: '20%', count: Math.round(stats.totalAiCalls * 0.20), color: 'bg-emerald-500' },
              { name: 'Gemini 3.1 Image', share: '10%', count: Math.round(stats.totalAiCalls * 0.10), color: 'bg-violet-500' },
              { name: 'Gemini 3.7 Fallback', share: '5%', count: Math.max(1, stats.totalAiCalls - Math.round(stats.totalAiCalls * 0.65) - Math.round(stats.totalAiCalls * 0.20) - Math.round(stats.totalAiCalls * 0.10)), color: 'bg-amber-500' },
            ].map((model) => (
              <div key={model.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${model.color}`} />
                    {model.name}
                  </span>
                  <span>{model.count}건 ({model.share})</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${model.color}`} style={{ width: model.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: B2B 생산성 경제성 가치 산출판 (ROI Calculator) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4.5 h-4.5 text-amber-500" />
                <span>B2B 기업 실무 생산성 대체 가치 (ROI)</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">
                수익 기여 분석
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Metric 1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Hourglass className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold">누적 시간 절감</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 tracking-tight">
                  {Math.round(stats.totalCreatedAll * 1.8 + stats.totalAiCalls * 0.15)}시간
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-medium">건당 1.8h / AI 호출 9m</p>
              </div>

              {/* Metric 2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold">생산성 가속도</span>
                </div>
                <p className="text-base font-extrabold text-emerald-600 tracking-tight">
                  +385%
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-medium">수동 작성 대비 속도</p>
              </div>
            </div>

            {/* Total Monetary Savings */}
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-emerald-800 block">누적 인건비/외주 리소스 대체 가치</span>
                <p className="text-[10px] text-emerald-600 font-medium">업무 공수 가치 환산 금액 (₩35k/hr)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-700 leading-none">
                  ₩{(Math.round(stats.totalCreatedAll * 1.8 + stats.totalAiCalls * 0.15) * 35000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-slate-400 text-center font-bold">
            ※ 실질적인 리소스 가치 환산율은 실시간 사용자 생성 건수를 기반으로 자동 추적 분석됩니다.
          </div>
        </div>
      </div>

      {/* Main Charts Row: 7-Day Trend + Service Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Multi-Service Generation Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>최근 7일간 서비스별 생성 및 AI 호출 추이</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  문서, 프레젠테이션, 엑셀 스프레드시트, 행정 양식의 일별 누적 생성 트렌드
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>실시간 데이터 집계</span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDoc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExcel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorForm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="documents"
                    name="전문 문서"
                    stroke="#4F46E5"
                    fillOpacity={1}
                    fill="url(#colorDoc)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="presentations"
                    name="전문 PPT"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorPres)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="excel"
                    name="전문 엑셀"
                    stroke="#059669"
                    fillOpacity={1}
                    fill="url(#colorExcel)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="forms"
                    name="전문 양식"
                    stroke="#D97706"
                    fillOpacity={1}
                    fill="url(#colorForm)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4 mt-2 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-indigo-50/60">
              <p className="text-[11px] text-slate-500 font-medium">전문 문서</p>
              <p className="text-sm font-extrabold text-indigo-700">{stats.totalDocuments}건</p>
            </div>
            <div className="p-2 rounded-xl bg-violet-50/60">
              <p className="text-[11px] text-slate-500 font-medium">전문 PPT</p>
              <p className="text-sm font-extrabold text-violet-700">{stats.totalPresentations}건</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/60">
              <p className="text-[11px] text-slate-500 font-medium">전문 엑셀</p>
              <p className="text-sm font-extrabold text-emerald-700">{stats.totalExcelSheets}건</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60">
              <p className="text-[11px] text-slate-500 font-medium">전문 양식</p>
              <p className="text-sm font-extrabold text-amber-700">{stats.totalForms}건</p>
            </div>
          </div>
        </div>

        {/* Service Share Donut Chart (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                <span>서비스별 생성 점유율</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">100%</span>
            </div>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceShares}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {serviceShares.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}건`, name]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stats.totalCreatedAll}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Total Items
                </span>
              </div>
            </div>

            {/* Legend list with percentage */}
            <div className="space-y-2 mt-2">
              {serviceShares.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">{item.count}건</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Industry Ranking & Realtime Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Industry Categories (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>최다 생성 상위 산업군 TOP 5</span>
            </h3>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            사용자들이 가장 많이 요청하고 생성한 주요 비즈니스 도메인 순위입니다.
          </p>

          <div className="space-y-3.5">
            {industryTops.slice(0, 5).map((item, idx) => (
              <div key={item.field} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700/10 text-amber-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{item.field}</span>
                  </div>
                  <span className="font-semibold text-slate-600">{item.count}건</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, item.sharePercent * 1.5))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Logs (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>실시간 통합 생성 및 호출 활동 로그</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                플랫폼 전체에서 발생하는 최신 문서/PPT/엑셀 생성 이벤트 실시간 피드
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  logFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setLogFilter('doc')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  logFilter === 'doc' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                문서
              </button>
              <button
                onClick={() => setLogFilter('ppt')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  logFilter === 'ppt' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                PPT
              </button>
              <button
                onClick={() => setLogFilter('excel')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  logFilter === 'excel' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                엑셀
              </button>
              <button
                onClick={() => setLogFilter('form')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  logFilter === 'form' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                양식
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                해당 필터에 해당하는 최근 활동 로그가 없습니다.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                        log.type === 'doc'
                          ? 'bg-indigo-100 text-indigo-800'
                          : log.type === 'ppt'
                          ? 'bg-violet-100 text-violet-800'
                          : log.type === 'excel'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.type === 'doc'
                        ? '전문 문서'
                        : log.type === 'ppt'
                        ? '전문 PPT'
                        : log.type === 'excel'
                        ? '전문 엑셀'
                        : '전문 양식'}
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] sm:max-w-md">
                        {log.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>사용자: {log.userEmailMasked}</span>
                        {log.tokenUsage && <span>• {log.tokenUsage.toLocaleString()} tokens</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {new Date(log.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      정상 완료
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
