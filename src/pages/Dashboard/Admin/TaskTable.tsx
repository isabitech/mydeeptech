import { useState } from "react";
import { Button, Modal, Form, Input, DatePicker, Select } from "antd";
import { UserPlus } from "lucide-react";

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

  // Handle Form Submission
  const handleOk = () => {
    form.validateFields().then((values) => {
      const newTask = {
        id: tasks.length + 1,
        ...values,
        deadline: values.deadline.format("YYYY-MM-DD"), // Format Date
      };
      setTasks([...tasks, newTask]);
      form.resetFields();
      setIsModalVisible(false);
    });
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
        <p>List of Assigned Tasks</p>
        <Button
          onClick={showModal}
          className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md"
        >
          Assign a Task <UserPlus />
        </Button>
      </div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">S/N</th>
            <th className="border p-2">Annotator First Name</th>
            <th className="border p-2">Email</th>
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
              <td className="border p-2">{task.firstName}</td>
              <td className="border p-2">{task.email}</td>
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
        okText="Assign"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="Annotator First Name"
            rules={[
              { required: true, message: "Please enter the first name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter an email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taskLink"
            label="Task Link"
            rules={[{ required: true, message: "Please enter the task link!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="guidelineLink"
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
            <Select placeholder="Select Task Name">
              <Select.Option value="Video Annotation">
                Video Annotation
              </Select.Option>
              <Select.Option value="Image Annotation">
                Image Annotation
              </Select.Option>
              <Select.Option value="Text Annotation">
                Text Annotation
              </Select.Option>
              <Select.Option value="Audio Annotation">
                Audio Annotation
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: "Please select a deadline!" }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskTable;
