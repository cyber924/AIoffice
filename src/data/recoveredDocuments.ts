import { GeneratedDocument } from '../types/document';
import { PresentationDocument } from '../types/presentation';
import { ExcelDocument } from '../types/excel';
import { BusinessFormDocument } from '../types/formStudio';
import { RECOVERED_OLD_MARKET_ITEMS } from './recoveredOldDbMarket';

export const RECOVERED_SAVED_DOCUMENTS: GeneratedDocument[] = RECOVERED_OLD_MARKET_ITEMS
  .filter((i) => i.productType === 'doc' && i.contentData)
  .map((i) => {
    const d = i.contentData;
    return {
      id: d.id || i.id,
      title: d.title || i.title,
      subtitle: d.subtitle || i.subtitle || '',
      field: d.field || 'management',
      customField: d.customField || '',
      documentType: d.documentType || 'proposal',
      customDocumentType: d.customDocumentType || '',
      purpose: d.purpose || i.summary || '',
      targetAudience: d.targetAudience || '',
      professionalLevel: d.professionalLevel || 'practitioner',
      length: d.length || 'standard',
      keywords: d.keywords || i.tags || [],
      executiveSummary: d.executiveSummary || i.summary || '',
      sections: d.sections || [],
      tableOfContents: d.tableOfContents || [],
      conclusion: d.conclusion || '',
      metadata: d.metadata || {
        createdAt: i.createdAt || Date.now(),
        updatedAt: i.updatedAt || Date.now(),
        wordCount: 1500,
        charCount: 4500,
        estimatedReadTimeMinutes: 5,
        version: 1,
        isStarred: true,
      },
    } as GeneratedDocument;
  });

export const RECOVERED_SAVED_PRESENTATIONS: PresentationDocument[] = RECOVERED_OLD_MARKET_ITEMS
  .filter((i) => i.productType === 'presentation' && i.contentData)
  .map((i) => {
    const d = i.contentData;
    return {
      id: d.id || i.id,
      title: d.title || i.title,
      subtitle: d.subtitle || i.subtitle || '',
      company: d.company || 'Enterprise AI WorkGen',
      author: d.author || 'WorkGen AI Solution Architect',
      field: d.field || 'management',
      presentationType: d.presentationType || 'ir_pitch',
      targetAudience: d.targetAudience || '투자 심사역 및 엔젤/VC',
      theme: d.theme || 'dark_navy',
      slides: d.slides || [],
      metadata: d.metadata || {
        createdAt: i.createdAt || Date.now(),
        updatedAt: i.updatedAt || Date.now(),
        slideCount: d.slides?.length || 10,
      },
    } as PresentationDocument;
  });

export const RECOVERED_SAVED_EXCELS: ExcelDocument[] = RECOVERED_OLD_MARKET_ITEMS
  .filter((i) => i.productType === 'excel' && i.contentData)
  .map((i) => {
    const d = i.contentData;
    return {
      id: d.id || i.id,
      title: d.title || i.title,
      subtitle: d.subtitle || i.subtitle || '',
      templateType: d.templateType || 'financial_forecast',
      company: d.company || '(주)글로벌 이노베이션',
      period: d.period || '2026',
      currency: d.currency || 'KRW',
      executiveSummary: d.executiveSummary || i.summary || '',
      kpis: d.kpis || [],
      sheets: d.sheets || [],
      chartData: d.chartData,
      metadata: d.metadata || {
        createdAt: i.createdAt || Date.now(),
        updatedAt: i.updatedAt || Date.now(),
      },
    } as ExcelDocument;
  });

export const RECOVERED_SAVED_FORMS: BusinessFormDocument[] = RECOVERED_OLD_MARKET_ITEMS
  .filter((i) => i.productType === 'form_studio' && i.contentData)
  .map((i) => {
    const d = i.contentData;
    return {
      id: d.id || i.id,
      title: d.title || i.title,
      formType: d.formType || 'proposal',
      docNumber: d.docNumber || 'DOC-2026-001',
      draftDate: d.draftDate || '2026-03-15',
      effectiveDate: d.effectiveDate || '2026-03-15',
      drafter: d.drafter || '이동원 수석 PM',
      recipient: d.recipient || '경영기획본부 및 대외 협력처',
      approvalLine: d.approvalLine || [],
      sections: d.sections || [],
      totalAmountNumber: d.totalAmountNumber || 0,
      totalAmountText: d.totalAmountText || '',
      supplyAmount: d.supplyAmount || 0,
      taxAmount: d.taxAmount || 0,
      specialTerms: d.specialTerms || '',
      metadata: d.metadata || {
        createdAt: i.createdAt || Date.now(),
        updatedAt: i.updatedAt || Date.now(),
      },
    } as BusinessFormDocument;
  });
