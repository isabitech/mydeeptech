import { useState } from 'react';

interface UsePDFViewerReturn {
  /** Whether the PDF viewer modal is visible */
  isVisible: boolean;
  /** Current PDF file URL */
  fileUrl: string;
  /** Open the PDF viewer with a file URL */
  openPDFViewer: (url: string) => void;
  /** Close the PDF viewer */
  closePDFViewer: () => void;
}

/**
 * Hook for managing PDF viewer modal state
 * 
 * @example
 * ```tsx
 * const { isVisible, fileUrl, openPDFViewer, closePDFViewer } = usePDFViewer();
 * 
 * // In your component
 * <Button onClick={() => openPDFViewer('path/to/document.pdf')}>
 *   View PDF
 * </Button>
 * 
 * <PDFViewerModal
 *   visible={isVisible}
 *   fileUrl={fileUrl}
 *   onClose={closePDFViewer}
 * />
 * ```
 */
export const usePDFViewer = (): UsePDFViewerReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  const openPDFViewer = (url: string) => {
    setFileUrl(url);
    setIsVisible(true);
  };

  const closePDFViewer = () => {
    setIsVisible(false);
    setFileUrl('');
  };

  return {
    isVisible,
    fileUrl,
    openPDFViewer,
    closePDFViewer,
  };
};