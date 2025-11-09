import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { useAdminInvoices } from "../../../../hooks/Auth/Admin/Invoices/useAdminInvoices";
import {
  CreateInvoiceForm,
} from "../../../../types/invoice.types";

const { Option } = Select;
const { TextArea } = Input;

interface Project {
  _id: string;
  projectName: string;
  projectCategory: string;
}

interface DTUser {
  _id: string;
  fullName: string;
  email: string;
}

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { createInvoice, loading } = useAdminInvoices();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dtUsers, setDtUsers] = useState<DTUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // TODO: Replace with actual API calls to get projects and DTUsers
      // For now using mock data
      setProjects([
        { _id: "1", projectName: "Sentiment Analysis Project", projectCategory: "Text Annotation" },
        { _id: "2", projectName: "Image Classification", projectCategory: "Computer Vision" },
      ]);
      
      setDtUsers([
        { _id: "1", fullName: "John Doe", email: "john@example.com" },
        { _id: "2", fullName: "Jane Smith", email: "jane@example.com" },
      ]);
    } catch (error) {
      message.error("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const invoiceData: CreateInvoiceForm = {
        projectId: values.projectId,
        dtUserId: values.dtUserId,
        invoiceAmount: values.invoiceAmount,
        currency: values.currency || "USD",
        dueDate: values.dueDate.toISOString(),
        description: values.description,
        workDescription: values.workDescription,
        hoursWorked: values.hoursWorked,
        tasksCompleted: values.tasksCompleted,
        qualityScore: values.qualityScore,
        invoiceType: values.invoiceType || "project_completion",
        adminNotes: values.adminNotes,
        workPeriodStart: values.workPeriod?.[0]?.toISOString(),
        workPeriodEnd: values.workPeriod?.[1]?.toISOString(),
      };

      const result = await createInvoice(invoiceData);
      if (result.success) {
        form.resetFields();
        onSuccess();
      } else {
        message.error(result.error || "Failed to create invoice");
      }
    } catch (error) {
      message.error("Failed to create invoice");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New Invoice"
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
          onClick={() => form.submit()}
          loading={loading}
        >
          Create Invoice
        </Button>,
      ]}
    >
      <Spin spinning={loadingData}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: "USD",
            invoiceType: "project_completion",
            dueDate: dayjs().add(30, "day"),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Project"
                rules={[{ required: true, message: "Please select a project" }]}
              >
                <Select placeholder="Select project">
                  {projects.map((project: any) => (
                    <Option key={project._id} value={project._id}>
                      {project.projectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dtUserId"
                label="DTUser"
                rules={[{ required: true, message: "Please select a DTUser" }]}
              >
                <Select placeholder="Select DTUser">
                  {dtUsers.map((user: any) => (
                    <Option key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="invoiceAmount"
                label="Invoice Amount"
                rules={[
                  { required: true, message: "Please enter invoice amount" },
                  { type: "number", min: 0.01, message: "Amount must be greater than 0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter amount"
                  precision={2}
                  min={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                  <Option value="NGN">NGN</Option>
                  <Option value="KES">KES</Option>
                  <Option value="GHS">GHS</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="invoiceType" label="Invoice Type">
                <Select>
                  <Option value="project_completion">Project Completion</Option>
                  <Option value="milestone">Milestone</Option>
                  <Option value="hourly">Hourly</Option>
                  <Option value="fixed_rate">Fixed Rate</Option>
                  <Option value="bonus">Bonus</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hoursWorked" label="Hours Worked">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter hours"
                  min={0}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tasksCompleted" label="Tasks Completed">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Number of tasks"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workPeriod" label="Work Period">
                <DatePicker.RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qualityScore" label="Quality Score (0-100)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Quality score"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Invoice description"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item name="workDescription" label="Work Description">
            <TextArea
              rows={3}
              placeholder="Detailed work description"
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item name="adminNotes" label="Admin Notes">
            <TextArea
              rows={2}
              placeholder="Internal notes"
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateInvoiceModal;