import { Modal, Form, Input, InputNumber, Switch, Button, Row, Col, Space, FormInstance } from 'antd';

const { TextArea } = Input;

interface Props {
  open: boolean;
  editingAssessment: any;
  form: any;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export const AssessmentModal: React.FC<Props> = ({
  open,
  editingAssessment,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title={editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Assessment Title"
              name="title"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Number of Tasks"
              name="numberOfTasks"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={10} className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Time Limit (minutes)"
              name="timeLimit"
              rules={[{ required: true }]}
            >
              <InputNumber min={30} max={180} className="w-full" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Passing Score"
              name="passingScore"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={10} step={0.1} className="w-full" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Max Retries"
              name="maxRetries"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={5} className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Allow Pausing"
              name={['requirements', 'allowPausing']}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Is Active"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editingAssessment ? 'Update Assessment' : 'Create Assessment'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
