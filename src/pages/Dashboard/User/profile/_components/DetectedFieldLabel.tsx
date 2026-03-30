import React, { ReactNode } from 'react';
import { Button } from 'antd';
import { DetectionField } from '../types';

interface DetectedFieldLabelProps {
  label: string;
  detectionField: DetectionField;
  onToggleManual: () => void;
  isEditing: boolean;
  children?: ReactNode;
}

const DetectedFieldLabel: React.FC<DetectedFieldLabelProps> = ({
  label,
  detectionField,
  onToggleManual,
  isEditing,
  children
}) => {
  return (
    <div className="flex items-center gap-2">
      {label}
      {detectionField.detected && !detectionField.manual && (
        <span className="text-green-500 text-xs">✓ Auto-detected</span>
      )}
      {detectionField.detected && (
        <Button
          type="link"
          size="small"
          onClick={onToggleManual}
          disabled={!isEditing}
          className="p-0 h-auto text-xs"
        >
          {detectionField.manual ? 'Use Auto' : 'Manual'}
        </Button>
      )}
      {children}
    </div>
  );
};

export default DetectedFieldLabel;