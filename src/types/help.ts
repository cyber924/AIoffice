export interface HelpContent {
  id: string;
  type: 'announcement' | 'faq' | 'manual';
  title: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}
