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
  Notification,
} from "../../../../types/notification.types";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

interface CreateNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingNotification?: Notification | null;
  isEdit?: boolean;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  open,
  onClose,
  onSuccess,
  editingNotification = null,
  isEdit = false,
}) => {
  const { createNotification, updateNotification, loading } = useAdminNotifications();
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

// Populate form when editing
useEffect(() => {
  if (open) {
    if (isEdit && editingNotification) {
      setIsBroadcast(false); // Always default to specific user mode
      form.setFieldsValue({
        recipientId: editingNotification.recipientId,
        title: editingNotification.title,
        message: editingNotification.message,
        type: editingNotification.type,
        priority: editingNotification.priority,
        actionUrl: editingNotification.actionUrl || editingNotification.data?.actionUrl,
        actionText: editingNotification.actionText || editingNotification.data?.actionText,
        scheduleFor: editingNotification.scheduleFor ? dayjs(editingNotification.scheduleFor) : undefined,
      });
    } else {
      // Reset form for create mode - default to specific user
      form.resetFields();
      setIsBroadcast(false);
    }
  }
}, [open, isEdit, editingNotification, form]);

  const handleSubmit = async (values: any) => {
    try {
      const notificationData: CreateNotificationForm = {
        recipientId: isBroadcast ? undefined : values.recipientId,
        recipientType: isBroadcast ? "all" : "user",
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        relatedData: {
          ...(values.actionUrl && { actionUrl: values.actionUrl }),
          ...(values.actionText && { actionText: values.actionText })
        },
        scheduleFor: values.scheduleFor ? values.scheduleFor.toISOString() : undefined,
      };

      let result;
      if (isEdit && editingNotification) {
        result = await updateNotification(editingNotification._id, notificationData);
      } else {
        result = await createNotification(notificationData);
      }

      if (result.success) {
        message.success(`Notification ${isEdit ? 'updated' : 'created'} successfully!`);
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(result.error || `Failed to ${isEdit ? 'update' : 'create'} notification`);
      }
    } catch (error) {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} notification`);
    }
  };

  const handleReshare = async () => {
    try {
      const values = await form.validateFields();
      const notificationData: CreateNotificationForm = {
        recipientId: isBroadcast ? undefined : values.recipientId,
        recipientType: isBroadcast ? "all" : "user",
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        relatedData: {
          ...(values.actionUrl && { actionUrl: values.actionUrl }),
          ...(values.actionText && { actionText: values.actionText })
        },
        scheduleFor: values.scheduleFor ? values.scheduleFor.toISOString() : undefined,
      };

      const result = await createNotification(notificationData);

      if (result.success) {
        message.success('Notification reshared successfully!');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(result.error || 'Failed to reshare notification');
      }
    } catch (error) {
      message.error('Failed to reshare notification');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Edit Notification" : "Create Notification"}
      open={open}
      onCancel={handleCancel}
      width={700}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        ...(isEdit ? [
          <Button
            key="reshare"
            type="default"
            loading={loading}
            onClick={handleReshare}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
          >
            Re-share
          </Button>
        ] : []),
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {isEdit ? "Update Notification" : "Create Notification"}
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
                  format="YYYY-MM-DD HH:mm:ss"
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