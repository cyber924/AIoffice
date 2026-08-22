import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExcelDocument, ExcelSheetData } from '../types/excel';

export async function exportToXlsx(doc: ExcelDocument): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = doc.company || 'AI Executive Excel Studio';
  workbook.lastModifiedBy = 'AI Executive Excel Studio';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Primary Theme Colors (Modern Navy / Indigo)
  const headerFill: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate-800
  };

  const totalFill: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }, // Slate-100
  };

  const titleFill: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4338CA' }, // Indigo-700
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  const doubleBottomBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'double', color: { argb: 'FF1E293B' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  doc.sheets.forEach((sheetData: ExcelSheetData, sheetIdx: number) => {
    const sheetName = sheetData.name.replace(/[\\/?*\[\]]/g, '').substring(0, 31) || `Sheet${sheetIdx + 1}`;
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true, state: sheetData.freezeHeader ? 'frozen' : 'normal', ySplit: sheetData.freezeHeader ? 4 : 0 }],
    });

    const colCount = Math.max(sheetData.columns.length, 6);

    // Row 1: Document Banner / Sheet Title
    const titleRow = worksheet.getRow(1);
    titleRow.height = 36;
    worksheet.mergeCells(1, 1, 1, colCount);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = `  ${doc.title} - ${sheetData.name}`;
    titleCell.font = { name: 'Malgun Gothic', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = titleFill;
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Row 2: Metadata (Company, Period, Currency)
    const metaRow = worksheet.getRow(2);
    metaRow.height = 20;
    worksheet.mergeCells(2, 1, 2, colCount);
    const metaCell = worksheet.getCell(2, 1);
    metaCell.value = `  회사명: ${doc.company || '당사'}  |  조회기간: ${doc.period || '2026년 연간'}  |  통화: ${doc.currency === 'USD' ? 'USD ($)' : 'KRW (원)'}  |  생성일: ${new Date().toLocaleDateString('ko-KR')}`;
    metaCell.font = { name: 'Malgun Gothic', size: 9, italic: true, color: { argb: 'FF64748B' } };
    metaCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Row 3: Empty spacer
    worksheet.getRow(3).height = 8;

    // Row 4: Column Headers
    const headerRow = worksheet.getRow(4);
    headerRow.height = 28;

    sheetData.columns.forEach((col, colIdx) => {
      const cell = headerRow.getCell(colIdx + 1);
      cell.value = col.header;
      cell.font = { name: 'Malgun Gothic', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = headerFill;
      cell.alignment = { vertical: 'middle', horizontal: col.align || 'center' };
      cell.border = thinBorder;

      // Set column width
      worksheet.getColumn(colIdx + 1).width = Math.max(col.width || 16, 12);
    });

    // Data Rows (from Row 5)
    let currentRowIdx = 5;
    sheetData.rows.forEach((rowObj) => {
      const row = worksheet.getRow(currentRowIdx);
      row.height = rowObj.rowHeight || 22;
      const isTotal = rowObj.isTotal;

      rowObj.cells.forEach((cellVal, cIdx) => {
        const cell = row.getCell(cIdx + 1);
        const colDef = sheetData.columns[cIdx];

        if (cellVal !== null && typeof cellVal === 'object' && 'value' in cellVal) {
          if (cellVal.formula) {
            cell.value = { formula: cellVal.formula.startsWith('=') ? cellVal.formula.slice(1) : cellVal.formula, result: cellVal.value as any };
          } else {
            cell.value = cellVal.value;
          }

          const format = cellVal.format || colDef?.format;
          applyNumberFormat(cell, format);

          cell.font = {
            name: 'Malgun Gothic',
            size: isTotal ? 10 : 9.5,
            bold: cellVal.isBold || isTotal,
            color: isTotal ? { argb: 'FF0F172A' } : cellVal.textColor ? { argb: cellVal.textColor.replace('#', 'FF') } : { argb: 'FF334155' },
          };

          if (isTotal) {
            cell.fill = totalFill;
            cell.border = doubleBottomBorder;
          } else if (cellVal.bgColor) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellVal.bgColor.replace('#', 'FF') } };
            cell.border = thinBorder;
          } else {
            cell.border = thinBorder;
          }

          cell.alignment = {
            vertical: 'middle',
            horizontal: cellVal.align || colDef?.align || (typeof cellVal.value === 'number' ? 'right' : 'left'),
          };
        } else {
          // Primitive value
          cell.value = (cellVal as string | number | boolean | null) ?? '';
          const format = colDef?.format;
          applyNumberFormat(cell, format);

          cell.font = {
            name: 'Malgun Gothic',
            size: isTotal ? 10 : 9.5,
            bold: isTotal,
            color: isTotal ? { argb: 'FF0F172A' } : { argb: 'FF334155' },
          };

          if (isTotal) {
            cell.fill = totalFill;
            cell.border = doubleBottomBorder;
          } else {
            cell.border = thinBorder;
          }

          cell.alignment = {
            vertical: 'middle',
            horizontal: colDef?.align || (typeof cellVal === 'number' ? 'right' : 'left'),
          };
        }
      });

      currentRowIdx++;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const sanitizedTitle = (doc.title || '전문_엑셀_보고서').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
  saveAs(blob, `${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function applyNumberFormat(cell: ExcelJS.Cell, format?: string) {
  if (!format) return;
  switch (format) {
    case 'currency_krw':
      cell.numFmt = '#,##0 "원";[Red]-#,##0 "원";"-"';
      break;
    case 'currency_usd':
      cell.numFmt = '$#,##0.00;[Red]($#,##0.00);"-"';
      break;
    case 'percent':
      cell.numFmt = '0.0%';
      break;
    case 'number':
      cell.numFmt = '#,##0';
      break;
    case 'date':
      cell.numFmt = 'yyyy-mm-dd';
      break;
    default:
      break;
  }
}
