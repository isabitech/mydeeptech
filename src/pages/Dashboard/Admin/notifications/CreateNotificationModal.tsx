import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Switch,
  DatePicker,
  Card,
  Spin,
} from "antd";
import { useAdminNotifications } from "../../../../hooks/Auth/Admin/useAdminNotifications";
import { useGetAllDtUsers, DTUser } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import {
  CreateNotificationForm,
  NotificationType,
  Priority,
} from "../../../../types/notification.types";

const { TextArea } = Input;
const { Option } = Select;

interface CreateNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { createNotification, loading } = useAdminNotifications();
  const { users: dtUsers , loading: usersLoading, getAllDTUsers } = useGetAllDtUsers();
  const [form] = Form.useForm();
  const [isBroadcast, setIsBroadcast] = useState(false);

const hasLoadedUsers = React.useRef(false);

useEffect(() => {
    if (open && !hasLoadedUsers.current) {
        // Fetch all users without pagination limit
        getAllDTUsers({ limit: 10000 });
        hasLoadedUsers.current = true;
    }
}, [open, getAllDTUsers]);

  // Debug logging
  useEffect(() => {
    console.log('dtUsers:', dtUsers, 'Type:', typeof dtUsers, 'Is Array:', Array.isArray(dtUsers));
  }, [dtUsers]);

  const handleSubmit = async (values: any) => {
    try {
      const notificationData: CreateNotificationForm = {
        recipientId: isBroadcast ? undefined : values.recipientId,
        recipientType: isBroadcast ? "all" : "user",
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        actionUrl: values.actionUrl || undefined,
        actionText: values.actionText || undefined,
        scheduleFor: values.scheduleFor ? values.scheduleFor.toISOString() : undefined,
      };

      const result = await createNotification(notificationData);

      if (result.success) {
        message.success("Notification created successfully!");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(result.error || "Failed to create notification");
      }
    } catch (error) {
      message.error("Failed to create notification");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create Notification"
      open={open}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Create Notification
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: "medium",
          type: "system_announcement",
        }}
      >
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Broadcast to All Users"
                valuePropName="checked"
              >
                <Switch
                  checked={isBroadcast}
                  onChange={setIsBroadcast}
                  checkedChildren="Broadcast"
                  unCheckedChildren="Specific User"
                />
              </Form.Item>
            </Col>
          </Row>

          {!isBroadcast && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="recipientId"
                  label="Select User"
                  rules={[
                    { required: true, message: "Please select a user" },
                  ]}
                >
                  <Select
                    placeholder="Select user to notify"
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    optionLabelProp="children"
                    loading={usersLoading}
                    notFoundContent={usersLoading ? <Spin size="small" /> : "No users found"}
                  >
                    {dtUsers && Array.isArray(dtUsers) && dtUsers.map((user) => (
                      <Option 
                        key={user._id} 
                        value={user._id}
                        label={`${user.fullName} - ${user.email}`}
                      >
                        <div className="relative">
                          <div style={{ fontWeight: 'bold', marginTop: '20px', position: 'absolute',  }}>{user.fullName}</div>
                          <div style={{ color: "#666", fontSize: "12px" }}>
                             {user.fullName} - {user.email} 
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Enter notification title" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: "Please enter message" }]}
            >
              <TextArea
                rows={4}
                placeholder="Enter notification message"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select notification type">
                <Option value="account_update">Account Update</Option>
                <Option value="project_update">Project Update</Option>
                <Option value="application_update">Application Update</Option>
                <Option value="assessment_result">Assessment Result</Option>
                <Option value="system_alert">System Alert</Option>
                <Option value="system_announcement">System Announcement</Option>
                <Option value="security_alert">Security Alert</Option>
                <Option value="payment_update">Payment Update</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select placeholder="Select priority">
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Card title="Optional Settings" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actionUrl"
                label="Action URL"
              >
                <Input placeholder="e.g., /dashboard/projects" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actionText"
                label="Action Button Text"
              >
                <Input placeholder="e.g., View Projects" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="scheduleFor"
                label="Schedule For (Optional)"
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Select date and time to send"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default CreateNotificationModal;