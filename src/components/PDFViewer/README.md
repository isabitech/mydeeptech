# PDF Viewer Components

A set of reusable components for viewing PDF documents in modal dialogs throughout the application.

## Components

### `PDFViewerModal`

A modal component that displays PDF documents using PDF.js with a clean, professional interface.

#### Props

- `visible: boolean` - Whether the modal is visible
- `fileUrl: string` - PDF file URL to display
- `title?: string` - Modal title (default: "Document Preview")
- `onClose: () => void` - Function to close the modal
- `footerButtons?: React.ReactNode[]` - Additional footer buttons
- `width?: number` - Modal width (default: 900)
- `height?: string` - Custom height for the PDF viewer (default: "70vh")

#### Example

```tsx
import { PDFViewerModal } from '../components/PDFViewer';

function DocumentTable() {
  const [isVisible, setIsVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const viewDocument = (url: string) => {
    setFileUrl(url);
    setIsVisible(true);
  };

  return (
    <div>
      <Button onClick={() => viewDocument('path/to/document.pdf')}>
        View Document
      </Button>
      
      <PDFViewerModal
        visible={isVisible}
        fileUrl={fileUrl}
        title="Employee Resume"
        onClose={() => setIsVisible(false)}
        footerButtons={[
          <Button key="download" type="primary">
            Download
          </Button>
        ]}
      />
    </div>
  );
}
```

### `MultiPDFViewerModal`

A modal component that displays multiple PDF documents in tabs, perfect for viewing related documents together.

#### Props

- `visible: boolean` - Whether the modal is visible
- `documents: PDFDocument[]` - Array of PDF documents to display
- `title?: string` - Modal title (default: "Document Preview")
- `onClose: () => void` - Function to close the modal
- `footerButtons?: React.ReactNode[]` - Additional footer buttons
- `width?: number` - Modal width (default: 1200)
- `height?: string` - Custom height for the PDF viewer (default: "70vh")
- `defaultActiveKey?: string` - Default active tab key
- `hideCloseButton?: boolean` - Hide the default close button (default: false)

#### PDFDocument Interface

```tsx
interface PDFDocument {
  key: string;        // Unique identifier for the document
  title: string;      // Tab title
  url: string;        // PDF file URL
}
```

#### Example

```tsx
import { MultiPDFViewerModal, useMultiPDFViewer } from '../components/PDFViewer';

function ContractDocuments() {
  const { isVisible, documents, openMultiPDFViewer, closePDFViewer } = useMultiPDFViewer();
  const [isAccepted, setIsAccepted] = useState(false);

  const handleViewDocuments = () => {
    openMultiPDFViewer([
      { key: 'sop', title: 'Standard Operating Procedure', url: '/assets/pdfs/sop.pdf' },
      { key: 'nda', title: 'Non-Disclosure Agreement', url: '/assets/pdfs/nda.pdf' },
      { key: 'contract', title: 'Service Contract', url: '/assets/pdfs/contract.pdf' },
    ]);
  };

  return (
    <div>
      <Button onClick={handleViewDocuments}>
        View Contract Documents
      </Button>
      
      <MultiPDFViewerModal
        visible={isVisible}
        documents={documents}
        title="Contract Documents"
        onClose={closePDFViewer}
        width={1200}
        hideCloseButton={!isAccepted} // Hide close button until documents are accepted
        footerButtons={[
          !isAccepted ? (
            <Button key="accept" type="primary" onClick={() => setIsAccepted(true)}>
              Accept All Documents
            </Button>
          ) : (
            <Button key="download" type="primary">
              Download Package
            </Button>
          )
        ]}
      />
    </div>
  );
}
```

## Hooks

### `usePDFViewer`

A custom hook that manages PDF viewer modal state for single documents.

#### Returns

- `isVisible: boolean` - Whether the PDF viewer modal is visible
- `fileUrl: string` - Current PDF file URL
- `openPDFViewer: (url: string) => void` - Open the PDF viewer with a file URL
- `closePDFViewer: () => void` - Close the PDF viewer

#### Example

```tsx
import { PDFViewerModal, usePDFViewer } from '../components/PDFViewer';

function MyComponent() {
  const { isVisible, fileUrl, openPDFViewer, closePDFViewer } = usePDFViewer();

  return (
    <div>
      <Button onClick={() => openPDFViewer('path/to/document.pdf')}>
        View PDF
      </Button>
      
      <PDFViewerModal
        visible={isVisible}
        fileUrl={fileUrl}
        onClose={closePDFViewer}
        title="Document Preview"
      />
    </div>
  );
}
```

### `useMultiPDFViewer`

A custom hook that manages multi-PDF viewer modal state for collections of documents.

#### Returns

- `isVisible: boolean` - Whether the PDF viewer modal is visible
- `documents: PDFDocument[]` - Current PDF documents array
- `openMultiPDFViewer: (docs: PDFDocument[]) => void` - Open the viewer with multiple documents
- `closePDFViewer: () => void` - Close the PDF viewer
- `addDocument: (doc: PDFDocument) => void` - Add a document to the current viewer
- `removeDocument: (key: string) => void` - Remove a document from the current viewer

#### Example

```tsx
import { MultiPDFViewerModal, useMultiPDFViewer } from '../components/PDFViewer';

function DocumentCollection() {
  const { isVisible, documents, openMultiPDFViewer, closePDFViewer, addDocument } = useMultiPDFViewer();

  const openInitialDocs = () => {
    openMultiPDFViewer([
      { key: 'doc1', title: 'Document 1', url: '/path/to/doc1.pdf' },
      { key: 'doc2', title: 'Document 2', url: '/path/to/doc2.pdf' },
    ]);
  };

  const addAdditionalDoc = () => {
    addDocument({ key: 'doc3', title: 'Document 3', url: '/path/to/doc3.pdf' });
  };

  return (
    <div>
      <Button onClick={openInitialDocs}>View Documents</Button>
      <Button onClick={addAdditionalDoc}>Add Document</Button>
      
      <MultiPDFViewerModal
        visible={isVisible}
        documents={documents}
        onClose={closePDFViewer}
      />
    </div>
  );
}
```

## Use Cases

### Single PDF Viewer
- Resume viewing in applicant management
- Individual document previews
- Simple document attachments

### Multi-PDF Viewer  
- **Contract Documents**: SOP + NDA + Service Agreement
- **Project Documents**: Proposal + Requirements + Specifications
- **Legal Documents**: Multiple contracts or agreements
- **Training Materials**: Collection of related PDFs
- **Application Packages**: Resume + Portfolio + References

## Features

- ✅ **No Download Prompts**: Documents render directly in the browser without triggering downloads
- ✅ **Full PDF Viewer**: Includes zoom, pagination, search, and navigation controls
- ✅ **Responsive Design**: Adapts to different screen sizes
- ✅ **Customizable**: Support for custom titles, dimensions, and footer buttons
- ✅ **Tabbed Interface**: Multi-document viewing with easy tab switching
- ✅ **Performance Optimized**: Uses Web Workers for PDF processing
- ✅ **Memory Management**: Proper cleanup to prevent memory leaks
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Implementation Notes

- Uses `@react-pdf-viewer/core` and `@react-pdf-viewer/default-layout` for PDF rendering
- Requires `pdfjs-dist` for Web Worker functionality
- Modal automatically destroys on close to prevent memory leaks
- PDF.js worker loaded from CDN for optimal performance
- Multi-PDF viewer uses tab switching to maintain performance

## Migration Guide

### Before (inline implementation)
```tsx
// Inline PDF modal implementation
const [pdfVisible, setPdfVisible] = useState(false);
const [pdfUrl, setPdfUrl] = useState('');

// Large amount of modal and PDF viewer setup code...
```

### After (reusable component)
```tsx
// Clean, reusable implementation
const { isVisible, fileUrl, openPDFViewer, closePDFViewer } = usePDFViewer();

<PDFViewerModal
  visible={isVisible}
  fileUrl={fileUrl}
  onClose={closePDFViewer}
/>
```

### Upgrading to Multi-PDF
```tsx
// From single PDF viewer
const { isVisible, fileUrl, openPDFViewer, closePDFViewer } = usePDFViewer();

// To multi-PDF viewer
const { isVisible, documents, openMultiPDFViewer, closePDFViewer } = useMultiPDFViewer();

// Usage change
openPDFViewer('single-doc.pdf');
// becomes
openMultiPDFViewer([
  { key: 'doc1', title: 'Document', url: 'single-doc.pdf' }
]);
```

## Dependencies

- `@react-pdf-viewer/core`: ^3.12.0
- `@react-pdf-viewer/default-layout`: ^3.12.0
- `pdfjs-dist`: ^3.11.174
- `antd`: ^5.22.1 (for Modal, Button, and Tabs components)