import { IndustryField } from './document';

export type PresentationType =
  | 'ir_pitch'
  | 'b2b_proposal'
  | 'business_plan'
  | 'marketing_deck'
  | 'product_launch'
  | 'tech_architecture'
  | 'executive_report'
  | 'policy_brief'
  | 'custom';

export type PresentationThemeId =
  | 'dark_navy'
  | 'tech_indigo'
  | 'emerald_growth'
  | 'creative_coral'
  | 'clean_slate';

export interface ThemeConfig {
  id: PresentationThemeId;
  name: string;
  description: string;
  bgClass: string;
  cardBgClass: string;
  textPrimary: string;
  textSecondary: string;
  accentClass: string;
  accentBadge: string;
  borderClass: string;
  pptxColors: {
    bg: string;
    cardBg: string;
    titleColor: string;
    bodyColor: string;
    accentColor: string;
    secondaryAccent: string;
    border: string;
  };
}

export type SlideLayoutType =
  | 'title'
  | 'section_header'
  | 'bullets_split'
  | 'cards_grid_3'
  | 'cards_grid_4'
  | 'swot_matrix'
  | 'comparison_table'
  | 'timeline_roadmap'
  | 'market_tam_sam_som'
  | 'financial_kpi'
  | 'conclusion_call_to_action';

export interface SlideContent {
  bulletPoints?: string[];
  cards?: {
    title: string;
    subtitle?: string;
    description: string;
    tag?: string;
    icon?: string;
  }[];
  metrics?: {
    value: string;
    label: string;
    change?: string;
    note?: string;
  }[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  timeline?: {
    phase: string;
    title: string;
    period: string;
    details: string[];
  }[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  marketSize?: {
    tam: { title: string; value: string; desc: string };
    sam: { title: string; value: string; desc: string };
    som: { title: string; value: string; desc: string };
  };
}

export interface SlideItem {
  id: string;
  slideNumber: number;
  layout: SlideLayoutType;
  category: string;
  title: string;
  subtitle?: string;
  keyTakeaway?: string;
  content: SlideContent;
  speakerNotes: string;
  imageUrl?: string;
  imageKeywords?: string;
  showImage?: boolean;
  isGenerating?: boolean;
}

export interface PresentationDocument {
  id: string;
  title: string;
  subtitle: string;
  author?: string;
  company?: string;
  field: IndustryField;
  customField?: string;
  presentationType: PresentationType;
  customPresentationType?: string;
  targetAudience: string;
  theme: PresentationThemeId;
  slides: SlideItem[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    slideCount: number;
    isStarred?: boolean;
    tags?: string[];
  };
}

export interface PresentationInputForm {
  field: IndustryField;
  customField?: string;
  presentationType: PresentationType;
  customPresentationType?: string;
  topic: string;
  purpose: string;
  targetAudience: string;
  companyName?: string;
  theme: PresentationThemeId;
  slideCountPreference: number; // 8, 10, 12, 15
  keyPoints?: string;
}

export interface PresentationPreset {
  id: string;
  name: string;
  description: string;
  field: IndustryField;
  presentationType: PresentationType;
  theme: PresentationThemeId;
  iconName: string;
  defaultData: Partial<PresentationInputForm>;
}
