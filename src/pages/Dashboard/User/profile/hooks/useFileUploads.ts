import { notification } from "antd";
import { useUploadFile } from "../../../../../hooks/useUploadFile";
import { endpoints } from "../../../../../store/api/endpoints";

export const useFileUploads = (userId: string | undefined, profileRefetch: () => void, form: any) => {
  const { uploadFile, uploading } = useUploadFile();

  const handleResumeUpload = async (file: File) => {
    if (file.size / 1024 / 1024 > 5) {
      notification.error({
        message: "File too large",
        description: "Resume must be less than 5MB.",
      });
      return false;
    }

    try {
      const result = await uploadFile(file, endpoints.profileDT.uploadResume);
      if (result.success) {
        form.setFieldsValue({ resumeUrl: result.url });
        notification.success({
          message: "Resume uploaded",
          description: "Resume uploaded successfully.",
        });
        if (userId) {
          profileRefetch();
        }
      } else {
        notification.error({
          message: "Upload failed",
          description: result.error || "Failed to upload resume",
        });
      }
    } catch (error) {
      notification.error({
        message: "Upload failed",
        description: "An unexpected error occurred while uploading",
      });
    }
    return false;
  };

  const handleIdDocumentUpload = async (file: File) => {
    if (file.size / 1024 / 1024 > 5) {
      notification.error({
        message: "File too large",
        description: "ID document must be less than 5MB.",
      });
      return false;
    }

    try {
      const result = await uploadFile(
        file,
        endpoints.profileDT.uploadIdDocument,
      );
      if (result.success) {
        form.setFieldsValue({ idDocumentUrl: result.url });
        notification.success({
          message: "ID document uploaded",
          description: "ID document uploaded successfully.",
        });
        if (userId) {
          profileRefetch();
        }
      } else {
        notification.error({
          message: "Upload failed",
          description: result.error || "Failed to upload ID document",
        });
      }
    } catch (error) {
      notification.error({
        message: "Upload failed",
        description: "An unexpected error occurred while uploading",
      });
    }
    return false;
  };

  const handleViewDocument = (url: string, type: string) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      notification.warning({
        message: "No Document",
        description: `No ${type} has been uploaded yet.`,
      });
    }
  };

  const handleRemoveDocument = (fieldName: string, documentType: string) => {
    form.setFieldsValue({ [fieldName]: "" });
    notification.success({
      message: "Document Removed",
      description: `${documentType} has been removed. Remember to save your changes.`,
    });
  };

  return {
    uploading,
    handleResumeUpload,
    handleIdDocumentUpload,
    handleViewDocument,
    handleRemoveDocument
  };
};