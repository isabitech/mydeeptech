import Header from "../../User/Header";

import TaskTable from "../TaskTable";

const TaskManagement = () => {
  // // State to track the currently selected project
  // const [selectedProject, setSelectedProject] = useState(1); // Default to the first project

  // // List of projects
  // const list = [
  //   {
  //     key: 1,
  //     title: "Image Annotation Project",
  //     component: <ImgProject />,
  //   },
  //   {
  //     key: 2,
  //     title: "Video Annotation Project",
  //     component: <VidProject />,
  //   },
  //   {
  //     key: 3,
  //     title: "Text Annotation Project",
  //     component: <TextProject />,
  //   },
  //   {
  //     key: 4,
  //     title: "Audio Annotation Project",
  //     component: <AudioProject />,
  //   },
  // ];

  return (
    <div className="h-full flex flex-col font-[gilroy-regular]">
      {/* Header */}
      <Header title="Task Management" />
      <TaskTable />
    </div>
  );
};

export default TaskManagement;
