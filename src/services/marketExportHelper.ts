import { MarketItem } from '../types/market';
import { exportDocumentToDocx } from './docWordExportService';
import { exportToPptx } from './pptxExportService';
import { exportToXlsx } from './excelExportService';
import { exportFormToDocx } from './formWordExportService';

/**
 * Native file exporter for Marketplace items:
 * - doc -> Microsoft Word (.docx)
 * - presentation -> PowerPoint (.pptx)
 * - excel -> Excel (.xlsx)
 * - form_studio -> Microsoft Word (.docx)
 */
export async function downloadMarketItemNativeFile(item: MarketItem): Promise<void> {
  if (!item || !item.contentData) {
    throw new Error('문서 데이터가 존재하지 않습니다.');
  }

  switch (item.productType) {
    case 'presentation':
      await exportToPptx(item.contentData);
      break;

    case 'excel':
      await exportToXlsx(item.contentData);
      break;

    case 'form_studio':
      await exportFormToDocx(item.contentData);
      break;

    case 'doc':
    default:
      await exportDocumentToDocx(item.contentData);
      break;
  }
}

export function getNativeFileExtensionLabel(productType: string): {
  ext: string;
  name: string;
  badge: string;
} {
  switch (productType) {
    case 'presentation':
      return { ext: '.pptx', name: 'PowerPoint 슬라이드', badge: 'PPTX' };
    case 'excel':
      return { ext: '.xlsx', name: 'Microsoft Excel 스프레드시트', badge: 'XLSX' };
    case 'form_studio':
      return { ext: '.docx', name: 'Microsoft Word 공문서식', badge: 'DOCX' };
    case 'doc':
    default:
      return { ext: '.docx', name: 'Microsoft Word 기획서', badge: 'DOCX' };
  }
}
