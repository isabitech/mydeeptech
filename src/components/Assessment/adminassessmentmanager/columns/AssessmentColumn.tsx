import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import { AssessmentConfig } from '../types';

const { Text } = Typography;

export const assessmentColumns = (
  onEdit: (record: AssessmentConfig) => void,
  onDelete: (id: string) => void
) => [
  {
    title: 'Assessment Title',
    dataIndex: 'title',
    render: (_: any, record: AssessmentConfig) => (
      <>
        <div className="font-medium">{record.title}</div>
        <Text type="secondary" className="text-xs">{record.description}</Text>
        <Tag color="blue">{record.project.name}</Tag>
      </>
    ),
  },
  {
    title: 'Tasks',
    render: (r: AssessmentConfig) => <Tag>{r.requirements.tasksPerAssessment}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'isActive',
    render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
  },
  {
    title: 'Actions',
    render: (record: AssessmentConfig) => (
      <Space>
        <Tooltip title="Edit">
          <Button icon={<EditOutlined />} type="text" onClick={() => onEdit(record)} />
        </Tooltip>
        <Tooltip title="Analytics">
          <Button icon={<BarChartOutlined />} type="text" />
        </Tooltip>
        <Popconfirm title="Delete?" onConfirm={() => onDelete(record.id)}>
          <Button danger icon={<DeleteOutlined />} type="text" />
        </Popconfirm>
      </Space>
    ),
  },
];
