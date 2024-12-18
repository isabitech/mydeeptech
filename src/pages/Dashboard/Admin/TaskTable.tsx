import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  notification,
} from "antd";
import { UserPlus } from "lucide-react";
import { useUserContext } from "../../../UserContext";
import { endpoints } from "../../../store/api/endpoints";

const TaskTable = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      firstName: "John",
      email: "john.doe@example.com",
      taskLink: "https://example.com/task1",
      guidelineLink: "https://example.com/guideline1",
      taskName: "Image Annotation",
      deadline: "2024-12-01",
    },
    {
      id: 2,
      firstName: "Jane",
      email: "jane.smith@example.com",
      taskLink: "https://example.com/task2",
      guidelineLink: "https://example.com/guideline2",
      taskName: "Text Annotation",
      deadline: "2024-11-25",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Show Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const { userInfo } = useUserContext();

  // Handle Form Submission
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      const response = await fetch(endpoints.tasks.createTask, {
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
      notification.success({ message: "Task created successfully!" });

      // setProjects((prevProjects) => [...prevProjects, data]); // Add new project to the list
      form.resetFields();
      setIsModalVisible(false);
    } catch (error: any) {
      notification.error({
        message: "Error Creating Project",
        description: error.message,
      });
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Task Management</h2>

      <div className="flex justify-between mb-4">
        <p>List of Created Tasks</p>
        <Button
          onClick={showModal}
          className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md"
        >
          Create a Task <UserPlus />
        </Button>
      </div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">S/N</th>
            {/* <th className="border p-2">Annotator First Name</th>
            <th className="border p-2">Email</th> */}
            <th className="border p-2">Task Link</th>
            <th className="border p-2">Task Guideline Link</th>
            <th className="border p-2">Task Name</th>
            <th className="border p-2">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id}>
              <td className="border p-2">{index + 1}</td>
              {/* <td className="border p-2">{task.firstName}</td>
              <td className="border p-2">{task.email}</td> */}
              <td className="border p-2">
                <a
                  href={task.taskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Task
                </a>
              </td>
              <td className="border p-2">
                <a
                  href={task.guidelineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Guidelines
                </a>
              </td>
              <td className="border p-2">{task.taskName}</td>
              <td className="border p-2">{task.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Assigning New Task */}
      <Modal
        title="Assign New Task"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskLink"
            label="Task Link"
            rules={[{ required: true, message: "Please enter the task link!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taskGuidelineLink"
            label="Task Guideline Link"
            rules={[
              { required: true, message: "Please enter the guideline link!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[
              { required: true, message: "Please select the task name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Deadline"
            rules={[{ required: true, message: "Please select a deadline!" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="createdBy"
            label="Created By"
            rules={[
              { required: true, message: "Please select the task name!" },
            ]}
          >
          <Input value={userInfo.userName}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskTable;
