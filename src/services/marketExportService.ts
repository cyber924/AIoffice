import { MarketItem } from '../types/market';
import { exportDocToDocx } from './docWordExportService';
import { exportToXlsx } from './excelExportService';
import { exportToPptx } from './pptxExportService';
import { exportFormToDocx } from './formWordExportService';

/**
 * Universal export function for market items that converts each document to its native
 * office file format (.docx, .xlsx, .pptx). Never outputs raw JSON!
 */
export async function downloadMarketItemNativeFile(item: MarketItem): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    switch (item.productType) {
      case 'excel':
        await exportToXlsx(item.contentData);
        return { success: true, filename: `${item.title}.xlsx` };

      case 'presentation':
        await exportToPptx(item.contentData);
        return { success: true, filename: `${item.title}.pptx` };

      case 'form_studio':
        await exportFormToDocx(item.contentData);
        return { success: true, filename: `${item.title}.docx` };

      case 'doc':
      default:
        await exportDocToDocx(item.contentData);
        return { success: true, filename: `${item.title}.docx` };
    }
  } catch (error: any) {
    console.error('Market export error:', error);
    return { success: false, error: error?.message || '다운로드 중 오류가 발생했습니다.' };
  }
}
