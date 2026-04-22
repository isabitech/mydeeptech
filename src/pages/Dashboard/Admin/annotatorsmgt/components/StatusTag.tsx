import { Tag } from "antd";
import { STATUS_COLORS, QA_STATUS_COLORS, AnnotatorStatus, QAStatus } from "../constants";

interface StatusTagProps {
  status: string | undefined;
  type?: 'annotator' | 'qa' | 'boolean';
  trueLabel?: string;
  falseLabel?: string;
}

const StatusTag = ({ status, type = 'annotator', trueLabel = 'YES', falseLabel = 'NO' }: StatusTagProps) => {
  // Handle boolean status (like verified, password set)
  if (type === 'boolean') {
    const isTrue = status === 'true';
    return (
      <Tag color={isTrue ? 'green' : 'red'}>
        {isTrue ? trueLabel : falseLabel}
      </Tag>
    );
  }

  // Handle QA status
  if (type === 'qa') {
    const color = status ? QA_STATUS_COLORS[status as QAStatus] || 'default' : 'orange';
    return (
      <Tag color={color}>
        {status ? status.toUpperCase() : 'PENDING'}
      </Tag>
    );
  }

  // Handle regular annotator status
  const color = status ? STATUS_COLORS[status as AnnotatorStatus] || 'default' : 'gray';
  return (
    <Tag color={color}>
      {status?.toUpperCase() || 'UNKNOWN'}
    </Tag>
  );
};

export default StatusTag;