import React from "react";
import { Modal, Button } from "antd";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** PDF file URL to display */
  fileUrl: string;
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
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  visible,
  fileUrl,
  title = "Document Preview",
  onClose,
  footerButtons = [],
  width = 900,
  height = "70vh",
}) => {
  // Initialize PDF viewer plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const defaultFooter = [
    <Button key="close" onClick={onClose}>
      Close
    </Button>,
  ];

  const footer = [...footerButtons, ...defaultFooter].filter(Boolean);

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
      destroyOnHidden
    >
      {fileUrl && (
        <div style={{ height: "100%" }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>
      )}
    </Modal>
  );
};

export default PDFViewerModal;