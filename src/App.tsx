/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppMode } from './components/Navbar';
import { IntroPage } from './components/IntroPage';
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
  fetchAllDocumentsForAdmin,
  fetchAllPresentationsForAdmin,
} from './services/firebaseService';
import {
  saveExcelDocument,
  fetchAllExcelDocuments,
  deleteExcelDocument,
  fetchAllExcelDocumentsForAdmin,
} from './services/excelFirebaseService';
import {
  saveBusinessForm,
  fetchAllBusinessForms,
  deleteBusinessForm,
  fetchAllBusinessFormsForAdmin,
  deleteBusinessFormForAdmin,
} from './services/formFirebaseService';
import { FormGeneratorForm } from './components/FormGeneratorForm';
import { FormViewer } from './components/FormViewer';
import { SavedFormsModal } from './components/SavedFormsModal';
import { MarketHub } from './components/market/MarketHub';
import { MarketPublishModal } from './components/market/MarketPublishModal';
import { MarketItem, MarketProductType } from './types/market';
import { AdminConsoleView } from './components/admin/AdminConsoleView';
import { UserImageGallery } from './components/UserImageGallery';
import { UserKnowledgeHub } from './components/UserKnowledgeHub';
import { UserHelpDrawer } from './components/UserHelpDrawer';
import { calculateAdminDashboardMetrics } from './services/adminAnalyticsService';
import { isUserAdmin } from './constants/adminConfig';
import { AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

function MainApp() {
  const { currentUser } = useAuth();
  const [appMode, setAppMode] = useState<AppMode>('intro');
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
  const [excelFormData, setExcelFormData] = useState<Partial<ExcelInputForm>>({});

  // Business Form states
  const [activeForm, setActiveForm] = useState<BusinessFormDocument | null>(null);
  const [savedForms, setSavedForms] = useState<BusinessFormDocument[]>([]);
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);
  const [formStudioFormData, setFormStudioFormData] = useState<Partial<BusinessFormInput>>({});

  // Marketplace states
  const [publishModalData, setPublishModalData] = useState<{
    id: string;
    productType: MarketProductType;
    title: string;
    subtitle?: string;
    summary?: string;
    category?: string;
    content: any;
  } | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [marketInitialDocId, setMarketInitialDocId] = useState<string | null>(null);

  // Modals & Errors
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isSavedDocsOpen, setIsSavedDocsOpen] = useState(false);
  const [isSavedPresOpen, setIsSavedPresOpen] = useState(false);
  const [isSavedExcelOpen, setIsSavedExcelOpen] = useState(false);
  const [isSavedFormsOpen, setIsSavedFormsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isKnowledgeHubOpen, setIsKnowledgeHubOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Deep Link URL Query Param check (?mode=market&docId=xxx)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      const docIdParam = params.get('docId') || params.get('item');
      if (modeParam === 'market' || docIdParam) {
        setAppMode('market');
        if (docIdParam) {
          setMarketInitialDocId(docIdParam);
        }
      }
    } catch (e) {
      console.error('URL parse error:', e);
    }
  }, []);

  // Load and refresh documents dynamically based on active appMode (admin vs user) and auth state
  useEffect(() => {
    async function loadData() {
      try {
        if (appMode === 'admin_console') {
          const [docs, pres, excels, forms] = await Promise.all([
            fetchAllDocumentsForAdmin(),
            fetchAllPresentationsForAdmin(),
            fetchAllExcelDocumentsForAdmin(),
            fetchAllBusinessFormsForAdmin(),
          ]);
          setSavedDocuments(docs);
          setSavedPresentations(pres);
          setSavedExcelDocs(excels);
          setSavedForms(forms);
        } else {
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
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    loadData();
  }, [currentUser, appMode]);

  // ---------------- Document Actions ----------------

  const handleGenerateDoc = async (data: DocumentInputForm) => {
    setIsGeneratingDoc(true);
    setGenerationError(null);
    try {
      const generatedDoc = await requestDocumentGeneration(data);
      setActiveDocument(generatedDoc);
      setAppMode('doc_generator');
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

  const handleSelectPreset = (preset: any, autoGenerate: boolean = false) => {
    const product = preset.productType || 'doc';
    if (product === 'doc') {
      if (preset.defaultData) {
        setDocFormData(preset.defaultData);
        if (autoGenerate && preset.defaultData.topic) {
          handleGenerateDoc(preset.defaultData as DocumentInputForm);
          return;
        }
      }
      setAppMode('doc_generator');
      setCurrentView('form');
    } else if (product === 'presentation') {
      if (preset.defaultData) {
        setPresFormData(preset.defaultData);
        if (autoGenerate && preset.defaultData.topic) {
          handleGeneratePresentation(preset.defaultData as PresentationInputForm);
          return;
        }
      }
      setAppMode('presentation_generator');
      setCurrentView('form');
    } else if (product === 'excel') {
      if (preset.defaultData) {
        setExcelFormData(preset.defaultData);
        if (autoGenerate && preset.defaultData.title) {
          handleGenerateExcel(preset.defaultData as ExcelInputForm);
          return;
        }
      }
      setAppMode('excel_generator');
      setCurrentView('form');
    } else if (product === 'form_studio') {
      if (preset.defaultData) {
        setFormStudioFormData(preset.defaultData);
        if (autoGenerate && preset.defaultData.title) {
          handleGenerateForm(preset.defaultData as BusinessFormInput);
          return;
        }
      }
      setAppMode('form_studio');
      setCurrentView('form');
    }
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
      setAppMode('presentation_generator');
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
      setAppMode('excel_generator');
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
      setAppMode('form_studio');
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

  // ---------------- Market Actions & Handlers ----------------

  const handleOpenPublishForDoc = (doc: GeneratedDocument) => {
    setPublishModalData({
      id: doc.id,
      productType: 'doc',
      title: doc.title,
      subtitle: `${doc.customField || doc.field} | ${doc.customDocumentType || doc.documentType}`,
      summary: doc.sections?.[0]?.content?.slice(0, 160) || '체계적인 목차와 내용으로 구성된 전문 비즈니스 문서입니다.',
      category: 'management',
      content: doc,
    });
    setIsPublishModalOpen(true);
  };

  const handleOpenPublishForPres = (pres: PresentationDocument) => {
    setPublishModalData({
      id: pres.id,
      productType: 'presentation',
      title: pres.title,
      subtitle: pres.subtitle,
      summary: pres.subtitle || `총 ${pres.slides?.length || 0}장으로 구성된 프리미엄 프레젠테이션 덱입니다.`,
      category: 'marketing',
      content: pres,
    });
    setIsPublishModalOpen(true);
  };

  const handleOpenPublishForExcel = (excel: ExcelDocument) => {
    setPublishModalData({
      id: excel.id,
      productType: 'excel',
      title: excel.title,
      subtitle: excel.subtitle || excel.company || '비즈니스 엑셀 모델',
      summary: excel.executiveSummary || `재무/운영 분석 및 KPI 대시보드가 포함된 실무 엑셀 스프레드시트입니다.`,
      category: 'finance',
      content: excel,
    });
    setIsPublishModalOpen(true);
  };

  const handleOpenPublishForForm = (form: BusinessFormDocument) => {
    setPublishModalData({
      id: form.id,
      productType: 'form_studio',
      title: form.title,
      subtitle: `문서번호: ${form.docNumber} | 기안자: ${form.drafter?.name || ''}`,
      summary: form.sections?.[0]?.content || `표준 결재선과 법적 효력을 갖춘 비즈니스 공문서 서식입니다.`,
      category: 'legal',
      content: form,
    });
    setIsPublishModalOpen(true);
  };

  const handleRemixMarketItem = (item: MarketItem) => {
    if (item.productType === 'presentation') {
      setActivePresentation(item.contentData);
      setAppMode('presentation_generator');
      setCurrentView('viewer');
    } else if (item.productType === 'excel') {
      setActiveExcel(item.contentData);
      setAppMode('excel_generator');
      setCurrentView('viewer');
    } else if (item.productType === 'form_studio') {
      setActiveForm(item.contentData);
      setAppMode('form_studio');
      setCurrentView('viewer');
    } else {
      setActiveDocument(item.contentData);
      setAppMode('doc_generator');
      setCurrentView('viewer');
    }

    try {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    } catch {}
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
          documents={savedDocuments}
          presentations={savedPresentations}
          excels={savedExcelDocs}
          forms={savedForms}
          onBackToApp={() => {
            setAppMode('form_studio');
            setCurrentView('form');
          }}
          onRefreshData={async () => {
            try {
              const [docs, pres, excels, forms] = await Promise.all([
                fetchAllDocumentsForAdmin(),
                fetchAllPresentationsForAdmin(),
                fetchAllExcelDocumentsForAdmin(),
                fetchAllBusinessFormsForAdmin(),
              ]);
              setSavedDocuments(docs);
              setSavedPresentations(pres);
              setSavedExcelDocs(excels);
              setSavedForms(forms);
            } catch (err) {
              console.error('Refresh admin data error:', err);
            }
          }}
          onEditDocument={(doc) => {
            setActiveDocument(doc);
            setAppMode('doc_generator');
            setCurrentView('viewer');
          }}
          onDeleteDocument={async (id) => {
            await deleteDocument(id);
            const updated = await fetchAllDocumentsForAdmin();
            setSavedDocuments(updated);
          }}
          onEditPresentation={(pres) => {
            setActivePresentation(pres);
            setAppMode('presentation_generator');
            setCurrentView('viewer');
          }}
          onDeletePresentation={async (id) => {
            await deletePresentation(id);
            const updated = await fetchAllPresentationsForAdmin();
            setSavedPresentations(updated);
          }}
          onEditExcel={(excel) => {
            setActiveExcel(excel);
            setAppMode('excel_generator');
            setCurrentView('viewer');
          }}
          onDeleteExcel={async (id) => {
            await deleteExcelDocument(id);
            const updated = await fetchAllExcelDocumentsForAdmin();
            setSavedExcelDocs(updated);
          }}
          onEditForm={(form) => {
            setActiveForm(form);
            setAppMode('form_studio');
            setCurrentView('viewer');
          }}
          onDeleteForm={async (userId, id) => {
            await deleteBusinessFormForAdmin(userId, id);
            const updated = await fetchAllBusinessFormsForAdmin();
            setSavedForms(updated);
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
        {appMode === 'intro' ? (
          <IntroPage
            onSelectAppMode={handleSelectMode}
            onOpenAgent={() => setIsAgentOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onApplyPreset={handleSelectPreset}
          />
        ) : appMode === 'market' ? (
          /* Open Marketplace & Webzine Studio */
          <MarketHub
            currentUser={currentUser}
            initialDocId={marketInitialDocId}
            onRemixToStudio={handleRemixMarketItem}
            onOpenMyDocuments={() => setIsSavedDocsOpen(true)}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        ) : appMode === 'form_studio' ? (
          /* Form Studio */
          currentView === 'form' ? (
            <FormGeneratorForm
              onSubmit={handleGenerateForm}
              isLoading={isGeneratingForm}
              initialData={formStudioFormData}
            />
          ) : activeForm ? (
            <FormViewer
              document={activeForm}
              onUpdateDocument={handleUpdateFormDocument}
              onBackToForm={() => setCurrentView('form')}
              onPublishToMarket={() => handleOpenPublishForForm(activeForm)}
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
              initialData={excelFormData}
            />
          ) : activeExcel ? (
            <ExcelViewer
              document={activeExcel}
              onUpdateDocument={handleUpdateExcelDocument}
              onBackToForm={() => setCurrentView('form')}
              onPublishToMarket={() => handleOpenPublishForExcel(activeExcel)}
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
              onPublishToMarket={() => handleOpenPublishForPres(activePresentation)}
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
              onPublishToMarket={() => handleOpenPublishForDoc(activeDocument)}
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
        onPublishToMarket={(doc) => handleOpenPublishForDoc(doc)}
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
        onPublishToMarket={(pres) => handleOpenPublishForPres(pres)}
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
        onPublishToMarket={(doc) => handleOpenPublishForExcel(doc)}
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
        onPublishToMarket={(form) => handleOpenPublishForForm(form)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <UserImageGallery
        isOpen={isImageGalleryOpen}
        onClose={() => setIsImageGalleryOpen(false)}
      />

      <UserKnowledgeHub
        isOpen={isKnowledgeHubOpen}
        onClose={() => setIsKnowledgeHubOpen(false)}
      />

      <UserHelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Market Publish Modal */}
      {publishModalData && (
        <MarketPublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          documentData={publishModalData}
          currentUser={currentUser}
          onPublishedSuccess={(item) => {
            setIsPublishModalOpen(false);
            setMarketInitialDocId(item.id);
            setAppMode('market');
            try {
              confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
            } catch {}
          }}
        />
      )}

      {/* Floating Smart Help Trigger */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-34 right-6 z-40 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-xl transition-all hover:scale-105 active:scale-95 border border-emerald-400/20 cursor-pointer"
      >
        <span className="w-4.5 h-4.5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">📢</span>
        <span>스마트 도움말</span>
      </button>

      {/* Floating Knowledge Hub Trigger */}
      <button
        onClick={() => setIsKnowledgeHubOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-550 text-white font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 border border-cyan-400/20 cursor-pointer"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">💡</span>
        <span>실시간 지식허브</span>
      </button>

      {/* Floating Image Gallery Trigger */}
      <button
        onClick={() => setIsImageGalleryOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 border border-indigo-400/20 cursor-pointer"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">🖼️</span>
        <span>공용 이미지 갤러리</span>
      </button>

      {/* Footer */}
      {currentView === 'form' && appMode !== 'intro' && appMode !== 'market' && (
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
