import { Button, Popconfirm, Space, Tag, Tooltip, Progress, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { VideoReel } from '../types';

const { Text } = Typography;

export const reelColumns = (
  onEdit: (reel: VideoReel) => void,
  onDelete: (id: string) => void
) => [
  {
    title: 'Video',
    render: (r: VideoReel) => (
      <div className="flex gap-3">
        <img src={r.thumbnailUrl} className="w-16 h-16 rounded" />
        <div>
          <div className="font-medium">{r.title}</div>
          <Text className="text-xs">{r.description}</Text>
        </div>
      </div>
    ),
  },
  {
    title: 'Niche',
    dataIndex: 'niche',
    render: (v: string) => <Tag color="purple">{v}</Tag>,
  },
  {
    title: 'Quality',
    dataIndex: 'qualityScore',
    render: (v: number) => <Progress type="circle" percent={v * 10} size={40} />,
  },
  {
    title: 'Actions',
    render: (r: VideoReel) => (
      <Space>
        <Tooltip title="Preview">
          <Button icon={<PlayCircleOutlined />} onClick={() => window.open(r.youtubeUrl)} />
        </Tooltip>
        <Tooltip title="Edit">
          <Button icon={<EditOutlined />} onClick={() => onEdit(r)} />
        </Tooltip>
        <Popconfirm title="Delete?" onConfirm={() => onDelete(r._id)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];
