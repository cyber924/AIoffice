/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppMode } from './components/Navbar';
import { DocumentForm } from './components/DocumentForm';
import { DocumentViewer } from './components/DocumentViewer';
import { PresentationForm } from './components/PresentationForm';
import { PresentationViewer } from './components/PresentationViewer';
import { ExcelGeneratorForm } from './components/ExcelGeneratorForm';
import { ExcelViewer } from './components/ExcelViewer';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { SavedDocumentsModal } from './components/SavedDocumentsModal';
import { SavedPresentationsModal } from './components/SavedPresentationsModal';
import { SavedExcelModal } from './components/SavedExcelModal';
import { AgentChatModal } from './components/AgentChatModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  DocumentInputForm,
  GeneratedDocument,
  DocumentPreset,
} from './types/document';
import {
  PresentationInputForm,
  PresentationDocument,
  SlideItem,
  PresentationThemeId,
  SlideLayoutType,
} from './types/presentation';
import { ExcelInputForm, ExcelDocument } from './types/excel';
import { BusinessFormInput, BusinessFormDocument } from './types/formStudio';
import {
  requestDocumentGeneration,
  requestPresentationGeneration,
  requestSlideRegeneration,
  requestDocumentToPresentation,
  requestGenerateExcel,
  requestGenerateBusinessForm,
} from './services/aiService';
import {
  saveDocument,
  fetchAllDocuments,
  deleteDocument,
  savePresentation,
  fetchAllPresentations,
  deletePresentation,
} from './services/firebaseService';
import {
  saveExcelDocument,
  fetchAllExcelDocuments,
  deleteExcelDocument,
} from './services/excelFirebaseService';
import {
  saveBusinessForm,
  fetchAllBusinessForms,
  deleteBusinessForm,
} from './services/formFirebaseService';
import { FormGeneratorForm } from './components/FormGeneratorForm';
import { FormViewer } from './components/FormViewer';
import { SavedFormsModal } from './components/SavedFormsModal';
import { AdminConsoleView } from './components/admin/AdminConsoleView';
import { calculateAdminDashboardMetrics } from './services/adminAnalyticsService';
import { isUserAdmin } from './constants/adminConfig';
import { AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

function MainApp() {
  const { currentUser } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('form_studio');
  const [currentView, setCurrentView] = useState<'form' | 'viewer'>('form');

  // Document states
  const [activeDocument, setActiveDocument] = useState<GeneratedDocument | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<GeneratedDocument[]>([]);
  const [docFormData, setDocFormData] = useState<Partial<DocumentInputForm>>({});
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Presentation states
  const [activePresentation, setActivePresentation] = useState<PresentationDocument | null>(null);
  const [savedPresentations, setSavedPresentations] = useState<PresentationDocument[]>([]);
  const [presFormData, setPresFormData] = useState<Partial<PresentationInputForm>>({});
  const [isGeneratingPres, setIsGeneratingPres] = useState(false);

  // Excel states
  const [activeExcel, setActiveExcel] = useState<ExcelDocument | null>(null);
  const [savedExcelDocs, setSavedExcelDocs] = useState<ExcelDocument[]>([]);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  // Business Form states
  const [activeForm, setActiveForm] = useState<BusinessFormDocument | null>(null);
  const [savedForms, setSavedForms] = useState<BusinessFormDocument[]>([]);
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);

  // Modals & Errors
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isSavedDocsOpen, setIsSavedDocsOpen] = useState(false);
  const [isSavedPresOpen, setIsSavedPresOpen] = useState(false);
  const [isSavedExcelOpen, setIsSavedExcelOpen] = useState(false);
  const [isSavedFormsOpen, setIsSavedFormsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load and refresh documents, presentations, excel, and forms on auth change
  useEffect(() => {
    async function loadData() {
      try {
        const [docs, pres, excels, forms] = await Promise.all([
          fetchAllDocuments(),
          fetchAllPresentations(),
          fetchAllExcelDocuments(),
          fetchAllBusinessForms(),
        ]);
        setSavedDocuments(docs);
        setSavedPresentations(pres);
        setSavedExcelDocs(excels);
        setSavedForms(forms);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    loadData();
  }, [currentUser]);

  // ---------------- Document Actions ----------------

  const handleGenerateDoc = async (data: DocumentInputForm) => {
    setIsGeneratingDoc(true);
    setGenerationError(null);
    try {
      const generatedDoc = await requestDocumentGeneration(data);
      setActiveDocument(generatedDoc);
      setCurrentView('viewer');

      await saveDocument(generatedDoc);
      const updatedList = await fetchAllDocuments();
      setSavedDocuments(updatedList);

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      console.error('Document generation failed:', err);
      setGenerationError(err.message || '문서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleSelectPreset = (preset: DocumentPreset, autoGenerate: boolean = false) => {
    if (preset.defaultData) {
      setDocFormData(preset.defaultData);
      if (autoGenerate && preset.defaultData.topic) {
        handleGenerateDoc(preset.defaultData as DocumentInputForm);
        return;
      }
    }
    setAppMode('doc_generator');
    setCurrentView('form');
  };

  const handleApplyAgentData = (suggestedData: Partial<DocumentInputForm>) => {
    setDocFormData((prev) => ({
      ...prev,
      ...suggestedData,
    }));
    setAppMode('doc_generator');
    setCurrentView('form');
  };

  const handleUpdateDocument = async (updatedDoc: GeneratedDocument) => {
    setActiveDocument(updatedDoc);
    await saveDocument(updatedDoc);
    const updatedList = await fetchAllDocuments();
    setSavedDocuments(updatedList);
  };

  const handleDeleteDocument = async (docId: string) => {
    await deleteDocument(docId);
    const updatedList = await fetchAllDocuments();
    setSavedDocuments(updatedList);

    if (activeDocument && activeDocument.id === docId) {
      setActiveDocument(null);
      setCurrentView('form');
    }
  };

  const handleToggleStar = async (docId: string) => {
    const docToUpdate = savedDocuments.find((d) => d.id === docId);
    if (!docToUpdate) return;

    const isStarred = !docToUpdate.metadata.isStarred;
    const updated = {
      ...docToUpdate,
      metadata: {
        ...docToUpdate.metadata,
        isStarred,
      },
    };

    await saveDocument(updated);
    const updatedList = await fetchAllDocuments();
    setSavedDocuments(updatedList);

    if (activeDocument && activeDocument.id === docId) {
      setActiveDocument(updated);
    }
  };

  // ---------------- Presentation Actions ----------------

  const handleGeneratePresentation = async (data: PresentationInputForm) => {
    setIsGeneratingPres(true);
    setGenerationError(null);
    try {
      const generatedPres = await requestPresentationGeneration(data);
      setActivePresentation(generatedPres);
      setCurrentView('viewer');

      await savePresentation(generatedPres);
      const updatedList = await fetchAllPresentations();
      setSavedPresentations(updatedList);

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      console.error('Presentation generation failed:', err);
      setGenerationError(err.message || '프레젠테이션 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGeneratingPres(false);
    }
  };

  const handleConvertDocumentToPres = async (
    doc: GeneratedDocument,
    theme: PresentationThemeId = 'dark_navy'
  ) => {
    setIsGeneratingPres(true);
    setGenerationError(null);
    try {
      const generatedPres = await requestDocumentToPresentation(doc, theme);
      setActivePresentation(generatedPres);
      setAppMode('presentation_generator');
      setCurrentView('viewer');

      await savePresentation(generatedPres);
      const updatedList = await fetchAllPresentations();
      setSavedPresentations(updatedList);

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      console.error('Document to Presentation failed:', err);
      setGenerationError(err.message || '문서의 PPT 변환 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPres(false);
    }
  };

  const handleRegenerateSlide = async (params: {
    presentationTitle: string;
    slide: SlideItem;
    requestedLayout?: SlideLayoutType;
    customPrompt?: string;
  }): Promise<SlideItem> => {
    const updatedSlide = await requestSlideRegeneration(params);
    return updatedSlide;
  };

  const handleUpdatePresentation = async (updatedPres: PresentationDocument) => {
    setActivePresentation(updatedPres);
    await savePresentation(updatedPres);
    const updatedList = await fetchAllPresentations();
    setSavedPresentations(updatedList);
  };

  const handleDeletePresentation = async (presId: string) => {
    await deletePresentation(presId);
    const updatedList = await fetchAllPresentations();
    setSavedPresentations(updatedList);

    if (activePresentation && activePresentation.id === presId) {
      setActivePresentation(null);
      setCurrentView('form');
    }
  };

  // ---------------- Excel Actions ----------------

  const handleGenerateExcel = async (formData: ExcelInputForm) => {
    setIsGeneratingExcel(true);
    setGenerationError(null);
    try {
      const generatedExcel = await requestGenerateExcel(formData);
      setActiveExcel(generatedExcel);
      setCurrentView('viewer');

      await saveExcelDocument(generatedExcel);
      const updatedList = await fetchAllExcelDocuments();
      setSavedExcelDocs(updatedList);

      try {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      console.error('Excel generation failed:', err);
      setGenerationError(err.message || '엑셀 스프레드시트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleUpdateExcelDocument = async (updatedExcel: ExcelDocument) => {
    setActiveExcel(updatedExcel);
    await saveExcelDocument(updatedExcel);
    const updatedList = await fetchAllExcelDocuments();
    setSavedExcelDocs(updatedList);
  };

  const handleDeleteExcel = async (excelId: string) => {
    await deleteExcelDocument(excelId);
    const updatedList = await fetchAllExcelDocuments();
    setSavedExcelDocs(updatedList);

    if (activeExcel && activeExcel.id === excelId) {
      setActiveExcel(null);
      setCurrentView('form');
    }
  };

  // ---------------- Business Form Actions ----------------

  const handleGenerateForm = async (formData: BusinessFormInput) => {
    setIsGeneratingForm(true);
    setGenerationError(null);
    try {
      const generatedForm = await requestGenerateBusinessForm(formData);
      setActiveForm(generatedForm);
      setCurrentView('viewer');

      await saveBusinessForm(generatedForm);
      const updatedList = await fetchAllBusinessForms();
      setSavedForms(updatedList);

      try {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      console.error('Form generation failed:', err);
      setGenerationError(err.message || '공문서/양식 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGeneratingForm(false);
    }
  };

  const handleUpdateFormDocument = async (updatedForm: BusinessFormDocument) => {
    setActiveForm(updatedForm);
    await saveBusinessForm(updatedForm);
    const updatedList = await fetchAllBusinessForms();
    setSavedForms(updatedList);
  };

  const handleDeleteForm = async (formId: string) => {
    await deleteBusinessForm(formId);
    const updatedList = await fetchAllBusinessForms();
    setSavedForms(updatedList);

    if (activeForm && activeForm.id === formId) {
      setActiveForm(null);
      setCurrentView('form');
    }
  };

  // ---------------- Global Navigation ----------------

  const handleNewItem = () => {
    if (appMode === 'form_studio') {
      setActiveForm(null);
    } else if (appMode === 'excel_generator') {
      setActiveExcel(null);
    } else if (appMode === 'presentation_generator') {
      setActivePresentation(null);
    } else {
      setActiveDocument(null);
    }
    setCurrentView('form');
  };

  const handleSelectMode = (mode: AppMode) => {
    setAppMode(mode);
    setCurrentView('form');
  };

  // Pre-calculate admin metrics
  const adminMetrics = calculateAdminDashboardMetrics(
    savedDocuments,
    savedPresentations,
    savedExcelDocs,
    savedForms
  );

  // If in Admin Console mode, display dedicated admin view
  if (appMode === 'admin_console') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased">
        <AdminConsoleView
          stats={adminMetrics.stats}
          serviceShares={adminMetrics.serviceShares}
          dailyTrends={adminMetrics.dailyTrends}
          industryTops={adminMetrics.industryTops}
          recentLogs={adminMetrics.recentLogs}
          userList={adminMetrics.userList}
          onBackToApp={() => {
            setAppMode('form_studio');
            setCurrentView('form');
          }}
          onRefreshData={async () => {
            try {
              const [docs, pres, excels, forms] = await Promise.all([
                fetchAllDocuments(),
                fetchAllPresentations(),
                fetchAllExcelDocuments(),
                fetchAllBusinessForms(),
              ]);
              setSavedDocuments(docs);
              setSavedPresentations(pres);
              setSavedExcelDocs(excels);
              setSavedForms(forms);
            } catch (err) {
              console.error('Refresh admin data error:', err);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Global Navbar */}
      <Navbar
        savedCount={savedDocuments.length}
        savedPresCount={savedPresentations.length}
        savedExcelCount={savedExcelDocs.length}
        savedFormCount={savedForms.length}
        appMode={appMode}
        onSelectAppMode={handleSelectMode}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAgent={() => setIsAgentOpen(true)}
        onOpenSavedDocs={() => setIsSavedDocsOpen(true)}
        onOpenSavedPresentations={() => setIsSavedPresOpen(true)}
        onOpenSavedExcel={() => setIsSavedExcelOpen(true)}
        onOpenSavedForms={() => setIsSavedFormsOpen(true)}
        onNewDocument={handleNewItem}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentView={currentView}
      />

      {/* Global Error Banner */}
      {generationError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 w-full">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">생성 안내 및 오류</h4>
                <p className="text-xs text-red-700 mt-0.5">{generationError}</p>
              </div>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-100/60 cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1">
        {appMode === 'form_studio' ? (
          /* Form Studio */
          currentView === 'form' ? (
            <FormGeneratorForm
              onSubmit={handleGenerateForm}
              isLoading={isGeneratingForm}
            />
          ) : activeForm ? (
            <FormViewer
              document={activeForm}
              onUpdateDocument={handleUpdateFormDocument}
              onBackToForm={() => setCurrentView('form')}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>선택된 공문서/양식이 없습니다.</p>
              <button
                onClick={handleNewItem}
                className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                새 양식 작성하기
              </button>
            </div>
          )
        ) : appMode === 'excel_generator' ? (
          /* Excel Studio */
          currentView === 'form' ? (
            <ExcelGeneratorForm
              onGenerate={handleGenerateExcel}
              isLoading={isGeneratingExcel}
            />
          ) : activeExcel ? (
            <ExcelViewer
              document={activeExcel}
              onUpdateDocument={handleUpdateExcelDocument}
              onBackToForm={() => setCurrentView('form')}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>선택된 엑셀 문서가 없습니다.</p>
              <button
                onClick={handleNewItem}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                새 엑셀 생성하기
              </button>
            </div>
          )
        ) : appMode === 'presentation_generator' ? (
          /* Presentation Studio */
          currentView === 'form' ? (
            <PresentationForm
              initialData={presFormData}
              onSubmit={handleGeneratePresentation}
              isGenerating={isGeneratingPres}
              savedDocuments={savedDocuments}
              onConvertDocument={handleConvertDocumentToPres}
            />
          ) : activePresentation ? (
            <PresentationViewer
              presentation={activePresentation}
              onUpdatePresentation={handleUpdatePresentation}
              onBackToForm={() => setCurrentView('form')}
              onRegenerateSlide={handleRegenerateSlide}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>선택된 프레젠테이션이 없습니다.</p>
              <button
                onClick={handleNewItem}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                새 슬라이드 덱 작성
              </button>
            </div>
          )
        ) : (
          /* Document Studio */
          currentView === 'form' ? (
            <DocumentForm
              initialData={docFormData}
              onSubmit={handleGenerateDoc}
              isGenerating={isGeneratingDoc}
              onOpenTemplates={() => setIsTemplatesOpen(true)}
            />
          ) : activeDocument ? (
            <DocumentViewer
              document={activeDocument}
              onBackToForm={() => setCurrentView('form')}
              onUpdateDocument={handleUpdateDocument}
              onDeleteDocument={handleDeleteDocument}
              onRegenerateAll={() => handleGenerateDoc(activeDocument as any)}
              onNewDocument={handleNewItem}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>선택된 문서가 없습니다.</p>
              <button
                onClick={handleNewItem}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                새 문서 작성하기
              </button>
            </div>
          )
        )}
      </main>

      {/* Modals */}
      <TemplateGalleryModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <AgentChatModal
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        onApplyToForm={handleApplyAgentData}
        currentDocumentTitle={
          appMode === 'form_studio'
            ? activeForm?.title
            : appMode === 'excel_generator'
            ? activeExcel?.title
            : appMode === 'presentation_generator'
            ? activePresentation?.title
            : activeDocument?.title
        }
      />

      <SavedDocumentsModal
        documents={savedDocuments}
        isOpen={isSavedDocsOpen}
        onClose={() => setIsSavedDocsOpen(false)}
        onSelectDocument={(doc) => {
          setActiveDocument(doc);
          setAppMode('doc_generator');
          setCurrentView('viewer');
        }}
        onDeleteDocument={handleDeleteDocument}
        onToggleStar={handleToggleStar}
      />

      <SavedPresentationsModal
        presentations={savedPresentations}
        isOpen={isSavedPresOpen}
        onClose={() => setIsSavedPresOpen(false)}
        onSelectPresentation={(pres) => {
          setActivePresentation(pres);
          setAppMode('presentation_generator');
          setCurrentView('viewer');
        }}
        onDeletePresentation={handleDeletePresentation}
      />

      <SavedExcelModal
        documents={savedExcelDocs}
        isOpen={isSavedExcelOpen}
        onClose={() => setIsSavedExcelOpen(false)}
        onSelectDocument={(doc) => {
          setActiveExcel(doc);
          setAppMode('excel_generator');
          setCurrentView('viewer');
        }}
        onDeleteDocument={handleDeleteExcel}
      />

      <SavedFormsModal
        savedForms={savedForms}
        isOpen={isSavedFormsOpen}
        onClose={() => setIsSavedFormsOpen(false)}
        onSelectForm={(form) => {
          setActiveForm(form);
          setAppMode('form_studio');
          setCurrentView('viewer');
        }}
        onDeleteForm={handleDeleteForm}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      {currentView === 'form' && (
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold text-slate-700">
              분야별 전문 비즈니스 문서 · PPT 프레젠테이션 · 전문 엑셀 스프레드시트 · 표준 행정 양식 스튜디오 All-in-One AI
            </p>
            <p className="mt-1 text-slate-400">
              네이티브 MS Word(.DOCX) 내보내기 · 결재선 도장 날인 · 전자세금계산서 · Firestore 실시간 동기화
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
