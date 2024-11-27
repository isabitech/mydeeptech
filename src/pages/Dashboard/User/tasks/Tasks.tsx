import Header from "../Header";
import { useState } from "react";
import Image from "./Image";
import Text from "./Text";
import Audio from "./Audio";
import Video from "./Video";

const Tasks = () => {
  // State to track the currently selected project
  const [selectedProject, setSelectedProject] = useState(1); // Default to the first project

  // List of projects
  const list = [
    {
      key: 1,
      title: "Image Annotation",
      component: <Image />,
    },
    {
      key: 2,
      title: "Text Annotation",
      component: <Text />,
    },
    {
      key: 3,
      title: "Audio Annotation",
      component: <Audio />,
    },
    {
      key: 4,
      title: "Video Annotation",
      component: <Video />,
    },
  ];
  

  return (
    <div className="h-full flex flex-col gap-4  font-[gilroy-regular]">
      <Header title="Tasks" />

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {list.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded ${
              selectedProject === item.key
                ? "bg-secondary text-white"
                : "bg-gray-300 text-black"
            }`}
            onClick={() => setSelectedProject(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Render the selected component */}
      <div className="mt-4">
        {list.find((item) => item.key === selectedProject)?.component}
      </div>
    </div>
  );
};

export default Tasks;
