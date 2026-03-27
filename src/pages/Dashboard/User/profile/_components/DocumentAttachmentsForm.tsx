import React, { useState } from "react";
import { Form, Input, Upload, Button, Space } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { PDFViewerModal } from "../../../../../components/PDFViewer";

interface DocumentAttachmentsFormProps {
  profile: any;
  isEditing: boolean;
  uploading: boolean;
  onResumeUpload: (file: File) => Promise<boolean>;
  onIdDocumentUpload: (file: File) => Promise<boolean>;
  onRemoveDocument: (fieldName: string, documentType: string) => void;
}

const DocumentAttachmentsForm: React.FC<DocumentAttachmentsFormProps> = ({
  profile,
  isEditing,
  uploading,
  onResumeUpload,
  onIdDocumentUpload,
  onRemoveDocument,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState("");

  const handleViewDocument = (url: string, title: string) => {
    setSelectedDocumentUrl(url);
    setSelectedDocumentTitle(title);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDocumentUrl("");
    setSelectedDocumentTitle("");
  };
  return (
    <>
         <Form.Item label="Resume/CV" name="resumeUrl">
          <div className="flex gap-2">
            <Input
              disabled={!isEditing}
              className="!font-[gilroy-regular] flex-1"
              placeholder={
                profile?.attachments?.resumeUrl
                  ? "Resume uploaded successfully"
                  : "No resume uploaded"
              }
              value={
                profile?.attachments?.resumeUrl
                  ? "Resume uploaded"
                  : ""
              }
            />
            {profile?.attachments?.resumeUrl && (
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() =>
                    handleViewDocument(
                      profile.attachments.resumeUrl,
                      "Resume/CV",
                    )
                  }
                  title="View Resume"
                >
                  View
                </Button>
                {isEditing && (
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() =>
                      onRemoveDocument("resumeUrl", "Resume")
                    }
                    title="Remove Resume"
                  >
                    Remove
                  </Button>
                )}
              </Space>
            )}
            {isEditing && (
              <Upload
                showUploadList={false}
                beforeUpload={onResumeUpload}
                accept=".pdf,.doc,.docx"
              >
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                  disabled={!isEditing}
                  loading={uploading}
                  title={
                    profile?.attachments?.resumeUrl
                      ? "Change Resume"
                      : "Upload Resume"
                  }
                >
                  {profile?.attachments?.resumeUrl
                    ? "Change"
                    : "Upload"}
                </Button>
              </Upload>
            )}
          </div>
        </Form.Item>

        <Form.Item label="ID Document" name="idDocumentUrl">
          <div className="flex gap-2">
            <Input
              disabled={!isEditing}
              className="!font-[gilroy-regular] flex-1"
              placeholder={
                profile?.attachments?.idDocumentUrl
                  ? "ID document uploaded successfully"
                  : "No ID document uploaded"
              }
              value={
                profile?.attachments?.idDocumentUrl
                  ? "ID document uploaded"
                  : ""
              }
            />
            {profile?.attachments?.idDocumentUrl && (
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() =>
                    handleViewDocument(
                      profile.attachments.idDocumentUrl,
                      "ID Document",
                    )
                  }
                  title="View ID Document"
                >
                  View
                </Button>
                {isEditing && (
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() =>
                      onRemoveDocument(
                        "idDocumentUrl",
                        "ID Document",
                      )
                    }
                    title="Remove ID Document"
                  >
                    Remove
                  </Button>
                )}
              </Space>
            )}
            {isEditing && (
              <Upload
                showUploadList={false}
                beforeUpload={onIdDocumentUpload}
                accept=".pdf,.jpg,.jpeg,.png"
              >
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                  disabled={!isEditing}
                  loading={uploading}
                  title={
                    profile?.attachments?.idDocumentUrl
                      ? "Change ID Document"
                      : "Upload ID Document"
                  }
                >
                  {profile?.attachments?.idDocumentUrl
                    ? "Change"
                    : "Upload"}
                </Button>
              </Upload>
            )}
          </div>
        </Form.Item>

        {/* Document Viewer Modal */}
        <PDFViewerModal
          visible={modalVisible}
          fileUrl={selectedDocumentUrl}
          title={selectedDocumentTitle}
          onClose={handleCloseModal}
        />
    </>
  );
};

export default DocumentAttachmentsForm;