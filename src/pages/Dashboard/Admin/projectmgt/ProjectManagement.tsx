import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, DatePicker, notification, Spin } from "antd";
import { LoadingOutlined, PlusSquareOutlined } from "@ant-design/icons";
import Header from "../../User/Header";
import { endpoints } from "../../../../store/api/endpoints";

export interface ProjectType {
  responseCode: number;
  message: string;
  data: Project[];
}

export interface Project {
  _id: string;
  projectName: string;
  company: string;
  dueDate: string;
  __v: number;
}

const ProjectManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch(endpoints.project.getProject, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data: ProjectType = await response.json();
        setProjects(data.data); // Update state with fetched data
      } catch (error: any) {
        notification.error({
          message: "Error Fetching Projects",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Create Project
  const handleCreateProject = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      const response = await fetch(endpoints.project.createProject, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create project");
      }

      const data = await response.json();
      notification.success({ message: "Project created successfully!" });

      setProjects((prevProjects) => [...prevProjects, data]); // Add new project to the list
      form.resetFields();
      setIsModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Creating Project",
        description: error.message,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  // Show Modal
  const showModal = () => setIsModalVisible(true);

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <Header title="Projects" />
      <div className="flex justify-between">
        <p>List of Projects</p>
        <Button
          className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md"
          onClick={showModal}
        >
          Create New Project <PlusSquareOutlined />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Spin indicator={<LoadingOutlined spin />} size="small" />
      ) : (
        <table className="text-primary w-full border-collapse border border-white">
          <thead className="text-left">
            <tr>
              <th className="p-2">S/N</th>
              <th className="p-2">Name</th>
              <th className="p-2">Company</th>
              <th className="p-2">Due Date</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project._id}>
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{project.projectName}</td>
                <td className="p-2">{project.company}</td>
                <td className="p-2">{project.dueDate}</td>
                <td className="p-2">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal
        title="Create New Project"
        visible={isModalVisible}
        onOk={handleCreateProject}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[{ required: true, message: "Please input the project name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: "Please input the company name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please select a due date!" }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
