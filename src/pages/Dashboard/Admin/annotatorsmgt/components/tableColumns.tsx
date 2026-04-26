import { Button, Tag, Space } from "antd";
import { EyeOutlined, FileImageOutlined } from "@ant-design/icons";
import { type AnnotatorUser } from "../../../../../validators/annotators/annotators-schema";
import StatusTag from "./StatusTag";

interface ColumnHandlers {
  onViewDetails: (annotator: AnnotatorUser) => void;
  onViewResult: (annotator: AnnotatorUser) => void;
}

export const createAnnotatorTableColumns = ({ onViewDetails, onViewResult }: ColumnHandlers) => [
  {
    title: 'Full Name',
    dataIndex: 'fullName',
    key: 'fullName',
    sorter: true,
    width: 150,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 100,
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Domains',
    dataIndex: 'userDomains',
    key: 'userDomains',
    width: 300,
    render: (_: unknown, record: AnnotatorUser) => {
      const domains = 'userDomains' in record && record.userDomains || [];
      return (
        <div className="flex items-center gap-px gap-y-1 w-[300px] flex-wrap">
          {domains?.map((domain: { _id: string; name: string; assignmentId?: string }) => (
            <Tag key={domain._id} color="blue">{domain.name}</Tag>
          ))}
        </div>
      );
    },
  },
  {
    title: 'Annotator Status',
    dataIndex: 'annotatorStatus',
    key: 'annotatorStatus',
    width: 100,
    render: (status: string) => <StatusTag status={status} type="annotator" />,
  },
  {
    title: 'MicroTasker Status',
    dataIndex: 'microTaskerStatus',
    key: 'microTaskerStatus',
    width: 100,
    render: (status: string) => <StatusTag status={status} type="annotator" />,
  },
  {
    title: 'QA Status',
    dataIndex: 'qaStatus',
    key: 'qaStatus',
    render: (status: string) => <StatusTag status={status} type="qa" />,
  },
  {
    title: 'Email Verified',
    width: 100,
    dataIndex: 'isEmailVerified',
    key: 'isEmailVerified',
    render: (verified: boolean) => (
      <StatusTag 
        status={verified.toString()} 
        type="boolean" 
        trueLabel="VERIFIED" 
        falseLabel="UNVERIFIED" 
      />
    ),
  },
  {
    title: 'Password Set',
    dataIndex: 'hasSetPassword',
    key: 'hasSetPassword',
    width: 100,
    render: (hasPassword: boolean) => (
      <StatusTag 
        status={hasPassword.toString()} 
        type="boolean" 
        trueLabel="SET" 
        falseLabel="NOT SET" 
      />
    ),
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 100,
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Assessment Result",
    dataIndex: "resultLink",
    key: "resultLink",
    width: 100,
    render: (link: string, record: AnnotatorUser) => (
      link ?
        <Button
          type="link"
          icon={<FileImageOutlined />}
          onClick={() => onViewResult(record)}
        >
          View Result
        </Button>
        : "No Result"
    )
  },
  {
    title: "Action",
    key: "action",
    render: (_: unknown, record: AnnotatorUser) => (
      <Space size="middle">
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(record)}
        >
          View Details
        </Button>
      </Space>
    ),
  }
];