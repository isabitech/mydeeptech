import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useSubmitAssessment } from "../../../../hooks/Auth/User/useSubmitAssessment";

interface SubmitProps {
  onSubmissionSuccess?: () => void;
}

const Submit = ({ onSubmissionSuccess }: SubmitProps) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const { submitAssessmentResults, loading } = useSubmitAssessment();

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt1MB = file.size / 1024 / 1024 < 1;
    if (!isLt1MB) {
      message.error('Image must be smaller than 1MB!');
      return false;
    }
    
    return false; // Prevent auto upload
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.error("Please upload at least one E2F test screenshot before submitting.");
      return;
    }

    try {
      // Extract actual File objects from fileList
      const files = fileList.map(item => item.originFileObj || item.file).filter(Boolean);
      
      const result = await submitAssessmentResults(files);
      
      if (result.success) {
        message.success("E2F test results submitted successfully! You will receive further instructions via email.");
        setFileList([]); // Clear the file list
        onSubmissionSuccess?.(); // Call the callback to update parent component
      } else {
        message.error(result.error || "Failed to submit assessment results");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      message.error("Failed to submit assessment results");
    }
  };

  return (
    <div className="mt-6 bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Submit E2F Test Results</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload screenshots of your E2F test results. Each image must be smaller than 1MB.
        </p>
        <Upload
          multiple
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={handleUploadChange}
          listType="picture-card" // shows image previews
          accept="image/*"
        >
          {fileList.length < 3 && ( // limit: 3 screenshots for E2F test
            <div>
              <UploadOutlined />
              <div className="mt-1 text-xs">Upload Image</div>
              <div className="text-xs text-gray-500">Max 1MB</div>
            </div>
          )}
        </Upload>

        <div className="mt-4">
          <Button
            type="primary"
            className="!bg-secondary !text-white !font-[gilroy-regular]"
            onClick={handleSubmit}
            loading={loading}
            disabled={fileList.length === 0}
          >
            Submit E2F Test Results
          </Button>
        </div>
      </div>
  )
}

export default Submit