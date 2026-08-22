import React, { useState, useEffect } from 'react';
import {
  ExcelDocument,
  ExcelSheetData,
  ExcelRowData,
  ExcelCellData,
  ExcelColumnDef,
} from '../types/excel';
import { exportToXlsx } from '../services/excelExportService';
import { requestAiEditExcel } from '../services/aiService';
import { ExcelAssistantDrawer } from './ExcelAssistantDrawer';
import { SheetStructureEditorModal } from './SheetStructureEditorModal';
import {
  FileSpreadsheet,
  Download,
  Layers,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  Award,
  PieChart,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Table as TableIcon,
  Plus,
  Trash2,
  Settings,
  Bot,
  Save,
  Check,
  Edit3,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ExcelViewerProps {
  document: ExcelDocument;
  onUpdateDocument?: (doc: ExcelDocument) => void;
  onBackToForm?: () => void;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({
  document: initialDocument,
  onUpdateDocument,
  onBackToForm,
}) => {
  const [doc, setDoc] = useState<ExcelDocument>(initialDocument);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSheetEditorOpen, setIsSheetEditorOpen] = useState(false);

  // In-cell editing states
  const [editingCellPos, setEditingCellPos] = useState<{ rIdx: number; cIdx: number } | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setDoc(initialDocument);
  }, [initialDocument]);

  const sheets = doc.sheets || [];
  const currentSheet: ExcelSheetData | undefined = sheets[activeSheetIndex] || sheets[0];

  const triggerDocumentUpdate = (newDoc: ExcelDocument) => {
    setDoc(newDoc);
    if (onUpdateDocument) {
      onUpdateDocument(newDoc);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // 1. Download XLSX
  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      await exportToXlsx(doc);
    } catch (err: any) {
      console.error('Failed to export excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. AI Assistant Update
  const handleApplyAiUpdate = async (instruction: string) => {
    setIsAiLoading(true);
    try {
      const updatedDoc = await requestAiEditExcel(doc, instruction);
      triggerDocumentUpdate(updatedDoc);
    } catch (err: any) {
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  // 3. In-cell editing functions
  const handleCellClick = (rIdx: number, cIdx: number, currentVal: any) => {
    const rawVal =
      currentVal && typeof currentVal === 'object' && 'value' in currentVal
        ? currentVal.value
        : currentVal ?? '';
    setEditingCellPos({ rIdx, cIdx });
    setEditInputValue(String(rawVal));
  };

  const handleCellBlurOrEnter = () => {
    if (!editingCellPos || !currentSheet) return;
    const { rIdx, cIdx } = editingCellPos;

    const targetRow = currentSheet.rows[rIdx];
    if (!targetRow) {
      setEditingCellPos(null);
      return;
    }

    let parsedVal: string | number = editInputValue.trim();
    if (/^-?\d+(\.\d+)?$/.test(parsedVal)) {
      parsedVal = parseFloat(parsedVal);
    }

    const newCells = [...targetRow.cells];
    const existingCell = newCells[cIdx];

    if (existingCell && typeof existingCell === 'object') {
      newCells[cIdx] = {
        ...existingCell,
        value: parsedVal,
      };
    } else {
      newCells[cIdx] = { value: parsedVal };
    }

    const updatedRows = [...currentSheet.rows];
    updatedRows[rIdx] = {
      ...targetRow,
      cells: newCells,
    };

    // Auto-recalculate if needed (e.g. recalculate total row sum for numeric columns)
    const recalculatedRows = recalculateSheetTotals(updatedRows, currentSheet.columns);

    const updatedSheets = [...sheets];
    updatedSheets[activeSheetIndex] = {
      ...currentSheet,
      rows: recalculatedRows,
    };

    // Also update chartData dynamically if editing Monthly Sales
    let updatedChartData = doc.chartData ? [...doc.chartData] : undefined;
    if (updatedChartData && currentSheet.name.includes('매출') && rIdx < updatedChartData.length) {
      const colName = currentSheet.columns[cIdx]?.header || '';
      if (typeof parsedVal === 'number') {
        const valInMillions = parsedVal >= 1000000 ? Math.round(parsedVal / 1000000) : parsedVal;
        if (colName.includes('실제')) {
          updatedChartData[rIdx] = { ...updatedChartData[rIdx], actual: valInMillions };
        } else if (colName.includes('목표')) {
          updatedChartData[rIdx] = { ...updatedChartData[rIdx], target: valInMillions };
        }
      }
    }

    const updatedDoc: ExcelDocument = {
      ...doc,
      sheets: updatedSheets,
      chartData: updatedChartData,
      metadata: {
        ...doc.metadata,
        updatedAt: Date.now(),
      },
    };

    triggerDocumentUpdate(updatedDoc);
    setEditingCellPos(null);
  };

  // Recalculate helper for total row
  const recalculateSheetTotals = (
    rows: ExcelRowData[],
    columns: ExcelColumnDef[]
  ): ExcelRowData[] => {
    const totalRowIndex = rows.findIndex((r) => r.isTotal);
    if (totalRowIndex === -1) return rows;

    const dataRows = rows.filter((r) => !r.isTotal);
    const totalRow = rows[totalRowIndex];
    const newTotalCells = [...totalRow.cells];

    columns.forEach((col, cIdx) => {
      // If column is numeric or currency
      if (col.format === 'currency_krw' || col.format === 'number') {
        let sum = 0;
        let hasNumber = false;
        dataRows.forEach((r) => {
          const cVal = r.cells[cIdx];
          const num = typeof cVal === 'object' ? cVal?.value : cVal;
          if (typeof num === 'number') {
            sum += num;
            hasNumber = true;
          }
        });
        if (hasNumber) {
          const oldCell = newTotalCells[cIdx];
          newTotalCells[cIdx] = {
            ...(typeof oldCell === 'object' ? oldCell : {}),
            value: sum,
            isBold: true,
          };
        }
      }
    });

    const finalRows = [...rows];
    finalRows[totalRowIndex] = {
      ...totalRow,
      cells: newTotalCells,
    };
    return finalRows;
  };

  // 4. Add new Row
  const handleAddRow = () => {
    if (!currentSheet) return;
    const newCells: ExcelCellData[] = currentSheet.columns.map((col, idx) => {
      if (idx === 0) return { value: `신규 항목 ${currentSheet.rows.length}` };
      if (col.format === 'currency_krw' || col.format === 'number') return { value: 0 };
      if (col.format === 'percent') return { value: 0.0 };
      return { value: '' };
    });

    const totalRowIndex = currentSheet.rows.findIndex((r) => r.isTotal);
    let updatedRows: ExcelRowData[];

    const newRow: ExcelRowData = {
      rowNumber: currentSheet.rows.length + 1,
      cells: newCells,
    };

    if (totalRowIndex >= 0) {
      updatedRows = [
        ...currentSheet.rows.slice(0, totalRowIndex),
        newRow,
        ...currentSheet.rows.slice(totalRowIndex),
      ];
    } else {
      updatedRows = [...currentSheet.rows, newRow];
    }

    const updatedSheets = [...sheets];
    updatedSheets[activeSheetIndex] = {
      ...currentSheet,
      rows: updatedRows,
    };

    triggerDocumentUpdate({
      ...doc,
      sheets: updatedSheets,
    });
  };

  // 5. Delete Row
  const handleDeleteRow = (rIdx: number) => {
    if (!currentSheet || currentSheet.rows.length <= 1) return;
    const updatedRows = currentSheet.rows.filter((_, idx) => idx !== rIdx);
    const updatedSheets = [...sheets];
    updatedSheets[activeSheetIndex] = {
      ...currentSheet,
      rows: recalculateSheetTotals(updatedRows, currentSheet.columns),
    };

    triggerDocumentUpdate({
      ...doc,
      sheets: updatedSheets,
    });
  };

  // 6. Add new Sheet
  const handleAddNewSheet = () => {
    const newSheetNumber = sheets.length + 1;
    const newSheet: ExcelSheetData = {
      id: `sheet_${Date.now()}`,
      name: `${newSheetNumber}. 추가_분석표`,
      description: '새롭게 추가된 세부 분석 시트입니다.',
      columns: [
        { header: '항목명', key: 'item', width: 20, align: 'left' },
        { header: '구분/분류', key: 'category', width: 15, align: 'center' },
        { header: '목표 금액 (₩)', key: 'target', width: 18, align: 'right', format: 'currency_krw' },
        { header: '실제 집행 (₩)', key: 'actual', width: 18, align: 'right', format: 'currency_krw' },
        { header: '달성률 / 집행률', key: 'rate', width: 16, align: 'right', format: 'percent' },
        { header: '비고 및 세부내역', key: 'notes', width: 25, align: 'left' },
      ],
      rows: [
        {
          rowNumber: 1,
          cells: [
            { value: '항목 1' },
            { value: '운영비' },
            { value: 50000000 },
            { value: 48000000 },
            { value: 0.96, formula: '=D5/C5' },
            { value: '정상 집행' },
          ],
        },
        {
          rowNumber: 2,
          isTotal: true,
          cells: [
            { value: '합계 (TOTAL)', isBold: true },
            { value: '전체', isBold: true },
            { value: 50000000, formula: '=SUM(C5:C5)', isBold: true },
            { value: 48000000, formula: '=SUM(D5:D5)', isBold: true },
            { value: 0.96, isBold: true },
            { value: '-', isBold: true },
          ],
        },
      ],
    };

    const updatedSheets = [...sheets, newSheet];
    triggerDocumentUpdate({
      ...doc,
      sheets: updatedSheets,
    });
    setActiveSheetIndex(updatedSheets.length - 1);
  };

  // Formatting display
  const getKpiIcon = (iconName?: string) => {
    switch (iconName) {
      case 'DollarSign':
        return DollarSign;
      case 'TrendingUp':
        return TrendingUp;
      case 'PieChart':
        return PieChart;
      case 'Award':
        return Award;
      default:
        return Target;
    }
  };

  const formatCellValue = (cellVal: any, format?: string) => {
    if (cellVal === null || cellVal === undefined) return '-';
    let val = typeof cellVal === 'object' && 'value' in cellVal ? cellVal.value : cellVal;

    // Handle formula evaluated or raw
    if (val === null || val === undefined || val === '') {
      if (typeof cellVal === 'object' && cellVal.formula) {
        return <span className="text-slate-400 font-mono text-[10px]">{cellVal.formula}</span>;
      }
      return '-';
    }

    if (typeof val === 'number') {
      if (format === 'percent') {
        return (val * 100).toFixed(1) + '%';
      }
      if (format === 'currency_krw') {
        if (Math.abs(val) >= 100000000) {
          return `${(val / 100000000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억 원`;
        }
        return `${val.toLocaleString('ko-KR')}원`;
      }
      if (format === 'currency_usd') {
        return `$${val.toLocaleString('en-US')}`;
      }
      return val.toLocaleString();
    }

    return String(val);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Save Toast */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>시트 변경사항이 즉시 저장되었습니다.</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                .XLSX 인터랙티브 시트
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {doc.company || '전략기획실'}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {doc.period || '2026년 연간'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {doc.title}
            </h1>
            {doc.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{doc.subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* AI natural language Assistant button */}
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Bot className="w-4 h-4 text-emerald-300" />
            <span>AI 자연어 엑셀 수정</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-slate-950 font-black">
              AI
            </span>
          </button>

          {onBackToForm && (
            <button
              onClick={onBackToForm}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              새 엑셀 생성
            </button>
          )}

          <button
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>엑셀 저장 중...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>.XLSX 다운로드</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {doc.kpis && doc.kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {doc.kpis.map((kpi, idx) => {
            const IconComp = getKpiIcon(kpi.iconName);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">{kpi.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IconComp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 my-1 tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  {kpi.subValue && <span className="text-slate-400 font-medium">{kpi.subValue}</span>}
                  {kpi.change && (
                    <span
                      className={`font-black flex items-center gap-0.5 ${
                        kpi.isPositive !== false ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {kpi.isPositive !== false ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {kpi.change}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Chart Card (Recharts) */}
      {doc.chartData && doc.chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {currentSheet?.chartSuggestion?.title || '실적 및 목표 추이 시각화 대시보드'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">시트 데이터 실시간 연동</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {currentSheet?.chartSuggestion?.type === 'bar' ? (
                <BarChart data={doc.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="actual" name="실제 매출" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="목표치" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={doc.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="실제 매출"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="목표 매출"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  {doc.chartData[0]?.prevYear !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="prevYear"
                      name="전년 동기"
                      stroke="#94A3B8"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spreadsheet Workspace Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        {/* Sheet Tabs Bar & Actions */}
        <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {/* Sheet tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto min-w-max">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>시트:</span>
            </span>
            {sheets.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setActiveSheetIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSheetIndex === idx
                    ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <TableIcon className="w-3 h-3 text-emerald-600" />
                <span>{s.name}</span>
              </button>
            ))}

            {/* + Add Sheet Button */}
            <button
              onClick={handleAddNewSheet}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
              title="새 시트 탭 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>시트 추가</span>
            </button>
          </div>

          {/* Sheet level tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSheetEditorOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              title="컬럼 추가/수정 및 시트 이름 관리"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>열(Column) 관리</span>
            </button>

            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>행(Row) 추가</span>
            </button>
          </div>
        </div>

        {/* Sheet Description & Edit Guide Bar */}
        <div className="px-5 py-2.5 bg-emerald-50/50 border-b border-emerald-100/60 text-xs text-emerald-900 font-medium flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{currentSheet?.description || '셀을 클릭하여 직접 내용을 수정할 수 있습니다.'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Edit3 className="w-3 h-3 text-emerald-600" />
            <span>💡 원하는 셀을 클릭하면 즉시 수정됩니다 (Enter로 저장)</span>
          </div>
        </div>

        {/* Interactive Editable Spreadsheet Grid */}
        <div className="overflow-x-auto max-h-[600px] select-text">
          {currentSheet ? (
            <table className="w-full border-collapse text-left text-xs font-sans">
              {/* Header */}
              <thead className="sticky top-0 z-10 bg-slate-800 text-white">
                <tr>
                  <th className="w-12 px-2 py-3 text-center border-r border-slate-700 font-mono text-[10px] text-slate-400 bg-slate-900">
                    #
                  </th>
                  {currentSheet.columns.map((col, cIdx) => (
                    <th
                      key={col.key || cIdx}
                      style={{ width: col.width ? `${col.width * 9}px` : 'auto' }}
                      className={`px-3.5 py-3 font-bold text-slate-100 border-r border-slate-700 last:border-0 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{col.header}</span>
                        {col.format === 'currency_krw' && (
                          <span className="text-[10px] font-mono text-emerald-300">₩</span>
                        )}
                        {col.format === 'percent' && (
                          <span className="text-[10px] font-mono text-amber-300">%</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-10 px-2 py-3 text-center text-slate-400 bg-slate-900">
                    작업
                  </th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody>
                {currentSheet.rows.map((rowObj, rIdx) => {
                  const isTotal = rowObj.isTotal;
                  return (
                    <tr
                      key={rIdx}
                      className={`border-b border-slate-100 transition-colors group ${
                        isTotal
                          ? 'bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300'
                          : rIdx % 2 === 0
                          ? 'bg-white hover:bg-emerald-50/20'
                          : 'bg-slate-50/40 hover:bg-emerald-50/30'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="px-2 py-2 text-center border-r border-slate-200 font-mono text-[10px] text-slate-500 bg-slate-50 select-none">
                        {isTotal ? '∑' : rIdx + 1}
                      </td>

                      {/* Cells */}
                      {rowObj.cells.map((cellVal, cIdx) => {
                        const colDef = currentSheet.columns[cIdx];
                        const format =
                          (cellVal && typeof cellVal === 'object' ? cellVal.format : null) ||
                          colDef?.format;
                        const isFormula = cellVal && typeof cellVal === 'object' && cellVal.formula;
                        const isEditingThisCell =
                          editingCellPos?.rIdx === rIdx && editingCellPos?.cIdx === cIdx;

                        return (
                          <td
                            key={cIdx}
                            onClick={() => !isEditingThisCell && handleCellClick(rIdx, cIdx, cellVal)}
                            className={`px-3 py-2 border-r border-slate-200 last:border-0 relative cursor-pointer ${
                              colDef?.align === 'right'
                                ? 'text-right'
                                : colDef?.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            } ${isTotal ? 'font-black text-slate-900' : 'text-slate-700'} hover:bg-emerald-100/50 transition-colors`}
                          >
                            {isEditingThisCell ? (
                              <input
                                autoFocus
                                type="text"
                                value={editInputValue}
                                onChange={(e) => setEditInputValue(e.target.value)}
                                onBlur={handleCellBlurOrEnter}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellBlurOrEnter();
                                  if (e.key === 'Escape') setEditingCellPos(null);
                                }}
                                className="w-full px-1.5 py-0.5 rounded bg-white border-2 border-emerald-500 text-xs font-bold text-slate-900 shadow-sm focus:outline-none"
                              />
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate block">
                                  {formatCellValue(cellVal, format)}
                                </span>
                                {isFormula && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                                    title={`수식: ${cellVal.formula}`}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Action (Delete) */}
                      <td className="px-1 text-center select-none">
                        {!isTotal && (
                          <button
                            onClick={() => handleDeleteRow(rIdx)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-all"
                            title="이 행 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400">시트 데이터가 없습니다.</div>
          )}
        </div>
      </div>

      {/* AI Assistant Drawer */}
      <ExcelAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        document={doc}
        onApplyAiUpdate={handleApplyAiUpdate}
        isLoading={isAiLoading}
      />

      {/* Sheet Structure Editor Modal */}
      {currentSheet && (
        <SheetStructureEditorModal
          isOpen={isSheetEditorOpen}
          onClose={() => setIsSheetEditorOpen(false)}
          sheet={currentSheet}
          onSaveSheet={(updatedSheet) => {
            const updatedSheets = [...sheets];
            updatedSheets[activeSheetIndex] = updatedSheet;
            triggerDocumentUpdate({
              ...doc,
              sheets: updatedSheets,
            });
          }}
        />
      )}
    </div>
  );
};
