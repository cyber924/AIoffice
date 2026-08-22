export type ExcelTemplateType =
  | 'monthly_sales_report' // 월별 매출 보고서 (User Request Essential)
  | 'financial_pl_forecast' // 3개년 추정 손익계산서
  | 'b2b_sales_pipeline' // B2B 영업 파이프라인 & 성과
  | 'project_wbs_budget' // 프로젝트 WBS 일정 및 투입 예산
  | 'payroll_calculator' // 급여 대장 및 4대보험 산출
  | 'inventory_stock_eoq' // 안전재고 및 수불부
  | 'marketing_roas_tracker' // 마케팅 채널별 ROAS 정산
  | 'custom_spreadsheet'; // 맞춤형 자유 양식

export interface ExcelCellData {
  value: string | number | boolean | null;
  formula?: string; // e.g. "=SUM(C4:C15)" or "=C4*(1-D4)"
  format?: 'currency_krw' | 'currency_usd' | 'percent' | 'number' | 'date' | 'text';
  isBold?: boolean;
  align?: 'left' | 'center' | 'right';
  bgColor?: string; // HEX e.g. "#F3F4F6", "#EEF2FF"
  textColor?: string;
}

export interface ExcelRowData {
  rowNumber: number;
  cells: (ExcelCellData | string | number | null)[];
  isHeader?: boolean;
  isTotal?: boolean;
  rowHeight?: number;
}

export interface ExcelColumnDef {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: 'currency_krw' | 'currency_usd' | 'percent' | 'number' | 'date' | 'text';
}

export interface ExcelSheetData {
  id: string;
  name: string;
  description?: string;
  columns: ExcelColumnDef[];
  rows: ExcelRowData[];
  freezeHeader?: boolean;
  chartSuggestion?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    title: string;
    xAxisKey: string;
    dataKeys: { key: string; name: string; color: string }[];
  };
}

export interface ExcelKpiSummary {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  iconName?: string;
}

export interface ExcelDocument {
  id: string;
  title: string;
  subtitle?: string;
  company?: string;
  templateType: ExcelTemplateType;
  currency: 'KRW' | 'USD';
  period?: string;
  executiveSummary?: string;
  kpis: ExcelKpiSummary[];
  sheets: ExcelSheetData[];
  chartData?: any[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    sheetCount: number;
  };
}

export interface ExcelInputForm {
  templateType: ExcelTemplateType;
  title: string;
  companyName?: string;
  period?: string;
  currency?: 'KRW' | 'USD';
  businessDescription: string;
  keyMetricsToInclude?: string;
  numberOfMonths?: number;
}
