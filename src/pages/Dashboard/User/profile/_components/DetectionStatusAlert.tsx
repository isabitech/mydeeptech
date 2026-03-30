import React from 'react';
import { Alert, Button, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface DetectionStatusAlertProps {
  detecting: boolean;
  detectionMessage: {
    type: 'success' | 'info' | 'warning';
    message: string;
  };
  onRedetect: () => void;
  isEditing: boolean;
}

const DetectionStatusAlert: React.FC<DetectionStatusAlertProps> = ({
  detecting,
  detectionMessage,
  onRedetect,
  isEditing
}) => {
  return (
    <>
      <Alert
        message={detectionMessage.message}
        type={detectionMessage.type}
        showIcon
        className="mb-4"
        action={
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onRedetect}
            loading={detecting}
            disabled={!isEditing}
          >
            Re-detect
          </Button>
        }
      />

      {detecting && (
        <div className="text-center mb-4">
          <Spin size="small" /> <span className="ml-2">Detecting device information...</span>
        </div>
      )}
    </>
  );
};

export default DetectionStatusAlert;