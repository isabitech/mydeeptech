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

## Hooks

### `usePDFViewer`

A custom hook that manages PDF viewer modal state with common patterns.

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

## Features

- ✅ **No Download Prompts**: Documents render directly in the browser without triggering downloads
- ✅ **Full PDF Viewer**: Includes zoom, pagination, search, and navigation controls
- ✅ **Responsive Design**: Adapts to different screen sizes
- ✅ **Customizable**: Support for custom titles, dimensions, and footer buttons
- ✅ **Consistent Styling**: Matches application design patterns
- ✅ **Performance Optimized**: Uses Web Workers for PDF processing
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation

## Implementation Notes

- Uses `@react-pdf-viewer/core` and `@react-pdf-viewer/default-layout` for PDF rendering
- Requires `pdfjs-dist` for Web Worker functionality
- Modal automatically destroys on close to prevent memory leaks
- PDF.js worker loaded from CDN for optimal performance

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

## Dependencies

- `@react-pdf-viewer/core`: ^3.12.0
- `@react-pdf-viewer/default-layout`: ^3.12.0
- `pdfjs-dist`: ^3.11.174
- `antd`: ^5.22.1 (for Modal and Button components)