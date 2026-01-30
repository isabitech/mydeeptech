import { Modal, Form, Input, Select, Button, Row, Col, Space, Alert } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface Props {
  open: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export const BulkUploadModal: React.FC<Props> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Bulk Upload YouTube Reels"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        message="Bulk Upload Instructions"
        description="Enter one YouTube URL per line."
        className="mb-4"
      />

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="YouTube URLs"
          name="urls"
          rules={[{ required: true }]}
        >
          <TextArea rows={8} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Default Niche"
              name="defaultNiche"
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

          <Col span={12}>
            <Form.Item label="Default Tags" name="defaultTags">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Start Bulk Upload
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
