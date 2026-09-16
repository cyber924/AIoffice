export type MarketProductType = 'doc' | 'presentation' | 'excel' | 'form_studio';

export interface MarketAuditCategoryScores {
  structure: number; // 전문 서식 구조 완성도 (0-100)
  usability: number; // 현업 실무 활용도 (0-100)
  compliance: number; // 규정 / 법률 / 비즈니스 표준 준수 (0-100)
  accuracy: number; // 데이터 / 수식 / 내용 정밀도 (0-100)
}

export interface MarketAuditReport {
  summary: string;
  strengths: string[];
  improvements: string[];
  categoryScores: MarketAuditCategoryScores;
  auditedAt: number;
}

export interface MarketItem {
  id: string;
  originalDocId: string;
  productType: MarketProductType;
  title: string;
  subtitle?: string;
  summary: string;
  category: string; // e.g. management, marketing, legal, finance, it_tech, hr, startup, etc.
  authorId: string;
  authorName: string;
  authorEmail: string;
  isFree: boolean;
  price: number; // 0 for free, 1000 for paid
  tags: string[];
  contentData: any; // The full document/presentation/excel/form object
  thumbnailKeywords?: string;
  coverGradient?: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  remixCount: number;
  isStaffPick?: boolean;
  // AI Quality Inspection (Audit)
  isAudited?: boolean;
  auditScore?: number; // 0-100 quality score
  auditStatus?: 'master_verified' | 'verified' | 'needs_review';
  auditReport?: MarketAuditReport;
  auditedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type MarketSortOption = 'latest' | 'popular' | 'downloads' | 'staff_pick' | 'audit_score';
export type MarketPriceFilter = 'all' | 'free' | 'paid';

export interface MarketFilterState {
  searchQuery: string;
  productType: 'all' | MarketProductType;
  category: string;
  priceFilter: MarketPriceFilter;
  sortBy: MarketSortOption;
  onlyAudited?: boolean;
}

