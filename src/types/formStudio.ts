export type BusinessFormType =
  | 'proposal_approval' // 기안서 / 품의서
  | 'quotation' // 표준 견적서
  | 'tax_invoice' // 전자 세금계산서 양식
  | 'weekly_report' // 주간 / 일일 업무 보고서
  | 'resume_career' // 전문 경력기술서 / 프리미엄 이력서
  | 'official_letter' // 비즈니스 공문 / 업무 협조전
  | 'employment_contract' // 표준 근로계약서 / 용역계약서
  | 'meeting_minutes'; // 공식 이사회 / 주주총회 / 회의록

export interface FormApprovalStep {
  role: string; // e.g. "기안자", "팀장", "본부장", "대표이사"
  name: string; // e.g. "홍길동 대리", "김철수 팀장"
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  date?: string;
  signature?: string; // Stamp label or signature text
}

export interface FormTableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'currency' | 'number' | 'text' | 'date';
}

export interface FormTableRow {
  id: string;
  cells: Record<string, any>;
  isTotal?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'key_value' | 'bullet_list' | 'signature_block' | 'stamp_approval';
  content?: string;
  items?: string[];
  keyValues?: { label: string; value: string; hint?: string }[];
  columns?: FormTableColumn[];
  rows?: FormTableRow[];
  summaryNote?: string;
}

export interface BusinessFormDocument {
  id: string;
  formType: BusinessFormType;
  title: string;
  docNumber?: string; // e.g. "HR-2026-0822"
  draftDate: string; // e.g. "2026년 08월 22일"
  effectiveDate?: string;
  drafter: {
    name: string;
    department?: string;
    position?: string;
    contact?: string;
    email?: string;
  };
  recipient?: {
    company?: string;
    department?: string;
    name?: string;
    contact?: string;
    email?: string;
    businessNumber?: string; // 사업자등록번호
    address?: string;
  };
  supplier?: {
    company: string;
    ceoName: string;
    businessNumber: string;
    address: string;
    businessType?: string; // 업태
    businessItem?: string; // 종목
    contact?: string;
    email?: string;
  };
  approvalLine?: FormApprovalStep[];
  totalAmountText?: string; // e.g. "일천일백만 원정 (VAT 포함)"
  totalAmountNumber?: number; // e.g. 11000000
  supplyAmount?: number; // e.g. 10000000
  taxAmount?: number; // e.g. 1000000
  sections: FormSection[];
  specialTerms?: string[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    isStarred?: boolean;
    templatePreset?: string;
  };
}

export interface BusinessFormInput {
  formType: BusinessFormType;
  title: string;
  drafterName: string;
  drafterDepartment?: string;
  drafterPosition?: string;
  companyName?: string;
  recipientName?: string;
  recipientCompany?: string;
  keyDetails: string;
  totalBudget?: string;
  targetDate?: string;
}
