import React from 'react';
import { Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { PDFViewerModal, usePDFViewer } from './index';

/**
 * Example component demonstrating the usage of the reusable PDF viewer
 * This can be used as a reference for implementing PDF viewing in other components
 */
const PDFViewerExample: React.FC = () => {
  const { isVisible, fileUrl, openPDFViewer, closePDFViewer } = usePDFViewer();

  // Example document URLs (replace with actual URLs)
  const sampleDocuments = [
    { name: 'Sample Resume', url: 'https://example.com/sample-resume.pdf' },
    { name: 'Project Proposal', url: 'https://example.com/project-proposal.pdf' },
    { name: 'Technical Specification', url: 'https://example.com/tech-spec.pdf' },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">PDF Viewer Example</h2>
      
      <div className="space-y-2">
        {sampleDocuments.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded">
            <span className="font-medium">{doc.name}</span>
            <Button
              type="link"
              icon={<FileTextOutlined />}
              onClick={() => openPDFViewer(doc.url)}
            >
              View Document
            </Button>
          </div>
        ))}
      </div>

      <PDFViewerModal
        visible={isVisible}
        fileUrl={fileUrl}
        title="Document Preview"
        onClose={closePDFViewer}
        footerButtons={[
          <Button key="print" onClick={() => window.print()}>
            Print
          </Button>,
          <Button key="download" type="primary" href={fileUrl} download>
            Download
          </Button>,
        ]}
      />
    </div>
  );
};

export default PDFViewerExample;