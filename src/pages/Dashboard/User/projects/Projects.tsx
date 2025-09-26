import { useState } from "react";
import Header from "../Header";
import ActiveProjects from "./ActiveProjects";
// import AvailableProjects from "./AvailableProjects";
// import Pendingprojects from "./PendingProjects";

const Projects = () => {
  // State to track the currently selected project
  const [selectedProject, setSelectedProject] = useState(1); // Default to the first project

  // List of projects
  const list = [
    {
      key: 1,
      title: "Active Projects",
      component: <ActiveProjects />,
    },
    // {
    //   key: 2,
    //   title: "Pending Projects",
    //   component: <Pendingprojects />,
    // },
    // {
    //   key: 3,
    //   title: "Available Projects",
    //   component: <AvailableProjects />,
    // },
  ];

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      {/* Header */}
      <Header title="Projects" />
      
      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {list.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded ${
              selectedProject === item.key ? "bg-secondary text-white" : "bg-gray-300 text-black"
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

export default Projects;
