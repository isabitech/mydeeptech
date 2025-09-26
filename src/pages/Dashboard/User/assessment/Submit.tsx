import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const Submit = () => {
     const [fileList, setFileList] = useState<any[]>([]);

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const handleSubmit = () => {
    if (fileList.length === 0) {
      message.error("Please upload at least one screenshot before submitting.");
      return;
    }
    message.success(`${fileList.length} screenshot(s) submitted successfully ✅`);
    // TODO: send all screenshots to backend API here
  };

  return (
    <div className="mt-6 bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Submit Results</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload screenshots of your certification and test results (you may upload more than one).
        </p>
        <Upload
          multiple
          beforeUpload={() => false} // prevent auto upload
          fileList={fileList}
          onChange={handleUploadChange}
          listType="picture-card" // shows image previews
        >
          {fileList.length < 5 && ( // optional limit: 5 screenshots
            <div>
              <UploadOutlined />
              <div className="mt-1 text-xs">Upload</div>
            </div>
          )}
        </Upload>

        <div className="mt-4">
          <Button
            type="primary"
            className="!bg-secondary !text-white !font-[gilroy-regular]"
            onClick={handleSubmit}
          >
            Submit Screenshots
          </Button>
        </div>
      </div>
  )
}

export default Submit