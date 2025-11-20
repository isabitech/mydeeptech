import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Card,
  DatePicker,
  Alert,
} from "antd";
import { useAdminNotifications } from "../../../../hooks/Auth/Admin/useAdminNotifications";
import {
  BroadcastNotificationForm,
  NotificationType,
  Priority,
} from "../../../../types/notification.types";

const { TextArea } = Input;
const { Option } = Select;

interface BroadcastNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BroadcastNotificationModal: React.FC<BroadcastNotificationModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { broadcastNotification, loading } = useAdminNotifications();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const broadcastData: BroadcastNotificationForm = {
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        targetAudience: values.targetAudience,
        actionUrl: values.actionUrl || undefined,
        actionText: values.actionText || undefined,
        scheduleFor: values.scheduleFor ? values.scheduleFor.toISOString() : undefined,
      };

      const result = await broadcastNotification(broadcastData);

      if (result.success) {
        message.success(
          `Broadcast notification sent to ${result.data.actualRecipients} users successfully!`
        );
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(result.error || "Failed to send broadcast notification");
      }
    } catch (error) {
      message.error("Failed to send broadcast notification");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="📢 Broadcast Notification"
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          style={{ backgroundColor: "#1890ff" }}
        >
          Send Broadcast
        </Button>,
      ]}
    >
      <Alert
        message="Broadcast Notification"
        description="This will send the notification to all users in the selected audience. Please review carefully before sending."
        type="info"
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: "medium",
          type: "system_announcement",
          targetAudience: "all",
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Broadcast Title"
              rules={[{ required: true, message: "Please enter broadcast title" }]}
            >
              <Input 
                placeholder="e.g., 🚀 Platform Update Available"
                style={{ fontSize: "16px" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="message"
              label="Broadcast Message"
              rules={[{ required: true, message: "Please enter broadcast message" }]}
            >
              <TextArea
                rows={5}
                placeholder="Enter the detailed message you want to broadcast to users..."
                style={{ fontSize: "14px" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="targetAudience"
              label="Target Audience"
              rules={[{ required: true, message: "Please select target audience" }]}
            >
              <Select placeholder="Select audience">
                <Option value="all">🌍 All Users</Option>
                <Option value="annotators">👥 Annotators Only</Option>
                <Option value="micro_taskers">⚡ Micro Taskers Only</Option>
                <Option value="verified_users">✅ Verified Users Only</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Notification Type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select notification type">
                <Option value="system_announcement">📢 System Announcement</Option>
                <Option value="system_alert">⚠️ System Alert</Option>
                <Option value="account_update">👤 Account Update</Option>
                <Option value="project_update">📋 Project Update</Option>
                <Option value="security_alert">🔒 Security Alert</Option>
                <Option value="payment_update">💰 Payment Update</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Priority Level"
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select placeholder="Select priority">
                <Option value="high">🔴 High Priority</Option>
                <Option value="medium">🟡 Medium Priority</Option>
                <Option value="low">🟢 Low Priority</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="scheduleFor"
              label="Schedule For (Optional)"
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Send immediately or schedule"
              />
            </Form.Item>
          </Col>
        </Row>

        <Card title="📎 Optional Action Settings" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actionUrl"
                label="Action URL"
              >
                <Input placeholder="e.g., /dashboard/new-features" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actionText"
                label="Action Button Text"
              >
                <Input placeholder="e.g., Learn More, View Details" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Alert
          message="📊 Estimated Reach"
          description={
            <div>
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                prevValues.targetAudience !== currentValues.targetAudience
              }>
                {({ getFieldValue }) => {
                  const audience = getFieldValue('targetAudience');
                  const estimates = {
                    all: "~1,247 users",
                    annotators: "~856 users", 
                    micro_taskers: "~391 users",
                    verified_users: "~723 users"
                  };
                  return (
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {estimates[audience as keyof typeof estimates] || "Select audience to see estimate"}
                    </span>
                  );
                }}
              </Form.Item>
            </div>
          }
          type="success"
          style={{ marginTop: 8 }}
        />
      </Form>
    </Modal>
  );
};

export default BroadcastNotificationModal;