import { useState } from "react";
import { apiUpload } from "../service/apiUtils";

export const useUploadFile = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const uploadFile = async (file: File, endpoint: string) => {
    setUploading(true);
    setError(null);
    setUrl(null);
    try {
      const result = await apiUpload(endpoint, file);
      // Assume the backend returns { url: "..." }
      setUrl(result.url || result.data?.url || null);
      return { success: true, url: result.url || result.data?.url };
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, error, url };
};
