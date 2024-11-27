import React, { useState } from "react";
import { Button, Select, Modal, Form, Input, DatePicker } from "antd";
import Header from "../../User/Header";
import { PlusSquareOutlined } from "@ant-design/icons";

const ProjectManagement = () => {
  const [activeProjects, setActiveProjects] = useState([
    {
      id: 1,
      name: "Image Annotation",
      company: "CVAT",
      dueDate: "2024-12-01",
      status: "Pending",
      enrolledUsers: "20",
      Applied: "30",
      rejectedUsers: "10",
    },
    {
      id: 2,
      name: "Text Annotation",
      company: "e2f",
      dueDate: "2024-11-25",
      status: "Completed",
      enrolledUsers: "20",
      Applied: "30",
      rejectedUsers: "10",
    },
    {
      id: 3,
      name: "Data Collection",
      company: "Appen",
      dueDate: "2024-12-10",
      status: "In Progress",
      enrolledUsers: "20",
      Applied: "30",
      rejectedUsers: "10",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Show Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle Form Submission
  const handleOk = () => {
    form.validateFields().then((values) => {
      const newProject = {
        id: activeProjects.length + 1,
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"), // Format Date
      };
      setActiveProjects([...activeProjects, newProject]);
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  // Handle Cancel Modal
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

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

      <table className="text-primary w-full border-collapse border border-white">
        <thead className="text-left">
          <tr>
            <th className="p-2">S/N</th>
            <th className="p-2">Name</th>
            <th className="p-2">Company</th>
            <th className="p-2">Due Date</th>
            <th className="p-2">Status</th>
            <th className="p-2">Enrolled Users</th>
            <th className="p-2">Applied</th>
            <th className="p-2">Rejected</th>
          </tr>
        </thead>
        <tbody>
          {activeProjects.map((project, index) => (
            <tr key={project.id}>
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{project.name}</td>
              <td className="p-2">{project.company}</td>
              <td className="p-2">{project.dueDate}</td>
              <td className="p-2">{project.status}</td>
              <td className="p-2">{project.enrolledUsers}</td>
              <td className="p-2">{project.Applied}</td>
              <td className="p-2">{project.rejectedUsers}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <Modal
        title="Create New Project"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
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
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status!" }]}
          >
            <Select>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="enrolledUsers"
            label="Enrolled Users"
            rules={[{ required: true, message: "Please input the number of enrolled users!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="Applied"
            label="Applied"
            rules={[{ required: true, message: "Please input the number of applied users!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="rejectedUsers"
            label="Rejected Users"
            rules={[{ required: true, message: "Please input the number of rejected users!" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
