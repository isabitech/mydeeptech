import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { FileTextOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { MultiPDFViewerModal, useMultiPDFViewer } from './index';

/**
 * Example component demonstrating the usage of the multi-PDF viewer
 * This shows how to display multiple PDF documents in tabs with optional close button control
 */
const MultiPDFViewerExample: React.FC = () => {
  const { isVisible, documents, openMultiPDFViewer, closePDFViewer } = useMultiPDFViewer();
  const [acceptanceRequired, setAcceptanceRequired] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Example: Show contract documents with close button hidden until accepted
  const handleViewContracts = () => {
    setAcceptanceRequired(true);
    setIsAccepted(false);
    openMultiPDFViewer([
      { 
        key: 'sop', 
        title: 'Standard Operating Procedure', 
        url: '/assets/pdfs/Standard_Operating_Procedure_(SOP)_for_Freelancers.pdf' 
      },
      { 
        key: 'nda', 
        title: 'Non-Disclosure Agreement', 
        url: '/assets/pdfs/MYDEEPTECH NDA.pdf' 
      },
    ]);
  };

  // Example: Show project documents with close button always available
  const handleViewProjectDocs = () => {
    setAcceptanceRequired(false);
    openMultiPDFViewer([
      { 
        key: 'proposal', 
        title: 'Project Proposal', 
        url: '/assets/pdfs/project-proposal.pdf' 
      },
      { 
        key: 'requirements', 
        title: 'Requirements Document', 
        url: '/assets/pdfs/requirements.pdf' 
      },
      { 
        key: 'specifications', 
        title: 'Technical Specifications', 
        url: '/assets/pdfs/tech-specs.pdf' 
      },
    ]);
  };

  const handleAccept = () => {
    setIsAccepted(true);
  };

  const handleClose = () => {
    closePDFViewer();
    setAcceptanceRequired(false);
    setIsAccepted(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Multi-PDF Viewer Example</h2>
      
      <Space size="middle" direction="vertical">
        <div>
          <h3 className="text-lg mb-2">Acceptance Required (No Close Button)</h3>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleViewContracts}
          >
            View Contract Documents (Must Accept)
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg mb-2">Regular Viewing (With Close Button)</h3>
          <Button
            type="default"
            icon={<FileTextOutlined />}
            onClick={handleViewProjectDocs}
          >
            View Project Documents
          </Button>
        </div>
      </Space>

      <MultiPDFViewerModal
        visible={isVisible}
        documents={documents}
        title={acceptanceRequired ? "Please Review and Accept" : "Document Collection"}
        onClose={handleClose}
        width={1200}
        hideCloseButton={acceptanceRequired && !isAccepted} // Hide close button only for contractx until accepted
        footerButtons={[
          acceptanceRequired && !isAccepted ? (
            <Button 
              key="accept" 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={handleAccept}
            >
              Accept Documents
            </Button>
          ) : (
            <Button key="print" onClick={() => window.print()}>
              Print Current Document
            </Button>
          ),
        ]}
      />
    </div>
  );
};

export default MultiPDFViewerExample;