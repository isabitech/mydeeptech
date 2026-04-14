import React, { useState } from "react";
import { Modal, Button, Tabs } from "antd";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFDocument {
  key: string;
  title: string;
  url: string;
}

interface MultiPDFViewerModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Array of PDF documents to display */
  documents: PDFDocument[];
  /** Modal title */
  title?: string;
  /** Function to close the modal */
  onClose: () => void;
  /** Additional footer buttons */
  footerButtons?: React.ReactNode[];
  /** Modal width */
  width?: number;
  /** Custom height for the PDF viewer */
  height?: string;
  /** Default active tab key */
  defaultActiveKey?: string;
  /** Hide the default close button */
  hideCloseButton?: boolean;
}

const MultiPDFViewerModal: React.FC<MultiPDFViewerModalProps> = ({
  visible,
  documents,
  title = "Document Preview",
  onClose,
  footerButtons = [],
  width = 1200,
  height = "70vh",
  defaultActiveKey,
  hideCloseButton = false,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || documents[0]?.key);
  
  // Initialize PDF viewer plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const defaultFooter = hideCloseButton ? [] : [
    <Button key="close" onClick={onClose}>
      Close
    </Button>,
  ];

  const footer = [...footerButtons, ...defaultFooter].filter(Boolean);

  // Create tab items
  const tabItems = documents.map(doc => ({
    key: doc.key,
    label: doc.title,
    children: (
      <div style={{ height: height }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={doc.url}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      </div>
    ),
  }));

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={footer}
      width={width}
      style={{ top: 20 }}
      styles={{
        body: {
          height: height,
          overflow: "hidden",
          padding: "8px",
        },
      }}
      destroyOnClose
    >
      {documents.length > 0 && (
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
          type="card"
          size="small"
        />
      )}
    </Modal>
  );
};

export default MultiPDFViewerModal;