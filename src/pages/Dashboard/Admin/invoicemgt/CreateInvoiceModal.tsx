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
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";
import { useAdminApplications } from "../../../../hooks/Auth/Admin/Projects/useAdminApplications";
import { useAdminDTUsers } from "../../../../hooks/Auth/Admin/useAdminDTUsers";
import {
  CreateInvoiceForm,
} from "../../../../types/invoice.types";
import { Project, DTUser, Application } from "../../../../types/project.types";

const { Option } = Select;
const { TextArea } = Input;

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
  const { getAllProjects } = useAdminProjects();
  const { getAllApplications } = useAdminApplications();
  const { getAllDTUsers } = useAdminDTUsers();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [dtUsers, setDtUsers] = useState<DTUser[]>([]);
  const [projectDTUsers, setProjectDTUsers] = useState<DTUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Load all projects and DTUsers
      const [projectsResult, dtUsersResult] = await Promise.all([
        getAllProjects({ status: "active" }),
        getAllDTUsers(),
      ]);

      if (projectsResult.success) {
        setProjects(projectsResult.data.data.projects);
      }

      console.log(dtUsersResult.data)

      if (dtUsersResult.success) {
        // Ensure dtUsers is always an array
        const usersData = dtUsersResult.data.users;
        setDtUsers( usersData || []);
      }
    } catch (error) {
      message.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setProjectDTUsers([]);
    
    try {
      // Get approved applications for this project to find assigned DTUsers
      const applicationsResult = await getAllApplications({
        projectId,
        status: "approved",
      });

      if (applicationsResult.success) {
        const applications = applicationsResult.data.data.applications;
        
        // Extract unique DTUsers from approved applications
        const assignedDTUserIds = applications
          .map((app: Application) => {
            // Handle both cases where applicantId might be a string or DTUser object
            if (typeof app.applicantId === 'string') {
              return app.applicantId;
            } else {
              return app.applicantId._id;
            }
          })
          .filter((id: string) => id);

        // Filter DTUsers to show only those assigned to this project
        const assignedDTUsers = Array.isArray(dtUsers) ? dtUsers.filter(user => 
          assignedDTUserIds.includes(user._id)
        ) : [];
        
        setProjectDTUsers(assignedDTUsers);
      }
    } catch (error) {
      console.error("Error loading project DTUsers:", error);
      message.error("Failed to load project users");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedProjectId(null);
    setProjectDTUsers([]);
    onClose();
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
        setSelectedProjectId(null);
        setProjectDTUsers([]);
        message.success("Invoice created successfully!");
        onSuccess();
      } else {
        message.error(result.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error("Failed to create invoice");
    }
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
                <Select 
                  placeholder="Select project"
                  onChange={handleProjectChange}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {projects.map((project) => (
                    <Option key={project._id} value={project._id} label={`${project.projectName} (${project.projectCategory})`}>
                      {project.projectName} ({project.projectCategory})
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
                <Select 
                  placeholder={selectedProjectId ? "Select DTUser assigned to this project" : "Please select a project first"}
                  disabled={!selectedProjectId || projectDTUsers.length === 0}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={
                    selectedProjectId && projectDTUsers.length === 0 
                      ? "No DTUsers assigned to this project" 
                      : "No DTUsers found"
                  }
                >
                  {projectDTUsers.map((user) => (
                    <Option key={user._id} value={user._id} label={`${user.fullName} (${user.email})`}>
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