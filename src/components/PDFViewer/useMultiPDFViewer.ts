import { useState } from 'react';

interface PDFDocument {
  key: string;
  title: string;
  url: string;
}

interface UseMultiPDFViewerReturn {
  /** Whether the PDF viewer modal is visible */
  isVisible: boolean;
  /** Current PDF documents */
  documents: PDFDocument[];
  /** Open the PDF viewer with multiple documents */
  openMultiPDFViewer: (docs: PDFDocument[]) => void;
  /** Close the PDF viewer */
  closePDFViewer: () => void;
  /** Add a document to the current viewer */
  addDocument: (doc: PDFDocument) => void;
  /** Remove a document from the current viewer */
  removeDocument: (key: string) => void;
}

/**
 * Hook for managing multi-PDF viewer modal state
 * 
 * @example
 * ```tsx
 * const { isVisible, documents, openMultiPDFViewer, closePDFViewer } = useMultiPDFViewer();
 * 
 * const handleViewDocuments = () => {
 *   openMultiPDFViewer([
 *     { key: 'sop', title: 'Standard Operating Procedure', url: '/assets/pdfs/sop.pdf' },
 *     { key: 'nda', title: 'Non-Disclosure Agreement', url: '/assets/pdfs/nda.pdf' },
 *   ]);
 * };
 * 
 * <MultiPDFViewerModal
 *   visible={isVisible}
 *   documents={documents}
 *   onClose={closePDFViewer}
 * />
 * ```
 */
export const useMultiPDFViewer = (): UseMultiPDFViewerReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [documents, setDocuments] = useState<PDFDocument[]>([]);

  const openMultiPDFViewer = (docs: PDFDocument[]) => {
    setDocuments(docs);
    setIsVisible(true);
  };

  const closePDFViewer = () => {
    setIsVisible(false);
    setDocuments([]);
  };

  const addDocument = (doc: PDFDocument) => {
    setDocuments(prev => [...prev, doc]);
  };

  const removeDocument = (key: string) => {
    setDocuments(prev => prev.filter(doc => doc.key !== key));
  };

  return {
    isVisible,
    documents,
    openMultiPDFViewer,
    closePDFViewer,
    addDocument,
    removeDocument,
  };
};