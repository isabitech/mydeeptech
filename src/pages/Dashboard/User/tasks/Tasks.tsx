import { useState } from "react";
import Image from "./Image";
import Text from "./Text";
import Audio from "./Audio";
import Video from "./Video";
import AssignedTasks from "./AssignedTasks";

const Tasks = () => {
  const [selectedProject, setSelectedProject] = useState(1);

  // List of projects
  const list = [
    {
      key: 1,
      title: "Assigned Tasks",
      component: <AssignedTasks />,
    },
    {
      key: 2,
      title: "Image Annotation",
      component: <Image />,
    },
    {
      key: 3,
      title: "Text Annotation",
      component: <Text />,
    },
    {
      key: 4,
      title: "Audio Annotation",
      component: <Audio />,
    },
    {
      key: 5,
      title: "Video Annotation",
      component: <Video />,
    },
  ];
  

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {list.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded ${
              selectedProject === item.key
                ? "bg-secondary text-white"
                : "bg-gray-300 text-black hover:bg-gray-400"
            }`}
            onClick={() => setSelectedProject(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Render the selected component */}
      <div className="flex-1">
        {list.find((item) => item.key === selectedProject)?.component}
      </div>
    </div>
  );
};

export default Tasks;
