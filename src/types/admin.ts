export interface AdminOverviewStats {
  totalUsers: number;
  activeTodayUsers: number;
  totalAiCalls: number;
  aiSuccessRate: number;
  totalDocuments: number;
  totalPresentations: number;
  totalExcelSheets: number;
  totalForms: number;
  totalCreatedAll: number;
  estimatedTokens: number;
  avgResponseTimeMs: number;
}

export interface ServiceShareItem {
  name: string;
  count: number;
  percent: number;
  color: string;
}

export interface DailyTrendItem {
  date: string;
  documents: number;
  presentations: number;
  excel: number;
  forms: number;
  total: number;
  aiCalls: number;
}

export interface IndustryTopItem {
  field: string;
  count: number;
  sharePercent: number;
}

export interface AdminActivityLog {
  id: string;
  type: 'doc' | 'ppt' | 'excel' | 'form';
  title: string;
  userEmailMasked: string;
  timestamp: number;
  status: 'success' | 'warning' | 'error';
  tokenUsage?: number;
}

export interface AdminUserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'super_admin' | 'user';
  createdAt: number;
  lastActiveAt: number;
  docCount: number;
  pptCount: number;
  excelCount: number;
  formCount: number;
  totalCreated: number;
  status: 'active' | 'suspended';
}
