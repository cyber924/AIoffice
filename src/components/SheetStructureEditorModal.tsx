import React, { useState } from 'react';
import { ExcelSheetData, ExcelColumnDef, ExcelRowData, ExcelCellData } from '../types/excel';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Type,
  Hash,
  Percent,
  DollarSign,
} from 'lucide-react';

interface SheetStructureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: ExcelSheetData;
  onSaveSheet: (updatedSheet: ExcelSheetData) => void;
}

export const SheetStructureEditorModal: React.FC<SheetStructureEditorModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onSaveSheet,
}) => {
  const [sheetName, setSheetName] = useState(sheet.name);
  const [sheetDescription, setSheetDescription] = useState(sheet.description || '');
  const [columns, setColumns] = useState<ExcelColumnDef[]>([...sheet.columns]);

  // New column state
  const [newColHeader, setNewColHeader] = useState('');
  const [newColFormat, setNewColFormat] = useState<'text' | 'number' | 'currency_krw' | 'percent'>('text');
  const [newColAlign, setNewColAlign] = useState<'left' | 'center' | 'right'>('left');

  if (!isOpen) return null;

  const handleAddColumn = () => {
    if (!newColHeader.trim()) return;
    const newKey = 'col_' + Date.now();
    const newCol: ExcelColumnDef = {
      header: newColHeader.trim(),
      key: newKey,
      width: 14,
      align: newColAlign,
      format: newColFormat === 'text' ? undefined : newColFormat,
    };

    setColumns([...columns, newCol]);
    setNewColHeader('');
  };

  const handleDeleteColumn = (indexToDelete: number) => {
    if (columns.length <= 1) {
      alert('최소 1개 이상의 컬럼이 필요합니다.');
      return;
    }
    setColumns(columns.filter((_, idx) => idx !== indexToDelete));
  };

  const handleSave = () => {
    // Update rows to match new column count
    const updatedRows = sheet.rows.map((row) => {
      const currentCells = [...row.cells];
      // If columns were added
      while (currentCells.length < columns.length) {
        currentCells.push({ value: '' });
      }
      // If columns were removed
      const slicedCells = currentCells.slice(0, columns.length);
      return {
        ...row,
        cells: slicedCells,
      };
    });

    onSaveSheet({
      ...sheet,
      name: sheetName.trim() || sheet.name,
      description: sheetDescription.trim(),
      columns,
      rows: updatedRows,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">시트 기본 정보 및 열(컬럼) 구조 관리</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Sheet Name & Desc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">시트 탭 이름</label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">시트 설명 / 부제</label>
              <input
                type="text"
                value={sheetDescription}
                onChange={(e) => setSheetDescription(e.target.value)}
                placeholder="예: 2026년 월별 세부 지표 분석"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Existing Columns List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              현재 구성된 열 목록 ({columns.length}개)
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-600 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{col.header}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                      {col.format === 'currency_krw'
                        ? '통화(₩)'
                        : col.format === 'percent'
                        ? '백분율(%)'
                        : col.format === 'currency_usd'
                        ? '달러($)'
                        : col.format === 'number'
                        ? '숫자'
                        : '일반 텍스트'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteColumn(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Column Box */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>새로운 열(Column) 추가</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="열 제목 (예: 영업이익)"
                  value={newColHeader}
                  onChange={(e) => setNewColHeader(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <select
                  value={newColFormat}
                  onChange={(e) => setNewColFormat(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="text">텍스트</option>
                  <option value="number">일반 숫자</option>
                  <option value="currency_krw">원화(₩ 통화)</option>
                  <option value="percent">백분율(%)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <select
                  value={newColAlign}
                  onChange={(e) => setNewColAlign(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="left">좌측 정렬</option>
                  <option value="center">가운데 정렬</option>
                  <option value="right">우측 정렬</option>
                </select>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColHeader.trim()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            변경사항 시트에 적용
          </button>
        </div>
      </div>
    </div>
  );
};
