import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Space,
  Alert,
  Tooltip,
} from 'antd';
import { YoutubeOutlined, LinkOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface Props {
  open: boolean;
  editingReel: any;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export const ReelModal: React.FC<Props> = ({
  open,
  editingReel,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title={editingReel ? 'Edit Video Reel' : 'Add Video Reel'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="YouTube URL"
          name="youtubeUrl"
          rules={[
            { required: true },
            {
              pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
              message: 'Invalid YouTube URL',
            },
          ]}
        >
          <Input
            prefix={<YoutubeOutlined />}
            addonAfter={
              <Tooltip title="Supports embed, shorts, watch, youtu.be">
                <LinkOutlined />
              </Tooltip>
            }
          />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          message="YouTube URL Information"
          description="Metadata will be auto-extracted if not provided."
          className="mb-4"
        />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Title" name="title">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Niche"
              name="niche"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="technology">Technology</Option>
                <Option value="lifestyle">Lifestyle</Option>
                <Option value="education">Education</Option>
                <Option value="entertainment">Entertainment</Option>
                <Option value="fitness">Fitness</Option>
                <Option value="sports">Sports</Option>
                <Option value="fashion">Fashion</Option>
                <Option value="food">Food & Cooking</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Description" name="description">
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Tags (comma-separated)" name="tags">
          <Input />
        </Form.Item>

        <Form.Item
          label="Is Active"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editingReel ? 'Update Reel' : 'Add Reel'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
