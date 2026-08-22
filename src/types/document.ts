export type IndustryField =
  | 'management'
  | 'marketing'
  | 'advertising'
  | 'sales'
  | 'planning'
  | 'it_tech'
  | 'ai_data'
  | 'finance'
  | 'real_estate'
  | 'education_hr'
  | 'legal'
  | 'policy'
  | 'research'
  | 'manufacturing'
  | 'logistics'
  | 'custom';

export type DocumentCategoryType =
  | 'business_plan'
  | 'proposal'
  | 'prd_planning'
  | 'market_research'
  | 'competitor_analysis'
  | 'marketing_strategy'
  | 'tech_spec'
  | 'executive_report'
  | 'curriculum_guide'
  | 'policy_proposal'
  | 'ir_pitch'
  | 'custom';

export type ProfessionalLevel = 'entry' | 'practitioner' | 'manager' | 'executive' | 'academic';

export type DocumentLength = 'concise' | 'standard' | 'comprehensive';

export interface DocumentInputForm {
  field: IndustryField;
  customField?: string;
  documentType: DocumentCategoryType;
  customDocumentType?: string;
  topic: string;
  purpose: string;
  targetAudience: string;
  professionalLevel: ProfessionalLevel;
  length: DocumentLength;
  keywords: string[];
  additionalRequirements?: string;
}

export interface DocumentSection {
  id: string;
  sectionNumber: string;
  title: string;
  summaryGuideline?: string;
  content: string;
  isGenerating?: boolean;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  subtitle?: string;
  executiveSummary: string;
  field: IndustryField;
  customField?: string;
  documentType: DocumentCategoryType;
  customDocumentType?: string;
  purpose: string;
  targetAudience: string;
  professionalLevel: ProfessionalLevel;
  length: DocumentLength;
  keywords: string[];
  tableOfContents: { sectionNumber: string; title: string; id: string }[];
  sections: DocumentSection[];
  conclusion?: string;
  metadata: {
    createdAt: number;
    updatedAt: number;
    wordCount: number;
    charCount: number;
    estimatedReadTimeMinutes: number;
    version: number;
    isStarred?: boolean;
    tags?: string[];
  };
}

export interface DocumentPreset {
  id: string;
  name: string;
  description: string;
  field: IndustryField;
  documentType: DocumentCategoryType;
  iconName: string;
  hasCompanyCustomizer?: boolean;
  companyPlaceholder?: string;
  defaultData: Partial<DocumentInputForm>;
}

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'outline' | 'sections' | 'polishing' | 'completed' | 'error';
  currentSectionIndex?: number;
  totalSections?: number;
  message?: string;
  error?: string;
}
