import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  notification,
  Spin,
} from "antd";
import { LoadingOutlined, PlusSquareOutlined } from "@ant-design/icons";
import Header from "../../User/Header";
import { endpoints } from "../../../../store/api/endpoints";
import moment from "moment";
import { differenceInDays, differenceInMonths, differenceInWeeks, } from "date-fns";

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
  const [projectId, setProjectId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

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

  // Create or Update Project
  const handleSubmitProject = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      const endpoint = isEditMode
        ? `${endpoints.project.updateProject}/${projectId}`
        : endpoints.project.createProject;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save project");
      }

      const data = await response.json();

      if (isEditMode) {
        setProjects((prev) =>
          prev.map((project) =>
            project._id === projectId ? { ...project, ...payload } : project
          )
        );
        notification.success({ message: "Project updated successfully!" });
      } else {
        setProjects((prevProjects) => [...prevProjects, data]);
        notification.success({ message: "Project created successfully!" });
      }

      form.resetFields();
      setIsModalVisible(false);
      setIsEditMode(false);
    } catch (error: any) {
      notification.error({
        message: `Error ${isEditMode ? "Updating" : "Creating"} Project`,
        description: error.message,
      });
    }
  };

  // Function to calculate time left
  const calculateTimeLeft = (dueDate: string): string => {
    const now = new Date();
    const due = new Date(dueDate);

    const monthsLeft = differenceInMonths(due, now);
    const weeksLeft = differenceInWeeks(due, now) % 4;
    const daysLeft = differenceInDays(due, now) % 7;

    if (monthsLeft < 0 || weeksLeft < 0 || daysLeft < 0) {
      return "Past Due";
    }

    return `${monthsLeft} months, ${weeksLeft} weeks, ${daysLeft} days left`;
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this project?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await fetch(
            `${endpoints.project.deleteProject}/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete project");
          }

          setProjects((prev) => prev.filter((project) => project._id !== id));
          notification.success({ message: "Project deleted successfully!" });
        } catch (error: any) {
          notification.error({
            message: "Error Deleting Project",
            description: error.message,
          });
        }
      },
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setIsEditMode(false);
  };

  // Show Modal for Create or Update
  const showModal = (project?: Project) => {
    if (project) {
      setIsEditMode(true);
      setProjectId(project._id);
      form.setFieldsValue({
        projectName: project.projectName,
        company: project.company,
        dueDate: project.dueDate ? moment(project.dueDate) : null,
      });
    } else {
      form.resetFields();
      setIsEditMode(false);
    }
    setIsModalVisible(true);
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <Header title="Projects" />
      <div className="flex justify-between">
        <p>List of Projects</p>
        <Button
          className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md"
          onClick={() => showModal()}
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
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project._id}>
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{project.projectName}</td>
                <td className="p-2">{project.company}</td>
                <td className="p-2">{calculateTimeLeft(project.dueDate)}</td>
                <td className="p-2 flex gap-2">
                  <Button
                    onClick={() => showModal(project)}
                    className="!bg-secondary !text-black !border-none !font-[gilroy-regular] rounded-md"
                  >
                    Update
                  </Button>
                  <Button
                    onClick={() => handleDeleteProject(project._id)}
                    className="!bg-primary !text-white !border-none !font-[gilroy-regular] rounded-md"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal
        title={isEditMode ? "Update Project" : "Create New Project"}
        visible={isModalVisible}
        onOk={handleSubmitProject}
        onCancel={handleCancel}
        okText={isEditMode ? "Update" : "Create"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[
              { required: true, message: "Please input the project name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="company"
            label="Company"
            rules={[
              { required: true, message: "Please input the company name!" },
            ]}
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
